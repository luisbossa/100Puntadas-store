const productos = [
  {
    nombre: "Rosé set",
    precio: "36.500 ₡",
    imagen: "/images/sets/set-1.jpg",
    link: "/product/sac-4",
    stock: 1,
  },
  {
    nombre: "Dahlia set",
    precio: "36.500 ₡",
    imagen: "/images/sets/set-2.jpg",
    link: "/product/sac-5",
    stock: 1,
  },
  {
    nombre: "Isla blanca",
    precio: "36.500 ₡",
    imagen: "/images/sets/set-3.jpg",
    link: "/product/sac-6",
    stock: 1,
  },
];

const contenedor = document.getElementById("lista-productos");

productos.forEach((p) => {
  const item = document.createElement("div");
  item.className = "collection-item w-dyn-item";

  item.innerHTML = `
    <a href="${p.link}" class="link-block w-inline-block w-clearfix">
      <div class="div-block-6 ${
        p.stock === 0 ? "" : "w-condition-invisible"
      }"></div>
      <div class="image-wrapper skeleton">
        <img
          src="${p.imagen}"
          alt="${p.nombre}"
          class="item-image"
          sizes="(max-width: 479px) 50vw, (max-width: 991px) 33vw, 20vw"
        />
      </div>
    </a>

    <link rel="prerender" href="${p.link}" />

    <div class="text-block-8 ${p.stock === 1 ? "" : "w-condition-invisible"}">
      <div>${p.nombre}</div>
      <span>${p.precio}</span>
    </div>

    <div class="soldout ${p.stock === 0 ? "" : "w-condition-invisible"}">
      VENDIDO
    </div>
  `;

  contenedor.appendChild(item);
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
