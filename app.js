const express = require("express");
const path = require("path");
const cors = require("cors");
const expressLayout = require("express-ejs-layouts");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(expressLayout);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.locals.ONVO_PUBLIC_KEY = process.env.ONVOPAY_PUBLIC_KEY;

app.use(require("./routes/homeRoute"));
app.use(require("./routes/productRoute"));
app.use(require("./routes/checkoutRoute"));
app.use(require("./routes/onvopayRoute"));
app.use(require("./routes/sinpepayRoute"));

module.exports = app;