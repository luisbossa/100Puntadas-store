document.addEventListener("DOMContentLoaded", async () => {
  /* ================= HELPERS ================= */
  function getVal(name) {
    return document.querySelector(`[name="${name}"]`)?.value.trim() || "";
  }

  function normalizePrice(v) {
    return Number(String(v || 0).replace(/[^\d]/g, ""));
  }

  function showError(field, msg, text) {
    field.classList.add("error");
    msg.textContent = text;
    return false;
  }

  function validateField(input) {
    const field = input.closest(".field");
    if (!field) return true;

    let msg = field.querySelector(".error-msg");
    if (!msg) {
      msg = document.createElement("small");
      msg.className = "error-msg";
      field.appendChild(msg);
    }

    const value = input.value.trim();

    if (!value) {
      return showError(field, msg, "Campo obligatorio");
    }

    if (input.name === "phone" && !/^[245678]\d{3}-\d{4}$/.test(value)) {
      return showError(field, msg, "Teléfono inválido");
    }

    if (input.name === "national_id" && !/^\d-\d{4}-\d{4}$/.test(value)) {
      return showError(field, msg, "Cédula inválida");
    }

    field.classList.remove("error");
    msg.textContent = "";
    return true;
  }

  function clearCheckoutForm() {
    document
      .querySelectorAll("input:not([type='radio']), textarea")
      .forEach((el) => (el.value = ""));

    document.querySelectorAll("select").forEach((select) => {
      select.selectedIndex = 0;
      select.disabled = select.id !== "province";
    });

    const defaultShipping = document.querySelector(
      'input[name="shipping_type"][value="correos"]'
    );
    if (defaultShipping) defaultShipping.checked = true;

    document.querySelectorAll(".field").forEach((field) => {
      field.classList.remove("error");
      const msg = field.querySelector(".error-msg");
      if (msg) msg.textContent = "";
    });
  }

  /* ================= BLOQUEO POST-PAGO ================= */
  if (sessionStorage.getItem("order_completed") === "true") {
    sessionStorage.removeItem("order_completed");
    localStorage.removeItem("checkoutData");
    location.replace("/");
    return;
  }

  const data = JSON.parse(localStorage.getItem("checkoutData"));

  if (!data || !data.cart?.length) {
    location.replace("/");
    return;
  }

  history.replaceState(null, "", location.href);
  window.addEventListener("popstate", () => location.replace("/"));

  /* ================= CONSTANTES ================= */
  const SHIPPING_COST = Number(window.SHIPPING_COST || 2500);
  const DISCOUNT_RATE = Number(window.DISCOUNT_RATE || 0.15);
  const DISCOUNT_MIN_ITEMS = Number(window.DISCOUNT_MIN_ITEMS || 2);

  /* ================= SUBTOTAL ================= */
  const subtotal = data.cart.reduce(
    (sum, i) => sum + normalizePrice(i.price) * Number(i.quantity),
    0
  );

  /* ================= RESUMEN DE PRODUCTOS ================= */
  const orderProductsBox = document.querySelector(".order-products");

  function renderOrderProducts(cart) {
    orderProductsBox.innerHTML = "";

    cart.forEach((item) => {
      const row = document.createElement("div");
      row.className = "order-product";

      row.innerHTML = `
        <div class="order-product-info">
          <img src="${item.image}" alt="${item.name}" />
          <div>
            <strong>${item.name}</strong>
            <small>
              ${item.color || ""}
              ${item.size ? " · Talla: " + item.size : ""}
              ${item.topSize ? " · Top: " + item.topSize : ""}
              ${item.bottomSize ? " · Bottom: " + item.bottomSize : ""}
            </small>
          </div>
        </div>

        <div class="order-product-price">
          <span>x${item.quantity}</span>
          <strong>₡ ${(
            normalizePrice(item.price) * Number(item.quantity)
          ).toLocaleString("es-CR")}</strong>
        </div>
      `;

      orderProductsBox.appendChild(row);
    });
  }

  renderOrderProducts(data.cart);

  const totalItems = data.cart.reduce((sum, i) => sum + Number(i.quantity), 0);
  const discount =
    totalItems >= DISCOUNT_MIN_ITEMS ? Math.round(subtotal * DISCOUNT_RATE) : 0;

  let currentShipping = 0;

  /* ================= ELEMENTOS ================= */
  const totalBox = document.querySelector(".order-total");
  const discountRow = document.getElementById("discountRow");
  const discountBox = document.getElementById("cartDiscount");
  const shippingRow = document.getElementById("shippingRow");
  const shippingCostBox = document.getElementById("shippingCost");

  const provinceSelect = document.getElementById("province");
  const cantonSelect = document.getElementById("canton");
  const districtSelect = document.getElementById("district");

  /* ================= FORMATOS INPUT ================= */
  const phoneInput = document.querySelector('[name="phone"]');
  const idInput = document.querySelector('[name="national_id"]');

  phoneInput?.addEventListener("input", () => {
    let v = phoneInput.value.replace(/\D/g, "");
    if (v.length > 4) v = v.slice(0, 4) + "-" + v.slice(4, 8);
    phoneInput.value = v.slice(0, 9);
  });

  idInput?.addEventListener("input", () => {
    let v = idInput.value.replace(/\D/g, "");
    if (v.length > 1) v = v.slice(0, 1) + "-" + v.slice(1);
    if (v.length > 6) v = v.slice(0, 6) + "-" + v.slice(6);
    idInput.value = v.slice(0, 12);
  });

  /* ================= PROVINCIAS ================= */
  async function loadProvinces() {
    const res = await fetch("/api/provinces");
    const provinces = await res.json();

    provinceSelect.innerHTML =
      `<option value="">Provincia</option>` +
      provinces
        .map((p) => `<option value="${p.code}">${p.province}</option>`)
        .join("");
  }

  provinceSelect.addEventListener("change", async () => {
    cantonSelect.innerHTML = `<option value="">Cantón</option>`;
    districtSelect.innerHTML = `<option value="">Distrito</option>`;
    cantonSelect.disabled = true;
    districtSelect.disabled = true;

    if (!provinceSelect.value) return;

    const res = await fetch(`/api/cantons/${provinceSelect.value}`);
    const cantons = await res.json();

    cantonSelect.innerHTML += cantons
      .map((c) => `<option value="${c.code}">${c.canton}</option>`)
      .join("");

    cantonSelect.disabled = false;
  });

  cantonSelect.addEventListener("change", async () => {
    districtSelect.innerHTML = `<option value="">Distrito</option>`;
    districtSelect.disabled = true;

    if (!cantonSelect.value) return;

    const res = await fetch(`/api/districts/${cantonSelect.value}`);
    const districts = await res.json();

    districtSelect.innerHTML += districts
      .map((d) => `<option value="${d.code}">${d.district}</option>`)
      .join("");

    districtSelect.disabled = false;
  });

  loadProvinces();

  /* ================= TOTALES ================= */
  function updateTotals() {
    const total = subtotal - discount + currentShipping;

    discountRow.style.display = discount ? "flex" : "none";
    discountBox.textContent = discount.toLocaleString("es-CR");

    shippingRow.classList.toggle("show", !!currentShipping);
    shippingCostBox.textContent = currentShipping.toLocaleString("es-CR");

    totalBox.textContent = `₡ ${total.toLocaleString("es-CR")}`;
  }

  function updateShipping() {
    const type = document.querySelector(
      'input[name="shipping_type"]:checked'
    )?.value;

    currentShipping = type === "correos" ? SHIPPING_COST : 0;
    updateTotals();
  }

  document
    .querySelectorAll('input[name="shipping_type"]')
    .forEach((r) => r.addEventListener("change", updateShipping));

  updateShipping();

  /* ================= SUBMIT ================= */
  document
    .querySelector("#checkout-btn")
    .addEventListener("click", async () => {
      let valid = true;

      document
        .querySelectorAll("input[required], select[required]")
        .forEach((f) => {
          if (!validateField(f)) valid = false;
        });

      if (!valid) return;

      data.email = getVal("email");
      data.phone = getVal("phone");
      data.full_name = getVal("full_name");
      data.national_id = getVal("national_id");
      data.address = getVal("address");
      data.neighborhood = getVal("neighborhood");
      data.address_details = getVal("address_details");
      data.province = getVal("province");
      data.canton = getVal("canton");
      data.district = getVal("district");

      const paymentMethod = document.querySelector(
        'input[name="payment_method"]:checked'
      )?.value;
      data.payment_method = paymentMethod;

      const rbMsg = document.querySelector(".rb-msg");

      if (!paymentMethod) {
        rbMsg.textContent =
          "Debes escoger un método de pago antes de continuar.";
        rbMsg.classList.add("show");
        return;
      }

      rbMsg.textContent = "";

      data.totals = {
        subtotal,
        discount,
        shipping: currentShipping,
        total: subtotal - discount + currentShipping,
      };

      try {
        const resOrder = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const jsonOrder = await resOrder.json();

        if (!jsonOrder.success) {
          rbMsg.textContent = "Error al crear la orden: " + jsonOrder.error;
          rbMsg.classList.add("show");
          return;
        }

        rbMsg.textContent = "";
        rbMsg.classList.remove("show");

        const { orderId, orderNumber } = jsonOrder;

        if (paymentMethod === "card") {
          const orderData = {
            orderId,
            orderNumber, // ✅ CORRECTO (5 dígitos)
            total: data.totals.total,
            paymentMethod: "Tarjeta",
            createdAt: new Date().toISOString(),
          };

          sessionStorage.setItem("order_completed", JSON.stringify(orderData));

          clearCheckoutForm();
          localStorage.removeItem("checkoutData");

          const resPayment = await fetch("/create-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              totals: data.totals,
              email: data.email,
              orderId,
            }),
          });

          const jsonPayment = await resPayment.json();

          if (!jsonPayment.success) {
            alert("Error al crear el pago: " + jsonPayment.error);
            return;
          }

          location.replace(
            `/payment?paymentIntentId=${jsonPayment.paymentIntentId}&orderNumber=${orderNumber}`
          );
        } else if (paymentMethod === "sinpe") {
          const orderData = {
            orderId,
            orderNumber: orderId,
            total: data.totals.total,
            paymentMethod: "SINPE Móvil",
            createdAt: new Date().toISOString(),
          };

          sessionStorage.setItem("order_completed", JSON.stringify(orderData));

          clearCheckoutForm();
          localStorage.removeItem("checkoutData");

          location.replace(`/payment-sinpe?orderId=${orderId}`);
        }
      } catch (err) {
        console.error(err);
        alert("Error interno al procesar el pago");
      }
    });
});
