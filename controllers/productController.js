exports.product1 = (req, res) => {
  const { paymentIntentId } = req.query; 
  
  res.render("product-view", { paymentIntentId }); 
};
