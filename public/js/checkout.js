/* ============================================================
   CHECKOUT — paso 1
   Muestra el resumen del carrito, valida el formulario, crea la orden
   en el servidor y redirige al pago (SINPE o tarjeta).
============================================================ */
(function () {
  const form = document.getElementById("checkoutForm");
  const submitBtn = document.getElementById("checkoutBtn");
  const formMessage = document.getElementById("formMessage");

  /* ================= DATOS DEL CARRITO ================= */
  let data;
  try {
    data = JSON.parse(localStorage.getItem("checkoutData"));
  } catch {
    data = null;
  }

  // Sin carrito (o de una versión vieja sin id) no hay nada que pagar.
  if (!data?.cart?.length || data.cart.some((item) => !item.id)) {
    localStorage.removeItem("checkoutData");
    location.replace("/");
    return;
  }

  // Volver atrás desde el checkout lleva a la tienda, no a una página de pago vieja.
  history.replaceState(null, "", location.href);
  window.addEventListener("popstate", () => location.replace("/"));

  const toNumber = (value) => Number(String(value || 0).replace(/[^\d]/g, ""));

  /* ================= MENSAJES ================= */
  function showMessage(text) {
    formMessage.textContent = text;
    formMessage.classList.toggle("is-visible", Boolean(text));
  }

  function setFieldError(input, text) {
    const field = input.closest(".field");
    const error = field?.querySelector(".field__error");
    if (!field || !error) return;

    field.classList.toggle("has-error", Boolean(text));
    error.textContent = text;
    input.setAttribute("aria-invalid", text ? "true" : "false");
  }

  /* ================= RESUMEN DE PRODUCTOS ================= */
  function renderOrderProducts() {
    const list = document.getElementById("orderProducts");

    list.replaceChildren(
      ...data.cart.map((item) => {
        const row = document.createElement("div");
        row.className = "order-product";

        const details = [
          item.color,
          item.size && "Talla: " + item.size,
          item.topSize && "Top: " + item.topSize,
          item.bottomSize && "Bottom: " + item.bottomSize,
        ]
          .filter(Boolean)
          .join(" · ");

        const info = document.createElement("div");
        info.className = "order-product__info";
        const img = Object.assign(document.createElement("img"), {
          src: thumbnail(item.image),
          alt: item.name,
          width: 50,
          height: 50,
        });
        const text = document.createElement("div");
        text.append(
          Object.assign(document.createElement("strong"), { textContent: item.name }),
          Object.assign(document.createElement("small"), { textContent: details }),
        );
        info.append(img, text);

        const price = document.createElement("div");
        price.className = "order-product__price";
        price.append(
          Object.assign(document.createElement("span"), { textContent: `x${item.quantity}` }),
          Object.assign(document.createElement("strong"), {
            textContent: Pricing.formatPrice(toNumber(item.price) * Number(item.quantity)),
          }),
        );

        row.append(info, price);
        return row;
      }),
    );
  }

  /* ================= TOTALES (vista previa; el servidor los recalcula) ================= */
  const pricingItems = data.cart.map((item) => ({
    price: toNumber(item.price),
    quantity: Number(item.quantity),
    discount: item.discount,
  }));

  function selectedShipping() {
    return form.querySelector('input[name="shipping_type"]:checked')?.value;
  }

  function updateTotals() {
    const { discount, shipping, total } = Pricing.calculateTotals(
      pricingItems,
      selectedShipping(),
    );

    document.getElementById("discountRow").hidden = !discount;
    document.getElementById("cartDiscount").textContent = Pricing.formatPrice(discount);
    document.getElementById("shippingRow").classList.toggle("is-visible", Boolean(shipping));
    document.getElementById("shippingCost").textContent = Pricing.formatPrice(shipping);
    document.getElementById("orderTotal").textContent = Pricing.formatPrice(total);
  }

  /* ================= PROVINCIA → CANTÓN → DISTRITO ================= */
  const provinceSelect = document.getElementById("province");
  const cantonSelect = document.getElementById("canton");
  const districtSelect = document.getElementById("district");

  function fillSelect(select, placeholder, rows, valueKey, labelKey) {
    select.replaceChildren(
      new Option(placeholder, ""),
      ...rows.map((row) => new Option(row[labelKey], row[valueKey])),
    );
  }

  async function fetchList(url) {
    try {
      const res = await fetch(url);
      return res.ok ? await res.json() : [];
    } catch {
      return [];
    }
  }

  async function loadProvinces() {
    const provinces = await fetchList("/api/provinces");
    fillSelect(provinceSelect, "Provincia", provinces, "code", "province");
    if (!provinces.length) showMessage("No pudimos cargar las provincias. Recarga la página.");
  }

  // Cantón y distrito se habilitan en orden
  function guardLocked(select, previous, text) {
    select.addEventListener("mousedown", (e) => {
      if (select.dataset.locked === "true") {
        e.preventDefault();
        setFieldError(previous, text);
        previous.focus();
      }
    });
  }
  guardLocked(cantonSelect, provinceSelect, "Primero debes seleccionar una provincia");
  guardLocked(districtSelect, cantonSelect, "Primero debes seleccionar un cantón");

  provinceSelect.addEventListener("change", async () => {
    setFieldError(provinceSelect, "");
    fillSelect(cantonSelect, "Cantón", [], "code", "canton");
    fillSelect(districtSelect, "Distrito", [], "code", "district");
    cantonSelect.dataset.locked = districtSelect.dataset.locked = "true";
    if (!provinceSelect.value) return;

    const cantons = await fetchList(`/api/cantons/${provinceSelect.value}`);
    fillSelect(cantonSelect, "Cantón", cantons, "code", "canton");
    cantonSelect.dataset.locked = "false";
  });

  cantonSelect.addEventListener("change", async () => {
    setFieldError(cantonSelect, "");
    fillSelect(districtSelect, "Distrito", [], "code", "district");
    districtSelect.dataset.locked = "true";
    if (!cantonSelect.value) return;

    const districts = await fetchList(`/api/districts/${cantonSelect.value}`);
    fillSelect(districtSelect, "Distrito", districts, "code", "district");
    districtSelect.dataset.locked = "false";
  });

  /* ================= FORMATO MIENTRAS SE ESCRIBE ================= */
  form.phone.addEventListener("input", () => {
    let v = form.phone.value.replace(/\D/g, "");
    if (v.length > 4) v = v.slice(0, 4) + "-" + v.slice(4, 8);
    form.phone.value = v.slice(0, 9);
  });

  form.national_id.addEventListener("input", () => {
    let v = form.national_id.value.replace(/\D/g, "");
    if (v.length > 1) v = v.slice(0, 1) + "-" + v.slice(1);
    if (v.length > 6) v = v.slice(0, 6) + "-" + v.slice(6);
    form.national_id.value = v.slice(0, 12);
  });

  /* ================= VALIDACIÓN ================= */
  const RULES = {
    email: [/^\S+@\S+\.\S+$/, "Correo inválido"],
    phone: [/^[245678]\d{3}-\d{4}$/, "Teléfono inválido"],
    national_id: [/^\d-\d{4}-\d{4}$/, "Cédula inválida"],
  };

  function validateField(input) {
    const value = input.value.trim();
    let error = "";

    if (!value) error = "Campo obligatorio";
    else if (RULES[input.name] && !RULES[input.name][0].test(value)) error = RULES[input.name][1];
    else if (input.name === "address" && value.length < 10) error = "Escribe la dirección completa";

    setFieldError(input, error);
    return !error;
  }

  // Al corregir un campo con error, se revalida en el momento
  form.addEventListener("input", (e) => {
    if (e.target.closest(".field.has-error")) validateField(e.target);
  });

  /* ================= ENVÍO ================= */
  async function postJSON(url, body) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  function setBusy(busy) {
    submitBtn.disabled = busy;
    submitBtn.textContent = busy ? "Procesando…" : "Continuar al pago";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    showMessage("");

    const invalid = [...form.querySelectorAll(".field [required]")].filter(
      (input) => !validateField(input),
    );

    if (invalid.length) {
      invalid[0].focus({ preventScroll: true });
      invalid[0].closest(".field").scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const paymentMethod = form.querySelector('input[name="payment_method"]:checked')?.value;
    if (!paymentMethod) {
      showMessage("Debes escoger un método de pago antes de continuar.");
      return;
    }

    const value = (name) => form[name].value.trim();
    const order = {
      cart: data.cart,
      email: value("email"),
      phone: value("phone"),
      full_name: value("full_name"),
      national_id: value("national_id"),
      province: value("province"),
      canton: value("canton"),
      district: value("district"),
      neighborhood: value("neighborhood"),
      address: value("address"),
      address_details: value("address_details"),
      shipping_type: selectedShipping(),
      payment_method: paymentMethod,
    };

    setBusy(true);

    try {
      const created = await postJSON("/api/orders", order);
      if (!created.success) throw new Error(created.error || "No se pudo crear la orden");

      const { orderToken, orderNumber, totals } = created;
      let nextUrl;

      if (paymentMethod === "card") {
        const payment = await postJSON("/create-intent", { orderToken });
        if (!payment.success) throw new Error(payment.error || "No se pudo iniciar el pago");
        nextUrl = `/payment?paymentIntentId=${encodeURIComponent(payment.paymentIntentId)}&orderNumber=${orderNumber}`;
      } else {
        nextUrl = `/payment-sinpe?order=${encodeURIComponent(orderToken)}`;
      }

      // Solo con la orden (y el pago) creados se guarda el resumen y se vacía el checkout
      sessionStorage.setItem(
        "order_completed",
        JSON.stringify({
          orderNumber,
          total: totals.total,
          paymentMethod: paymentMethod === "card" ? "Tarjeta" : "SINPE Móvil",
          createdAt: new Date().toISOString(),
        }),
      );
      localStorage.removeItem("checkoutData");
      location.replace(nextUrl);
    } catch (err) {
      console.error(err);
      showMessage(err.message || "Error al procesar el pedido. Intenta de nuevo.");
      setBusy(false);
    }
  });

  /* ================= INICIO ================= */
  renderOrderProducts();
  form.querySelectorAll('input[name="shipping_type"]').forEach((radio) =>
    radio.addEventListener("change", updateTotals),
  );
  updateTotals();
  loadProvinces();
})();
