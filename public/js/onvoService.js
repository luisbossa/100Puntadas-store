import { createPaymentIntentInternal } from "./onvopayService.js";

export async function createOrder(req, res) {
  const { totals } = req.body;

  // crear payment intent
  const paymentIntentId = await createPaymentIntentInternal(totals.total);

  res.json({
    success: true,
    paymentIntentId,
  });
}
