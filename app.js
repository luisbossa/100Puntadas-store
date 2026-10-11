const express = require("express");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const expressLayout = require("express-ejs-layouts");

const app = express();

// Vercel está detrás de un proxy: necesario para leer la IP real (rate limit).
app.set("trust proxy", 1);

app.use(
  helmet({
    // El sitio usa scripts inline, GA, GSAP, Swiper y el SDK de ONVO;
    // una CSP se configura aparte para no romperlos.
    contentSecurityPolicy: false,
    // El checkout de ONVO puede abrir ventanas de autenticación 3DS.
    crossOriginOpenerPolicy: false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressLayout);
app.use("/onvo", express.json({ type: "*/*" }));

// Límite de peticiones para crear órdenes y pagos (por IP).
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    error: "Demasiados intentos. Intenta de nuevo en unos minutos.",
  },
});
app.use(["/api/orders", "/create-intent"], paymentLimiter);

app.set("view engine", "ejs");
// Cada vista declara sus propios <link>/<script>; el layout los ubica en <head> y al final del <body>.
app.set("layout extractStyles", true);
app.set("layout extractScripts", true);
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.locals.ONVO_PUBLIC_KEY = process.env.ONVOPAY_PUBLIC_KEY;
app.locals.formatPrice = require("./public/js/pricing").formatPrice;

app.use(require("./routes/homeRoute"));
app.use(require("./routes/productRoute"));
app.use(require("./routes/checkoutRoute"));
app.use(require("./routes/onvopayRoute"));
app.use(require("./routes/sinpepayRoute"));
app.use("/webhooks", require("./routes/webhookRoute"));

// Cualquier otra ruta: página 404 con el diseño del sitio
app.use((req, res) => {
  res.status(404).render("404", { pageTitle: "Página no encontrada" });
});

module.exports = app;
