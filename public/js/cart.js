/* ============================================================
   OBTENER INFORMACIÓN DEL PRODUCTO
============================================================ */
function getProductInfo() {
  const name = document.getElementById("productName").textContent.trim();

  // Precio (quitar ₡ y comas)
  let priceText = document.querySelector(".prices-wrap p").textContent.trim();
  let price = parseFloat(priceText.replace(/[₡,\. ,]/g, ""));

  // Imagen principal
  const imageElement = document.getElementById("productImage");
  const image = imageElement ? imageElement.src : "/images/default.png";

  // Radios seleccionados
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

/* ============================================================
   FUNCIONES DEL CARRITO
============================================================ */

// Obtener carrito desde localStorage
function getCart() {
  return JSON.parse(localStorage.getItem("cartItems")) || [];
}

// Guardar carrito
function saveCart(cart) {
  localStorage.setItem("cartItems", JSON.stringify(cart));
}

// Calcular total
function calculateTotal(cart) {
  return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
}

// Calcular la cantidad total de productos en el carrito
function calculateTotalQuantity(cart) {
  return cart.reduce((acc, item) => acc + item.quantity, 0);
}

/* ============================================================
   INICIALIZACIÓN
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const panel = document.getElementById("cartPanel");
  const overlay = document.getElementById("cartOverlay");
  const closeBtn = document.getElementById("closeCartBtn");
  const addBtn = document.getElementById("addToCartBtn");

  // Seleccionamos el botón para abrir el carrito
  const openCartBtn = document.getElementById("openCartBtn");
  const cartCount = document.querySelector(".cart-count"); // Elemento donde se muestra el total de productos

  // Actualizar el contador de productos en el carrito al cargar la página
  cartCount.textContent = calculateTotalQuantity(getCart());

  /* ===================================
     RENDER DEL CARRITO
  ===================================== */
  window.renderCart = function () {
    let cart = getCart();

    const container = document.querySelector(".cart-items");
    const totalBox = document.getElementById("cartTotal");
    const emptyCartMessage = document.getElementById("emptyCartMessage"); // Elemento para el mensaje vacío

    container.innerHTML = ""; // Limpiar el contenedor antes de agregar los productos
    totalBox.textContent = "₡0"; // Si no hay productos, no mostrar total
    let total = 0;

    // Mostrar mensaje de carrito vacío si no hay productos
    if (cart.length === 0) {
      emptyCartMessage.style.display = "block"; // Mostrar mensaje
    } else {
      emptyCartMessage.style.display = "none"; // Ocultar mensaje si hay productos
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

    // Actualizar el total de productos en el carrito
    cartCount.textContent = calculateTotalQuantity(cart);

    // Agregar funcionalidad de eliminar
    const deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const cartItem = e.target.closest(".cart-item"); // Seleccionar el item
        const index = cartItem.getAttribute("data-index"); // Obtener el índice del producto en el carrito

        // Animación para desaparecer
        cartItem.classList.add("fade-out");

        // Después de la animación, eliminar el producto
        setTimeout(() => {
          let cart = getCart();
          cart.splice(index, 1); // Eliminar producto del carrito
          saveCart(cart); // Guardar el carrito actualizado

          // Volver a renderizar el carrito
          renderCart();
        }, 300); // Tiempo de animación (300ms)
      });
    });

    // Agregar funcionalidad de aumentar/disminuir cantidad
    const quantityBtns = document.querySelectorAll(".quantity-btn");
    quantityBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const cartItem = e.target.closest(".cart-item"); // Seleccionar el item
        const index = cartItem.getAttribute("data-index"); // Obtener el índice del producto en el carrito
        let cart = getCart();
        const item = cart[index];

        if (e.target.classList.contains("increase")) {
          item.quantity += 1; // Aumentar cantidad
        } else if (
          e.target.classList.contains("decrease") &&
          item.quantity > 1
        ) {
          item.quantity -= 1; // Disminuir cantidad
        }

        saveCart(cart); // Guardar carrito actualizado
        renderCart(); // Volver a renderizar el carrito

        // Actualizar la cantidad en el input
        const quantityElement = cartItem.querySelector(".quantity-input");
        quantityElement.value = item.quantity;
      });
    });

    // Actualizar la cantidad cuando se escriba directamente en el input
    const quantityInputs = document.querySelectorAll(".quantity-input");
    quantityInputs.forEach((input) => {
      input.addEventListener("input", (e) => {
        const cartItem = e.target.closest(".cart-item"); // Seleccionar el item
        const index = cartItem.getAttribute("data-index"); // Obtener el índice del producto en el carrito
        let cart = getCart();
        const item = cart[index];

        // Asegurar que la cantidad sea un número mayor o igual a 1
        const newQuantity = Math.max(1, parseInt(e.target.value));

        item.quantity = newQuantity; // Actualizar la cantidad
        saveCart(cart); // Guardar carrito actualizado
        renderCart(); // Volver a renderizar el carrito
      });
    });
  };

  /* ===================================
     ABRIR Y CERRAR PANEL
  ===================================== */
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

  /* ===================================
     AGREGAR AL CARRITO
  ===================================== */
  addBtn.addEventListener("click", () => {
    const product = getProductInfo();
    let cart = getCart();

    cart.push(product);
    saveCart(cart);

    openCart(); // Abre el carrito después de agregar el producto
  });

  // Añadir funcionalidad al botón "Carrito"
  openCartBtn.addEventListener("click", () => {
    openCart();
  });
});

// Función para crear el paymentIntent
async function createPaymentIntent() {
  const cart = getCart();

  // Obtener el nombre del primer producto del carrito
  const productName = cart.length > 0 ? cart[0].name : "Producto";

  // Calcular el total real del carrito
  const amount = calculateTotal(cart);

  // Enviar la solicitud al backend
  const response = await fetch("/create-intent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      productName, // 👉 ENVIAMOS EL NOMBRE AL BACKEND
    }),
  });

  const data = await response.json();

  if (data.ok) {
    const paymentIntentId = data.paymentIntentId;

    // Ahora redirigimos al usuario a la página de pago
    window.location.href = `/payment?paymentIntentId=${paymentIntentId}&productName=${encodeURIComponent(
      productName
    )}`;
  } else {
    alert("Error al crear el pago, por favor intente de nuevo.");
  }
}

// Llama a la función cuando el usuario hace clic en el botón de "Finalizar compra"
document.querySelector(".cart-checkout-btn").addEventListener("click", (e) => {
  e.preventDefault();
  createPaymentIntent();
});
