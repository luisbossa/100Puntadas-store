exports.productView = (req, res) => {
  const { paymentIntentId } = req.query;
  const { slug } = req.params;

  res.render("product-view", {
    paymentIntentId,
    slug, 
  });
};
