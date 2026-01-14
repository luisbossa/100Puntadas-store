document.addEventListener("DOMContentLoaded", () => {
  const data =
    sessionStorage.getItem("order_completed") ||
    localStorage.getItem("order_completed");

  // seguridad REAL
  if (!data) {
    location.replace("/");
    return;
  }

  const order = JSON.parse(data);

  // pintar datos
  document.getElementById("confirm-order").textContent =
    order.orderNumber || `#${order.orderId}`;

  document.getElementById("confirm-date").textContent = new Date(
    order.createdAt
  ).toLocaleDateString("es-CR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  document.getElementById("confirm-method").textContent = order.paymentMethod;

  document.getElementById("confirm-total").textContent =
    "₡ " + Number(order.total).toLocaleString("es-CR");

  /* ================= LIMPIEZA DEFINITIVA ================= */

  // carrito
  localStorage.removeItem("cartItems");
  localStorage.removeItem("checkoutData");

  // sesión de confirmación
  sessionStorage.removeItem("order_completed");
  localStorage.removeItem("order_completed");
});
