require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const expressLayout = require("express-ejs-layouts");

const app = express();

/* ================= SENTRY (opcional) ================= */
if (process.env.NODE_ENV === "production") {
  const Sentry = require("@sentry/node");
  const Tracing = require("@sentry/tracing");

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Integrations.Express({ app }),
    ],
    tracesSampleRate: 0.01,
  });

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

/* ================= MIDDLEWARES ================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(expressLayout);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.locals.ONVO_PUBLIC_KEY = process.env.ONVOPAY_PUBLIC_KEY;

/* ================= ROUTES ================= */
app.use(require("./routes/homeRoute"));
app.use(require("./routes/productRoute"));
app.use(require("./routes/checkoutRoute"));
app.use(require("./routes/onvopayRoute"));
app.use(require("./routes/sinpepayRoute"));

/* ================= ERROR HANDLERS ================= */
if (process.env.NODE_ENV === "production") {
  const Sentry = require("@sentry/node");
  app.use(Sentry.Handlers.errorHandler());
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Error interno del servidor");
});

module.exports = app; // 🚨 CLAVE
