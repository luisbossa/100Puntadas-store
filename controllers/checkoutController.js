const db = require("../db/pool");
const catalog = require("../data/catalog");
const Pricing = require("../public/js/pricing");
const orderToken = require("../utils/orderToken");

/* ================= HELPERS ================= */
const productsById = Object.fromEntries(
  Object.values(catalog).map((product) => [product.id, product]),
);

const DEFAULT_SIZES = ["XS", "S", "M", "L"];

const cleanText = (v, max = 40) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

// Reconstruye cada ítem del carrito con los datos reales del catálogo.
// Del cliente solo se toman id, cantidad y variantes; nunca precio ni nombre.
function buildOrderItems(cart) {
  return cart.map((raw) => {
    const product = productsById[raw?.id];
    if (!product) throw new Error("Producto no disponible");
    if (product.stock === 0) throw new Error(`${product.name} está agotado`);

    const quantity = Number(raw.quantity);
    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > Pricing.MAX_QUANTITY
    ) {
      throw new Error("Cantidad inválida");
    }

    const sizes = product.sizes || DEFAULT_SIZES;
    const styles = (product.styles || []).map((s) => s.label);

    const topSize = cleanText(raw.topSize);
    const bottomSize = cleanText(raw.bottomSize);
    const size = cleanText(raw.size);
    const bottomStyle = cleanText(raw.bottomStyle);

    if ([topSize, bottomSize, size].some((s) => s && !sizes.includes(s))) {
      throw new Error(`Talla inválida para ${product.name}`);
    }
    if (bottomStyle && !styles.includes(bottomStyle)) {
      throw new Error(`Estilo inválido para ${product.name}`);
    }

    return {
      name: product.name,
      image: product.images[0],
      price: product.price,
      discount: product.discount,
      quantity,
      topSize,
      bottomSize,
      bottomStyle,
      size,
      color: cleanText(raw.color, 30),
    };
  });
}

async function generateOrderNumber(client) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = Math.floor(10000 + Math.random() * 90000); // 5 dígitos
    const { rows } = await client.query(
      "SELECT 1 FROM orders WHERE order_number = $1",
      [candidate],
    );
    if (!rows.length) return candidate;
  }
  throw new Error("No se pudo generar un número de pedido único");
}

/* ================= PÁGINAS ================= */
exports.checkoutPage = (req, res) => {
  res.render("checkout", {
    layout: "checkout-layout",
    pageTitle: "Finalizar compra",
    step: 1,
  });
};

exports.confirmPage = (req, res) => {
  res.render("confirm", {
    layout: "checkout-layout",
    pageTitle: "Pedido confirmado",
    step: 3,
    bodyClass: "page-confirm",
  });
};

/* ================= CREATE ORDER ================= */
exports.getInfo = async (req, res) => {
  const {
    email,
    phone,
    full_name,
    national_id,
    province,
    canton,
    district,
    address,
    neighborhood,
    address_details,
    cart,
    shipping_type,
    payment_method,
  } = req.body;

  /* ================= VALIDACIONES ================= */
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ success: false, error: "Correo inválido" });
  }

  if (!/^[245678]\d{3}-\d{4}$/.test(phone)) {
    return res.status(400).json({ success: false, error: "Teléfono inválido" });
  }

  if (!/^\d-\d{4}-\d{4}$/.test(national_id)) {
    return res.status(400).json({ success: false, error: "Cédula inválida" });
  }

  if (typeof full_name !== "string" || full_name.trim().length < 3) {
    return res.status(400).json({ success: false, error: "Nombre inválido" });
  }

  if (typeof address !== "string" || address.trim().length < 10) {
    return res.status(400).json({
      success: false,
      error: "La dirección es obligatoria y muy corta",
    });
  }

  if (!Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ success: false, error: "Carrito inválido" });
  }

  if (!["sinpe", "card"].includes(payment_method)) {
    return res
      .status(400)
      .json({ success: false, error: "Método de pago inválido" });
  }

  if (!Object.hasOwn(Pricing.SHIPPING_OPTIONS, shipping_type)) {
    return res
      .status(400)
      .json({ success: false, error: "Método de envío inválido" });
  }

  let items;
  try {
    items = buildOrderItems(cart);
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }

  /* ================= CAST DE CODES ================= */
  const provinceCode = Number(province);
  const cantonCode = Number(canton);
  const districtCode = Number(district);

  if (
    Number.isNaN(provinceCode) ||
    Number.isNaN(cantonCode) ||
    Number.isNaN(districtCode)
  ) {
    return res.status(400).json({
      success: false,
      error: "Provincia, cantón o distrito inválido",
    });
  }

  const client = await db.connect();

  try {
    /* ================= CONVERTIR CODES → NOMBRES ================= */
    const [provinceRes, cantonRes, districtRes] = await Promise.all([
      client.query("SELECT province FROM provinces WHERE code = $1", [
        provinceCode,
      ]),
      client.query(
        "SELECT canton FROM cantons WHERE code = $1 AND province = $2",
        [cantonCode, provinceCode],
      ),
      client.query(
        "SELECT district FROM districts WHERE code = $1 AND canton = $2",
        [districtCode, cantonCode],
      ),
    ]);

    if (
      !provinceRes.rows.length ||
      !cantonRes.rows.length ||
      !districtRes.rows.length
    ) {
      return res.status(400).json({
        success: false,
        error: "Provincia, cantón o distrito inválido",
      });
    }

    /* ================= TOTALES (calculados en servidor) ================= */
    const totals = Pricing.calculateTotals(items, shipping_type);

    if (totals.total <= 0) {
      return res.status(400).json({ success: false, error: "Total inválido" });
    }

    /* ================= BLOQUEO DUPLICADOS ================= */
    const existingOrder = await client.query(
      "SELECT id, status FROM orders WHERE email = $1 AND total = $2 ORDER BY id DESC LIMIT 1",
      [email.trim(), totals.total],
    );

    if (
      existingOrder.rows.length > 0 &&
      existingOrder.rows[0].status === "paid"
    ) {
      return res
        .status(409)
        .json({ success: false, error: "Esta orden ya fue pagada" });
    }

    await client.query("BEGIN");

    const orderNumber = await generateOrderNumber(client);

    /* ================= INSERT ORDER ================= */
    const orderResult = await client.query(
      `INSERT INTO orders
      (order_number, email, phone, full_name, national_id, province_name, canton_name, district_name,
       address, neighborhood, address_details, subtotal, discount, shipping, total, status, payment_method)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'pending',$16)
       RETURNING id`,
      [
        orderNumber,
        email.trim(),
        phone.trim(),
        full_name.trim(),
        national_id.trim(),
        provinceRes.rows[0].province,
        cantonRes.rows[0].canton,
        districtRes.rows[0].district,
        address.trim(),
        cleanText(neighborhood, 120) || "",
        cleanText(address_details, 500),
        totals.subtotal,
        totals.discount,
        totals.shipping,
        totals.total,
        payment_method,
      ],
    );

    const orderId = orderResult.rows[0].id;

    /* ================= INSERT ITEMS ================= */
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items
        (order_id, product_name, image, price, quantity, top_size, bottom_size, bottom_style, size, color)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          orderId,
          item.name,
          item.image,
          item.price,
          item.quantity,
          item.topSize,
          item.bottomSize,
          item.bottomStyle,
          item.size,
          item.color,
        ],
      );
    }

    await client.query("COMMIT");

    /* ================= RESPUESTA ================= */
    return res.json({
      success: true,
      orderToken: orderToken.create(orderId),
      orderNumber,
      payment_method,
      totals,
    });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("CHECKOUT ERROR:", err);
    return res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  } finally {
    client.release();
  }
};

/* ================= SELECTS API ================= */
exports.getProvinces = async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT code, province FROM provinces ORDER BY province"
    );
    res.json(rows);
  } catch (err) {
    console.error("GET PROVINCES ERROR:", err);
    res.status(500).json([]);
  }
};

exports.getCantons = async (req, res) => {
  try {
    const provinceCode = Number(req.params.provinceCode);
    if (Number.isNaN(provinceCode)) return res.json([]);

    const { rows } = await db.query(
      "SELECT code, canton FROM cantons WHERE province = $1 ORDER BY canton",
      [provinceCode]
    );
    res.json(rows);
  } catch (err) {
    console.error("GET CANTONS ERROR:", err);
    res.status(500).json([]);
  }
};

exports.getDistricts = async (req, res) => {
  try {
    const cantonCode = Number(req.params.cantonCode);
    if (Number.isNaN(cantonCode)) return res.json([]);

    const { rows } = await db.query(
      "SELECT code, district FROM districts WHERE canton = $1 ORDER BY district",
      [cantonCode]
    );
    res.json(rows);
  } catch (err) {
    console.error("GET DISTRICTS ERROR:", err);
    res.status(500).json([]);
  }
};
