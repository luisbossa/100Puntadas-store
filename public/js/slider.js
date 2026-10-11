/* ============================================================
   GALERÍA DE PRODUCTO
   - Aparición suave de cada imagen al cargar.
   - En pantallas < 768px la galería se vuelve un carrusel (Swiper).
============================================================ */
document.querySelectorAll(".product__image").forEach((img) => {
  const show = () =>
    gsap.to(img, { duration: 1, opacity: 1, ease: "power2.out" });

  if (img.complete) show();
  else img.addEventListener("load", show, { once: true });
});

let swipers = [];

function checkScreenWidth() {
  if (window.innerWidth < 768) {
    if (swipers.length === 0) {
      document.querySelectorAll(".product").forEach((el) => {
        swipers.push(
          new Swiper(el, {
            slidesPerView: 1,
            slidesPerGroup: 1,
            spaceBetween: 24,
            grabCursor: true,
            centeredSlides: false,
            pagination: {
              el: el.querySelector(".swiper-pagination"),
              clickable: true,
            },
          }),
        );
      });
    }
  } else {
    swipers.forEach((swiper) => swiper.destroy(true, true));
    swipers = [];
  }
}

checkScreenWidth();

window.addEventListener("resize", checkScreenWidth);
