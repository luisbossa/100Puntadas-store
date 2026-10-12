const orderToken = require("../utils/orderToken");
const onvo = require("../utils/onvo");
const { getOrderWithItems, isPaid } = require("../utils/orders");

/* ============================================================
   PAGO CON TARJETA (ONVO)
   1. El checkout crea la orden y luego el PaymentIntent (create-intent).
   2. /payment?order=<token> monta el formulario de ONVO.
   3. ONVO avisa por webhook (/onvo) y la orden pasa a "pagado";
      /confirm también consulta a ONVO por si el webhook se retrasa.
============================================================ */

exports.paymentPage = async (req, res) => {
  const orderId = orderToken.verify(req.query.order);
  if (!orderId) return res.redirect("/");

  const data = await getOrderWithItems(orderId);
  if (!data || data.order.payment_method !== "card") return res.redirect("/");

  const { order } = data;
  if (isPaid(order.status)) {
    return res.redirect(`/confirm?order=${encodeURIComponent(req.query.order)}`);
  }
  if (!order.payment_intent_id || order.status === "cancelled") return res.redirect("/");

  res.render("onvo-pay", {
    layout: "checkout-layout",
    pageTitle: "Pago con tarjeta",
    step: 2,
    bodyClass: "page-onvo",
    paymentIntentId: order.payment_intent_id,
    orderNumber: order.order_number || order.id,
    orderToken: req.query.order,
  });
};

exports.createPaymentIntent = async (req, res) => {
  const orderId = orderToken.verify(req.body?.orderToken);
  if (!orderId) {
    return res.status(400).json({ success: false, error: "Orden inválida" });
  }

  // El monto sale de la orden guardada, nunca del navegador.
  const data = await getOrderWithItems(orderId);
  const order = data?.order;

  if (!order || order.payment_method !== "card") {
    return res.status(404).json({ success: false, error: "Orden no encontrada" });
  }
  if (isPaid(order.status)) {
    return res.status(409).json({ success: false, error: "Esta orden ya fue pagada" });
  }

  try {
    const intent = await onvo.createIntent(order);
    res.json({ success: true, paymentIntentId: intent.id });
  } catch (err) {
    console.error("ONVO ERROR:", err.message);
    res.status(err.status && err.status < 500 ? err.status : 502).json({
      success: false,
      error: "No se pudo iniciar el pago con tarjeta. Intenta de nuevo.",
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
    const intent = event?.data;
    const orderId = Number(intent?.metadata?.orderId);

    if (event?.type === "payment-intent.succeeded" && orderId) {
      // Marca pagada solo si el monto coincide y solo una vez (correo sin duplicados).
      await onvo.syncFromIntent(orderId, intent);
    } else if (event?.type === "payment-intent.failed") {
      console.warn("ONVO WEBHOOK: pago fallido", {
        orderId,
        error: intent?.error?.message || intent?.lastPaymentError?.message,
      });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("ONVO WEBHOOK ERROR:", err);
    res.sendStatus(500);
  }
};
