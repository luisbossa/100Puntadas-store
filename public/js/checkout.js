document.addEventListener("DOMContentLoaded", () => {
  const data = JSON.parse(localStorage.getItem("checkoutData"));

  if (!data || !data.cart || data.cart.length === 0) {
    console.warn("No hay datos de checkout");
    return;
  }

  const productsContainer = document.querySelector(".order-products");
  const totalBox = document.querySelector(".order-total");
  const discountRow = document.getElementById("discountRow");
  const discountBox = document.getElementById("cartDiscount");

  productsContainer.innerHTML = "";

  /* ================= PRODUCTOS ================= */
  data.cart.forEach((item) => {
    const meta = [];

    if (item.topSize) meta.push(`Top: ${item.topSize}`);
    if (item.bottomSize) meta.push(`Bottom: ${item.bottomSize}`);
    if (item.bottomStyle) meta.push(`Estilo: ${item.bottomStyle}`);
    if (item.size) meta.push(`Talla: ${item.size}`);
    if (item.color) meta.push(`Color: ${item.color}`);

    productsContainer.innerHTML += `
      <div class="product-row">
        <div>
          <div class="product-name">
            ${item.quantity}× ${item.name}
          </div>
          ${
            meta.length
              ? `<div class="product-meta">${meta.join(" · ")}</div>`
              : ""
          }
        </div>
        <div class="product-price">
          ₡${(item.price * item.quantity).toLocaleString("es-CR")}
        </div>
      </div>
    `;
  });

  /* ================= DESCUENTO ================= */
  const discount = Number(data.totals.discount || 0);

  if (discount > 0) {
    discountRow.style.display = "flex";
    discountBox.textContent = discount.toLocaleString("es-CR");
  } else {
    discountRow.style.display = "none";
  }

  /* ================= TOTAL ================= */
  const total = Number(data.totals.total);

  totalBox.textContent = `₡${total.toLocaleString("es-CR")}`;
});
