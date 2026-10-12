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
    // El panel administrativo (otro dominio) muestra las imágenes de productos.
    crossOriginResourcePolicy: { policy: "cross-origin" },
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
/* ---------- Archivos estáticos y caché ----------
   CSS/JS se piden con ?v=<versión> (helper asset() en las vistas): se cachean
   un año y cada deploy cambia la versión. Imágenes y fuentes: 30 días. */
const ASSET_VERSION = (
  process.env.VERCEL_GIT_COMMIT_SHA || Date.now().toString(36)
).slice(0, 8);
app.locals.asset = (file) => `${file}?v=${ASSET_VERSION}`;

app.use((req, res, next) => {
  const folder = req.path.match(/^\/(css|js|images|fonts)\//)?.[1];

  if (folder && req.query.v) {
    res.set("Cache-Control", "public, max-age=31536000, immutable");
  } else if (folder === "images" || folder === "fonts") {
    res.set("Cache-Control", "public, max-age=2592000, stale-while-revalidate=86400");
  } else if (folder) {
    res.set("Cache-Control", "public, max-age=3600");
  }
  next();
});
app.use(express.static(path.join(__dirname, "public"), { cacheControl: false }));

app.locals.ONVO_PUBLIC_KEY = process.env.ONVOPAY_PUBLIC_KEY;
app.locals.formatPrice = require("./public/js/pricing").formatPrice;
app.locals.img = require("./utils/images").img;
app.locals.store = require("./data/store");
// Nombres de colores para el carrito (navegador): { white: "Blanco", … }
app.locals.colorLabels = Object.fromEntries(
  require("./data/colors").map(({ id, label }) => [id, label]),
);

// URL absoluta para SEO/Open Graph: las imágenes subidas desde el panel
// ya son absolutas (Vercel Blob); las del repo son rutas /images/...
const SITE_URL = "https://100puntadas.vercel.app";
app.locals.siteUrl = SITE_URL;
app.locals.absUrl = (src) => (/^https?:\/\//.test(src) ? src : SITE_URL + src);

// Colecciones del menú (desde la base de datos, cacheadas).
const { getCatalog } = require("./utils/catalog");
app.use(async (req, res, next) => {
  if (req.method !== "GET") return next();
  try {
    const { collections, campaign } = await getCatalog();
    res.locals.navCollections = collections.map(({ id, title }) => ({ id, title }));
    // Campaña de descuento vigente (Promociones en el panel): barra de promoción y textos.
    res.locals.campaign = campaign;
  } catch (err) {
    console.error("MENÚ: no se pudieron cargar las colecciones", err.message);
    res.locals.navCollections = [];
    res.locals.campaign = null;
  }
  next();
});

app.use(require("./routes/shopRoute"));
app.use(require("./routes/checkoutRoute"));
app.use(require("./routes/onvopayRoute"));
app.use(require("./routes/sinpepayRoute"));
app.use("/webhooks", require("./routes/webhookRoute"));

// Cualquier otra ruta: página 404 con el diseño del sitio
app.use((req, res) => {
  res.status(404).render("404", { pageTitle: "Página no encontrada" });
});

// Error inesperado (p. ej. la base de datos no responde).
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("ERROR:", err);
  if (req.accepts(["html", "json"]) === "json" || req.path.startsWith("/api/")) {
    return res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
  res.status(500).render("500", { pageTitle: "Algo salió mal" });
});

module.exports = app;
