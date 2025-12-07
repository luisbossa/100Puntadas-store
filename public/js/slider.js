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

function checkScreenWidth() {
  if (window.innerWidth < 768) {
    if (!mySwiper) {
      $(".shop-swiper").each(function (index, element) {
        let nav = $(this).find(".swiper-pagination")[0];
        mySwiper = new Swiper($(this)[0], {
          grabCursor: true,
          slidesPerView: 1,
          slidesPerGroup: 1,
          spaceBetween: 20,
          pagination: {
            el: nav,
            clickable: true,
          },
        });
      });
    }
  } else {
    if (mySwiper) {
      mySwiper.destroy(true, true);
      mySwiper = null;
    }
  }
}

checkScreenWidth();
