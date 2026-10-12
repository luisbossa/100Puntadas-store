/* ============================================================
   PAGO CON TARJETA — monta el formulario seguro de ONVO.
============================================================ */
(function () {
  const container = document.getElementById("onvo-checkout-container");
  const { publicKey, paymentIntent } = container?.dataset || {};
  if (!paymentIntent) return;

  function mount() {
    container.replaceChildren();
    onvo
      .pay({
        publicKey,
        paymentIntentId: paymentIntent,
        paymentType: "one_time",
        onSuccess: () => {
          window.location.href = "/confirm";
        },
        onError: (err) => {
          console.error("Error en el pago:", err);
        },
      })
      .render("#onvo-checkout-container");
  }

  // El SDK se carga aparte; se espera a que esté disponible (máx. 15 s)
  const startedAt = Date.now();
  (function waitForSDK() {
    if (typeof onvo !== "undefined") return mount();
    if (Date.now() - startedAt > 15000) {
      const loading = container.querySelector(".onvo-loading");
      loading.textContent =
        "No pudimos cargar el formulario de pago. Recarga la página para intentarlo de nuevo.";
      loading.classList.add("is-error");
      return;
    }
    setTimeout(waitForSDK, 100);
  })();
})();
