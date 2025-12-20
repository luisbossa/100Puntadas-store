const bikinis = [
  {
    nombre: "BLACK COFFEE",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-1.webp",
    link: "/product/black-coffee",
    stock: 1,
    discount: 0,
    oldPrice: "30.000 ₡",
  },
  {
    nombre: "COW PRINT",
    precio: "22.750 ₡",
    imagen: "/images/swimwears/swimwear-2.webp",
    link: "/product/cow-print",
    stock: 1,
    discount: 1,
    oldPrice: "32.500 ₡",
  },
  {
    nombre: "TURQUOISE",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-3.webp",
    link: "/product/turquoise",
    stock: 1,
    discount: 0,
    oldPrice: "30.000 ₡",
  },
  {
    nombre: "BLUE CAPITAN",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-4.webp",
    link: "/product/blue-capitan",
    stock: 1,
    discount: 0,
    oldPrice: "30.000 ₡",
  },
  {
    nombre: "EARTH",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-5.webp",
    link: "/product/earth",
    stock: 1,
    discount: 0,
    oldPrice: "30.000 ₡",
  },
  {
    nombre: "MALIBU",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-6.webp",
    link: "/product/malibu",
    stock: 1,
    discount: 0,
    oldPrice: "30.000 ₡",
  },
  {
    nombre: "AQUA",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-7.webp",
    link: "/product/aqua",
    stock: 1,
    discount: 0,
    oldPrice: "30.000 ₡",
  },
  {
    nombre: "LILAC",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-8.webp",
    link: "/product/lilac",
    stock: 1,
    discount: 0,
    oldPrice: "30.000 ₡",
  },
  {
    nombre: "FAIRY FLOSS",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-9.webp",
    link: "/product/fairyFloss",
    stock: 1,
    discount: 0,
    oldPrice: "30.000 ₡",
  },
  {
    nombre: "CLOUDY",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-10.webp",
    link: "/product/cloudy",
    stock: 1,
    discount: 0,
    oldPrice: "30.000 ₡",
  },
  {
    nombre: "BLUSH",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-11.webp",
    link: "/product/blush",
    stock: 1,
    discount: 0,
    oldPrice: "30.000 ₡",
  },
  {
    nombre: "CANDY",
    precio: "34.500 ₡",
    imagen: "/images/swimwears/swimwear-12.webp",
    link: "/product/candy",
    stock: 1,
    discount: 0,
    oldPrice: "32.500 ₡",
  },
  {
    nombre: "LOLLIE",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-13.webp",
    link: "/product/lollie",
    stock: 1,
    discount: 0,
    oldPrice: "30.000 ₡",
  },
  {
    nombre: "RED WINE",
    precio: "34.500 ₡",
    imagen: "/images/swimwears/swimwear-14.webp",
    link: "/product/redWine",
    stock: 1,
    discount: 0,
    oldPrice: "32.500 ₡",
  },
  {
    nombre: "SNAKE PRINT",
    precio: "22.750 ₡",
    imagen: "/images/swimwears/swimwear-15.webp",
    link: "/product/snakePrint",
    stock: 1,
    discount: 1,
    oldPrice: "32.500 ₡",
  },
  {
    nombre: "HEART OF OCEAN",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-16.webp",
    link: "/product/heartOfOcean",
    stock: 1,
    discount: 0,
    oldPrice: "30.000 ₡",
  },
  {
    nombre: "BUBBLE GUM KIINI",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-17.jpeg",
    link: "/product/bubblegum",
    stock: 1,
    discount: 0,
    oldPrice: "30.000 ₡",
  },
  {
    nombre: "MARSHMALLOW",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-18.jpeg",
    link: "/product/marshmallow",
    stock: 1,
    discount: 0,
    oldPrice: "30.000 ₡",
  },
  {
    nombre: "VINTAGE SUMMER",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-19.jpeg",
    link: "/product/vintageSummer",
    stock: 1,
    discount: 0,
    oldPrice: "30.000 ₡",
  },
  {
    nombre: "CHERRY",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-20.jpeg",
    link: "/product/cherry",
    stock: 1,
    discount: 0,
    oldPrice: "30.000 ₡",
  },
  {
    nombre: "NAVY BLUE",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-21.jpeg",
    link: "/product/navyBlue",
    stock: 1,
    discount: 0,
    oldPrice: "30.000 ₡",
  },
  {
    nombre: "LEOPARD KIINI",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-22.jpeg",
    link: "/product/leopard",
    stock: 1,
    discount: 0,
    oldPrice: "30.000 ₡",
  },
];

const container = document.getElementById("bikinis-list");

bikinis.forEach((bikini) => {
  const item = `
    <div class="collection-item w-dyn-item">
    
       <a href="${bikini.link}" class="link-block w-inline-block w-clearfix">
          ${
            bikini.discount === 1
              ? `<span class="badge-discount">30% OFF</span>`
              : ""
          }

          <div class="no-stock ${
            bikini.stock === 0 ? "" : "w-condition-invisible"
          }"></div>

          <div class="image-wrapper skeleton">
            <img 
              alt="${bikini.nombre}" 
              src="${bikini.imagen}"
              sizes="(max-width: 479px) 50vw, (max-width: 991px) 33vw, 20vw"
              class="item-image"
            />
          </div>
        </a>

        <div class="soldout ${
          bikini.stock === 0 ? "" : "w-condition-invisible"
        }">
            <div>${bikini.nombre}</div>
            AGOTADO
        </div>

        <div class="text-block-8 ${
          bikini.stock === 0 ? "w-condition-invisible" : ""
        }">
            <div>${bikini.nombre}</div>

            ${
              bikini.discount === 1
                ? `<span class="old-price">${bikini.oldPrice}</span>`
                : ""
            }

            <span>${bikini.precio}</span>
        </div>
    </div>
  `;

  container.innerHTML += item;
});

document.querySelectorAll(".image-wrapper img").forEach((img) => {
  const wrapper = img.parentElement;

  if (img.complete) {
    wrapper.classList.add("loaded");
  } else {
    img.addEventListener("load", () => {
      wrapper.classList.add("loaded");
    });
  }
});
