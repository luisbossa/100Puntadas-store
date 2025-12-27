document.addEventListener("DOMContentLoaded", async () => {
  const data = JSON.parse(localStorage.getItem("checkoutData"));

  if (!data || !data.cart?.length) return;

  /* ================= CONSTANTES ================= */
  const SHIPPING_COST = Number(window.SHIPPING_COST || 2500);
  const DISCOUNT_RATE = Number(window.DISCOUNT_RATE || 0.15);
  const DISCOUNT_MIN_ITEMS = Number(window.DISCOUNT_MIN_ITEMS || 2);

  /* ================= SUBTOTAL ================= */
  const subtotal = data.cart.reduce(
    (sum, i) => sum + Number(i.price) * Number(i.quantity),
    0
  );

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

    shippingRow.style.display = currentShipping ? "flex" : "none";
    shippingCostBox.textContent = currentShipping.toLocaleString("es-CR");

    totalBox.textContent = `₡${total.toLocaleString("es-CR")}`;
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

      data.totals = {
        subtotal,
        discount,
        shipping: currentShipping,
        total: subtotal - discount + currentShipping,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (json.success) {
        localStorage.removeItem("checkoutData");
        location.href = "/payment";
      }
    });
});

/* ================= HELPERS ================= */
function getVal(name) {
  return document.querySelector(`[name="${name}"]`)?.value.trim() || "";
}

function validateField(input) {
  const field = input.closest(".field");
  if (!field) return true;

  let msg = field.querySelector(".error-msg");

  // 👉 si no existe el contenedor de error, lo creamos
  if (!msg) {
    msg = document.createElement("small");
    msg.className = "error-msg";
    field.appendChild(msg);
  }

  const value = input.value.trim();

  if (!value) {
    field.classList.add("error");
    msg.textContent = "Campo obligatorio";
    return false;
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

function showError(field, msg, text) {
  field.classList.add("error");
  msg.textContent = text;
  return false;
}
