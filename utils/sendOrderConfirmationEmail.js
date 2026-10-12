const path = require("path");
const transporter = require("./mailer");
const orderToken = require("./orderToken");
const { formatPrice } = require("../public/js/pricing");

/* ============================================================
   CORREO DE CONFIRMACIÓN — se envía cuando el pago queda
   confirmado (ONVO o aprobación SINPE desde el panel).
   Incluye el detalle de la compra y un enlace a /confirm.
============================================================ */
const SITE_URL = (process.env.SITE_URL || "https://100puntadas.vercel.app").replace(/\/+$/, "");

const PAYMENT = { sinpe: "SINPE Móvil / transferencia", card: "Tarjeta" };

// Los datos vienen del cliente: se escapan antes de ponerlos en el HTML.
const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const variants = (item) =>
  [
    item.size && `Talla ${item.size}`,
    item.top_size && `Top ${item.top_size}`,
    item.bottom_size && `Bottom ${item.bottom_size}`,
    item.bottom_style,
    item.color,
  ]
    .filter(Boolean)
    .join(" · ");

const row = (label, value, strong = false) => `
  <tr>
    <td style="padding:6px 0;font-size:14px;color:${strong ? "#161616" : "#5e5e5e"};${strong ? "font-weight:700;" : ""}">${label}</td>
    <td style="padding:6px 0;font-size:14px;text-align:right;color:#161616;${strong ? "font-weight:700;font-size:16px;" : ""}">${value}</td>
  </tr>`;

module.exports = async function sendOrderConfirmationEmail(order, items) {
  const number = order.order_number || order.id;
  const viewUrl = `${SITE_URL}/confirm?order=${encodeURIComponent(orderToken.create(order.id))}`;
  const address = [order.province_name, order.canton_name, order.district_name].filter(Boolean).join(", ");

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #eee;font-size:14px;color:#161616;">
          <strong>${esc(item.product_name)}</strong>
          ${variants(item) ? `<br><span style="font-size:13px;color:#5e5e5e;">${esc(variants(item))}</span>` : ""}
          <br><span style="font-size:13px;color:#5e5e5e;">Cantidad: ${item.quantity}</span>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #eee;font-size:14px;text-align:right;white-space:nowrap;color:#161616;">
          ${formatPrice(item.price * item.quantity)}
        </td>
      </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pedido confirmado #${number}</title>
</head>
<body style="margin:0;padding:0;background:#fcfaf6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fcfaf6;padding:20px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">

        <tr><td>
          <img src="cid:header-image" alt="100 Puntadas" width="600" style="display:block;width:100%;height:auto;">
        </td></tr>

        <tr><td style="padding:32px 32px 8px;color:#161616;">
          <h1 style="margin:0 0 8px;font-size:24px;">¡Gracias por tu compra, ${esc(order.full_name.split(" ")[0])}!</h1>
          <p style="margin:0 0 4px;font-size:15px;line-height:1.6;color:#5e5e5e;">
            Confirmamos tu pago. Estamos preparando tu pedido y te avisaremos cuando salga hacia ti.
          </p>
          <p style="margin:16px 0 0;font-size:14px;color:#5e5e5e;">
            Pedido <strong style="color:#161616;">#${number}</strong> ·
            ${new Date(order.created_at).toLocaleDateString("es-CR", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Costa_Rica" })}
          </p>
        </td></tr>

        <!-- Productos -->
        <tr><td style="padding:16px 32px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">${itemsHtml}</table>
        </td></tr>

        <!-- Totales -->
        <tr><td style="padding:12px 32px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${row("Subtotal", formatPrice(order.subtotal))}
            ${Number(order.discount) > 0 ? row("Descuento", `−${formatPrice(order.discount)}`) : ""}
            ${row("Envío", Number(order.shipping) > 0 ? formatPrice(order.shipping) : "Retiro en tienda")}
            ${row("Total pagado", formatPrice(order.total), true)}
          </table>
        </td></tr>

        <!-- Entrega y pago -->
        <tr><td style="padding:24px 32px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fcfaf6;border-radius:10px;">
            <tr><td style="padding:16px 18px;font-size:14px;line-height:1.6;color:#161616;">
              <strong>Entrega</strong><br>
              ${esc(order.full_name)} · ${esc(order.phone)}<br>
              ${esc(address)}<br>
              ${esc(order.address)}${order.neighborhood ? `, ${esc(order.neighborhood)}` : ""}
              <br><br>
              <strong>Método de pago</strong><br>
              ${PAYMENT[order.payment_method] || esc(order.payment_method)}
            </td></tr>
          </table>
        </td></tr>

        <!-- Botón -->
        <tr><td style="padding:28px 32px 32px;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="background:#161616;border-radius:999px;">
              <a href="${viewUrl}" style="display:inline-block;padding:13px 28px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">
                Ver mi pedido
              </a>
            </td>
          </tr></table>
          <p style="margin:18px 0 0;font-size:13px;color:#5e5e5e;">
            ¿Dudas? Escríbenos por WhatsApp al 8792-5172 indicando tu número de pedido.
          </p>
        </td></tr>

        <tr><td style="padding:18px;text-align:center;font-size:12px;color:#999;border-top:1px solid #eee;">
          © ${new Date().getFullYear()} 100 Puntadas · Hecho a mano en Costa Rica
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: `"100 Puntadas" <${process.env.MAIL_USER}>`,
    to: order.email,
    subject: `Pedido confirmado #${number} · 100 Puntadas`,
    html,
    attachments: [
      {
        filename: "mail-img.png",
        path: path.join(__dirname, "../public/images/mail-img.png"),
        cid: "header-image",
      },
    ],
  });
};
