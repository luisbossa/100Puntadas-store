// app.js
require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const expressLayout = require("express-ejs-layouts");

const app = express();

app.locals.process = {
  env: process.env,
};

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(expressLayout);

// EJS config
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Pasar la clave pública al frontend
app.locals.ONVO_PUBLIC_KEY = process.env.ONVOPAY_PUBLIC_KEY;

// Routes
app.use(require("./routes/homeRoute"));
app.use(require("./routes/productRoute"));
app.use(require("./routes/checkoutRoute"));
app.use(require("./routes/onvopayRoute"));


const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

