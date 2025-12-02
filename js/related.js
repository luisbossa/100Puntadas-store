const relatedProducts = [
  {
    name: "LEOPARD",
    price: "30.000 ₡",
    img: "/images/swimwear-14.jpg",
    link: "#",
  },
  {
    name: "LILAC",
    price: "30.000 ₡",
    img: "/images/swimwear-15.jpg",
    link: "#",
  },
  {
    name: "ORANGE BLAST",
    price: "30.000 ₡",
    img: "/images/swimwear-16.jpg",
    link: "#",
  },
];

const container = document.getElementById("macy-container");

function generateProducts() {
  container.innerHTML = ""; // Limpia primero

  relatedProducts.forEach((product) => {
    const item = document.createElement("div");
    item.className = "news-item-wrapper w-dyn-item";

    item.innerHTML = `
      <a href="${product.link}" class="shop-item-link wiggle w-inline-block">
        <div class="shop-thumb-wrap">
          <img 
            alt="${product.name}"
            loading="lazy"
            src="${product.img}"
            class="shop-thumb-img is-main"
            sizes="(max-width: 479px) 43vw, (max-width: 991px) 45vw, 30vw"
          />
        </div>

        <div class="margin-top-s">
          <div class="text-style-h3">${product.name}</div>

          <div class="prices-wrap">
            <div class="text-style-h3 is-price">${product.price}</div>
          </div>
        </div>
      </a>
    `;

    container.appendChild(item);
  });
}

generateProducts();
