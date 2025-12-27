document.addEventListener("DOMContentLoaded", async () => {
  const checkoutData = JSON.parse(localStorage.getItem("checkoutData"));
  if (!checkoutData || !checkoutData.cart?.length) return;

  const productsContainer = document.querySelector(".order-products");
  const totalBox = document.querySelector(".order-total");
  const discountRow = document.getElementById("discountRow");
  const discountBox = document.getElementById("cartDiscount");
  const shippingBox = document.getElementById("shippingCost");

  let currentShipping = 2500;

  /* ================= PRODUCTOS ================= */
  productsContainer.innerHTML = "";
  checkoutData.cart.forEach((item) => {
    productsContainer.insertAdjacentHTML(
      "beforeend",
      `
      <div class="product-row">
        <div>
          <strong>${item.quantity}× ${item.name}</strong>
        </div>
        <div>
          ₡${(item.price * item.quantity).toLocaleString("es-CR")}
        </div>
      </div>
    `
    );
  });

  /* ================= DESCUENTO ================= */
  if (checkoutData.totals.discount > 0) {
    discountRow.style.display = "flex";
    discountBox.textContent =
      checkoutData.totals.discount.toLocaleString("es-CR");
  }

  /* ================= ENVÍO ================= */
  const updateTotals = () => {
    const baseTotal = checkoutData.totals.total - checkoutData.totals.shipping;
    const finalTotal = baseTotal + currentShipping;

    shippingBox.textContent = currentShipping.toLocaleString("es-CR");
    totalBox.textContent = `₡${finalTotal.toLocaleString("es-CR")}`;
  };

  updateTotals();

  /* ================= TIPO DE ENVÍO ================= */
  document.querySelectorAll('input[name="shipping_type"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      currentShipping = radio.value === "correos" ? 2500 : 0;
      updateTotals();
    });
  });

  /* ================= SELECTS PROVINCIA ================= */
  const provinceSelect = document.getElementById("province");
  const cantonSelect = document.getElementById("canton");
  const districtSelect = document.getElementById("district");

  const provinces = await fetch("/api/provinces").then((r) => r.json());
  provinces.forEach((p) => {
    provinceSelect.innerHTML += `<option value="${p.code}">${p.name}</option>`;
  });

  provinceSelect.onchange = async () => {
    cantonSelect.disabled = !provinceSelect.value;
    cantonSelect.innerHTML = "<option value=''>Cantón</option>";
    districtSelect.innerHTML = "<option value=''>Distrito</option>";
    districtSelect.disabled = true;

    if (!provinceSelect.value) return;

    const cantons = await fetch(`/api/cantons/${provinceSelect.value}`).then(
      (r) => r.json()
    );

    cantons.forEach((c) => {
      cantonSelect.innerHTML += `<option value="${c.code}">${c.name}</option>`;
    });
  };

  cantonSelect.onchange = async () => {
    districtSelect.disabled = !cantonSelect.value;
    districtSelect.innerHTML = "<option value=''>Distrito</option>";

    if (!cantonSelect.value) return;

    const districts = await fetch(`/api/districts/${cantonSelect.value}`).then(
      (r) => r.json()
    );

    districts.forEach((d) => {
      districtSelect.innerHTML += `<option value="${d.code}">${d.name}</option>`;
    });
  };

  /* ================= SUBMIT ================= */
  document.getElementById("checkout-btn").onclick = async () => {
    let valid = true;

    document
      .querySelectorAll("input[required], select[required]")
      .forEach((el) => {
        if (!validateField(el)) valid = false;
      });

    if (!document.querySelector('input[name="payment_method"]:checked')) {
      alert("Selecciona un método de pago");
      return;
    }

    if (!valid) return;

    const payload = {
      email: getVal("email"),
      phone: getVal("phone"),
      full_name: getVal("full_name"),
      national_id: getVal("national_id"),
      province: provinceSelect.options[provinceSelect.selectedIndex].text,
      canton: cantonSelect.options[cantonSelect.selectedIndex].text,
      district: districtSelect.options[districtSelect.selectedIndex].text,
      neighborhood: getVal("neighborhood"),
      address: getVal("address"),
      address_details: getVal("address_details"),
      shipping_type: document.querySelector(
        'input[name="shipping_type"]:checked'
      ).value,
      payment_method: document.querySelector(
        'input[name="payment_method"]:checked'
      ).value,
      cart: checkoutData.cart,
      totals: {
        ...checkoutData.totals,
        shipping: currentShipping,
        total:
          checkoutData.totals.total -
          checkoutData.totals.shipping +
          currentShipping,
      },
    };

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.success) {
      localStorage.removeItem("checkoutData");
      window.location.href = "/payment";
    }
  };
});

/* ================= HELPERS ================= */

function getVal(name) {
  return document.querySelector(`[name="${name}"]`)?.value.trim();
}

function validateField(input) {
  const wrapper = input.closest(".field");
  const msg = wrapper.querySelector(".error-msg");

  if (!input.value.trim()) {
    wrapper.classList.add("error");
    msg.textContent = "Campo obligatorio";
    return false;
  }

  wrapper.classList.remove("error");
  msg.textContent = "";
  return true;
}
