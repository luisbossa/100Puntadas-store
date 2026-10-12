/* ============================================================
   PAGO SINPE — espera la confirmación del comprobante.
   Consulta el estado cada 5 s (solo con la pestaña visible) y
   habilita el botón para ir a la confirmación cuando está pagado.
============================================================ */
(function () {
  const btn = document.getElementById("sinpeConfirmBtn");
  const status = document.getElementById("sinpeStatus");
  if (!btn) return;

  const { orderToken, orderNumber, total, createdAt } = btn.dataset;
  const POLL_MS = 5000;
  const MAX_WAIT_MS = 30 * 60 * 1000; // deja de consultar tras 30 min
  const startedAt = Date.now();
  let timer = null;

  async function checkStatus() {
    try {
      const res = await fetch(`/payment-sinpe/${encodeURIComponent(orderToken)}/status`);
      const data = await res.json();

      if (data?.ok && data.status === "paid") {
        stop();
        btn.disabled = false;
        btn.textContent = "Confirmar pedido";
        status.textContent = "✅ Pago confirmado. Ya puedes continuar con tu pedido.";
        return;
      }
    } catch (err) {
      console.error("Error verificando estado SINPE", err);
    }

    if (Date.now() - startedAt > MAX_WAIT_MS) {
      stop();
      status.textContent =
        "Seguimos verificando tu pago. Recarga esta página más tarde o escríbenos por Whatsapp al 8792-5172.";
    }
  }

  function start() {
    if (!timer && btn.disabled) timer = setInterval(checkStatus, POLL_MS);
  }

  function stop() {
    clearInterval(timer);
    timer = null;
  }

  // No consultar mientras la pestaña está en segundo plano
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else {
      checkStatus();
      start();
    }
  });

  btn.addEventListener("click", () => {
    sessionStorage.setItem(
      "order_completed",
      JSON.stringify({ orderNumber, total: Number(total), paymentMethod: "SINPE Móvil", createdAt }),
    );
    window.location.href = "/confirm";
  });

  start();
})();
