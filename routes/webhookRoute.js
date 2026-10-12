const express = require("express");
const router = express.Router();
const webhookController = require("../controllers/webhookController");

// El panel (BBoard) avisa que un pedido quedó pagado → correo al cliente.
router.post("/order-paid", webhookController.orderPaid);
router.post("/sinpe-paid", webhookController.orderPaid); // nombre anterior
// Estado de la configuración (lo consulta el panel).
router.post("/health", webhookController.health);

module.exports = router;
