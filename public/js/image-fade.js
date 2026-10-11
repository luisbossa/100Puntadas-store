/* Muestra cada imagen de producto con un fundido suave cuando termina de cargar. */
document.querySelectorAll(".product-card__image").forEach((img) => {
  const show = () => img.classList.add("is-loaded");

  if (img.complete) show();
  else {
    img.addEventListener("load", show, { once: true });
    img.addEventListener("error", show, { once: true });
  }
});
