const sendOrderConfirmationEmail = require("../utils/sendOrderConfirmationEmail");
const { safeEqual } = require("../utils/orderToken");
const { getOrderWithItems, isPaid } = require("../utils/orders");
const transporter = require("../utils/mailer");

/* El panel (BBoard) avisa que un pedido pasó a "pagado" (aprobación SINPE o
   pago con tarjeta verificado en ONVO) → se envía el correo al cliente.
   Requiere el header X-Webhook-Secret = SINPE_WEBHOOK_SECRET (el mismo valor
   configurado en BBoard). */
const authorized = (req) => {
  const expectedSecret = process.env.SINPE_WEBHOOK_SECRET;
  return Boolean(expectedSecret) && safeEqual(req.get("X-Webhook-Secret"), expectedSecret);
};

exports.orderPaid = async (req, res) => {
  if (!authorized(req)) {
    return res.status(401).json({ ok: false, message: "No autorizado" });
  }

  const orderId = Number(req.body?.orderId);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return res.status(400).json({ ok: false, message: "Falta orderId" });
  }

  try {
    const data = await getOrderWithItems(orderId);
    if (!data) {
      return res.status(404).json({ ok: false, message: "Pedido no encontrado" });
    }

    // Nunca confirmar por correo un pedido que no está pagado.
    if (!isPaid(data.order.status)) {
      return res.status(409).json({ ok: false, message: "El pedido no está pagado" });
    }

    await sendOrderConfirmationEmail(data.order, data.items);
    res.json({ ok: true });
  } catch (err) {
    console.error("ORDER PAID WEBHOOK ERROR:", err);
    res.status(500).json({ ok: false, message: "Error interno" });
  }
};

/* Estado de la configuración de la tienda, para la página "Estado de
   integraciones" del panel. Solo responde sí/no: nunca expone valores. */
exports.health = async (req, res) => {
  if (!authorized(req)) {
    return res.status(401).json({ ok: false, message: "No autorizado" });
  }

  const onvoKey = process.env.ONVOPAY_SECRET_KEY || "";
  const mail = await Promise.race([
    transporter.verify().then(() => ({ ok: true })),
    new Promise((resolve) => setTimeout(() => resolve({ ok: false, error: "Sin respuesta de Gmail" }), 8000)),
  ]).catch((err) => ({ ok: false, error: err.code === "EAUTH" ? "Usuario o contraseña de Gmail inválidos" : err.message }));

  res.json({
    ok: true,
    mail: { configured: Boolean(process.env.MAIL_USER && process.env.MAIL_PASS), ...mail },
    onvoKey: {
      configured: Boolean(onvoKey),
      mode: onvoKey.startsWith("onvo_live_") ? "live" : onvoKey.startsWith("onvo_test_") ? "test" : null,
    },
    onvoWebhookSecret: Boolean(process.env.ONVOPAY_WEBHOOK_SECRET),
    orderTokenSecret: Boolean(process.env.ORDER_TOKEN_SECRET),
  });
};
