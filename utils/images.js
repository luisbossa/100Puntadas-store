/* ============================================================
   IMÁGENES RESPONSIVE
   img("/images/products/x.jpg", { alt, sizes, class }) devuelve un <img>
   con srcset de las versiones WebP generadas por `npm run images`
   (ver scripts/optimize-images.js). Si una foto no está optimizada,
   se usa la original tal cual.
============================================================ */
let manifest = {};
try {
  manifest = require("../data/image-manifest.json");
} catch {
  console.warn("Sin data/image-manifest.json: corre `npm run images`");
}

const escape = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const variantUrl = (src, width) =>
  `/images/opt${src.slice("/images".length).replace(/\.\w+$/, "")}-${width}.webp`;

// Datos de la versión optimizada: { src, srcset, width, height } (o null)
function responsive(src) {
  const entry = manifest[src];
  if (!entry) return null;

  const srcset = entry.widths
    .map((w) => `${variantUrl(src, w)} ${Math.min(w, entry.width)}w`)
    .join(", ");
  // src por defecto: 800px (o la mayor disponible) para navegadores sin srcset
  const fallback = entry.widths.includes(800) ? 800 : entry.widths[entry.widths.length - 1];

  return { src: variantUrl(src, fallback), srcset, width: entry.width, height: entry.height };
}

// Etiqueta <img> completa. attrs: alt, sizes, class, loading, decoding, fetchpriority…
function img(src, attrs = {}) {
  const data = responsive(src);
  const { sizes = "100vw", ...rest } = attrs;

  const all = {
    src: data ? data.src : src,
    ...(data && { srcset: data.srcset, sizes }),
    ...(data && { width: data.width, height: data.height }),
    loading: "lazy",
    decoding: "async",
    ...rest,
  };

  const html = Object.entries(all)
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => (v === true ? k : `${k}="${escape(v)}"`))
    .join(" ");

  return `<img ${html}>`;
}

module.exports = { img, responsive, variantUrl };
