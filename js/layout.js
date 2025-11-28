document.addEventListener("DOMContentLoaded", () => {
  const footer = document.getElementById("footer");
  if (!footer) return;

  footer.innerHTML = `
    <div class="footer-link">
      © 2025 100Puntadas. Website creado por 
      <a href="https://bstudio.site/" target="_blank" class="link">BStudio</a>
    </div>
  `;
});
