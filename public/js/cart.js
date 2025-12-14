/* ============================================================
   CART GLOBAL
============================================================ */

function getCart() {
  return JSON.parse(localStorage.getItem("cartItems")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cartItems", JSON.stringify(cart));
}

function calculateTotal(cart) {
  return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
}

function calculateTotalQuantity(cart) {
  return cart.reduce((acc, item) => acc + item.quantity, 0);
}

/* ============================================================
   ADD TO CART (GLOBAL)
============================================================ */
window.addToCart = function (item) {
  const cart = getCart();

  const existing = cart.find(
    (p) =>
      p.id === item.id &&
      p.topSize === item.topSize &&
      p.bottomSize === item.bottomSize &&
      p.bottomStyle === item.bottomStyle
  );

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
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
    const emptyMessage = document.getElementById("emptyCartMessage");
    const checkoutBtn = document.querySelector(".cart-checkout-btn");

    if (!container) return;

    container.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
      emptyMessage.style.display = "block";
      checkoutBtn?.classList.add("disabled");
    } else {
      emptyMessage.style.display = "none";

      cart.forEach((item, index) => {
        total += item.price * item.quantity;

        container.innerHTML += `
          <div class="cart-item" data-index="${index}">
            <img src="${item.image}" loading="eager">
            <div class="cart-info-div">
              <h3 class="cart-heading">${item.name}</h3>
              <p>Top: ${item.topSize}</p>
              <p>Bottom: ${item.bottomSize}</p>
              <p>Estilo: ${item.bottomStyle}</p>
              <p>₡${item.price.toLocaleString("es-CR")}</p>

              <div class="quantity-controls">
                <button class="quantity-btn decrease">-</button>
                <input type="number" class="quantity-input" value="${
                  item.quantity
                }" min="1">
                <button class="quantity-btn increase">+</button>
              </div>
            </div>
            <button class="delete-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18M19 6l-1 14H6L5 6H4M8 10v6M12 10v6M16 10v6M3 6h18"></path>
                </svg>
            </button>
          </div>
        `;
      });
    }

    totalBox.textContent = total.toLocaleString("es-CR");
    cartCount.textContent = calculateTotalQuantity(cart);

    /* DELETE */
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const cartItem = e.target.closest(".cart-item");
        const index = cartItem.dataset.index;

        // Agrega la animación
        cartItem.classList.add("fade-out");

        // Espera a que termine la animación
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

    /* QUANTITY BUTTONS */
    document.querySelectorAll(".quantity-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const itemEl = e.target.closest(".cart-item");
        const index = itemEl.dataset.index;
        const cart = getCart();

        if (btn.classList.contains("increase")) cart[index].quantity++;
        if (btn.classList.contains("decrease") && cart[index].quantity > 1)
          cart[index].quantity--;

        saveCart(cart);
        renderCart();
      });
    });

    /* QUANTITY INPUT */
    document.querySelectorAll(".quantity-input").forEach((input) => {
      input.addEventListener("input", (e) => {
        const itemEl = e.target.closest(".cart-item");
        const index = itemEl.dataset.index;
        const cart = getCart();

        cart[index].quantity = Math.max(1, parseInt(e.target.value) || 1);
        saveCart(cart);
        renderCart();
      });
    });
  };

  /* ============================================================
     OPEN / CLOSE
  ============================================================ */
  window.openCart = function () {
    panel?.classList.add("open");
    overlay?.classList.add("show");
    renderCart();
  };

  closeBtn?.addEventListener("click", () => {
    panel.classList.remove("open");
    overlay.classList.remove("show");
  });

  overlay?.addEventListener("click", () => {
    panel.classList.remove("open");
    overlay.classList.remove("show");
  });

  openCartBtn?.addEventListener("click", openCart);

  renderCart();

  /* ============================================================
     MOBILE MENU OPEN / CLOSE (ANIMATED)
  ============================================================ */
  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.querySelector(".mobile-menu");
  const closeMenuBtn = document.querySelector(".close-button");
  const mobileLinks = document.querySelectorAll(".mobile-link");

  function openMobileMenu() {
    mobileMenu?.classList.add("active");
    document.body.classList.add("no-scroll"); // si ya usas esta clase
  }

  function closeMobileMenu() {
    mobileMenu?.classList.remove("active");
    document.body.classList.remove("no-scroll");
  }

  /* OPEN */
  hamburger?.addEventListener("click", openMobileMenu);

  /* CLOSE */
  closeMenuBtn?.addEventListener("click", closeMobileMenu);

  /* CLOSE ON LINK CLICK */
  mobileLinks.forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });
});
