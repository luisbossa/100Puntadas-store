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
          // Your options here
          // loop: true,
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

window.addEventListener("resize", checkScreenWidth);

// Wait for the document to be ready
$(document).ready(function () {
  // Select all elements with class "variant-btn"
  $(".variant-btn").each(function () {
    let text = $(this).text();
    console.log(text);
    // Check the text of the element
    if (text === "White") {
      $(this).addClass("is-white");
    } else if (text === "Blue") {
      $(this).addClass("is-blue");
    }
  });
});
