/* ============================================================
   PRODUCTOS
============================================================ */
/* ============================================================
   PRODUCTOS
============================================================ */
const beachwearProducts = {
  "black-coffee": {
    id: "black-coffee",
    slug: "black-coffee",
    link: "/product/black-coffee",
    name: "BLACK COFFEE",
    price: 32500,
    currency: "₡",
    description:
      "Traje de baño Black Coffee con tonos café profundo y detalles artesanales en crochet, diseñado para un look elegante y natural.",
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
    slug: "cow-print",
    link: "/product/cow-print",
    name: "COW PRINT",
    price: 22750,
    currency: "₡",
    description:
      "Traje de baño Cow Print con estampado inspirado en vacas, ideal para un estilo atrevido y divertido en la playa.",
    images: [
      "/images/swimwears/swimwear-2.webp",
      "/images/products/product-2.1.jpg",
      "/images/products/product-2.2.jpg",
    ],
    sizes: ["XS", "S", "M", "L"],
    styles: [
      { label: "REGULAR", img: "/images/regular.png" },
      { label: "TANGA", img: "/images/thong.png" },
    ],
  },

  turquoise: {
    id: "turquoise",
    slug: "turquoise",
    link: "/product/turquoise",
    name: "TURQUOISE",
    price: 32500,
    currency: "₡",
    description:
      "Traje de baño Turquoise con un vibrante color turquesa que resalta el bronceado y evoca frescura tropical.",
    images: [
      "/images/swimwears/swimwear-3.webp",
      "/images/products/product-3.1.jpg",
    ],
    sizes: ["XS", "S", "M", "L"],
    styles: [
      { label: "REGULAR", img: "/images/regular.png" },
      { label: "TANGA", img: "/images/thong.png" },
    ],
  },

  "blue-capitan": {
    id: "blue-capitan",
    slug: "blue-capitan",
    link: "/product/blue-capitan",
    name: "BLUE CAPITAN",
    price: 32500,
    currency: "₡",
    description:
      "Traje de baño Blue Capitan con tono azul marino clásico, inspirado en el océano y la libertad del mar.",
    images: [
      "/images/swimwears/swimwear-4.webp",
      "/images/products/product-4.1.jpg",
      "/images/products/product-4.2.jpg",
      "/images/products/product-4.3.jpg",
    ],
    sizes: ["XS", "S", "M", "L"],
    styles: [
      { label: "REGULAR", img: "/images/regular.png" },
      { label: "TANGA", img: "/images/thong.png" },
    ],
  },

  earth: {
    id: "earth",
    slug: "earth",
    link: "#",
    name: "EARTH",
    price: 32500,
    currency: "₡",
    description:
      "Traje de baño Earth con tonos tierra suaves, inspirado en la naturaleza y el equilibrio natural.",
    images: [
      "/images/swimwears/swimwear-5.webp",
      "/images/products/product-5.1.jpg",
      "/images/products/product-5.2.jpg",
    ],
    sizes: ["XS", "S", "M", "L"],
    styles: [
      { label: "REGULAR", img: "/images/regular.png" },
      { label: "TANGA", img: "/images/thong.png" },
    ],
  },

  malibu: {
    id: "malibu",
    slug: "malibu",
    link: "#",
    name: "MALIBU",
    price: 32500,
    currency: "₡",
    description:
      "Traje de baño Malibu inspirado en las playas californianas, fresco, juvenil y lleno de energía.",
    images: [
      "/images/swimwears/swimwear-6.webp",
      "/images/products/product-6.1.jpg",
      "/images/products/product-6.2.jpg",
      "/images/products/product-6.3.jpg",
    ],
    sizes: ["XS", "S", "M", "L"],
    styles: [
      { label: "REGULAR", img: "/images/regular.png" },
      { label: "TANGA", img: "/images/thong.png" },
    ],
  },

  aqua: {
    id: "aqua",
    slug: "aqua",
    link: "#",
    name: "AQUA",
    price: 32500,
    currency: "₡",
    description:
      "Traje de baño Aqua con tonos claros y frescos, perfecto para días soleados junto al mar.",
    images: [
      "/images/swimwears/swimwear-7.webp",
      "/images/products/product-7.1.jpg",
      "/images/products/product-7.2.jpg",
    ],
    sizes: ["XS", "S", "M", "L"],
    styles: [
      { label: "REGULAR", img: "/images/regular.png" },
      { label: "TANGA", img: "/images/thong.png" },
    ],
  },

  lilac: {
    id: "lilac",
    slug: "lilac",
    link: "#",
    name: "LILAC",
    price: 32500,
    currency: "₡",
    description:
      "Traje de baño Lilac con un delicado tono lila que transmite suavidad, feminidad y elegancia.",
    images: [
      "/images/swimwears/swimwear-8.webp",
      "/images/products/product-8.1.jpg",
      "/images/products/product-8.2.jpg",
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
document.getElementById("productDescription").textContent = product.description;

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
    bottomSize: document.querySelector('input[name="bottom-size"]:checked')
      ?.value,
    bottomStyle: document.querySelector('input[name="bottom-style"]:checked')
      ?.value,

    quantity: 1,
  };

  if (!item.topSize || !item.bottomSize || !item.bottomStyle) {
    alert("Selecciona todas las opciones");
    return;
  }

  window.addToCart(item);
});
