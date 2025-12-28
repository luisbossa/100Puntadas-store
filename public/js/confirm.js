document.addEventListener("DOMContentLoaded", () => {
  const order = localStorage.getItem("confirm_order");
  const total = localStorage.getItem("confirm_total");
  const method = localStorage.getItem("confirm_method");
  const date = localStorage.getItem("confirm_date");

  // seguridad mínima
  if (!order || !total) {
    location.replace("/");
    return;
  }

  document.getElementById("confirm-order").textContent = `#${order}`;
  document.getElementById("confirm-date").textContent = date;
  document.getElementById("confirm-method").textContent = method;
  document.getElementById("confirm-total").textContent =
    "₡ " + Number(total).toLocaleString("es-CR");

  // limpieza (opcional)
  localStorage.removeItem("confirm_order");
  localStorage.removeItem("confirm_total");
  localStorage.removeItem("confirm_method");
  localStorage.removeItem("confirm_date");
});
