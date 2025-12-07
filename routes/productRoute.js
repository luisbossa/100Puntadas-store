const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.get("/product1", productController.product1);

module.exports = router;
