exports.home = (req, res) => {
  res.render("index", {});
};

exports.policy = (req, res) => {
  res.render("policy", {});
};

exports.sizes = (req, res) => {
  res.render("sizes", {});
};
