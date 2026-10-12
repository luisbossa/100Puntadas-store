const db = require("../db/pool");

/* ============================================================
   PEDIDOS — lectura y cambio a "pagado", compartido por el
   webhook de ONVO, la página de confirmación y el webhook del
   panel (BBoard). El correo se envía desde quien llama.
============================================================ */

// Estados en los que el pago ya está confirmado.
const PAID_STATUSES = ["paid", "shipped", "delivered"];
const isPaid = (status) => PAID_STATUSES.includes(status);

async function getOrderWithItems(orderId) {
  const [{ rows: orders }, { rows: items }] = await Promise.all([
    db.query("SELECT * FROM orders WHERE id = $1", [orderId]),
    db.query("SELECT * FROM order_items WHERE order_id = $1 ORDER BY id", [orderId]),
  ]);
  return orders[0] ? { order: orders[0], items } : null;
}

/* Marca el pedido como pagado si el monto cobrado coincide.
   Solo desde pending/cancelled: un reintento del webhook no debe
   devolver a "pagado" un pedido que ya se envió.
   Devuelve true si el pedido cambió (para enviar el correo una sola vez). */
async function markPaid(orderId, amountMinor, paymentIntentId = null) {
  const { rowCount } = await db.query(
    `UPDATE orders
     SET status = 'paid', paid_at = NOW(),
         payment_intent_id = COALESCE(payment_intent_id, $3)
     WHERE id = $1
       AND status IN ('pending', 'cancelled')
       AND ROUND(total * 100) = $2`,
    [orderId, Number(amountMinor), paymentIntentId],
  );
  return rowCount > 0;
}

module.exports = { PAID_STATUSES, isPaid, getOrderWithItems, markPaid };
