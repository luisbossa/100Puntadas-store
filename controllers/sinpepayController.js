const orderToken = require("../utils/orderToken");
const { getOrderWithItems, isPaid } = require("../utils/orders");

/* La orden se identifica con un token firmado (no con el id),
   para que nadie pueda ver los datos de otra persona cambiando el número. */

exports.paymentPage = async (req, res) => {
  const orderId = orderToken.verify(req.query.order);
  if (!orderId) return res.redirect("/");

  try {
    const data = await getOrderWithItems(orderId);
    if (!data) return res.redirect("/");

    const token = encodeURIComponent(req.query.order);
    if (data.order.payment_method === "card") return res.redirect(`/payment?order=${token}`);

    res.render("sinpe-pay", {
      layout: "checkout-layout",
      pageTitle: "Pago por SINPE",
      step: 2,
      bodyClass: "page-sinpe",
      order: data.order,
      orderItems: data.items,
      orderToken: req.query.order,
      // Si ya se aprobó (o incluso se envió), el botón llega habilitado.
      confirmed: isPaid(data.order.status),
      cancelled: data.order.status === "cancelled",
    });
  } catch (err) {
    console.error("SINPE PAGE ERROR:", err);
    res.redirect("/");
  }
};

// Estado de la orden para el navegador (página SINPE y confirmación con tarjeta).
// confirmed = pagado, enviado o entregado.
exports.paymentStatus = async (req, res) => {
  const orderId = orderToken.verify(req.params.token);
  if (!orderId) return res.status(404).json({ ok: false });

  try {
    const data = await getOrderWithItems(orderId);
    if (!data) return res.json({ ok: false });

    const { status } = data.order;
    res.json({ ok: true, status, confirmed: isPaid(status) });
  } catch (err) {
    console.error("ORDER STATUS ERROR:", err);
    res.json({ ok: false });
  }
};
