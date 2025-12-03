const jumpsuits = [
  {
    nombre: "KIINI ONE PIECE",
    precio: "35.000 ₡",
    imagen: "/images/jumpsuits/jumpsuit-1.webp",
    link: "/product/jean-13",
    stock: 1,
  },
  {
    nombre: "ENTERIZO 2",
    precio: "35.000 ₡",
    imagen: "/images/jumpsuits/jumpsuit-2.webp",
    link: "/product/jean-19",
    stock: 1,
  },
  {
    nombre: "BLOOM",
    precio: "35.000 ₡",
    imagen: "/images/jumpsuits/jumpsuit-3.webp",
    link: "/product/jean-28",
    stock: 1,
  },
  {
    nombre: "MONOKINI",
    precio: "35.000 ₡",
    imagen: "/images/jumpsuits/jumpsuit-4.webp",
    link: "/product/jean-29",
    stock: 1,
  },
];

const contenedorJumpsuits = document.getElementById("lista-jumpsuits");

jumpsuits.forEach((p) => {
  const item = document.createElement("div");
  item.className = "collection-item w-dyn-item";

  item.innerHTML = `
    <a href="${p.link}" class="link-block w-inline-block w-clearfix">
      <div class="div-block-6 ${
        p.stock === 0 ? "" : "w-condition-invisible"
      }"></div>

      <img
        alt="${p.nombre}"
        loading="lazy"
        src="${p.imagen}"
        sizes="(max-width: 479px) 50vw, (max-width: 991px) 33vw, 20vw"
        class="item-image"
      />
    </a>

    <link rel="prerender" href="${p.link}" />

    <div class="soldout ${p.stock === 0 ? "" : "w-condition-invisible"}">
      VENDIDO
    </div>

    <div class="text-block-8 ${p.stock === 1 ? "" : "w-condition-invisible"}">
      <div>${p.nombre}</div>
      <span>${p.precio}</span>
    </div>
  `;

  contenedorJumpsuits.appendChild(item);
});
