// Servidor local para desarrollo (en Vercel se usa api/index.js).
require("dotenv").config();

const app = require("./app");
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Servidor en http://localhost:${port}`);
});
