const sendOrderConfirmationEmail = require("../utils/sendOrderConfirmationEmail");
const { safeEqual } = require("../utils/orderToken");
const { getOrderWithItems, isPaid } = require("../utils/orders");

/* El panel (BBoard) avisa que un pedido pasó a "pagado" (aprobación SINPE o
   pago con tarjeta verificado en ONVO) → se envía el correo al cliente.
   Requiere el header X-Webhook-Secret = SINPE_WEBHOOK_SECRET (el mismo valor
   configurado en BBoard). */
exports.orderPaid = async (req, res) => {
  const expectedSecret = process.env.SINPE_WEBHOOK_SECRET;

  if (!expectedSecret || !safeEqual(req.get("X-Webhook-Secret"), expectedSecret)) {
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
