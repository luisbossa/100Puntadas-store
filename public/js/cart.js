/* ============================================================
   CARRITO — se guarda en localStorage y se muestra en el panel lateral.
============================================================ */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem("cartItems")) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("cartItems", JSON.stringify(cart));
}

// Escapa texto antes de insertarlo con innerHTML (el carrito vive en localStorage).
function escapeHTML(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
}

// Lo que se envía al checkout: el servidor solo confía en id, cantidad y variantes.
window.toCheckoutItem = function (item) {
  return {
    id: item.id,
    name: item.name,
    image: item.image,
    quantity: item.quantity,
    price: item.price,
    discount: item.discount,
    color: COLOR_LABELS[item.color] || item.color || null,
    topSize: item.topSize || null,
    bottomSize: item.bottomSize || null,
    bottomStyle: item.bottomStyle || null,
    size: item.size || null,
  };
};

window.addToCart = function (item) {
  const cart = getCart();

  const variantData = {
    topSize: item.topSize || null,
    bottomSize: item.bottomSize || null,
    bottomStyle: item.bottomStyle || null,
    size: item.size || null,
    color: item.color || null,
  };

  const variantKey = JSON.stringify(variantData);
  const variantId = `${item.id}-${btoa(variantKey)}`;

  const existing = cart.find((p) => p.id === item.id && p.variantId === variantId);

  if (existing) {
    existing.quantity = Math.min(existing.quantity + item.quantity, Pricing.MAX_QUANTITY);
  } else {
    cart.push({ ...item, variantKey, variantId });
  }

  saveCart(cart);
  openCart();
};

document.addEventListener("DOMContentLoaded", () => {
  const panel = document.getElementById("cartPanel");
  const overlay = document.getElementById("cartOverlay");
  const closeBtn = document.getElementById("closeCartBtn");
  const openCartBtn = document.getElementById("openCartBtn");
  const cartCount = document.querySelector(".cart-count");
  const list = panel?.querySelector(".cart-items");
  const MAX = Pricing.MAX_QUANTITY;
  const $ = (id) => document.getElementById(id);

  if (!panel || !list) return;

  /* ================= PRODUCTO ================= */

  // "Top S · Bottom M · Hilo" / "Talla M · Rosado"
  function variantText(item) {
    return [
      item.size && `Talla ${item.size}`,
      item.topSize && `Top ${item.topSize}`,
      item.bottomSize && `Bottom ${item.bottomSize}`,
      item.bottomStyle && item.bottomStyle.charAt(0) + item.bottomStyle.slice(1).toLowerCase(),
      item.color && (COLOR_LABELS[item.color] || item.color),
    ]
      .filter(Boolean)
      .join(" · ");
  }

  function itemHTML(item, index) {
    const name = escapeHTML(item.name);
    const url = item.url ? escapeHTML(item.url) : null;
    const image = `<img src="${escapeHTML(thumbnail(item.image))}" width="76" height="101" alt="${name}" loading="lazy">`;
    const qty = Number(item.quantity);

    return `
      <li class="cart-item" data-index="${index}">
        ${url ? `<a class="cart-item__media" href="${url}" tabindex="-1">${image}</a>` : `<div class="cart-item__media">${image}</div>`}

        <div class="cart-item__body">
          <div class="cart-item__top">
            <h3 class="cart-item__name">${url ? `<a href="${url}">${name}</a>` : name}</h3>
            <span class="cart-item__price">${Pricing.formatPrice(item.price * qty)}</span>
          </div>
          <p class="cart-item__variant">${escapeHTML(variantText(item))}</p>
          ${qty > 1 ? `<p class="cart-item__unit">${Pricing.formatPrice(item.price)} c/u</p>` : ""}

          <div class="cart-item__actions">
            <div class="qty" role="group" aria-label="Cantidad de ${name}">
              <button type="button" class="qty__btn" data-action="decrease" aria-label="Quitar uno" ${qty <= 1 ? "disabled" : ""}>−</button>
              <span class="qty__value" aria-live="polite">${qty}</span>
              <button type="button" class="qty__btn" data-action="increase" aria-label="Agregar uno" ${qty >= MAX ? "disabled" : ""}>+</button>
            </div>
            <button type="button" class="cart-item__remove" data-action="remove">Eliminar</button>
          </div>
        </div>
      </li>`;
  }

  /* ================= PROMO "LLEVA DOS Y AHORRA" ================= */
  function renderPromo(cart, discount) {
    const promo = $("cartPromo");
    const eligible = cart.filter((i) => i.discount !== 1).reduce((acc, i) => acc + i.quantity, 0);
    const rate = `${Pricing.DISCOUNT_RATE * 100}%`;
    const pairComplete = eligible > 0 && eligible % Pricing.DISCOUNT_MIN_ITEMS === 0;

    promo.hidden = eligible === 0;
    promo.classList.toggle("is-complete", pairComplete);
    $("cartPromoFill").style.width = pairComplete ? "100%" : "50%";
    $("cartPromoText").innerHTML = pairComplete
      ? `✦ ¡Listo! Tienes <strong>${rate} de descuento</strong> aplicado.`
      : discount > 0
        ? `Agrega <strong>1 prenda más</strong> y también tendrá ${rate} de descuento.`
        : `Agrega <strong>1 prenda más</strong> y obtén <strong>${rate} de descuento</strong>.`;
  }

  /* ================= RENDER ================= */
  window.renderCart = function () {
    const cart = getCart();
    const { subtotal, discount, total, totalQuantity } = Pricing.calculateTotals(cart);

    panel.classList.toggle("is-empty", cart.length === 0);
    $("cartTitleCount").textContent = totalQuantity ? `(${totalQuantity})` : "";
    list.innerHTML = cart.map(itemHTML).join("");

    renderPromo(cart, discount);
    $("cartSubtotal").textContent = Pricing.formatPrice(subtotal);
    $("discountRow").hidden = !discount;
    $("cartDiscount").textContent = Pricing.formatPrice(discount);
    $("cartTotal").textContent = Pricing.formatPrice(total);

    updateCount(totalQuantity);
  };

  // Número del ícono del header: rebota si aumentó
  let lastCount = null;
  function updateCount(count) {
    if (!cartCount) return;
    cartCount.textContent = count;
    cartCount.dataset.count = count; // con 0 la burbuja se oculta (CSS)
    openCartBtn?.setAttribute(
      "aria-label",
      count ? `Abrir carrito, ${count} ${count === 1 ? "producto" : "productos"}` : "Abrir carrito, vacío",
    );
    if (lastCount !== null && count > lastCount) {
      cartCount.classList.remove("is-bumped");
      void cartCount.offsetWidth; // reinicia la animación
      cartCount.classList.add("is-bumped");
    }
    lastCount = count;
  }

  /* ================= ACCIONES ================= */
  list.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    const index = Number(btn?.closest(".cart-item")?.dataset.index);
    if (!btn || Number.isNaN(index)) return;

    const cart = getCart();
    const item = cart[index];
    if (!item) return;

    const action = btn.dataset.action;
    if (action === "remove") cart.splice(index, 1);
    if (action === "increase" && item.quantity < MAX) item.quantity++;
    if (action === "decrease" && item.quantity > 1) item.quantity--;

    saveCart(cart);
    renderCart();

    // Mantener el foco en el mismo control para quien usa teclado
    const focusTarget =
      action === "remove"
        ? list.querySelector(".cart-item__remove") || $("closeCartBtn")
        : list.querySelector(`.cart-item[data-index="${index}"] [data-action="${action}"]:not(:disabled)`);
    focusTarget?.focus();
  });

  /* ================= ABRIR / CERRAR ================= */
  function closeCart() {
    if (!panel.classList.contains("open")) return;
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
    overlay?.classList.remove("show");
    document.body.classList.remove("no-scroll");
    openCartBtn?.focus();
  }

  window.openCart = function () {
    renderCart();
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    overlay?.classList.add("show");
    document.body.classList.add("no-scroll");
    closeBtn?.focus();
  };

  closeBtn?.addEventListener("click", closeCart);
  overlay?.addEventListener("click", closeCart);
  openCartBtn?.addEventListener("click", openCart);
  panel.querySelectorAll("[data-close-cart]").forEach((el) => el.addEventListener("click", closeCart));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("open")) closeCart();
  });

  renderCart();

  /* ================= PRECIOS VIGENTES =================
     El carrito guarda el precio al agregar. Al cargar la página se
     consultan los precios actuales (campañas de descuento, cambios
     en el panel) y se actualiza si algo cambió. */
  (async function refreshPrices() {
    const cart = getCart();
    if (!cart.length) return;
    try {
      const ids = [...new Set(cart.map((item) => item.id))].join(",");
      const res = await fetch(`/api/cart/prices?ids=${encodeURIComponent(ids)}`);
      const { prices } = await res.json();

      let changed = false;
      for (const item of cart) {
        const current = prices[item.id];
        if (!current?.available || current.price == null) continue;
        if (item.price !== current.price || item.discount !== current.discount) {
          item.price = current.price;
          item.discount = current.discount;
          changed = true;
        }
      }
      if (changed) {
        saveCart(cart);
        renderCart();
      }
    } catch (err) {
      console.error("No se pudieron actualizar los precios del carrito", err);
    }
  })();

  /* ================= IR AL CHECKOUT ================= */
  $("checkoutBtn")?.addEventListener("click", (e) => {
    e.preventDefault();

    const cart = getCart();
    if (!cart.length) return;

    localStorage.setItem("checkoutData", JSON.stringify({ cart: cart.map(toCheckoutItem) }));
    window.location.href = "/checkout";
  });
});
