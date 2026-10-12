const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");
const productController = require("../controllers/productController");

router.get("/", homeController.home);
router.get("/policy", homeController.policy);
router.get("/sizes", homeController.sizes);
router.get("/product/:slug", productController.productView);
router.get("/api/cart/prices", productController.cartPrices);

module.exports = router;
