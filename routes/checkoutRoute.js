const express = require("express");
const router = express.Router();

const checkoutController = require("../controllers/checkoutController");

router.post("/api/orders", checkoutController.getInfo);

router.get("/checkout", (req, res) => {
  res.render("checkout", {
    layout: false,
  });
});

router.get("/api/provinces", checkoutController.getProvinces);
router.get("/api/cantons/:provinceCode", checkoutController.getCantons);
router.get("/api/districts/:cantonCode", checkoutController.getDistricts);


module.exports = router;
