const crochets = [
  {
    nombre: "DAISY BIKINI",
    precio: "33.500 ₡",
    imagen: "/images/crochets/crochet-1.jpeg",
    link: "/product/daisyBikini",
    stock: 1,
    discount: 0,
    oldPrice: "30.000 ₡",
  },
  {
    nombre: "SCARLETT BIKINI",
    precio: "30.000 ₡",
    imagen: "/images/crochets/crochet-2.jpeg",
    link: "/product/scarlettBikini",
    stock: 1,
    discount: 0,
    oldPrice: "30.000 ₡",
  },
  {
    nombre: "SORBET LIME",
    precio: "30.000 ₡",
    imagen: "/images/crochets/crochet-3.jpeg",
    link: "/product/sorbetLime",
    stock: 1,
    discount: 0,
    oldPrice: "30.000 ₡",
  },
  {
    nombre: "SORBET PINK",
    precio: "30.000 ₡",
    imagen: "/images/crochets/crochet-4.jpeg",
    link: "/product/sorbetPink",
    stock: 1,
    discount: 0,
    oldPrice: "30.000 ₡",
  },
  {
    nombre: "SORBET BUBBLEGUM",
    precio: "30.000 ₡",
    imagen: "/images/crochets/crochet-5.jpeg",
    link: "/product/sorbetBubblegum",
    stock: 1,
    discount: 0,
    oldPrice: "30.000 ₡",
  },
  {
    nombre: "COOKIE",
    precio: "30.000 ₡",
    imagen: "/images/crochets/crochet-6.jpeg",
    link: "/product/cookie",
    stock: 1,
    discount: 0,
    oldPrice: "30.000 ₡",
  },
  {
    nombre: "SANTORINI",
    precio: "30.000 ₡",
    imagen: "/images/crochets/crochet-7.jpeg",
    link: "/product/santorini",
    stock: 1,
    discount: 0,
    oldPrice: "30.000 ₡",
  },
  {
    nombre: "APHRODITE",
    precio: "33.500 ₡",
    imagen: "/images/crochets/crochet-8.jpeg",
    link: "/product/aphrodite",
    stock: 1,
    discount: 0,
    oldPrice: "30.000 ₡",
  },
  {
    nombre: "CHERRY",
    precio: "30.000 ₡",
    imagen: "/images/crochets/crochet-9.jpeg",
    link: "/product/cherry",
    stock: 1,
    discount: 0,
    oldPrice: "30.000 ₡",
  },
  {
    nombre: "BDAY CAKE",
    precio: "30.000 ₡",
    imagen: "/images/crochets/crochet-10.jpeg",
    link: "/product/bdayCake",
    stock: 1,
    discount: 0,
    oldPrice: "30.000 ₡",
  },
];

const crochetWrapper = document.getElementById("crochet-list");

crochets.forEach((crochet) => {
  const item = `
    <div class="collection-item w-dyn-item">
    
       <a href="${crochet.link}" class="link-block w-inline-block w-clearfix">
          ${
            crochet.discount === 1
              ? `<span class="badge-discount">30% OFF</span>`
              : ""
          }

          <div class="no-stock ${
            crochet.stock === 0 ? "" : "w-condition-invisible"
          }"></div>

          <div class="image-wrapper skeleton">
            <img 
              alt="${crochet.nombre}" 
              src="${crochet.imagen}"
              sizes="(max-width: 479px) 50vw, (max-width: 991px) 33vw, 20vw"
              class="item-image"
            />
          </div>
        </a>

        <div class="soldout ${
          crochet.stock === 0 ? "" : "w-condition-invisible"
        }">
            <div>${crochet.nombre}</div>
            AGOTADO
        </div>

        <div class="text-block-8 ${
          crochet.stock === 0 ? "w-condition-invisible" : ""
        }">
            <div>${crochet.nombre}</div>

            ${
              crochet.discount === 1
                ? `<span class="old-price">${crochet.oldPrice}</span>`
                : ""
            }

            <span>${crochet.precio}</span>
        </div>
    </div>
  `;

  crochetWrapper.innerHTML += item;
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
