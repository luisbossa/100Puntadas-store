let tricksCursor = document.querySelector(".cursor");

// Detectar móvil (iOS / Android / tablets)
const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
  navigator.userAgent
);

// Si es móvil → desactivar todo
if (isMobile) {
  tricksCursor.style.display = "none"; // esconder cursor
} else {
  // --- SOLO DESKTOP: Cursor activo ---
  window.addEventListener("mousemove", cursor);

  function cursor(e) {
    // Si estamos dentro de una zona prohibida → ocultar cursor
    if (e.target.closest(".no-cursor-zone")) {
      tricksCursor.style.opacity = "0";
      return;
    }

    // Si estamos fuera → mostrar y mover
    tricksCursor.style.opacity = "1";
    tricksCursor.style.top = e.pageY + "px";
    tricksCursor.style.left = e.pageX + "px";
  }

  $(document).on("mouseenter", "a", function () {
    // SI el link está dentro de una zona sin cursor → ignorar
    if ($(this).closest(".no-cursor-zone").length > 0) {
      window.addEventListener("mousemove", cursor); // seguir el mouse normal
      return;
    }

    // Links normales → activar cursor centrado
    window.removeEventListener("mousemove", cursor);

    let width = $(this).outerWidth() / 2;
    let height = $(this).outerHeight() / 2;
    let top = $(this).offset().top;
    let left = $(this).offset().left;

    tricksCursor.style.top = top + height + "px";
    tricksCursor.style.left = left + width + "px";
  });
}
