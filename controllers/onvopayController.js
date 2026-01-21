const db = require("../db/pool");
const sendOrderConfirmationEmail = require("../utils/sendOrderConfirmationEmail");

exports.confirm = (req, res) => {
  res.render("confirm", { layout: false });
};

exports.createPaymentIntent = async (req, res) => {
  try {
    const { totals, email, orderId } = req.body;

    if (!totals || !totals.total || !email || !orderId) {
      return res.status(400).json({
        success: false,
        error: "Faltan datos para crear el pago",
      });
    }

    const response = await fetch("https://api.onvopay.com/v1/payment-intents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ONVOPAY_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: Math.round(totals.total * 100),
        currency: "CRC",
        description: `Orden #${orderId} - 100Puntadas`,
        metadata: {
          orderId: String(orderId),
          email: String(email),
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("ONVO ERROR:", data);
      return res.status(response.status).json({
        success: false,
        error: data.message || "Error al crear el PaymentIntent",
      });
    }

    return res.json({
      success: true,
      paymentIntentId: data.id,
    });
  } catch (err) {
    console.error("ONVO INTERNAL ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
};

exports.handleWebhook = async (req, res) => {
  try {
    const event = req.body;

    if (event.type === "payment-intent.succeeded") {
      const paymentIntent = event.data;
      const { orderId, email } = paymentIntent.metadata;

      await db.query(
        "UPDATE orders SET status='paid', paid_at=NOW() WHERE id=$1",
        [orderId],
      );

      await sendOrderConfirmationEmail(email, orderId);
    }

    res.sendStatus(200);
  } catch {
    res.sendStatus(500);
  }
};
