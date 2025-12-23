document.addEventListener("DOMContentLoaded", () => {
  const data = JSON.parse(localStorage.getItem("checkoutData"));

  if (!data || !data.cart) {
    console.warn("No hay datos de checkout");
    return;
  }

  const productsContainer = document.querySelector(".order-products");
  const totalBox = document.querySelector(".order-total");

  productsContainer.innerHTML = "";

  // ================= PRODUCTOS =================
  data.cart.forEach((item) => {
    productsContainer.innerHTML += `
      <div class="order-col">
        <div>
          ${item.quantity}x ${item.name}
          ${item.size ? ` - Talla: ${item.size}` : ""}
          ${item.color ? ` - Color: ${item.color}` : ""}
        </div>
        <div>₡${(item.price * item.quantity).toLocaleString("es-CR")}</div>
      </div>
    `;
  });

  // ================= TOTAL FINAL =================
  totalBox.textContent = `₡${data.totals.total}`;
});
