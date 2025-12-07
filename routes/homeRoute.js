const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");

router.get("/", homeController.home);
router.get("/policy", homeController.policy);
router.get("/sizes", homeController.sizes);

module.exports = router;


