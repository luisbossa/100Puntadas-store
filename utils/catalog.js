const db = require("../db/pool");

/* ============================================================
   CATÁLOGO — fuente única: la base de datos (se administra
   desde el panel BBoard). Se cachea en memoria unos segundos
   para no consultar Neon en cada página.
   Forma de cada producto (la misma que tenía data/catalog.js):
   { id, dbId, slug, productType, name, price, oldPrice, discount,
     currency, description, description2, images[], sizes[],
     styles[{ label, img }], stock }
   stock: null = bajo pedido, 0 = agotado, n = unidades.
============================================================ */
const TTL_MS = 30 * 1000;

let cache = null; // { products, collections, loadedAt }
let loading = null;

async function load() {
  const [products, collections] = await Promise.all([
    db.query(`
      SELECT p.id, p.slug, p.name, p.product_type, p.price, p.old_price, p.discount,
             p.currency, p.description, p.description2, p.main_image, p.stock,
             COALESCE((SELECT json_agg(pi.image ORDER BY pi.position)
                       FROM product_images pi WHERE pi.product_id = p.id), '[]') AS images,
             (SELECT json_agg(ps.size ORDER BY ps.position)
                FROM product_sizes ps WHERE ps.product_id = p.id) AS sizes,
             COALESCE((SELECT json_agg(json_build_object('label', st.label, 'img', st.image) ORDER BY st.position)
                       FROM product_styles st WHERE st.product_id = p.id), '[]') AS styles
      FROM products p
      WHERE p.active
      ORDER BY p.name`),
    db.query(`
      SELECT c.slug, c.name,
             COALESCE(json_agg(p.slug ORDER BY cp.position) FILTER (WHERE p.id IS NOT NULL), '[]') AS products
      FROM collections c
      LEFT JOIN collection_products cp ON cp.collection_id = c.id
      LEFT JOIN products p ON p.id = cp.product_id AND p.active
      WHERE c.active
      GROUP BY c.id
      ORDER BY c.position`),
  ]);

  const bySlug = {};
  for (const p of products.rows) {
    bySlug[p.slug] = {
      id: p.slug, // es lo que guarda el carrito del navegador
      dbId: p.id,
      slug: p.slug,
      productType: p.product_type,
      name: p.name,
      price: p.price,
      oldPrice: p.old_price,
      discount: p.discount,
      currency: p.currency,
      description: p.description,
      description2: p.description2,
      images: p.images.length ? p.images : [p.main_image],
      sizes: p.sizes,
      styles: p.styles,
      stock: p.stock,
    };
  }

  return {
    products: bySlug,
    collections: collections.rows
      .map((c) => ({ id: c.slug, title: c.name, products: c.products }))
      .filter((c) => c.products.length),
    loadedAt: Date.now(),
  };
}

// Devuelve { products, collections }. Si Neon falla y hay una copia
// previa, se sigue mostrando la tienda con esa copia.
async function getCatalog() {
  if (cache && Date.now() - cache.loadedAt < TTL_MS) return cache;

  loading ??= load()
    .then((fresh) => (cache = fresh))
    .catch((err) => {
      if (!cache) throw err;
      console.error("CATÁLOGO: usando copia en caché,", err.message);
      return cache;
    })
    .finally(() => {
      loading = null;
    });

  return loading;
}

// Lectura sin caché (checkout: precio y stock siempre actuales).
async function getFreshProducts() {
  const fresh = await load();
  cache = fresh;
  return fresh.products;
}

// Slug actual de un producto cuya URL cambió (o null).
async function findRedirect(oldSlug) {
  const { rows } = await db.query(
    `SELECT p.slug FROM product_slug_redirects r
     JOIN products p ON p.id = r.product_id AND p.active
     WHERE r.old_slug = $1`,
    [oldSlug],
  );
  return rows[0]?.slug || null;
}

module.exports = { getCatalog, getFreshProducts, findRedirect };
