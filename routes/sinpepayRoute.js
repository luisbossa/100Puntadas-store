const express = require("express");
const router = express.Router();
const sinpeController = require("../controllers/sinpepayController");
const db = require("../db/pool");

router.get("/confirm", sinpeController.sinpeConfirm);

router.get("/payment-sinpe", async (req, res) => {
  const { orderId } = req.query;
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
    });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

router.get("/payment-sinpe/:id/status", async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await db.query("SELECT status FROM orders WHERE id = $1", [
      id,
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
