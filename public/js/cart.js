/* ============================================================
   CART GLOBAL
============================================================ */

function getCart() {
  return JSON.parse(localStorage.getItem("cartItems")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cartItems", JSON.stringify(cart));
}

function calculateTotalQuantity(cart) {
  return cart.reduce((acc, item) => acc + item.quantity, 0);
}

window.addToCart = function (item) {
  const cart = getCart();

  const variantData = {
    topSize: item.topSize || null,
    bottomSize: item.bottomSize || null,
    bottomStyle: item.bottomStyle || null,
    size: item.size || null,
    color: item.color || null,
  };

  const variantKey = JSON.stringify(variantData);
  const variantId = `${item.id}-${btoa(variantKey)}`;

  const existing = cart.find(
    (p) => p.id === item.id && p.variantId === variantId
  );

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push({
      ...item,
      variantKey,
      variantId,
    });
  }

  saveCart(cart);
  openCart();
};

/* ============================================================
   DOM READY
============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const panel = document.getElementById("cartPanel");
  const overlay = document.getElementById("cartOverlay");
  const closeBtn = document.getElementById("closeCartBtn");
  const openCartBtn = document.getElementById("openCartBtn");
  const cartCount = document.querySelector(".cart-count");

  /* ============================================================
     RENDER CART
  ============================================================ */

  window.renderCart = function () {
    const cart = getCart();
    const container = document.querySelector(".cart-items");
    const totalBox = document.getElementById("cartTotal");
    const shippingBox = document.getElementById("cartShipping");
    const emptyMessage = document.getElementById("emptyCartMessage");
    const checkoutBtn = document.querySelector(".cart-checkout-btn");
    const discountRow = document.getElementById("discountRow");
    const discountBox = document.getElementById("cartDiscount");

    if (!container) return;

    container.innerHTML = "";

    let subtotal = 0;
    let totalQuantity = 0;

    if (cart.length === 0) {
      emptyMessage.style.display = "block";
      checkoutBtn?.classList.add("disabled");
      discountRow.style.display = "none";
      totalBox.textContent = "0";
      shippingBox.textContent = "0";
      if (cartCount) cartCount.textContent = "0";
      return;
    }

    emptyMessage.style.display = "none";
    checkoutBtn?.classList.remove("disabled");

    cart.forEach((item, index) => {
      subtotal += item.price * item.quantity;
      totalQuantity += item.quantity;

      container.innerHTML += `
        <div class="cart-item" data-index="${index}">
            <img src="${item.image}" loading="eager" alt="${item.name}">
            
            <div class="cart-info-div">
              <h3 class="cart-heading">${item.name}</h3>
              ${item.topSize ? `<p>Top: ${item.topSize}</p>` : ""}
              ${item.bottomSize ? `<p>Bottom: ${item.bottomSize}</p>` : ""}
              ${item.bottomStyle ? `<p>Estilo: ${item.bottomStyle}</p>` : ""}
              ${item.size ? `<p>Talla: ${item.size}</p>` : ""}
              ${
                item.color
                  ? `<p>Color: ${COLOR_LABELS[item.color] || item.color}</p>`
                  : ""
              }
              <p>₡${item.price.toLocaleString("es-CR")}</p>

              <div class="quantity-controls">
                <button class="quantity-btn decrease">-</button>
                <input
                  type="number"
                  class="quantity-input"
                  value="${item.quantity}"
                  min="1"
                >
                <button class="quantity-btn increase">+</button>
              </div>
            </div>

            <button class="delete-btn" aria-label="Eliminar producto">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18M19 6l-1 14H6L5 6H4M8 10v6M12 10v6M16 10v6"></path>
              </svg>
            </button>
          </div>
      `;
    });

    /* ================= DESCUENTO ================= */

    let discount = 0;
    const pairs = Math.floor(totalQuantity / DISCOUNT_MIN_ITEMS);

    if (pairs > 0) {
      const prices = [];

      cart.forEach((item) => {
        for (let i = 0; i < item.quantity; i++) {
          prices.push(item.price);
        }
      });

      prices.sort((a, b) => a - b);

      const discountedItemsCount = pairs * DISCOUNT_MIN_ITEMS;

      const discountedSubtotal = prices
        .slice(0, discountedItemsCount)
        .reduce((acc, price) => acc + price, 0);

      discount = Math.round(discountedSubtotal * DISCOUNT_RATE);

      discountRow.style.display = "flex";
      discountBox.textContent = discount.toLocaleString("es-CR");
    } else {
      discountRow.style.display = "none";
    }

    /* ================= TOTAL ================= */

    const shipping = SHIPPING_COST;
    const total = subtotal - discount + shipping;

    shippingBox.textContent = shipping.toLocaleString("es-CR");
    totalBox.textContent = total.toLocaleString("es-CR");
    if (cartCount) cartCount.textContent = totalQuantity;

    /* ================= DELETE ================= */

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = e.target.closest(".cart-item").dataset.index;
        const cart = getCart();
        cart.splice(index, 1);
        saveCart(cart);
        renderCart();
      });
    });

    /* ================= QUANTITY ================= */

    document.querySelectorAll(".quantity-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = e.target.closest(".cart-item").dataset.index;
        const cart = getCart();

        if (btn.classList.contains("increase")) cart[index].quantity++;
        if (btn.classList.contains("decrease") && cart[index].quantity > 1)
          cart[index].quantity--;

        saveCart(cart);
        renderCart();
      });
    });

    document.querySelectorAll(".quantity-input").forEach((input) => {
      input.addEventListener("change", (e) => {
        const index = e.target.closest(".cart-item").dataset.index;
        const cart = getCart();
        const value = parseInt(e.target.value, 10);
        cart[index].quantity = value >= 1 ? value : 1;
        saveCart(cart);
        renderCart();
      });
    });
  };

  /* ============================================================
     OPEN / CLOSE CART
  ============================================================ */

  window.openCart = function () {
    panel?.classList.add("open");
    overlay?.classList.add("show");
    renderCart();
  };

  closeBtn?.addEventListener("click", () => {
    panel?.classList.remove("open");
    overlay?.classList.remove("show");
  });

  overlay?.addEventListener("click", () => {
    panel?.classList.remove("open");
    overlay?.classList.remove("show");
  });

  openCartBtn?.addEventListener("click", openCart);

  renderCart();

  /* ============================================================
     CHECKOUT (NUMÉRICO, SIN DOM)
  ============================================================ */

  const checkoutBtn = document.getElementById("checkoutBtn");

  checkoutBtn?.addEventListener("click", (e) => {
    e.preventDefault();

    const cart = getCart();
    if (!cart.length) return;

    let subtotal = 0;
    let totalQuantity = 0;

    cart.forEach((item) => {
      subtotal += item.price * item.quantity;
      totalQuantity += item.quantity;
    });

    let discount = 0;
    const pairs = Math.floor(totalQuantity / DISCOUNT_MIN_ITEMS);

    if (pairs > 0) {
      const prices = [];
      cart.forEach((item) => {
        for (let i = 0; i < item.quantity; i++) prices.push(item.price);
      });
      prices.sort((a, b) => a - b);

      const discountedSubtotal = prices
        .slice(0, pairs * DISCOUNT_MIN_ITEMS)
        .reduce((a, b) => a + b, 0);

      discount = Math.round(discountedSubtotal * DISCOUNT_RATE);
    }

    const shipping = SHIPPING_COST;
    const total = subtotal - discount + shipping;

    const checkoutCart = cart.map((item) => ({
      name: item.name,
      image: item.image,
      quantity: item.quantity,
      price: item.price,
      color: COLOR_LABELS[item.color] || item.color,
      topSize: item.topSize || null,
      bottomSize: item.bottomSize || null,
      bottomStyle: item.bottomStyle || null,
      size: item.size || null,
    }));

    localStorage.setItem(
      "checkoutData",
      JSON.stringify({
        cart: checkoutCart,
        totals: { total, shipping, discount },
      })
    );

    window.location.href = "/checkout";
  });
});
