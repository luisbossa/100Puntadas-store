/* ============================================================
   HEADER
   - Se compacta al hacer scroll.
   - Marca en el menú la sección de la home que se está viendo.
   - Menú móvil: abrir/cerrar con teclado y foco controlado.
============================================================ */
(function () {
  const header = document.getElementById("siteHeader");
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  const closeMenuBtn = document.getElementById("closeMenuBtn");

  /* ---------- Header compacto ---------- */
  let ticking = false;
  function updateScrolled() {
    header.classList.toggle("header--scrolled", window.scrollY > 40);
    ticking = false;
  }
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateScrolled);
      }
    },
    { passive: true },
  );
  updateScrolled();

  /* ---------- Sección actual (solo en la home) ---------- */
  const links = [...document.querySelectorAll(".nav-link[data-section]")];
  const sections = links
    .map((link) => document.getElementById(link.dataset.section))
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const visible = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id)));
        // La primera sección visible (en orden de la página) es la actual
        const current = sections.find((s) => visible.has(s.id))?.id;
        links.forEach((link) => {
          if (link.dataset.section === current) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
  }

  /* ---------- Menú móvil ---------- */
  function openMenu() {
    mobileMenu.classList.add("active");
    document.body.classList.add("no-scroll");
    hamburger.setAttribute("aria-expanded", "true");
    closeMenuBtn.focus();
  }

  function closeMenu({ restoreFocus = true } = {}) {
    mobileMenu.classList.remove("active");
    document.body.classList.remove("no-scroll");
    hamburger.setAttribute("aria-expanded", "false");
    if (restoreFocus) hamburger.focus();
  }

  hamburger.addEventListener("click", openMenu);
  closeMenuBtn.addEventListener("click", () => closeMenu());

  // Al elegir un enlace se cierra el menú (sin devolver el foco: se navega)
  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeMenu({ restoreFocus: false }));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileMenu.classList.contains("active")) closeMenu();
  });
})();
