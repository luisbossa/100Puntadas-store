const crypto = require("crypto");

/* ============================================================
   TOKEN PÚBLICO DE ORDEN
   Evita exponer el id secuencial en URLs (/payment-sinpe?order=…).
   Formato: "<id>.<firma>" — la firma es un HMAC del id, así que
   nadie puede adivinar el token de otra orden.
============================================================ */

function getSecret() {
  const secret =
    process.env.ORDER_TOKEN_SECRET || process.env.ONVOPAY_SECRET_KEY;

  if (!secret) {
    throw new Error("Falta ORDER_TOKEN_SECRET en las variables de entorno");
  }

  return secret;
}

function sign(id) {
  return crypto
    .createHmac("sha256", getSecret())
    .update(String(id))
    .digest("base64url")
    .slice(0, 24);
}

exports.create = (orderId) => `${orderId}.${sign(orderId)}`;

// Devuelve el id de la orden si el token es válido, o null.
exports.verify = (token) => {
  if (typeof token !== "string") return null;

  const [id, signature] = token.split(".");
  if (!/^\d+$/.test(id || "") || !signature) return null;

  const expected = Buffer.from(sign(id));
  const received = Buffer.from(signature);

  if (
    expected.length !== received.length ||
    !crypto.timingSafeEqual(expected, received)
  ) {
    return null;
  }

  return Number(id);
};

// Compara un secreto recibido en un header sin filtrar tiempos.
exports.safeEqual = (a, b) => {
  if (typeof a !== "string" || typeof b !== "string") return false;

  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};
