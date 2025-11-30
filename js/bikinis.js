const bikinis = [
  {
    nombre: "Black coffee",
    precio: "30.000 ₡",
    imagen: "/images/swimwear-1.jpg",
    link: "/pages/product-view.html",
    stock: 1,
  },
  {
    nombre: "Bikini #2",
    precio: "31.000 ₡",
    imagen: "/images/swimwear-2.jpg",
    link: "#",
    stock: 1,
  },
  {
    nombre: "Bikini #3",
    precio: "VENDIDO",
    imagen: "/images/swimwear-3.jpg",
    link: "#",
    stock: 0,
  },
  {
    nombre: "Bikini #4",
    precio: "35.000 ₡",
    imagen: "/images/swimwear-4.jpg",
    link: "#",
    stock: 1,
  },
  {
    nombre: "Bikini #5",
    precio: "33.000 ₡",
    imagen: "/images/swimwear-5.jpg",
    link: "#",
    stock: 1,
  },
  {
    nombre: "Bikini #6",
    precio: "34.000 ₡",
    imagen: "/images/swimwear-6.jpg",
    link: "#",
    stock: 1,
  },
  {
    nombre: "Bikini #7",
    precio: "32.500 ₡",
    imagen: "/images/swimwear-7.jpg",
    link: "#",
    stock: 1,
  },
  {
    nombre: "Bikini #8",
    precio: "36.000 ₡",
    imagen: "/images/swimwear-8.jpg",
    link: "#",
    stock: 1,
  },
  {
    nombre: "Bikini #9",
    precio: "VENDIDO",
    imagen: "/images/swimwear-9.jpg",
    link: "#",
    stock: 0,
  },
  {
    nombre: "Bikini #10",
    precio: "29.000 ₡",
    imagen: "/images/swimwear-10.jpg",
    link: "#",
    stock: 1,
  },
  {
    nombre: "Bikini #11",
    precio: "38.000 ₡",
    imagen: "/images/swimwear-11.jpg",
    link: "#",
    stock: 1,
  },
  {
    nombre: "Bikini #12",
    precio: "30.500 ₡",
    imagen: "/images/swimwear-12.jpg",
    link: "#",
    stock: 1,
  },
  {
    nombre: "Bikini #13",
    precio: "37.000 ₡",
    imagen: "/images/swimwear-13.jpg",
    link: "#",
    stock: 1,
  },
  {
    nombre: "Bikini #14",
    precio: "28.500 ₡",
    imagen: "/images/swimwear-14.jpg",
    link: "#",
    stock: 1,
  },
  {
    nombre: "Bikini #15",
    precio: "39.000 ₡",
    imagen: "/images/swimwear-15.jpg",
    link: "#",
    stock: 1,
  },
];

const container = document.getElementById("bikinis-list");

bikinis.forEach((bikini) => {
  const item = `
            <div class="collection-item w-dyn-item">
                <a href="${
                  bikini.link
                }" class="link-block w-inline-block w-clearfix">
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
                    VENDIDO
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
