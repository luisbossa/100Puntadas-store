const express = require("express");
const router = express.Router();
const onvoController = require("../controllers/onvopayController");

router.post("/create-intent", onvoController.createPaymentIntent);

router.get("/payment", (req, res) => {
  const { paymentIntentId } = req.query;

  console.log("paymentIntentId recibido en /payment:", paymentIntentId);  // Debugging

  if (paymentIntentId) {
    res.render("onvo-pay", { paymentIntentId, layout: false });
  } else {
    res.status(400).send("paymentIntentId no encontrado");
  }
});



module.exports = router;
