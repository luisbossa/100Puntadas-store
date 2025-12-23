// const pool = require("../db/pool");

exports.insertOrderItems = async ({ cart }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const item of cart) {
      await client.query(
        `INSERT INTO order_items
         (product_name, top_size, bottom_size, bottom_style, size, color, quantity, unit_price)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          item.product_name,
          item.topSize || null,
          item.bottomSize || null,
          item.bottomStyle || null,
          item.size || null,
          item.color || null,
          item.quantity,
          item.unit_price,
        ]
      );
    }

    await client.query("COMMIT");
    return { ok: true };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("INSERT ORDER ITEMS ERROR:", error);
    return { ok: false, message: error.message };
  } finally {
    client.release();
  }
};
