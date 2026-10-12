const catalog = require("../data/catalog");
const collections = require("../data/collections");

/* ============================================================
   HELPERS DE TIENDA para las vistas (home, producto, relacionados)
============================================================ */

const { formatPrice } = require("../public/js/pricing");

// Datos que necesita una tarjeta de producto.
const toCard = (slug) => {
  const product = catalog[slug];
  return {
    slug,
    name: product.name,
    url: `/product/${slug}`,
    image: product.images[0],
    price: formatPrice(product.price),
    oldPrice: product.oldPrice ? formatPrice(product.oldPrice) : null,
    onSale: product.discount === 1,
    soldOut: product.stock === 0,
  };
};

exports.formatPrice = formatPrice;

exports.getProduct = (slug) =>
  Object.hasOwn(catalog, slug) ? catalog[slug] : null;

exports.getCollections = () =>
  collections.map((collection) => ({
    ...collection,
    products: collection.products.map(toCard),
  }));

// Productos al azar (disponibles) distintos del actual.
exports.getRelated = (currentSlug, limit = 4) => {
  const pool = Object.keys(catalog).filter(
    (slug) => slug !== currentSlug && catalog[slug].stock !== 0,
  );

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, limit).map(toCard);
};

/* ============================================================
   PÁGINA DE PRODUCTO
============================================================ */
const DEFAULT_SIZES = ["XS", "S", "M", "L"];

const COLORS = require("../data/colors");

// Grupos de opciones según el tipo de prenda.
function getOptionGroups(product) {
  const sizes = product.sizes || DEFAULT_SIZES;
  const colors = { label: "Colores", name: "color", type: "color", options: COLORS };

  if (product.productType === "bikini") {
    return [
      { label: "Top", name: "top-size", type: "size", options: sizes },
      { label: "Bottom", name: "bottom-size", type: "size", options: sizes },
      { label: "Cobertura", name: "bottom-style", type: "style", options: product.styles || [], wrap: true },
    ];
  }

  if (["set", "crochet"].includes(product.productType)) {
    return [
      { label: "Top", name: "top-size", type: "size", options: sizes },
      { label: "Bottom", name: "bottom-size", type: "size", options: sizes },
      { ...colors, wrap: true },
    ];
  }

  return [
    { label: "Tallas", name: "single-size", type: "size", options: DEFAULT_SIZES },
    colors,
  ];
}

exports.getProductPage = (slug) => {
  const product = exports.getProduct(slug);
  if (!product) return null;

  return {
    slug,
    product,
    price: formatPrice(product.price),
    soldOut: product.stock === 0,
    optionGroups: getOptionGroups(product),
    // "Lo que necesitas saber" solo aplica a bikinis (top + bottom combinables)
    showFitNotes: product.productType === "bikini",
    related: exports.getRelated(slug),
    // Lo mínimo que necesita el navegador para armar el ítem del carrito
    cartData: {
      id: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency,
      image: product.images[0],
      discount: product.discount,
    },
  };
};
