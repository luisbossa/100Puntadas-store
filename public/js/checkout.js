document.addEventListener("DOMContentLoaded", () => {
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
});

const checkoutBtn = document.querySelector("#checkout-btn");

checkoutBtn.addEventListener("click", async () => {
  const checkoutData = JSON.parse(localStorage.getItem("checkoutData"));
  if (!checkoutData) return alert("No hay información del pedido");

  let isValid = true;

  document
    .querySelectorAll("input[required], textarea[required]")
    .forEach((field) => {
      if (!validateField(field)) isValid = false;
    });

  const terms = document.querySelector("#terms-checkbox");
  if (!terms.checked) {
    alert("Debes aceptar los términos y condiciones");
    return;
  }

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
    national_id: getVal("national_id"),
    province: getVal("province"),
    canton: getVal("canton"),
    district: getVal("district"),
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

function getVal(name) {
  return document.querySelector(`[name="${name}"]`).value.trim();
}

function validateField(input) {
  const value = input.value.trim();
  const wrapper = input.closest(".field");
  const msg = wrapper.querySelector(".error-msg");

  if (!value) return showError(wrapper, msg, "Este campo es obligatorio");

  if (input.name === "email" && !/^\S+@\S+\.\S+$/.test(value))
    return showError(wrapper, msg, "Correo inválido");

  if (input.name === "phone" && value.length < 8)
    return showError(wrapper, msg, "Teléfono inválido");

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
  document.querySelectorAll("input, textarea").forEach((el) => {
    if (el.type === "checkbox") {
      el.checked = false;
    } else {
      el.value = "";
    }
  });
}
