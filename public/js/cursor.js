/* ============================================================
   CURSOR "COMPRAR" — solo en dispositivos con mouse.
   Sigue al puntero y se centra sobre los enlaces de producto.
============================================================ */
(function () {
  const cursorEl = document.querySelector(".cursor");
  if (!cursorEl) return;

  const hasMouse = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (!hasMouse.matches) {
    cursorEl.style.display = "none";
    return;
  }

  const label = cursorEl.querySelector(".cursor-btn");
  const buyText = label.textContent;
  let snappedTo = null;

  // Sobre un producto agotado el cursor dice "Agotado" en vez de "Comprar"
  function setSoldOut(isSoldOut) {
    cursorEl.classList.toggle("is-soldout", isSoldOut);
    label.textContent = isSoldOut ? "Agotado" : buyText;
  }

  function follow(e) {
    if (snappedTo) return;

    setSoldOut(Boolean(e.target.closest(".product-card--soldout")));

    if (e.target.closest(".no-cursor-zone")) {
      cursorEl.style.opacity = "0";
      return;
    }

    cursorEl.style.opacity = "1";
    cursorEl.style.top = e.pageY + "px";
    cursorEl.style.left = e.pageX + "px";
  }

  // Al pasar por un enlace (fuera de zonas sin cursor) se centra sobre él.
  function snap(e) {
    const link = e.target.closest("a");
    if (!link || link === snappedTo || link.closest(".no-cursor-zone")) return;

    snappedTo = link;
    setSoldOut(false);
    const rect = link.getBoundingClientRect();
    cursorEl.style.opacity = "1";
    cursorEl.style.top = rect.top + window.scrollY + rect.height / 2 + "px";
    cursorEl.style.left = rect.left + window.scrollX + rect.width / 2 + "px";
  }

  function release(e) {
    if (snappedTo && !snappedTo.contains(e.relatedTarget)) snappedTo = null;
  }

  window.addEventListener("mousemove", follow);
  document.addEventListener("mouseover", snap);
  document.addEventListener("mouseout", release);
})();
