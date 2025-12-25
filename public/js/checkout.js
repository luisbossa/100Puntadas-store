document.addEventListener("DOMContentLoaded", async () => {
  const data = JSON.parse(localStorage.getItem("checkoutData"));

  if (!data || !data.cart || data.cart.length === 0) {
    console.warn("No hay datos de checkout");
    return;
  }

  const productsContainer = document.querySelector(".order-products");
  const totalBox = document.querySelector(".order-total");
  const discountRow = document.getElementById("discountRow");
  const discountBox = document.getElementById("cartDiscount");

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
          <div class="product-name">
            ${item.quantity}× ${item.name}
          </div>
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

  /* ================= DESCUENTO ================= */
  const discount = Number(data.totals.discount || 0);
  if (discount > 0) {
    discountRow.style.display = "flex";
    discountBox.textContent = discount.toLocaleString("es-CR");
  } else {
    discountRow.style.display = "none";
  }

  /* ================= TOTAL ================= */
  const total = Number(data.totals.total);
  totalBox.textContent = `₡${total.toLocaleString("es-CR")}`;

  /* ================= SELECTS DINÁMICOS ================= */
  const provinceSelect = document.getElementById("province");
  const cantonSelect = document.getElementById("canton");
  const districtSelect = document.getElementById("district");

  const provinces = await fetch("/api/provinces").then((res) => res.json());
  provinceSelect.innerHTML = '<option value="">Provincia</option>';
  provinces.forEach((p) => {
    provinceSelect.innerHTML += `<option value="${p.code}">${p.name}</option>`;
  });

  provinceSelect.addEventListener("change", async () => {
    const provinceCode = provinceSelect.value;
    cantonSelect.disabled = !provinceCode;
    districtSelect.disabled = true;
    districtSelect.innerHTML = '<option value="">Distrito</option>';

    if (!provinceCode) {
      cantonSelect.innerHTML = '<option value="">Cantón</option>';
      return;
    }

    const cantons = await fetch(`/api/cantons/${provinceCode}`).then((res) =>
      res.json()
    );
    cantonSelect.innerHTML = '<option value="">Cantón</option>';
    cantons.forEach((c) => {
      cantonSelect.innerHTML += `<option value="${c.code}">${c.name}</option>`;
    });
  });

  cantonSelect.addEventListener("change", async () => {
    const cantonCode = cantonSelect.value;
    districtSelect.disabled = !cantonCode;

    if (!cantonCode) {
      districtSelect.innerHTML = '<option value="">Distrito</option>';
      return;
    }

    const districts = await fetch(`/api/districts/${cantonCode}`).then((res) =>
      res.json()
    );
    districtSelect.innerHTML = '<option value="">Distrito</option>';
    districts.forEach((d) => {
      districtSelect.innerHTML += `<option value="${d.code}">${d.name}</option>`;
    });
  });

  /* ================= TELÉFONO COSTA RICA ================= */
  const phoneInput = document.querySelector('input[name="phone"]');

  phoneInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, ""); // solo números

    // Máximo 8 dígitos
    if (value.length > 8) value = value.slice(0, 8);

    // Formato 8888-8888
    if (value.length > 4) {
      value = value.replace(/^(\d{4})(\d{0,4})$/, "$1-$2");
    }

    e.target.value = value;
  });

  /* ================= CÉDULA COSTA RICA ================= */
  const nationalIdInput = document.querySelector('input[name="national_id"]');

  nationalIdInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, ""); // solo números
    if (value.length > 1 && value.length <= 5) {
      value = value.replace(/^(\d)(\d{0,4})$/, "$1-$2");
    } else if (value.length > 5) {
      value = value.replace(/^(\d)(\d{4})(\d{0,4})$/, "$1-$2-$3");
    }
    e.target.value = value;
  });

  /* ================= ENVÍO DEL FORMULARIO ================= */
  const checkoutBtn = document.querySelector("#checkout-btn");

  checkoutBtn.addEventListener("click", async () => {
    const checkoutData = JSON.parse(localStorage.getItem("checkoutData"));
    if (!checkoutData) return alert("No hay información del pedido");

    let isValid = true;

    document
      .querySelectorAll("input[required], select[required], textarea[required]")
      .forEach((field) => {
        if (!validateField(field)) isValid = false;
      });

    if (!isValid) {
      document.querySelector(".field.error")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    const formData = {
      email: getVal("email"),
      phone: getVal("phone"),
      full_name: getVal("full_name"),
      national_id: nationalIdInput.value,
      province: provinceSelect.options[provinceSelect.selectedIndex].text,
      canton: cantonSelect.options[cantonSelect.selectedIndex].text,
      district: districtSelect.options[districtSelect.selectedIndex].text,
      address: getVal("address"),
      neighborhood: getVal("neighborhood"),
      address_details: getVal("address_details"),
      cart: checkoutData.cart,
      totals: checkoutData.totals,
    };

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (data.success) {
      clearCheckoutForm();
      localStorage.removeItem("checkoutData");
      window.location.href = "/payment";
    }
  });
});

/* ================= FUNCIONES AUXILIARES ================= */
function getVal(name) {
  const el = document.querySelector(`[name="${name}"]`);
  return el ? el.value.trim() : "";
}

function validateField(input) {
  const value = input.value.trim();
  const wrapper = input.closest(".field");
  const msg = wrapper.querySelector(".error-msg");

  if (!value) return showError(wrapper, msg, "Este campo es obligatorio");

  if (input.name === "address") {
    if (value.length < 10) {
      return showError(wrapper, msg, "La dirección es muy corta");
    }
  }

  if (input.name === "national_id") {
    if (!/^\d-\d{4}-\d{4}$/.test(value)) {
      return showError(wrapper, msg, "Cédula inválida. Formato: 1-2345-6789");
    }
  }

  if (input.name === "email" && !/^\S+@\S+\.\S+$/.test(value))
    return showError(wrapper, msg, "Correo inválido");

  if (input.name === "phone") {
    if (!/^[245678]\d{3}-\d{4}$/.test(value)) {
      return showError(wrapper, msg, "Teléfono inválido. Formato: 8888-8888");
    }
  }

  clearError(wrapper, msg);
  return true;
}

function showError(wrapper, msg, text) {
  wrapper.classList.add("error");
  msg.textContent = text;
  return false;
}

function clearError(wrapper, msg) {
  wrapper.classList.remove("error");
  msg.textContent = "";
}

function clearCheckoutForm() {
  document.querySelectorAll("input, select, textarea").forEach((el) => {
    if (el.type === "checkbox") el.checked = false;
    else el.value = "";
  });
}
