const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");
const closeMenuBtn = document.getElementById("closeMenuBtn");

hamburger.addEventListener("click", () => {
  mobileMenu.classList.add("active");
  document.body.classList.add("no-scroll");
});

closeMenuBtn.addEventListener("click", () => {
  mobileMenu.classList.remove("active");
  document.body.classList.remove("no-scroll");
});

document.querySelectorAll(".mobile-link").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("active");
    document.body.classList.remove("no-scroll");
  });
});
