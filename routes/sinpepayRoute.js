const express = require("express");
const router = express.Router();
const sinpeController = require("../controllers/sinpepayController");
const orderToken = require("../utils/orderToken");
const db = require("../db/pool");

router.get("/confirm", sinpeController.sinpeConfirm);

// La orden se identifica con un token firmado (no con el id),
// para que nadie pueda ver los datos de otra persona cambiando el número.
router.get("/payment-sinpe", async (req, res) => {
  const orderId = orderToken.verify(req.query.order);
  if (!orderId) return res.redirect("/");

  try {
    const { rows: orderRows } = await db.query(
      "SELECT * FROM orders WHERE id = $1",
      [orderId]
    );

    if (!orderRows.length) return res.redirect("/");

    const order = orderRows[0];

    const { rows: orderItems } = await db.query(
      "SELECT * FROM order_items WHERE order_id = $1",
      [orderId]
    );

    res.render("sinpe-pay", {
      layout: false,
      order,
      orderItems,
      orderToken: req.query.order,
    });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

router.get("/payment-sinpe/:token/status", async (req, res) => {
  const orderId = orderToken.verify(req.params.token);
  if (!orderId) return res.status(404).json({ ok: false });

  try {
    const { rows } = await db.query("SELECT status FROM orders WHERE id = $1", [
      orderId,
    ]);

    if (!rows.length) {
      return res.json({ ok: false });
    }

    res.json({
      ok: true,
      status: rows[0].status,
    });
  } catch (err) {
    console.error(err);
    res.json({ ok: false });
  }
});

module.exports = router;
