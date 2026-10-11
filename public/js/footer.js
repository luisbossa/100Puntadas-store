/* ============================================================
   FOOTER — efecto "reveal" al llegar al final (solo escritorio).
============================================================ */
gsap.registerPlugin(ScrollTrigger);

gsap.matchMedia().add(
  "(min-width: 992px) and (prefers-reduced-motion: no-preference)",
  () => {
    const fixedFooter = document.querySelector(".footer-wrapper");

    document.querySelectorAll(".footer-anim-wrapper").forEach((wrapper, index) => {
      const targets = [wrapper, fixedFooter].filter(Boolean);
      const find = (selector) =>
        targets.flatMap((el) => [...el.querySelectorAll(selector)]);

      const tl = gsap.timeline({
        scrollTrigger: {
          id: "navScrolltrigger-" + index,
          trigger: wrapper,
          start: "top bottom",
          end: "bottom 70%",
          scrub: true,
        },
      });

      tl.from(find(".footer__inner"), { yPercent: 50 });
      tl.from(find(".footer__logo"), { yPercent: 20 }, "<");
      tl.from(find(".footer__inner"), { opacity: 0 }, "<0.1");
    });
  },
);
