const pool = require("../db/pool");

exports.createOrder = async ({ customer, cart, totalAmount }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /* ===============================
       1. INSERT ORDER
    =============================== */
    const orderResult = await client.query(
      `
      INSERT INTO orders (
        customer_name,
        email,
        phone,
        address,
        total_amount,
        status
      )
      VALUES ($1, $2, $3, $4, $5, 'pending')
      RETURNING *
      `,
      [
        customer.name,
        customer.email,
        customer.phone || null,
        customer.address || null,
        totalAmount,
      ]
    );

    const order = orderResult.rows[0];

    /* ===============================
       2. INSERT ITEMS + DISCOUNT STOCK
    =============================== */
    for (const item of cart) {
      // 🔒 Bloquea la variante
      const variantRes = await client.query(
        `
        SELECT stock
        FROM product_variants
        WHERE id = $1
        FOR UPDATE
        `,
        [item.variantId]
      );

      if (variantRes.rowCount === 0) {
        throw new Error("Variante no encontrada");
      }

      if (variantRes.rows[0].stock < item.quantity) {
        throw new Error("Stock insuficiente");
      }

      // Insert order item
      await client.query(
        `
        INSERT INTO order_items (
          order_id,
          product_variant_id,
          quantity,
          unit_price
        )
        VALUES ($1, $2, $3, $4)
        `,
        [order.id, item.variantId, item.quantity, item.price]
      );

      // Descontar stock
      await client.query(
        `
        UPDATE product_variants
        SET stock = stock - $1
        WHERE id = $2
        `,
        [item.quantity, item.variantId]
      );
    }

    await client.query("COMMIT");
    return order;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};


