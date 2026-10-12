/* ============================================================
   GUÍA DE TALLAS — modal que "crece" desde el botón (GSAP Flip)
   y al cerrar recorre la misma animación al revés.
============================================================ */
const modalWindow = document.querySelector("#size-guide-modal");
const modal = modalWindow.querySelector(".sizechart-modal");
const btn = document.querySelector("#size-guide-btn");
const closeBtn = modalWindow.querySelector("[data-close-size-guide]");

const ease = CustomEase.create(
  "easeModal",
  "M0,0 C0.308,0.19 0.107,0.633 0.288,0.866 0.382,0.987 0.656,1 1,1",
);

let timeline = null; // animación de apertura; al cerrar se reproduce en reversa

const isOpen = () => modalWindow.style.display === "flex";

function onOpened() {
  modal.style.overflowY = "auto";
  closeBtn.focus();
}

function onClosed() {
  modalWindow.style.display = "none";
  gsap.set([modal, modalWindow], { clearProps: "all" });
  timeline = null;
  btn.focus();
}

window.openSizeChart = function () {
  // Si se estaba cerrando, simplemente vuelve a abrir desde donde va
  if (timeline) {
    timeline.play();
    return;
  }

  modalWindow.style.display = "flex";
  btn.setAttribute("aria-expanded", "true");

  gsap.set(modal, { clearProps: "all" });
  modal.style.overflow = "hidden";

  // Estado inicial: del tamaño y posición del botón
  const btnRect = btn.getBoundingClientRect();
  gsap.set(modal, {
    position: "absolute",
    top: btnRect.top,
    left: btnRect.left,
    width: btnRect.width,
    height: btnRect.height,
    opacity: 0.1,
    scale: 0.6,
  });

  const state = Flip.getState(modal, { props: "opacity" });

  // Estado final: centrado a tamaño completo
  gsap.set(modal, {
    position: "relative",
    top: "unset",
    left: "unset",
    width: "",
    height: "",
    opacity: 1,
    scale: 1,
  });

  timeline = gsap.timeline({
    onComplete: onOpened,
    onReverseComplete: onClosed,
  });

  timeline.fromTo(
    modalWindow,
    { opacity: 0 },
    { opacity: 1, duration: 0.35, ease: "power1.out" },
    0,
  );

  timeline.add(
    Flip.from(state, {
      duration: 0.65,
      ease,
      absolute: true,
      props: "opacity",
    }),
    0,
  );
};

window.closeSizeChart = function () {
  if (!timeline) return;

  btn.setAttribute("aria-expanded", "false");
  modal.style.overflow = "hidden";
  modal.scrollTop = 0;

  // La misma animación de apertura, de vuelta hacia el botón
  timeline.reverse();
};

btn.addEventListener("click", openSizeChart);
closeBtn.addEventListener("click", closeSizeChart);

// Cerrar al hacer clic fuera del recuadro o con la tecla Escape
modalWindow.addEventListener("click", (event) => {
  if (event.target === modalWindow) closeSizeChart();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && isOpen()) closeSizeChart();
});
