/* Carrusel de testimonios: duplica la lista (que ya viene del servidor) para
   que el desplazamiento sea infinito. La copia se oculta a lectores de pantalla. */
const marqueeList = document.getElementById("marqueeList");

if (marqueeList) {
  const copies = [...marqueeList.children].map((item) => {
    const copy = item.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    copy.querySelectorAll("img").forEach((img) => (img.alt = ""));
    return copy;
  });
  marqueeList.append(...copies);
}
