const express = require("express");
const router = express.Router();
const onvoController = require("../controllers/onvopayController");

router.get("/payment", onvoController.paymentPage);
router.post("/create-intent", onvoController.createPaymentIntent);
router.post("/onvo", onvoController.handleWebhook);

module.exports = router;
