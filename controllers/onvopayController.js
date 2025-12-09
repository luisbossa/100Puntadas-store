// controllers/onvopayController.js

export async function createPaymentIntent(req, res) {
  try {
    const { amount } = req.body;

    console.log("Monto final enviado a Onvo:", amount);
    console.log("USANDO SECRET KEY:", process.env.ONVOPAY_SECRET_KEY);

    // Llamada a la API Onvo
    const response = await fetch("https://api.onvopay.com/v1/payment-intents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ONVOPAY_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount,
        currency: "CRC",
        description: "Compra en 100Puntadas",
      }),
    });

    // Verifica el estado de la respuesta de Onvo
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error en Onvo:", errorData);
      return res.status(response.status).json({ ok: false, error: errorData });
    }

    // Si la respuesta es correcta, obtenemos los datos
    const data = await response.json();
    console.log("Respuesta Onvo:", data);

    // Redirige al cliente a la página de pago
    res.json({
      ok: true,
      paymentIntentId: data.id, // Este ID lo usas en el frontend para redirigir a la página de pago
    });
  } catch (error) {
    console.error("ERROR:", error);
    return res
      .status(500)
      .json({ ok: false, error: "Error interno del servidor" });
  }
}
