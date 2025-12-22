const checkoutService = require("../services/checkoutService");

exports.createCheckout = async (req, res) => {
  try {
    const { customer, cart, totalAmount } = req.body;

    if (!customer || !cart || cart.length === 0) {
      return res.status(400).json({
        ok: false,
        message: "Datos incompletos",
      });
    }

    const order = await checkoutService.createOrder({
      customer,
      cart,
      totalAmount,
    });

    res.status(201).json({
      ok: true,
      orderId: order.id,
    });
  } catch (error) {
    console.error("CHECKOUT ERROR:", error);
    res.status(500).json({
      ok: false,
      message: "Error procesando checkout",
    });
  }
};
