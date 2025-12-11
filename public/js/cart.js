function getProductInfo() {
  const name = document.getElementById("productName").textContent.trim();
  let priceText = document.querySelector(".prices-wrap p").textContent.trim();
  let price = parseFloat(priceText.replace(/[₡,\. ,]/g, ""));
  const imageElement = document.getElementById("productImage");
  const image = imageElement ? imageElement.src : "/images/default.png";
  const topSize = document.querySelector(
    'input[name="top-size"]:checked'
  )?.value;
  const bottomSize = document.querySelector(
    'input[name="bottom-size"]:checked'
  )?.value;
  const bottomStyle = document.querySelector(
    'input[name="bottom-style"]:checked'
  )?.value;

  return {
    name,
    price,
    image,
    topSize,
    bottomSize,
    bottomStyle,
    quantity: 1,
  };
}

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

document.addEventListener("DOMContentLoaded", () => {
  const panel = document.getElementById("cartPanel");
  const overlay = document.getElementById("cartOverlay");
  const closeBtn = document.getElementById("closeCartBtn");
  const addBtn = document.getElementById("addToCartBtn");
  const openCartBtn = document.getElementById("openCartBtn");
  const cartCount = document.querySelector(".cart-count");

  cartCount.textContent = calculateTotalQuantity(getCart());

  window.renderCart = function () {
    let cart = getCart();
    const container = document.querySelector(".cart-items");
    const totalBox = document.getElementById("cartTotal");
    const emptyCartMessage = document.getElementById("emptyCartMessage");
    const checkoutBtn = document.querySelector(".cart-checkout-btn");

    container.innerHTML = "";
    totalBox.textContent = "₡0";
    let total = 0;

    if (cart.length === 0) {
      emptyCartMessage.style.display = "block";
    } else {
      emptyCartMessage.style.display = "none";
      cart.forEach((item, index) => {
        total += item.price * item.quantity;

        container.innerHTML += `
          <div class="cart-item" data-index="${index}">
              <img src="${item.image}" loading="eager">
              <div class="cart-info-div">
                  <h3 class="cart-heading">${item.name}</h3>
                  <p>Talla top: ${item.topSize}</p>
                  <p>Talla bottom: ${item.bottomSize}</p>
                  <p>Estilo: ${item.bottomStyle}</p>
                  <p>₡${item.price.toLocaleString("es-CR")}</p>
                  <div class="quantity-controls">
                      <button class="quantity-btn decrease">-</button>
                      <input type="number" class="quantity-input" value="${
                        item.quantity
                      }" min="1" />
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

    if (cart.length === 0 || total === 0) {
      checkoutBtn.classList.add("disabled");
    } else {
      checkoutBtn.classList.remove("disabled");
    }

    const deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const cartItem = e.target.closest(".cart-item");
        const index = cartItem.getAttribute("data-index");
        cartItem.classList.add("fade-out");

        setTimeout(() => {
          let cart = getCart();
          cart.splice(index, 1);
          saveCart(cart);
          renderCart();
        }, 300);
      });
    });

    const quantityBtns = document.querySelectorAll(".quantity-btn");
    quantityBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const cartItem = e.target.closest(".cart-item");
        const index = cartItem.getAttribute("data-index");
        let cart = getCart();
        const item = cart[index];

        if (e.target.classList.contains("increase")) {
          item.quantity += 1;
        } else if (
          e.target.classList.contains("decrease") &&
          item.quantity > 1
        ) {
          item.quantity -= 1;
        }

        saveCart(cart);
        renderCart();

        const quantityElement = cartItem.querySelector(".quantity-input");
        quantityElement.value = item.quantity;
      });
    });

    const quantityInputs = document.querySelectorAll(".quantity-input");
    quantityInputs.forEach((input) => {
      input.addEventListener("input", (e) => {
        const cartItem = e.target.closest(".cart-item");
        const index = cartItem.getAttribute("data-index");
        let cart = getCart();
        const item = cart[index];
        const newQuantity = Math.max(1, parseInt(e.target.value));

        item.quantity = newQuantity;
        saveCart(cart);
        renderCart();
      });
    });
  };

  window.openCart = function () {
    panel.classList.add("open");
    overlay.classList.add("show");
    renderCart();
  };

  closeBtn.addEventListener("click", () => {
    panel.classList.remove("open");
    overlay.classList.remove("show");
  });

  overlay.addEventListener("click", () => {
    panel.classList.remove("open");
    overlay.classList.remove("show");
  });

  addBtn.addEventListener("click", () => {
    const product = getProductInfo();
    let cart = getCart();
    cart.push(product);
    saveCart(cart);
    openCart();
  });

  openCartBtn.addEventListener("click", () => {
    openCart();
  });
});

async function createPaymentIntent() {
  const cart = getCart();
  const productName = cart.length > 0 ? cart[0].name : "Producto";
  const amount = calculateTotal(cart);

  const response = await fetch("/create-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, productName }),
  });

  const data = await response.json();

  if (data.ok) {
    const paymentIntentId = data.paymentIntentId;
    window.location.href = `/payment?paymentIntentId=${paymentIntentId}&productName=${encodeURIComponent(
      productName
    )}`;
  } else {
    alert("Error al crear el pago, por favor intente de nuevo.");
  }
}

document.querySelector(".cart-checkout-btn").addEventListener("click", (e) => {
  if (e.target.classList.contains("disabled")) {
    e.preventDefault();
    return;
  }

  e.preventDefault();
  createPaymentIntent();
});
