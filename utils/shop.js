const { getCatalog } = require("./catalog");
const { formatPrice } = require("../public/js/pricing");
const COLORS = require("../data/colors");

/* ============================================================
   HELPERS DE TIENDA para las vistas (home, producto, relacionados)
   Los productos vienen de la base de datos (utils/catalog.js).
============================================================ */
const DEFAULT_SIZES = ["XS", "S", "M", "L"];

// "30% OFF" calculado del precio anterior (null si no aplica).
const salePercent = (product) =>
  product.oldPrice > product.price
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : null;

// Datos que necesita una tarjeta de producto.
const toCard = (product) => ({
  slug: product.slug,
  name: product.name,
  url: `/product/${product.slug}`,
  image: product.images[0],
  price: formatPrice(product.price),
  oldPrice: product.oldPrice ? formatPrice(product.oldPrice) : null,
  onSale: product.discount === 1,
  salePercent: salePercent(product),
  soldOut: product.stock === 0,
});

exports.formatPrice = formatPrice;
exports.DEFAULT_SIZES = DEFAULT_SIZES;

exports.getProduct = async (slug) => {
  const { products } = await getCatalog();
  return Object.hasOwn(products, slug) ? products[slug] : null;
};

exports.getCollections = async () => {
  const { products, collections } = await getCatalog();
  return collections.map((collection) => ({
    ...collection,
    products: collection.products.map((slug) => toCard(products[slug])),
  }));
};

// Para el menú: [{ id, title }]
exports.getNavCollections = async () => {
  const { collections } = await getCatalog();
  return collections.map(({ id, title }) => ({ id, title }));
};

// Productos al azar (disponibles) distintos del actual.
async function getRelated(currentSlug, limit = 4) {
  const { products } = await getCatalog();
  const pool = Object.values(products).filter(
    (p) => p.slug !== currentSlug && p.stock !== 0,
  );

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, limit).map(toCard);
}

/* ============================================================
   PÁGINA DE PRODUCTO
============================================================ */
// Grupos de opciones según el tipo de prenda.
function getOptionGroups(product) {
  const sizes = product.sizes?.length ? product.sizes : DEFAULT_SIZES;
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
    { label: "Tallas", name: "single-size", type: "size", options: sizes },
    colors,
  ];
}

exports.getProductPage = async (slug) => {
  const product = await exports.getProduct(slug);
  if (!product) return null;

  return {
    slug,
    product,
    price: formatPrice(product.price),
    soldOut: product.stock === 0,
    optionGroups: getOptionGroups(product),
    // "Lo que necesitas saber" solo aplica a bikinis (top + bottom combinables)
    showFitNotes: product.productType === "bikini",
    related: await getRelated(slug),
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
