/* ============================================================
   PÁGINA DE PRODUCTO — agregar al carrito / comprar ahora.
   La página ya viene armada desde el servidor; aquí solo se lee
   la selección del formulario.
============================================================ */
const product = window.PRODUCT;
const form = document.getElementById("productForm");
const message = document.getElementById("productMessage");

// name del input → campo del ítem en el carrito
const FIELDS = {
  "top-size": "topSize",
  "bottom-size": "bottomSize",
  "bottom-style": "bottomStyle",
  "single-size": "size",
  color: "color",
};

function showMessage(text) {
  message.textContent = text;
}

function buildCartItem() {
  const item = {
    id: product.id,
    name: product.name,
    price: product.price,
    currency: product.currency,
    image: product.image,
    url: location.pathname, // para volver al producto desde el carrito
    quantity: 1,
    discount: product.discount,
  };

  const groups = [...form.querySelectorAll(".option-group")];
  const missing = groups.find((group) => !group.querySelector("input:checked"));

  if (missing) {
    showMessage(`Selecciona una opción en "${missing.querySelector(".option-group__label").textContent}".`);
    missing.querySelector("input")?.focus();
    return null;
  }

  for (const input of form.querySelectorAll("input:checked")) {
    item[FIELDS[input.name]] = input.value;
  }

  showMessage("");
  return item;
}

/* ============= AGREGAR AL CARRITO ================ */

document.getElementById("addToCartBtn")?.addEventListener("click", () => {
  const item = buildCartItem();
  if (!item) return;

  window.addToCart(item);
});

/* ============ COMPRAR AHORA → CHECKOUT ============= */

document.getElementById("buyNowBtn")?.addEventListener("click", () => {
  const cart = getCart();
  let checkoutCart;

  if (cart.length > 0) {
    checkoutCart = cart.map(toCheckoutItem);
  } else {
    const item = buildCartItem();
    if (!item) return;
    checkoutCart = [toCheckoutItem(item)];
  }

  localStorage.setItem("checkoutData", JSON.stringify({ cart: checkoutCart }));

  window.location.href = "/checkout";
});

/* ============ COLUMNA FIJA EN PANTALLAS BAJAS ============= */
// Si la información no entra en la pantalla, la columna se pega por abajo
// (top negativo): primero se desplaza hasta mostrar su final y luego queda fija.
const info = document.querySelector(".product__info");

function updateStickyTop() {
  if (!info) return;
  const preferred = parseFloat(getComputedStyle(document.body).fontSize) * 6; // 6em
  const fits = info.offsetHeight + preferred <= window.innerHeight;
  info.style.setProperty(
    "--sticky-top",
    fits ? "" : `${window.innerHeight - info.offsetHeight - 16}px`,
  );
}

updateStickyTop();
window.addEventListener("resize", updateStickyTop);
// El acordeón cambia el alto de la columna
new ResizeObserver(updateStickyTop).observe(info);
