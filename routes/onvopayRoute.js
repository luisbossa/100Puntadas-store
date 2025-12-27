const express = require("express");
const router = express.Router();
const onvoController = require("../controllers/onvopayController");
const db = require("../db/pool");

router.post("/create-intent", onvoController.createPaymentIntent);

router.get("/payment", (req, res) => {
  const { paymentIntentId } = req.query;

  if (!paymentIntentId) {
    return res.redirect("/");
  }

  res.render("onvo-pay", {
    layout: false,
    paymentIntentId,
    ONVO_PUBLIC_KEY: process.env.ONVOPAY_PUBLIC_KEY,
  });
});

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

module.exports = router;
