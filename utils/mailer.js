const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Comprobación de credenciales: solo se usa al arrancar en desarrollo (server.js),
// no en cada arranque de la función en Vercel.
transporter.checkConnection = () =>
  transporter
    .verify()
    .then(() => console.log("SMTP listo para enviar correos"))
    .catch((error) => console.error("SMTP ERROR:", error.message));

module.exports = transporter;
