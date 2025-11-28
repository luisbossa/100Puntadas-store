const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");
const closeMenuBtn = document.getElementById("closeMenuBtn");

// abrir menú
hamburger.addEventListener("click", () => {
  mobileMenu.classList.add("active");
});

// cerrar menú
closeMenuBtn.addEventListener("click", () => {
  mobileMenu.classList.remove("active");
});

// cerrar cuando se cliquea un link
document.querySelectorAll(".mobile-link").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("active");
  });
});
