const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const expressLayout = require("express-ejs-layouts");

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(expressLayout);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

app.use(express.static(path.join(__dirname, "..", "public")));

app.use(require("../routes/homeRoute"));
app.use(require("../routes/productRoute"));

module.exports = app;
