/* ============================================================
   MENÚ MÓVIL — abrir/cerrar, con soporte de teclado.
============================================================ */
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");
const closeMenuBtn = document.getElementById("closeMenuBtn");

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
mobileMenu.querySelectorAll(".mobile-menu__link").forEach((link) => {
  link.addEventListener("click", () => closeMenu({ restoreFocus: false }));
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && mobileMenu.classList.contains("active")) closeMenu();
});
