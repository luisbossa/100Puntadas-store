const express = require("express");
const router = express.Router();
const onvoController = require("../controllers/onvopayController");

router.post("/create-intent", onvoController.createPaymentIntent);

router.get("/payment", (req, res) => {
  res.render("onvo-pay", {
    layout: false,
  });
});

module.exports = router;
