const express = require("express");
const router = express.Router();

// 👉 SOLO RENDER (sin layout)
router.get("/checkout", (req, res) => {
  res.render("checkout", {
    layout: false,
  });
});

module.exports = router;
