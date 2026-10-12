const db = require("../db/pool");
const orderToken = require("../utils/orderToken");
const sendOrderConfirmationEmail = require("../utils/sendOrderConfirmationEmail");

exports.paymentPage = (req, res) => {
  const { paymentIntentId, orderNumber } = req.query;

  if (!paymentIntentId || !orderNumber) {
    return res.redirect("/");
  }

  res.render("onvo-pay", {
    layout: "checkout-layout",
    pageTitle: "Pago con tarjeta",
    step: 2,
    bodyClass: "page-onvo",
    paymentIntentId,
    orderNumber,
  });
};

exports.createPaymentIntent = async (req, res) => {
  try {
    const orderId = orderToken.verify(req.body?.orderToken);

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: "Orden inválida",
      });
    }

    // El monto sale de la orden guardada, nunca del navegador.
    const { rows } = await db.query(
      "SELECT id, total, email, status, payment_method FROM orders WHERE id = $1",
      [orderId],
    );
    const order = rows[0];

    if (!order || order.payment_method !== "card") {
      return res
        .status(404)
        .json({ success: false, error: "Orden no encontrada" });
    }

    if (order.status === "paid") {
      return res
        .status(409)
        .json({ success: false, error: "Esta orden ya fue pagada" });
    }

    const response = await fetch("https://api.onvopay.com/v1/payment-intents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ONVOPAY_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: Math.round(Number(order.total) * 100),
        currency: "CRC",
        description: `Orden #${order.id} - 100Puntadas`,
        metadata: {
          orderId: String(order.id),
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
  // ONVO envía el secreto del webhook en este header (empieza con "webhook_secret_").
  const expectedSecret = process.env.ONVOPAY_WEBHOOK_SECRET;

  if (!expectedSecret) {
    console.error("ONVO WEBHOOK: falta ONVOPAY_WEBHOOK_SECRET");
    return res.sendStatus(500);
  }

  if (!orderToken.safeEqual(req.get("X-Webhook-Secret"), expectedSecret)) {
    return res.sendStatus(401);
  }

  try {
    const event = req.body;

    if (event?.type === "payment-intent.succeeded") {
      const paymentIntent = event.data;
      const orderId = Number(paymentIntent?.metadata?.orderId);

      // Solo se marca pagada si el monto cobrado coincide con la orden,
      // y solo una vez (evita correos duplicados si ONVO reintenta).
      const { rows } = await db.query(
        `UPDATE orders SET status='paid', paid_at=NOW()
         WHERE id=$1 AND status <> 'paid' AND ROUND(total * 100) = $2
         RETURNING email`,
        [orderId, Number(paymentIntent?.amount)],
      );

      if (!rows.length) {
        console.warn("ONVO WEBHOOK: orden ya pagada o monto distinto", {
          orderId,
          amount: paymentIntent?.amount,
        });
      } else {
        // Si el correo falla no se devuelve error: ONVO reintentaría,
        // pero la orden ya quedó pagada y no se reenviaría.
        await sendOrderConfirmationEmail(rows[0].email, orderId).catch((err) =>
          console.error("ONVO WEBHOOK: error enviando correo", err),
        );
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("ONVO WEBHOOK ERROR:", err);
    res.sendStatus(500);
  }
};
