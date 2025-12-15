const relatedProducts = [
  {
    nombre: "BLACK COFFEE",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-1.webp",
    link: "/product/black-coffee",
  },
  {
    nombre: "COW PRINT",
    precio: "22.750 ₡",
    imagen: "/images/swimwears/swimwear-2.webp",
    link: "/product/cow-print",
  },
  {
    nombre: "TURQUOISE",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-3.webp",
    link: "/product/turquoise",
  },
  {
    nombre: "BLUE CAPITAN",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-4.webp",
    link: "/product/blue-capitan",
  },
  {
    nombre: "EARTH",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-5.webp",
    link: "/product/earth",
  },
  {
    nombre: "MALIBU",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-6.webp",
    link: "/product/malibu",
  },
  {
    nombre: "AQUA",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-7.webp",
    link: "/product/aqua",
  },
  {
    nombre: "LILAC",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-8.webp",
    link: "/product/lilac",
  },
  {
    nombre: "FAIRY FLOSS",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-9.webp",
    link: "/product/fairyFloss",
  },
  {
    nombre: "CLOUDY",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-10.webp",
    link: "/product/cloudy",
  },
  {
    nombre: "BLUSH",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-11.webp",
    link: "/product/blush",
  },
  {
    nombre: "CANDY",
    precio: "34.500 ₡",
    imagen: "/images/swimwears/swimwear-12.webp",
    link: "/product/candy",
  },
  {
    nombre: "LOLLIE",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-13.webp",
    link: "/product/lollie",
  },
  {
    nombre: "RED WINE",
    precio: "34.500 ₡",
    imagen: "/images/swimwears/swimwear-14.webp",
    link: "/product/redWine",
  },
  {
    nombre: "SNAKE PRINT",
    precio: "22.750 ₡",
    imagen: "/images/swimwears/swimwear-15.webp",
    link: "/product/snakePrint",
  },
  {
    nombre: "HEART OF OCEAN",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-16.webp",
    link: "/product/heartOfOcean",
  },

  // ===== JUMPSUITS =====
  {
    nombre: "KIINI ONE PIECE",
    precio: "36.500 ₡",
    imagen: "/images/jumpsuits/jumpsuit-1.webp",
    link: "/product/jean-13",
  },
  {
    nombre: "ENTERIZO 2",
    precio: "36.500 ₡",
    imagen: "/images/jumpsuits/jumpsuit-2.webp",
    link: "/product/jean-19",
  },
  {
    nombre: "BLOOM",
    precio: "36.500 ₡",
    imagen: "/images/jumpsuits/jumpsuit-3.webp",
    link: "/product/jean-28",
  },
  {
    nombre: "MONOKINI",
    precio: "36.500 ₡",
    imagen: "/images/jumpsuits/jumpsuit-4.webp",
    link: "/product/jean-29",
  },

  // ===== SETS =====
  {
    nombre: "Rosé set",
    precio: "36,500 ₡",
    imagen: "/images/sets/set-1.jpg",
    link: "/product/sac-4",
  },
  {
    nombre: "Dahlia set",
    precio: "36,500 ₡",
    imagen: "/images/sets/set-2.jpg",
    link: "/product/sac-5",
  },
  {
    nombre: "Isla blanca",
    precio: "36,500 ₡",
    imagen: "/images/sets/set-3.jpg",
    link: "/product/sac-6",
  },
];

const container = document.getElementById("macy-container");
const RELATED_LIMIT = 3;

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function generateProducts() {
  if (!container) return;

  container.innerHTML = "";

  const currentPath = window.location.pathname;

  const filteredProducts = relatedProducts.filter(
    (product) => product.link !== currentPath
  );

  // Mezclar y tomar los primeros N productos
  const randomProducts = shuffleArray(filteredProducts).slice(0, RELATED_LIMIT);

  randomProducts.forEach((product) => {
    const item = document.createElement("div");
    item.className = "news-item-wrapper w-dyn-item";

    item.innerHTML = `
      <a href="${product.link}" class="shop-item-link wiggle w-inline-block">
        <div class="shop-thumb-wrap">
          <img 
            alt="${product.nombre}"
            loading="eager"
            src="${product.imagen}"
            class="shop-thumb-img is-main"
            sizes="(max-width: 479px) 43vw, (max-width: 991px) 45vw, 30vw"
          />
        </div>

        <div class="margin-top-s">
          <div class="text-style-h3">${product.nombre}</div>

          <div class="prices-wrap">
            <div class="text-style-h3 is-price">${product.precio}</div>
          </div>
        </div>
      </a>
    `;

    container.appendChild(item);
  });
}

generateProducts();
