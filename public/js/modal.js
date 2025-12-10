const modalWindow = document.querySelector("#window-send-suggestion");
const modal = modalWindow.querySelector(".sizechart-modal");
const btn = document.querySelector("#btn-sizeChart");

window.openSizeChart = function () {
  modalWindow.style.display = "flex";

  // Añadir la clase no-scroll al body
  document.body.classList.add("no-scroll");

  gsap.set(modal, { clearProps: "all" });

  modal.style.overflow = "hidden";

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

  const state = Flip.getState(modal);

  gsap.set(modal, {
    position: "relative",
    top: "unset",
    left: "unset",
    width: "",
    height: "",
    opacity: 1,
    scale: 1,
  });

  gsap.fromTo(
    modalWindow,
    { opacity: 0 },
    { opacity: 1, duration: 0.35, ease: "power1.out" }
  );

  Flip.from(state, {
    duration: 0.65,
    ease: CustomEase.create(
      "easeModal",
      "M0,0 C0.308,0.19 0.107,0.633 0.288,0.866 0.382,0.987 0.656,1 1,1"
    ),
    absolute: true,
    onComplete: () => {
      modal.style.overflowY = "auto";
    },
  });
};

window.closeSizeChart = function () {
  modal.style.overflow = "hidden";

  // Eliminar la clase no-scroll del body
  document.body.classList.remove("no-scroll");

  const btnRect = btn.getBoundingClientRect();
  const state = Flip.getState(modal);

  gsap.set(modal, {
    position: "absolute",
    top: btnRect.top,
    left: btnRect.left,
    width: btnRect.width,
    height: btnRect.height,
    scale: 0.6,
    opacity: 0,
  });

  Flip.from(state, {
    duration: 0.55,
    ease: "power1.in",
    absolute: true,
  });

  gsap.to(modalWindow, {
    opacity: 0,
    duration: 0.45,
    ease: "power1.in",
    onComplete: () => {
      modalWindow.style.display = "none";
      gsap.set(modal, { clearProps: "all" });
    },
  });
};

modalWindow.addEventListener("click", function (event) {
  if (event.target === modalWindow) {
    closeSizeChart();
  }
});
