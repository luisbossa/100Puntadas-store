const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");
const productController = require("../controllers/productController");

router.get("/", homeController.home);
router.get("/product1", productController.product1);

module.exports = router;


