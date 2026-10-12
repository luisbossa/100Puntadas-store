const { getProductPage } = require("../utils/shop");
const { findRedirect } = require("../utils/catalog");

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
