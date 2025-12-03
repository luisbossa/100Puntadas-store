// Obtener elementos
const modalWindow = document.querySelector("#window-send-suggestion");
const modal = modalWindow.querySelector(".sizechart-modal");
const btn = document.querySelector("#btn-sizeChart");

// Animación: abrir modal desde el botón
window.openSizeChart = function () {

    // Hacer visible para medir
    modalWindow.style.display = "flex";

    // Reset por si acaso
    gsap.set(modal, { clearProps: "all" });

    // Poner modal encima del botón (estado inicial FLIP)
    const btnRect = btn.getBoundingClientRect();
    const modalRect = modal.getBoundingClientRect();

    // Convertir modal a posición absoluta temporal
    gsap.set(modal, {
        position: "absolute",
        top: btnRect.top,
        left: btnRect.left,
        width: btnRect.width,
        height: btnRect.height,
        opacity: 0.1,
        scale: 0.6
    });

    // Guardar estado inicial
    const state = Flip.getState(modal);

    // Estado final: modal centrado con su tamaño real
    gsap.set(modal, {
        position: "relative",
        top: "unset",
        left: "unset",
        width: "",
        height: "",
        opacity: 1,
        scale: 1
    });

    // Fondo fade in
    gsap.fromTo(modalWindow,
        { opacity: 0 },
        { opacity: 1, duration: 0.35, ease: "power1.out" }
    );

    // Animación FLIP desde el botón → centro
    Flip.from(state, {
        duration: 0.65,
        ease: CustomEase.create("easeModal", "M0,0 C0.308,0.19 0.107,0.633 0.288,0.866 0.382,0.987 0.656,1 1,1"),
        absolute: true
    });
};


// Animación: cerrar modal hacia el botón
window.closeSizeChart = function () {

    const btnRect = btn.getBoundingClientRect();

    const state = Flip.getState(modal);

    // Poner modal en destino final: al botón
    gsap.set(modal, {
        position: "absolute",
        top: btnRect.top,
        left: btnRect.left,
        width: btnRect.width,
        height: btnRect.height,
        scale: 0.6,
        opacity: 0
    });

    // Animación FLIP inversa
    Flip.from(state, {
        duration: 0.55,
        ease: "power1.in",
        absolute: true
    });

    // Fade del fondo
    gsap.to(modalWindow, {
        opacity: 0,
        duration: 0.45,
        ease: "power1.in",
        onComplete: () => {
            modalWindow.style.display = "none";
            gsap.set(modal, { clearProps: "all" });
        }
    });
};
