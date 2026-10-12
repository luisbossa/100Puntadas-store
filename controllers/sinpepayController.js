const db = require("../db/pool");
const orderToken = require("../utils/orderToken");

/* La orden se identifica con un token firmado (no con el id),
   para que nadie pueda ver los datos de otra persona cambiando el número. */

exports.paymentPage = async (req, res) => {
  const orderId = orderToken.verify(req.query.order);
  if (!orderId) return res.redirect("/");

  try {
    const [{ rows: orderRows }, { rows: orderItems }] = await Promise.all([
      db.query("SELECT * FROM orders WHERE id = $1", [orderId]),
      db.query("SELECT * FROM order_items WHERE order_id = $1", [orderId]),
    ]);

    if (!orderRows.length) return res.redirect("/");

    res.render("sinpe-pay", {
      layout: "checkout-layout",
      pageTitle: "Pago por SINPE",
      step: 2,
      bodyClass: "page-sinpe",
      order: orderRows[0],
      orderItems,
      orderToken: req.query.order,
    });
  } catch (err) {
    console.error("SINPE PAGE ERROR:", err);
    res.redirect("/");
  }
};

exports.paymentStatus = async (req, res) => {
  const orderId = orderToken.verify(req.params.token);
  if (!orderId) return res.status(404).json({ ok: false });

  try {
    const { rows } = await db.query("SELECT status FROM orders WHERE id = $1", [
      orderId,
    ]);

    if (!rows.length) return res.json({ ok: false });

    res.json({ ok: true, status: rows[0].status });
  } catch (err) {
    console.error("SINPE STATUS ERROR:", err);
    res.json({ ok: false });
  }
};
