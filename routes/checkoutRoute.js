const express = require("express");
const router = express.Router();

const checkoutController = require("../controllers/checkoutController");

router.post("/api/orders", checkoutController.getInfo);

router.get("/checkout", (req, res) => {
  res.render("checkout", {
    layout: false,
  });
});


module.exports = router;
