const express = require("express");
const router = express.Router();
const webhookController = require("../controllers/webhookController");

// El panel (BBoard) avisa que un pedido quedó pagado → correo al cliente.
router.post("/order-paid", webhookController.orderPaid);
router.post("/sinpe-paid", webhookController.orderPaid); // nombre anterior

module.exports = router;
