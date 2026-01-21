const sendOrderConfirmationEmail = require("../utils/sendOrderConfirmationEmail");
const db = require("../db/pool");

exports.sinpePaid = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ ok: false, message: "Falta orderId" });
    }

    const { rows } = await db.query("SELECT email FROM orders WHERE id = $1", [
      orderId,
    ]);
    if (!rows.length) {
      return res.status(404).json({ ok: false, message: "Pedido no encontrado" });
    }

    const email = rows[0].email;

    await sendOrderConfirmationEmail(email, orderId);

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, message: "Error interno" });
  }
};
