function getCart() {
  try {
    return JSON.parse(localStorage.getItem("cartItems")) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("cartItems", JSON.stringify(cart));
}

// Escapa texto antes de insertarlo con innerHTML (el carrito vive en localStorage).
function escapeHTML(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}

// Lo que se envía al checkout: el servidor solo confía en id, cantidad y variantes.
window.toCheckoutItem = function (item) {
  return {
    id: item.id,
    name: item.name,
    image: item.image,
    quantity: item.quantity,
    price: item.price,
    discount: item.discount,
    color: COLOR_LABELS[item.color] || item.color || null,
    topSize: item.topSize || null,
    bottomSize: item.bottomSize || null,
    bottomStyle: item.bottomStyle || null,
    size: item.size || null,
  };
};

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
    (p) => p.id === item.id && p.variantId === variantId,
  );

  if (existing) {
    existing.quantity = Math.min(
      existing.quantity + item.quantity,
      Pricing.MAX_QUANTITY,
    );
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

document.addEventListener("DOMContentLoaded", () => {
  const panel = document.getElementById("cartPanel");
  const overlay = document.getElementById("cartOverlay");
  const closeBtn = document.getElementById("closeCartBtn");
  const openCartBtn = document.getElementById("openCartBtn");
  const cartCount = document.querySelector(".cart-count");
  const MAX = Pricing.MAX_QUANTITY;

  window.renderCart = function () {
    const cart = getCart();
    const container = document.querySelector(".cart-items");
    const totalBox = document.getElementById("cartTotal");
    const emptyMessage = document.getElementById("emptyCartMessage");
    const checkoutBtn = document.querySelector(".cart-checkout-btn");
    const discountRow = document.getElementById("discountRow");
    const discountBox = document.getElementById("cartDiscount");
    const promo = document.getElementById("cartPromo");

    if (!container) return;

    if (cart.length === 0) {
      container.innerHTML = "";
      emptyMessage.style.display = "block";
      checkoutBtn?.classList.add("disabled");
      discountRow.style.display = "none";
      if (promo) promo.hidden = true;
      totalBox.textContent = Pricing.formatPrice(0);
      updateCount(0);
      return;
    }

    emptyMessage.style.display = "none";
    checkoutBtn?.classList.remove("disabled");

    container.innerHTML = cart
      .map((item, index) => {
        const name = escapeHTML(item.name);
        const color = COLOR_LABELS[item.color] || item.color;

        return `
        <div class="cart-item" data-index="${index}">
            <img src="${escapeHTML(item.image)}" loading="eager" alt="${name}">

            <div class="cart-info-div">
              <h3 class="cart-heading">${name}</h3>
              ${item.topSize ? `<p>Top: ${escapeHTML(item.topSize)}</p>` : ""}
              ${item.bottomSize ? `<p>Bottom: ${escapeHTML(item.bottomSize)}</p>` : ""}
              ${item.bottomStyle ? `<p>Estilo: ${escapeHTML(item.bottomStyle)}</p>` : ""}
              ${item.size ? `<p>Talla: ${escapeHTML(item.size)}</p>` : ""}
              ${color ? `<p>Color: ${escapeHTML(color)}</p>` : ""}
              <p>${Pricing.formatPrice(item.price)}</p>

              <div class="quantity-controls">
                <button class="quantity-btn decrease ${item.quantity <= 1 ? "disabled" : ""}" aria-label="Restar uno">–</button>
                <input
                  type="number"
                  class="quantity-input"
                  value="${Number(item.quantity)}"
                  min="1" max="${MAX}"
                  aria-label="Cantidad"
                >
                <button class="quantity-btn increase ${item.quantity >= MAX ? "disabled" : ""}" aria-label="Sumar uno">+</button>
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
      })
      .join("");

    /* ================= TOTALES ================= */

    const { discount, total, totalQuantity } = Pricing.calculateTotals(cart);

    // Aviso de la promo: con un número impar de prendas elegibles falta 1 para el 15%
    const eligible = cart
      .filter((item) => item.discount !== 1)
      .reduce((acc, item) => acc + item.quantity, 0);
    if (promo) {
      const rate = `${Pricing.DISCOUNT_RATE * 100}%`;
      promo.hidden = eligible % Pricing.DISCOUNT_MIN_ITEMS === 0;
      promo.textContent =
        discount > 0
          ? `Agrega 1 prenda más y también tendrá ${rate} de descuento.`
          : `Agrega 1 prenda más y obtén ${rate} de descuento.`;
    }

    if (discount > 0) {
      discountRow.style.display = "flex";
      discountBox.textContent = Pricing.formatPrice(discount);
    } else {
      discountRow.style.display = "none";
    }

    totalBox.textContent = Pricing.formatPrice(total);
    updateCount(totalQuantity);
  };

  // Actualiza el número del ícono y lo hace "rebotar" si aumentó
  let lastCount = null;
  function updateCount(count) {
    if (!cartCount) return;
    cartCount.textContent = count;
    if (lastCount !== null && count > lastCount) {
      cartCount.classList.remove("is-bumped");
      void cartCount.offsetWidth; // reinicia la animación
      cartCount.classList.add("is-bumped");
    }
    lastCount = count;
  }

  /* ============ ACCIONES DEL CARRITO (delegación) ============ */

  const itemsContainer = document.querySelector(".cart-items");

  function updateItem(target, change) {
    const index = target.closest(".cart-item")?.dataset.index;
    if (index === undefined) return;

    const cart = getCart();
    if (!cart[index]) return;

    change(cart, Number(index));
    saveCart(cart);
    renderCart();
  }

  itemsContainer?.addEventListener("click", (e) => {
    if (e.target.closest(".delete-btn")) {
      updateItem(e.target, (cart, i) => cart.splice(i, 1));
      return;
    }

    const btn = e.target.closest(".quantity-btn");
    if (!btn) return;

    updateItem(btn, (cart, i) => {
      if (btn.classList.contains("increase") && cart[i].quantity < MAX) {
        cart[i].quantity++;
      }
      if (btn.classList.contains("decrease") && cart[i].quantity > 1) {
        cart[i].quantity--;
      }
    });
  });

  itemsContainer?.addEventListener("change", (e) => {
    if (!e.target.classList.contains("quantity-input")) return;

    updateItem(e.target, (cart, i) => {
      let value = parseInt(e.target.value, 10);
      if (isNaN(value) || value < 1) value = 1;
      if (value > MAX) value = MAX;
      cart[i].quantity = value;
    });
  });

  /* =========== OPEN / CLOSE CART ============ */

  function closeCart() {
    if (!panel?.classList.contains("open")) return;
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
    overlay?.classList.remove("show");
    openCartBtn?.focus();
  }

  window.openCart = function () {
    panel?.classList.add("open");
    panel?.setAttribute("aria-hidden", "false");
    overlay?.classList.add("show");
    renderCart();
    closeBtn?.focus();
  };

  closeBtn?.addEventListener("click", closeCart);
  overlay?.addEventListener("click", closeCart);
  openCartBtn?.addEventListener("click", openCart);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel?.classList.contains("open")) closeCart();
  });

  renderCart();

  /* ========== CHECKOUT ============ */

  const checkoutBtn = document.getElementById("checkoutBtn");

  checkoutBtn?.addEventListener("click", (e) => {
    e.preventDefault();

    const cart = getCart();
    if (!cart.length) return;

    localStorage.setItem(
      "checkoutData",
      JSON.stringify({ cart: cart.map(toCheckoutItem) }),
    );

    window.location.href = "/checkout";
  });
});
