const db = require("../db/pool");
const { markPaid, getOrderWithItems, isPaid } = require("./orders");
const sendOrderConfirmationEmail = require("./sendOrderConfirmationEmail");

/* ============================================================
   ONVO PAY — API de intenciones de pago (montos en la unidad
   mínima: ₡1 = 100). Docs: https://docs.onvopay.com
============================================================ */
const API = "https://api.onvopay.com/v1";

async function request(path, { method = "GET", body } = {}) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ONVOPAY_SECRET_KEY}`,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10000),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || `ONVO respondió ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

// Crea el PaymentIntent de la orden (o reutiliza el que ya tiene).
async function createIntent(order) {
  if (order.payment_intent_id) return { id: order.payment_intent_id };

  const intent = await request("/payment-intents", {
    method: "POST",
    body: {
      amount: Math.round(Number(order.total) * 100),
      currency: "CRC",
      description: `Pedido #${order.order_number || order.id} - 100Puntadas`,
      metadata: { orderId: String(order.id) },
    },
  });

  await db.query("UPDATE orders SET payment_intent_id = $2 WHERE id = $1", [order.id, intent.id]);
  return intent;
}

const getIntent = (id) => request(`/payment-intents/${encodeURIComponent(id)}`);

/* Aplica a la orden el resultado de un PaymentIntent (del webhook o
   consultado a ONVO). Si quedó pagada recién ahora, envía el correo.
   Devuelve { paid, changed }. */
async function syncFromIntent(orderId, intent) {
  if (intent?.status !== "succeeded" || Number(intent?.metadata?.orderId) !== Number(orderId)) {
    return { paid: false, changed: false };
  }

  const changed = await markPaid(orderId, intent.amount, intent.id);
  const data = await getOrderWithItems(orderId);

  if (changed) {
    // Si el correo falla no se revierte el pago (ONVO reintentaría y no se reenviaría).
    await sendOrderConfirmationEmail(data.order, data.items).catch((err) =>
      console.error("ONVO: error enviando correo", err.message),
    );
  } else if (data && !isPaid(data.order.status)) {
    // ONVO cobró pero el monto no coincide con la orden: revisar a mano.
    console.warn("ONVO: monto distinto al de la orden", { orderId, amount: intent.amount });
  }

  return { paid: Boolean(data && isPaid(data.order.status)), changed };
}

module.exports = { createIntent, getIntent, syncFromIntent };
