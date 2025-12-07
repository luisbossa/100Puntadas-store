$(".footer-anim-wrapper").each(function (index) {
  const targets = $(this).add($(".footer-wrapper"));

  let tl = gsap.timeline({
    scrollTrigger: {
      id: "navScrolltrigger",
      trigger: $(this),          
      start: "top bottom",
      end: "bottom 70%",
      scrub: true,
    },
  });

  tl.from(targets.find(".page-padding"), {
    yPercent: 50,
  });

  tl.from(
    targets.find(".logo-footer-wrapper img"),
    {
      yPercent: 20,
    },
    "<"
  );

  tl.from(
    targets.find(".page-padding"),
    {
      opacity: 0,
    },
    "<0.1"
  );
});
