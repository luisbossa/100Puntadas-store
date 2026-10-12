const { Pool } = require("pg");

/* ============================================================
   CONEXIÓN A POSTGRESQL
   - Producción: Neon (requiere SSL).
   - Desarrollo: PostgreSQL local (sin SSL).
   Se decide por la URL; DATABASE_SSL=true/false lo fuerza.
============================================================ */
const connectionString = process.env.DATABASE_URL;

const isLocal = /@(localhost|127\.0\.0\.1)(:\d+)?\//.test(connectionString || "");
const useSSL = process.env.DATABASE_SSL
  ? process.env.DATABASE_SSL === "true"
  : !isLocal;

const pool = new Pool({
  connectionString,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
  // En Vercel cada función abre su propio pool: pocas conexiones y que se liberen rápido.
  max: process.env.VERCEL ? 3 : 10,
  idleTimeoutMillis: 10_000,
});

pool.on("error", (err) => {
  console.error("POSTGRES POOL ERROR:", err.message);
});

module.exports = pool;
