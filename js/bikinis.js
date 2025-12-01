const bikinis = [
  {
    nombre: "BLACK COFFEE",
    precio: "30.000 ₡",
    imagen: "/images/swimwear-1.jpg",
    link: "/pages/product-view.html",
    stock: 1,
  },
  {
    nombre: "COW PRINT",
    precio: "30.000 ₡",
    imagen: "/images/swimwear-2.jpg",
    link: "#",
    stock: 1,
  },
  {
    nombre: "TURQUOISE",
    precio: "30.000 ₡",
    imagen: "/images/swimwear-3.jpg",
    link: "#",
    stock: 1,
  },
  {
    nombre: "BLUE CAPITAN",
    precio: "30.000 ₡",
    imagen: "/images/swimwear-4.jpg",
    link: "#",
    stock: 1,
  },
  {
    nombre: "EARTH",
    precio: "30.000 ₡",
    imagen: "/images/swimwear-5.jpg",
    link: "#",
    stock: 1,
  },
  {
    nombre: "MALIBU",
    precio: "30.000 ₡",
    imagen: "/images/swimwear-6.jpg",
    link: "#",
    stock: 1,
  },
  {
    nombre: "COTTON CANDY - AQUA",
    precio: "30.000 ₡",
    imagen: "/images/swimwear-7.jpg",
    link: "#",
    stock: 1,
  },
  {
    nombre: "COTTON CANDY - LILAC",
    precio: "30.000 ₡",
    imagen: "/images/swimwear-8.jpg",
    link: "#",
    stock: 1,
  },
  {
    nombre: "FAIRY FLOSS",
    precio: "30.000 ₡",
    imagen: "/images/swimwear-9.jpg",
    link: "#",
    stock: 1,
  },
  {
    nombre: "CLOUDY",
    precio: "30.000 ₡",
    imagen: "/images/swimwear-10.jpg",
    link: "#",
    stock: 1,
  },
  {
    nombre: "BLUSH",
    precio: "30.000 ₡",
    imagen: "/images/swimwear-11.jpg",
    link: "#",
    stock: 1,
  },
  {
    nombre: "CANDY",
    precio: "32.500 ₡",
    imagen: "/images/swimwear-12.jpg",
    link: "#",
    stock: 1,
  },
  {
    nombre: "LOLLIE",
    precio: "30.000 ₡",
    imagen: "/images/swimwear-13.jpg",
    link: "#",
    stock: 1,
  },
  {
    nombre: "RED WINE",
    precio: "32.500 ₡",
    imagen: "/images/swimwear-14.jpg",
    link: "#",
    stock: 1,
  },
  {
    nombre: "SNAKE PRINT",
    precio: "30.000 ₡",
    imagen: "/images/swimwear-15.jpg",
    link: "#",
    stock: 1,
  },
  {
    nombre: "HEART OF OCEAN",
    precio: "30.000 ₡",
    imagen: "/images/swimwear-16.jpg",
    link: "#",
    stock: 1,
  },
];

const container = document.getElementById("bikinis-list");

bikinis.forEach((bikini) => {
  const item = `
    <div class="collection-item w-dyn-item">
        <a href="${bikini.link}" class="link-block w-inline-block w-clearfix">
            <div class="div-block-6 ${
              bikini.stock === 0 ? "" : "w-condition-invisible"
            }"></div>
            <img 
                alt="${bikini.nombre}" 
                loading="lazy"
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

