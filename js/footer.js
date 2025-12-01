$(".footer-anim-wrapper").each(function (index) {
  // `this` es el footer móvil (footer-anim-wrapper)
  // Armamos una colección que contiene el footer móvil (this) + el footer desktop
  const targets = $(this).add($(".footer-wrapper"));

  let tl = gsap.timeline({
    scrollTrigger: {
      id: "navScrolltrigger",
      trigger: $(this),          // <-- mantuviste el trigger sobre el footer móvil
      start: "top bottom",
      end: "bottom 70%",
      scrub: true,
    },
  });

  // Animar .page-padding dentro de ambos footers (mobile + desktop)
  tl.from(targets.find(".page-padding"), {
    yPercent: 50,
  });

  // Animar logo dentro de ambos footers
  tl.from(
    targets.find(".logo-footer-wrapper img"),
    {
      yPercent: 20,
    },
    "<"
  );

  // Fade-in de la misma .page-padding (para ambos)
  tl.from(
    targets.find(".page-padding"),
    {
      opacity: 0,
    },
    "<0.1"
  );
});
