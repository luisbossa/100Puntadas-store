const items = document.querySelectorAll(".accordion-item");

items.forEach((item) => {
  const header = item.querySelector(".accordion-header");
  const content = item.querySelector(".accordion-content");

  header.addEventListener("click", () => {
    const isOpen = item.classList.contains("active");

    // Cerrar todos
    items.forEach((i) => {
      i.classList.remove("active");
      i.querySelector(".accordion-content").style.height = 0;
    });

    // Abrir el clickeado
    if (!isOpen) {
      item.classList.add("active");
      content.style.height = content.scrollHeight + "px";
    }
  });
});
