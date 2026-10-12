const { getProductPage } = require("../utils/shop");
const { findRedirect, getCatalog } = require("../utils/catalog");

exports.productView = async (req, res) => {
  const page = await getProductPage(req.params.slug);

  if (!page) {
    // URL antigua (el slug cambió): redirección permanente a la nueva.
    const slug = await findRedirect(req.params.slug);
    if (slug) return res.redirect(301, `/product/${slug}`);

    return res.status(404).render("404", { pageTitle: "Página no encontrada" });
  }

  res.render("product-view", {
    ...page,
    pageTitle: page.product.name,
    pageDescription: page.product.description,
    pageImage: page.product.images[0],
    canonicalPath: `/product/${page.slug}`,
    ogType: "product",
  });
};

/* Precios vigentes de los productos del carrito (?ids=a,b,c). El carrito
   guarda el precio al agregar; así se actualiza si empezó o terminó una
   campaña de descuento o cambió un precio en el panel. */
exports.cartPrices = async (req, res) => {
  const ids = String(req.query.ids || "").split(",").filter(Boolean).slice(0, 50);
  const { products } = await getCatalog();

  const prices = {};
  for (const id of ids) {
    const p = Object.hasOwn(products, id) ? products[id] : null;
    prices[id] = p
      ? { price: p.price, discount: p.discount, oldPrice: p.oldPrice || null, available: p.stock !== 0 }
      : { available: false };
  }
  res.set("Cache-Control", "no-store");
  res.json({ prices });
};
