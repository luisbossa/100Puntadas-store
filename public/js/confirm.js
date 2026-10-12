/* ============================================================
   CONFIRMACIÓN — el servidor ya verificó el pedido (/confirm?order=…).
   Aquí: vaciar el carrito y, si el pago con tarjeta aún se está
   procesando, consultar el estado hasta que ONVO lo confirme.
============================================================ */
(function () {
  const receipt = document.querySelector("[data-confirm-state]");
  if (!receipt) return;

  const { confirmState, orderToken } = receipt.dataset;

  // El pedido ya está pagado: el carrito y los datos del checkout ya no se necesitan.
  if (confirmState === "paid") {
    localStorage.removeItem("cartItems");
    localStorage.removeItem("checkoutData");
  }
  // Restos de la versión anterior de esta página.
  sessionStorage.removeItem("order_completed");
  localStorage.removeItem("order_completed");

  if (confirmState !== "processing") return;

  const POLL_MS = 4000;
  const MAX_WAIT_MS = 5 * 60 * 1000;
  const startedAt = Date.now();

  const timer = setInterval(async () => {
    try {
      const res = await fetch(`/api/order-status/${encodeURIComponent(orderToken)}`);
      const data = await res.json();
      // Pagado (o cancelado): recargar para mostrar el recibo verificado.
      if (data?.ok && (data.confirmed || data.status === "cancelled")) {
        clearInterval(timer);
        window.location.reload();
        return;
      }
    } catch (err) {
      console.error("Error consultando el pago", err);
    }

    if (Date.now() - startedAt > MAX_WAIT_MS) {
      clearInterval(timer);
      document.querySelector(".confirm-subtext").textContent =
        "Tu pago está tardando más de lo normal. Recarga la página en unos minutos o escríbenos por WhatsApp con tu número de pedido.";
    }
  }, POLL_MS);
})();
