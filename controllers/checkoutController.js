const db = require("../db/pool");

/* ================= HELPERS ================= */
const normalize = (v) => Number(String(v || 0).replace(/[^\d]/g, ""));

/* ================= CREATE ORDER ================= */
exports.getInfo = async (req, res) => {
  try {
    const {
      email,
      phone,
      full_name,
      national_id,
      province, // code
      canton,   // code
      district, // code
      address,
      neighborhood,
      address_details,
      cart,
      totals,
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

    if (!address || address.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: "La dirección es obligatoria y muy corta",
      });
    }

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Carrito inválido",
      });
    }

    /* ================= CAST DE CODES ================= */
    const provinceCode = Number(province);
    const cantonCode = Number(canton);
    const districtCode = Number(district);

    if (Number.isNaN(provinceCode) || Number.isNaN(cantonCode) || Number.isNaN(districtCode)) {
      return res.status(400).json({
        success: false,
        error: "Provincia, cantón o distrito inválido",
      });
    }

    /* ================= CONVERTIR CODES → NOMBRES ================= */
    const provinceRes = await db.query(
      "SELECT province FROM provinces WHERE code = $1",
      [provinceCode]
    );
    const cantonRes = await db.query(
      "SELECT canton FROM cantons WHERE code = $1 AND province = $2",
      [cantonCode, provinceCode]
    );
    const districtRes = await db.query(
      "SELECT district FROM districts WHERE code = $1 AND canton = $2",
      [districtCode, cantonCode]
    );

    if (!provinceRes.rows.length || !cantonRes.rows.length || !districtRes.rows.length) {
      return res.status(400).json({
        success: false,
        error: "Provincia, cantón o distrito inválido",
      });
    }

    const provinceName = provinceRes.rows[0].province;
    const cantonName = cantonRes.rows[0].canton;
    const districtName = districtRes.rows[0].district;

    /* ================= TOTALES (BACKEND ES AUTORIDAD) ================= */
    const subtotal = cart.reduce(
      (acc, item) => acc + normalize(item.price) * Number(item.quantity || 1),
      0
    );

    const discount = normalize(totals?.discount);
    const shipping = normalize(totals?.shipping);
    const total = subtotal - discount + shipping;

    if (total <= 0) {
      return res.status(400).json({
        success: false,
        error: "Total inválido",
      });
    }

    /* ================= BLOQUEO DUPLICADOS ================= */
    const existingOrder = await db.query(
      "SELECT id, status FROM orders WHERE email = $1 AND total = $2 ORDER BY id DESC LIMIT 1",
      [email.trim(), total]
    );

    if (existingOrder.rows.length > 0 && existingOrder.rows[0].status === "paid") {
      return res.status(409).json({
        success: false,
        error: "Esta orden ya fue pagada",
      });
    }

    /* ================= INSERT ORDER ================= */
    const orderResult = await db.query(
      `INSERT INTO orders
      (email, phone, full_name, national_id, province_name, canton_name, district_name,
       address, neighborhood, address_details, subtotal, discount, shipping, total, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'pending')
       RETURNING id`,
      [
        email.trim(),
        phone.trim(),
        full_name.trim(),
        national_id.trim(),
        provinceName,
        cantonName,
        districtName,
        address.trim(),
        neighborhood?.trim() || "",
        address_details || null,
        subtotal,
        discount,
        shipping,
        total,
      ]
    );

    const orderId = orderResult.rows[0].id;

    /* ================= INSERT ITEMS ================= */
    for (const item of cart) {
      await db.query(
        `INSERT INTO order_items
        (order_id, product_name, image, price, quantity, top_size, bottom_size, bottom_style, size, color)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          orderId,
          item.name,
          item.image,
          normalize(item.price),
          Number(item.quantity || 1),
          item.topSize || null,
          item.bottomSize || null,
          item.bottomStyle || null,
          item.size || null,
          item.color || null,
        ]
      );
    }

    /* ================= RESPUESTA ================= */
    return res.json({ success: true, orderId });
  } catch (err) {
    console.error("CHECKOUT ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
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
