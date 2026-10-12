/* ============================================================
   PAGO SINPE — espera la confirmación del comprobante.
   Consulta el estado cada 5 s (solo con la pestaña visible) y
   habilita el botón para ir a la confirmación cuando está pagado.
============================================================ */
/* Botones "Copiar" de los datos bancarios */
document.addEventListener("click", async (event) => {
  const copyBtn = event.target.closest("[data-copy]");
  if (!copyBtn) return;

  try {
    await navigator.clipboard.writeText(copyBtn.dataset.copy);
    copyBtn.textContent = "¡Copiado!";
    copyBtn.classList.add("is-copied");
    setTimeout(() => {
      copyBtn.textContent = "Copiar";
      copyBtn.classList.remove("is-copied");
    }, 1800);
  } catch (err) {
    console.error("No se pudo copiar", err);
  }
});

(function () {
  const btn = document.getElementById("sinpeConfirmBtn");
  const status = document.getElementById("sinpeStatus");
  if (!btn) return;

  const { orderToken } = btn.dataset;
  const confirmUrl = `/confirm?order=${encodeURIComponent(orderToken)}`;
  const POLL_MS = 5000;
  const MAX_WAIT_MS = 30 * 60 * 1000; // deja de consultar tras 30 min
  const startedAt = Date.now();
  let timer = null;

  btn.addEventListener("click", () => {
    window.location.href = confirmUrl;
  });

  // Ya llegó aprobado desde el servidor: no hay nada que esperar.
  if (!btn.disabled) return;

  async function checkStatus() {
    try {
      const res = await fetch(`/api/order-status/${encodeURIComponent(orderToken)}`);
      const data = await res.json();

      // "confirmed" = pagado, enviado o entregado (el panel pudo avanzarlo más).
      if (data?.ok && data.confirmed) {
        stop();
        btn.disabled = false;
        btn.textContent = "Ver mi pedido";
        status.textContent = "✅ Pago confirmado. Ya puedes ver tu pedido.";
        status.classList.add("is-confirmed");
        return;
      }

      if (data?.ok && data.status === "cancelled") {
        stop();
        btn.hidden = true;
        status.textContent =
          "Este pedido fue cancelado. Si ya realizaste el pago, escríbenos por WhatsApp con tu número de pedido.";
        return;
      }
    } catch (err) {
      console.error("Error verificando estado SINPE", err);
    }

    if (Date.now() - startedAt > MAX_WAIT_MS) {
      stop();
      status.textContent =
        "Seguimos verificando tu pago. Recarga esta página más tarde o escríbenos por WhatsApp al 8792-5172.";
    }
  }

  function start() {
    if (!timer && btn.disabled) timer = setInterval(checkStatus, POLL_MS);
  }

  function stop() {
    clearInterval(timer);
    timer = null;
  }

  // No consultar mientras la pestaña está en segundo plano.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (btn.disabled) {
      checkStatus();
      start();
    }
  });

  checkStatus(); // primera consulta inmediata
  start();
})();
