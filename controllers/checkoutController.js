const db = require("../db/pool");

// Normaliza precios
const normalize = (v) => Number(String(v || 0).replace(/[^\d]/g, ""));

exports.getInfo = async (req, res) => {
  try {
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
      totals,
    } = req.body;

    /* ================= VALIDACIONES BACKEND ================= */

    if (!address || address.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: "La dirección es obligatoria y muy corta",
      });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Correo inválido",
      });
    }

    // Teléfono Costa Rica: 8 dígitos, inicia en 2,4,5,6,7,8 → formato ####-####
    if (!/^[245678]\d{3}-\d{4}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        error: "Teléfono inválido",
      });
    }

    // Cédula Costa Rica: 1-2345-6789
    if (!/^\d-\d{4}-\d{4}$/.test(national_id)) {
      return res.status(400).json({
        success: false,
        error: "Cédula inválida",
      });
    }

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Carrito inválido" });
    }

    /* ================= TOTALES ================= */

    const subtotal = cart.reduce(
      (acc, item) => acc + normalize(item.price) * item.quantity,
      0
    );
    const discount = normalize(totals.discount);
    const shipping = normalize(totals.shipping);
    const total = normalize(totals.total);

    /* ================= INSERT ORDEN ================= */

    const orderResult = await db.query(
      `
      INSERT INTO orders
      (email, phone, full_name, national_id, province_name, canton_name, district_name, address, neighborhood, address_details, subtotal, discount, shipping, total)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING id
      `,
      [
        email.trim(),
        phone.trim(),
        full_name.trim(),
        national_id.trim(),
        province,
        canton,
        district,
        address.trim(),
        neighborhood.trim(),
        address_details,
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
        `
        INSERT INTO order_items
        (order_id, product_name, image, price, quantity, top_size, bottom_size, bottom_style, size, color)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        `,
        [
          orderId,
          item.name,
          item.image,
          normalize(item.price),
          item.quantity,
          item.topSize || null,
          item.bottomSize || null,
          item.bottomStyle || null,
          item.size || null,
          item.color || null,
        ]
      );
    }

    res.json({ success: true, orderId });
  } catch (err) {
    console.error("CHECKOUT ERROR:", err);
    res.status(500).json({ success: false });
  }
};

/* ================= SELECTS ================= */

exports.getProvinces = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT code, province AS name FROM provinces ORDER BY province"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
};

exports.getCantons = async (req, res) => {
  try {
    const { provinceCode } = req.params;
    const result = await db.query(
      "SELECT code, canton AS name FROM cantons WHERE province = $1 ORDER BY canton",
      [provinceCode]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
};

exports.getDistricts = async (req, res) => {
  try {
    const { cantonCode } = req.params;
    const result = await db.query(
      "SELECT code, district AS name FROM districts WHERE canton = $1 ORDER BY district",
      [cantonCode]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
};
