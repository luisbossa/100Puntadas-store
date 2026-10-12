const db = require("../db/pool");

/* ============================================================
   CAMPAÑAS DE DESCUENTO (se administran en el panel BBoard →
   Promociones). Una campaña vigente rebaja el precio de los
   productos sin modificar el precio base guardado:
   - price pasa a ser el precio con descuento,
   - oldPrice muestra el precio normal tachado,
   - discount = 1 → no participa en "lleva 2 y ahorra" (si la
     campaña suspende esa promo).
============================================================ */

// Campaña activa en este momento (si hay varias, la que empezó más recientemente).
async function getActiveCampaign() {
  const { rows } = await db.query(
    `SELECT id, name, percent, starts_at, ends_at, banner_text, skip_on_sale, suspend_bundle_promo
     FROM campaigns
     WHERE active AND starts_at <= now() AND (ends_at IS NULL OR ends_at > now())
     ORDER BY starts_at DESC
     LIMIT 1`,
  );
  return rows[0] || null;
}

const discountedPrice = (price, percent) => Math.round((price * (100 - percent)) / 100);

// Devuelve el producto con el precio de la campaña aplicado (o igual si no aplica).
function applyCampaign(product, campaign) {
  if (!campaign) return product;
  const alreadyOnSale = product.discount === 1 || product.oldPrice > product.price;
  if (campaign.skip_on_sale && alreadyOnSale) return product;

  return {
    ...product,
    oldPrice: alreadyOnSale ? product.oldPrice : product.price,
    price: discountedPrice(product.price, campaign.percent),
    discount: campaign.suspend_bundle_promo ? 1 : product.discount,
    campaignId: campaign.id,
  };
}

module.exports = { getActiveCampaign, applyCampaign, discountedPrice };
