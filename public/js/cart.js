const COLOR_LABELS = {
  white: "Blanco",
  coffe: "Café",
  pink: "Rosado",
  red: "Rojo",
  black: "Negro",
};

const DISCOUNT_RATE = 0.15;
const DISCOUNT_MIN_ITEMS = 2;
const SHIPPING_COST = 2500;

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

  const variantKey = JSON.stringify({
    topSize: item.topSize || null,
    bottomSize: item.bottomSize || null,
    bottomStyle: item.bottomStyle || null,
    size: item.size || null,
    color: item.color || null,
  });

  const existing = cart.find(
    (p) => p.id === item.id && p.variantKey === variantKey
  );

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push({ ...item, variantKey });
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
    } else {
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
    }

    /* ================= DISCOUNT LOGIC ================= */

    let discount = 0;

    // Pares completos (2, 4, 6, 8...)
    const pairs = Math.floor(totalQuantity / DISCOUNT_MIN_ITEMS);

    if (pairs > 0) {
      // Expandimos precios por cantidad
      const prices = [];

      cart.forEach((item) => {
        for (let i = 0; i < item.quantity; i++) {
          prices.push(item.price);
        }
      });

      // Ordenamos del más barato al más caro
      prices.sort((a, b) => a - b);

      // Prendas que entran en el descuento
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

    const shipping = cart.length > 0 ? SHIPPING_COST : 0;
    const total = subtotal - discount + shipping;

    shippingBox.textContent = shipping.toLocaleString("es-CR");
    totalBox.textContent = total.toLocaleString("es-CR");
    if (cartCount) cartCount.textContent = totalQuantity;

    /* ================= DELETE ================= */

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const cartItem = e.target.closest(".cart-item");
        const index = cartItem.dataset.index;

        cartItem.classList.add("fade-out");
        cartItem.addEventListener(
          "animationend",
          () => {
            const cart = getCart();
            cart.splice(index, 1);
            saveCart(cart);
            renderCart();
          },
          { once: true }
        );
      });
    });

    /* ================= QUANTITY BUTTONS ================= */

    document.querySelectorAll(".quantity-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const itemEl = e.target.closest(".cart-item");
        const index = itemEl.dataset.index;
        const cart = getCart();

        if (btn.classList.contains("increase")) {
          cart[index].quantity++;
        }

        if (btn.classList.contains("decrease") && cart[index].quantity > 1) {
          cart[index].quantity--;
        }

        saveCart(cart);
        renderCart();
      });
    });

    /* ================= QUANTITY INPUT ================= */

    document.querySelectorAll(".quantity-input").forEach((input) => {
      input.addEventListener("change", (e) => {
        const itemEl = e.target.closest(".cart-item");
        const index = itemEl.dataset.index;
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
});
