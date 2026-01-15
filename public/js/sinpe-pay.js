const orderId = window.SINPE_ORDER_ID;
const btn = document.getElementById("btn-sinpe-confirm");
const pendingMsg = document.querySelector(".pending-msg");

if (!orderId || !btn) {
  console.warn("SINPE polling detenido: orderId o botón no disponible");
} else {
  const polling = setInterval(checkPaymentStatus, 5000);

  async function checkPaymentStatus() {
    try {
      const res = await fetch(`/payment-sinpe/${orderId}/status`);
      const data = await res.json();

      if (!data?.ok) return;

      if (data.status === "paid") {
        btn.disabled = false;
        btn.textContent = "Confirmar pedido";

        pendingMsg.textContent =
          "✅ Pago confirmado. Ya puedes continuar con tu pedido.";

        clearInterval(polling);
      }
    } catch (err) {
      console.error("Error verificando estado SINPE", err);
    }
  }
}
