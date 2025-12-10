exports.home = (req, res) => {
  const { paymentIntentId } = req.query;
  res.render("index", { paymentIntentId });
};

exports.policy = (req, res) => {
  res.render("policy", { paymentIntentId: null });
};

exports.sizes = (req, res) => {
  res.render("sizes", { paymentIntentId: null });
};
