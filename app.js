// app.js
require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const expressLayout = require("express-ejs-layouts");

const app = express();

// ✅ Inicializar Sentry solo en producción
if (process.env.NODE_ENV === "production") {
  const Sentry = require("@sentry/node");
  const Tracing = require("@sentry/tracing");

  Sentry.init({
    dsn: process.env.SENTRY_DSN, // Tu DSN de Sentry
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Integrations.Express({ app }),
    ],
    tracesSampleRate: 0.01 
  });

  // Middleware de Sentry
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

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

// ✅ Middleware de error de Sentry (solo si está activo)
if (process.env.NODE_ENV === "production") {
  const Sentry = require("@sentry/node");
  app.use(Sentry.Handlers.errorHandler());
}

// Middleware de manejo de errores general
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Error interno del servidor");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
