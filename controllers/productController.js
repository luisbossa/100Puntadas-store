const { getProductPage } = require("../utils/shop");

exports.productView = (req, res) => {
  const page = getProductPage(req.params.slug);

  if (!page) {
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
