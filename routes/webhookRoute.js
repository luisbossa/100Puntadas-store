const express = require("express");
const router = express.Router();
const webhookController = require("../controllers/webhookController");

router.post("/sinpe-paid", webhookController.sinpePaid);

module.exports = router;
