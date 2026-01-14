const express = require("express");
const router = express.Router();
const onvoController = require("../controllers/onvopayController");

router.get("/confirm", onvoController.confirm);

router.post("/create-intent", onvoController.createPaymentIntent);

router.get("/payment", (req, res) => {
  const { paymentIntentId, orderNumber } = req.query;

  if (!paymentIntentId || !orderNumber) {
    return res.redirect("/");
  }

  res.render("onvo-pay", {
    layout: false,
    paymentIntentId,
    orderNumber,
    ONVO_PUBLIC_KEY: process.env.ONVOPAY_PUBLIC_KEY,
  });
});

router.post("/onvo", onvoController.handleWebhook);

module.exports = router;
