document.addEventListener("DOMContentLoaded", function () {
  $(".product-img-wrap img")
    .on("load", function () {
      gsap.to(this, 1, {
        opacity: 1,
        ease: "power2.out",
      });
    })
    .each(function () {
      if (this.complete) {
        $(this).trigger("load");
      }
    });
});

var mySwiper;

let swipers = [];

function checkScreenWidth() {
  if (window.innerWidth < 768) {
    if (swipers.length === 0) {
      $(".shop-swiper").each(function () {
        const nav = $(this).find(".swiper-pagination")[0];

        const swiper = new Swiper(this, {
          slidesPerView: 1,
          slidesPerGroup: 1,
          spaceBetween: 0, // 🔥 CLAVE
          grabCursor: true,
          centeredSlides: false,
          pagination: {
            el: nav,
            clickable: true,
          },
        });

        swipers.push(swiper);
      });
    }
  } else {
    swipers.forEach((swiper) => swiper.destroy(true, true));
    swipers = [];
  }
}

checkScreenWidth();

window.addEventListener("resize", checkScreenWidth);

$(document).ready(function () {
  $(".variant-btn").each(function () {
    let text = $(this).text();
    if (text === "White") {
      $(this).addClass("is-white");
    } else if (text === "Blue") {
      $(this).addClass("is-blue");
    }
  });
});
