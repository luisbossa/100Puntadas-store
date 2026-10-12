const express = require("express");
const router = express.Router();
const sinpeController = require("../controllers/sinpepayController");

router.get("/payment-sinpe", sinpeController.paymentPage);
router.get("/api/order-status/:token", sinpeController.paymentStatus);
// Ruta anterior (páginas SINPE abiertas antes del cambio).
router.get("/payment-sinpe/:token/status", sinpeController.paymentStatus);

module.exports = router;
