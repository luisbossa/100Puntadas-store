/* ============================================================
   PRODUCTOS
============================================================ */
const beachwearProducts = {
  "black-coffee": {
    id: "black-coffee",
    name: "BLACK COFFEE",
    price: 30000,
    currency: "₡",
    description:
      "Traje de baño Black Coffee con detalles artesanales en crochet.",
    images: [
      "/images/swimwears/swimwear-1.webp",
      "/images/products/product-1.1.webp",
      "/images/products/product-1.2.webp",
      "/images/products/product-1.3.webp",
      "/images/products/product-1.4.webp",
    ],
    sizes: ["XS", "S", "M", "L"],
    styles: [
      { label: "REGULAR", img: "/images/regular.png" },
      { label: "TANGA", img: "/images/thong.png" },
    ],
  },

  "cow-print": {
    id: "cow-print",
    name: "COW PRINT",
    price: 21000,
    currency: "₡",
    description:
      "Traje de baño Cow Print inspirado en vacas, ideal para días de playa.",
    images: [
      "/images/swimwears/swimwear-2.webp",
      "/images/products/product-2.1.jpg",
    ],
    sizes: ["XS", "S", "M", "L"],
    styles: [
      { label: "REGULAR", img: "/images/regular.png" },
      { label: "TANGA", img: "/images/thong.png" },
    ],
  },
};

/* ============================================================
   PRODUCTO ACTUAL
============================================================ */
const slug = window.PRODUCT_SLUG;
const product = beachwearProducts[slug];

if (!product) {
  console.error("Producto no encontrado:", slug);
}

/* ============================================================
   RENDER PRODUCTO
============================================================ */
document.getElementById("productName").textContent = product.name;
document.getElementById("productPrice").textContent =
  product.price.toLocaleString("es-CR") + " " + product.currency;
document.getElementById("productDescription").textContent =
  product.description;

/* IMÁGENES */
const imagesWrap = document.getElementById("productImages");
imagesWrap.innerHTML = product.images
  .map(
    (img, i) => `
    <div class="product-img-wrap swiper-slide">
      <img src="${img}" alt="${product.name} ${i + 1}" class="product-img">
    </div>
  `
  )
  .join("");

/* TALLAS */
function renderSizes(containerId, name) {
  const container = document.getElementById(containerId);
  container.innerHTML = product.sizes
    .map(
      (size, i) => `
      <label class="variant-btn">
        <input type="radio" name="${name}" value="${size}" ${
        i === 0 ? "checked" : ""
      } hidden>
        ${size}
      </label>
    `
    )
    .join("");
}

renderSizes("topSizes", "top-size");
renderSizes("bottomSizes", "bottom-size");

/* ESTILOS */
const stylesWrap = document.getElementById("bottomStyles");
stylesWrap.innerHTML = product.styles
  .map(
    (style, i) => `
    <div class="style-rb-div">
      <img src="${style.img}" class="style-img">
      <label class="style-btn">
        <input type="radio" name="bottom-style" value="${style.label}" ${
      i === 0 ? "checked" : ""
    } hidden>
        ${style.label}
      </label>
    </div>
  `
  )
  .join("");

/* ============================================================
   ADD TO CART
============================================================ */
document.getElementById("addToCartBtn")?.addEventListener("click", () => {
  const item = {
    id: product.id,
    name: product.name,
    price: product.price,
    currency: product.currency,
    image: product.images[0],

    topSize: document.querySelector('input[name="top-size"]:checked')?.value,
    bottomSize: document.querySelector('input[name="bottom-size"]:checked')?.value,
    bottomStyle: document.querySelector(
      'input[name="bottom-style"]:checked'
    )?.value,

    quantity: 1,
  };

  if (!item.topSize || !item.bottomSize || !item.bottomStyle) {
    alert("Selecciona todas las opciones");
    return;
  }

  window.addToCart(item);
});