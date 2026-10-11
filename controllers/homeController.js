const { getCollections } = require("../utils/shop");

exports.home = (req, res) => {
  res.render("index", {
    collections: getCollections(),
    isHome: true,
    noCursorZone: true,
  });
};

exports.policy = (req, res) => {
  res.render("policy", {
    pageTitle: "Condiciones de venta",
    pageDescription:
      "Política de cambios, envíos y condiciones de compra de 100 Puntadas.",
    canonicalPath: "/policy",
  });
};

exports.sizes = (req, res) => {
  res.render("sizes", {
    pageTitle: "Guía de tallas",
    pageDescription:
      "Tabla de medidas de 100 Puntadas: encuentra tu talla de bikini según cintura, cadera y busto.",
    canonicalPath: "/sizes",
  });
};
