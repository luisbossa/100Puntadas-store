const db = require("../db/pool");

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
      neighborhood,
      address_details,
      cart,
      totals,
    } = req.body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ success: false, error: "Carrito inválido" });
    }

    const subtotal = cart.reduce(
      (acc, item) => acc + normalize(item.price) * item.quantity,
      0
    );

    const discount = normalize(totals.discount);
    const shipping = normalize(totals.shipping);
    const total = normalize(totals.total);

    const orderResult = await db.query(
      `
      INSERT INTO orders
      (email, phone, full_name, national_id, province, canton, district, neighborhood, address_details, subtotal, discount, shipping, total)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING id
      `,
      [
        email,
        phone,
        full_name,
        national_id,
        province,
        canton,
        district,
        neighborhood,
        address_details,
        subtotal,
        discount,
        shipping,
        total,
      ]
    );

    const orderId = orderResult.rows[0].id;

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
