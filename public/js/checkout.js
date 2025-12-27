document.addEventListener("DOMContentLoaded", async () => {
  const data = JSON.parse(localStorage.getItem("checkoutData"));

  if (!data || !data.cart || data.cart.length === 0) {
    console.warn("No hay datos de checkout");
    return;
  }

  /* ================= CONSTANTES ================= */
  const SHIPPING_COST = Number(window.SHIPPING_COST || 2500);
  const DISCOUNT_RATE = Number(window.DISCOUNT_RATE || 0.15);
  const DISCOUNT_MIN_ITEMS = Number(window.DISCOUNT_MIN_ITEMS || 2);

  /* ================= SUBTOTAL ================= */
  const subtotal = data.cart.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  const totalItems = data.cart.reduce(
    (sum, item) => sum + Number(item.quantity),
    0
  );

  /* ================= DESCUENTO ================= */
  const discount =
    totalItems >= DISCOUNT_MIN_ITEMS ? Math.round(subtotal * DISCOUNT_RATE) : 0;

  let currentShipping = 0;

  /* ================= ELEMENTOS ================= */
  const productsContainer = document.querySelector(".order-products");
  const totalBox = document.querySelector(".order-total");
  const discountRow = document.getElementById("discountRow");
  const discountBox = document.getElementById("cartDiscount");
  const shippingRow = document.getElementById("shippingRow");
  const shippingCostBox = document.getElementById("shippingCost");

  productsContainer.innerHTML = "";

  /* ================= PRODUCTOS ================= */
  data.cart.forEach((item) => {
    const meta = [];
    if (item.topSize) meta.push(`Top: ${item.topSize}`);
    if (item.bottomSize) meta.push(`Bottom: ${item.bottomSize}`);
    if (item.bottomStyle) meta.push(`Estilo: ${item.bottomStyle}`);
    if (item.size) meta.push(`Talla: ${item.size}`);
    if (item.color) meta.push(`Color: ${item.color}`);

    productsContainer.innerHTML += `
      <div class="product-row">
        <div>
          <div class="product-name">${item.quantity}× ${item.name}</div>
          ${
            meta.length
              ? `<div class="product-meta">${meta.join(" · ")}</div>`
              : ""
          }
        </div>
        <div class="product-price">
          ₡${(item.price * item.quantity).toLocaleString("es-CR")}
        </div>
      </div>
    `;
  });

  /* ================= DESCUENTO UI ================= */
  if (discount > 0) {
    discountRow.style.display = "flex";
    discountBox.textContent = discount.toLocaleString("es-CR");
  } else {
    discountRow.style.display = "none";
  }

  /* ================= TOTALES ================= */
  function updateTotals() {
    const total = subtotal - discount + currentShipping;

    if (currentShipping > 0) {
      shippingRow.style.display = "flex";
      shippingCostBox.textContent = currentShipping.toLocaleString("es-CR");
    } else {
      shippingRow.style.display = "none";
      shippingCostBox.textContent = "0";
    }

    totalBox.textContent = `₡${total.toLocaleString("es-CR")}`;
  }

  /* ================= ENVÍO (RADIOS) ================= */
  function updateShipping() {
    const selected = document.querySelector(
      'input[name="shipping_type"]:checked'
    )?.value;

    if (selected === "correos") {
      currentShipping = SHIPPING_COST;
    } else {
      currentShipping = 0;
    }

    updateTotals();
  }

  document.querySelectorAll('input[name="shipping_type"]').forEach((radio) => {
    radio.addEventListener("change", updateShipping);
  });

  // Inicial al cargar
  updateShipping();

  /* ================= SUBMIT ================= */
  document
    .querySelector("#checkout-btn")
    .addEventListener("click", async () => {
      let valid = true;

      document
        .querySelectorAll(
          "input[required], select[required], textarea[required]"
        )
        .forEach((f) => {
          if (!validateField(f)) valid = false;
        });

      if (!valid) return;

      data.totals = {
        subtotal,
        discount,
        shipping: currentShipping,
        total: subtotal - discount + currentShipping,
      };

      localStorage.setItem("checkoutData", JSON.stringify(data));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (json.success) {
        localStorage.removeItem("checkoutData");
        window.location.href = "/payment";
      }
    });
});

/* ================= HELPERS ================= */
function getVal(name) {
  return document.querySelector(`[name="${name}"]`)?.value.trim() || "";
}

function validateField(input) {
  const wrapper = input.closest(".field");
  const msg = wrapper.querySelector(".error-msg");
  const value = input.value.trim();

  if (!value) return showError(wrapper, msg, "Campo obligatorio");

  if (input.name === "address" && value.length < 10)
    return showError(wrapper, msg, "Dirección muy corta");

  if (input.name === "national_id" && !/^\d-\d{4}-\d{4}$/.test(value))
    return showError(wrapper, msg, "Cédula inválida");

  if (input.name === "email" && !/^\S+@\S+\.\S+$/.test(value))
    return showError(wrapper, msg, "Correo inválido");

  if (input.name === "phone" && !/^[245678]\d{3}-\d{4}$/.test(value))
    return showError(wrapper, msg, "Teléfono inválido");

  wrapper.classList.remove("error");
  msg.textContent = "";
  return true;
}

function showError(wrapper, msg, text) {
  wrapper.classList.add("error");
  msg.textContent = text;
  return false;
}
