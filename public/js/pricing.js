/* ============================================================
   PRECIOS — reglas de descuento y envío.
   El mismo archivo lo usa el navegador (window.Pricing) para
   mostrar totales y el servidor (require) para calcular el
   total real de la orden. Si cambia la promo, se cambia aquí.
============================================================ */
(function (root) {
  const DISCOUNT_RATE = 0.15;
  const DISCOUNT_MIN_ITEMS = 2;
  const SHIPPING_COST = 2500;
  const MAX_QUANTITY = 20;

  const SHIPPING_OPTIONS = {
    correos: SHIPPING_COST,
    store: 0,
  };

  // Promo "lleva dos y ahorra 15%": se aplica por pares a las prendas
  // sin descuento especial (discount === 1), empezando por las más baratas.
  function calculateDiscount(items) {
    const prices = [];

    items.forEach((item) => {
      if (item.discount === 1) return;
      for (let i = 0; i < item.quantity; i++) prices.push(item.price);
    });

    const pairs = Math.floor(prices.length / DISCOUNT_MIN_ITEMS);
    if (pairs === 0) return 0;

    prices.sort((a, b) => a - b);

    const discountedSubtotal = prices
      .slice(0, pairs * DISCOUNT_MIN_ITEMS)
      .reduce((acc, price) => acc + price, 0);

    return Math.round(discountedSubtotal * DISCOUNT_RATE);
  }

  // 30000 → "30.000 ₡" (mismo formato en todo el sitio)
  function formatPrice(amount) {
    const rounded = Math.round(Number(amount) || 0);
    return `${String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} ₡`;
  }

  // items: [{ price, quantity, discount }]
  function calculateTotals(items, shippingType) {
    const subtotal = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
    const discount = calculateDiscount(items);
    const shipping = SHIPPING_OPTIONS[shippingType] || 0;

    return {
      subtotal,
      discount,
      shipping,
      total: subtotal - discount + shipping,
      totalQuantity,
    };
  }

  const Pricing = {
    DISCOUNT_RATE,
    DISCOUNT_MIN_ITEMS,
    SHIPPING_COST,
    MAX_QUANTITY,
    SHIPPING_OPTIONS,
    calculateDiscount,
    calculateTotals,
    formatPrice,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = Pricing;
  } else {
    root.Pricing = Pricing;
  }
})(typeof window !== "undefined" ? window : globalThis);
