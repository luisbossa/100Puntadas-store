const express = require("express");
const router = express.Router();
const checkoutController = require("../controllers/checkoutController");

// Páginas
router.get("/checkout", checkoutController.checkoutPage);
router.get("/confirm", checkoutController.confirmPage);

// API
router.post("/api/orders", checkoutController.getInfo);
router.get("/api/provinces", checkoutController.getProvinces);
router.get("/api/cantons/:provinceCode", checkoutController.getCantons);
router.get("/api/districts/:cantonCode", checkoutController.getDistricts);

module.exports = router;
