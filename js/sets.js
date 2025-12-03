const productos = [
  {
    nombre: "Vestido #1",
    precio: "69.500 ₡",
    imagen: "/images/sets/set-1.webp",
    link: "/product/sac-4",
    stock: 1,
  },
  {
    nombre: "Vestido #2",
    precio: "63.500 ₡",
    imagen: "/images/sets/set-2.webp",
    link: "/product/sac-5",
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
      <img
        src="${p.imagen}"
        alt="${p.nombre}"
        loading="lazy"
        class="item-image"
        sizes="(max-width: 479px) 50vw, (max-width: 991px) 33vw, 20vw"
      />
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
