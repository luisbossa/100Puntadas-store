const bikinis = [
  {
    nombre: "BLACK COFFEE",
    precio: "30.000 ₡",
    imagen: "/images/swimwears/swimwear-1.webp",
    link: "/pages/product-view.html",
    stock: 1,
    discount: 0,
  },
  {
    nombre: "COW PRINT",
    precio: "30.000 ₡",
    imagen: "/images/swimwears/swimwear-2.webp",
    link: "#",
    stock: 1,
    discount: 1,
  },
  {
    nombre: "TURQUOISE",
    precio: "30.000 ₡",
    imagen: "/images/swimwears/swimwear-3.webp",
    link: "#",
    stock: 1,
    discount: 0,
  },
  {
    nombre: "BLUE CAPITAN",
    precio: "30.000 ₡",
    imagen: "/images/swimwears/swimwear-4.webp",
    link: "#",
    stock: 1,
    discount: 0,
  },
  {
    nombre: "EARTH",
    precio: "30.000 ₡",
    imagen: "/images/swimwears/swimwear-5.webp",
    link: "#",
    stock: 1,
    discount: 0,
  },
  {
    nombre: "MALIBU",
    precio: "30.000 ₡",
    imagen: "/images/swimwears/swimwear-6.webp",
    link: "#",
    stock: 1,
    discount: 0,
  },
  {
    nombre: "AQUA",
    precio: "30.000 ₡",
    imagen: "/images/swimwears/swimwear-7.webp",
    link: "#",
    stock: 1,
    discount: 0,
  },
  {
    nombre: "LILAC",
    precio: "30.000 ₡",
    imagen: "/images/swimwears/swimwear-8.webp",
    link: "#",
    stock: 1,
    discount: 0,
  },
  {
    nombre: "FAIRY FLOSS",
    precio: "30.000 ₡",
    imagen: "/images/swimwears/swimwear-9.webp",
    link: "#",
    stock: 1,
    discount: 0,
  },
  {
    nombre: "CLOUDY",
    precio: "30.000 ₡",
    imagen: "/images/swimwears/swimwear-10.webp",
    link: "#",
    stock: 1,
    discount: 0,
  },
  {
    nombre: "BLUSH",
    precio: "30.000 ₡",
    imagen: "/images/swimwears/swimwear-11.webp",
    link: "#",
    stock: 1,
    discount: 0,
  },
  {
    nombre: "CANDY",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-12.webp",
    link: "#",
    stock: 1,
    discount: 0,
  },
  {
    nombre: "LOLLIE",
    precio: "30.000 ₡",
    imagen: "/images/swimwears/swimwear-13.webp",
    link: "#",
    stock: 1,
    discount: 0,
  },
  {
    nombre: "RED WINE",
    precio: "32.500 ₡",
    imagen: "/images/swimwears/swimwear-14.webp",
    link: "#",
    stock: 1,
    discount: 0,
  },
  {
    nombre: "SNAKE PRINT",
    precio: "30.000 ₡",
    imagen: "/images/swimwears/swimwear-15.webp",
    link: "#",
    stock: 1,
    discount: 1,
  },
  {
    nombre: "HEART OF OCEAN",
    precio: "30.000 ₡",
    imagen: "/images/swimwears/swimwear-16.webp",
    link: "#",
    stock: 1,
    discount: 0,
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

          <img 
              alt="${bikini.nombre}" 
              loading="eager"
              src="${bikini.imagen}"
              sizes="(max-width: 479px) 50vw, (max-width: 991px) 33vw, 20vw"
              class="item-image"
          />
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
            <span>${bikini.precio}</span>
        </div>
    </div>
  `;

  container.innerHTML += item;
});
