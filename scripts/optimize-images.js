/* ============================================================
   OPTIMIZAR IMÁGENES — npm run images

   Genera versiones WebP livianas de las fotos en varios anchos:
     public/images/products/product-1.1.jpg
       → public/images/opt/products/product-1.1-160.webp
       → public/images/opt/products/product-1.1-400.webp  …
   y un manifiesto (data/image-manifest.json) que usan las vistas para
   armar srcset/sizes: el navegador descarga solo el tamaño que necesita.

   Correr después de agregar o cambiar fotos. Solo procesa lo nuevo.
============================================================ */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const IMAGES = path.join(ROOT, "public", "images");
const OUT = path.join(IMAGES, "opt");
const MANIFEST = path.join(ROOT, "data", "image-manifest.json");

const WIDTHS = [160, 400, 800, 1200];
const QUALITY = 78;

// No se optimizan: logos de pago (SVG), imágenes de correo (se adjuntan) y la salida misma.
const SKIP = [/^opt\//, /^mail-/, /\.svg$/i, /\.ico$/i, /\.gif$/i];

function listImages(dir, base = "") {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const rel = path.posix.join(base, entry.name);
    if (entry.isDirectory()) return listImages(path.join(dir, entry.name), rel);
    if (!/\.(jpe?g|png|webp)$/i.test(entry.name) || SKIP.some((re) => re.test(rel))) return [];
    return [rel];
  });
}

async function main() {
  const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")) : {};
  const files = listImages(IMAGES);
  let created = 0;
  let before = 0;
  let after = 0;

  for (const rel of files) {
    const src = path.join(IMAGES, rel);
    const key = "/images/" + rel;
    const stat = fs.statSync(src);
    const prev = manifest[key];

    // Sin cambios desde la última vez: se salta
    if (prev && prev.mtime === stat.mtimeMs && prev.size === stat.size) continue;

    const meta = await sharp(src).metadata();
    const name = rel.replace(/\.\w+$/, "");
    fs.mkdirSync(path.join(OUT, path.dirname(rel)), { recursive: true });

    // Solo anchos menores o iguales al original (una foto chica genera un solo archivo)
    const widths = WIDTHS.filter((w) => w <= meta.width);
    if (!widths.length) widths.push(WIDTHS[0]);

    for (const width of widths) {
      const dest = path.join(OUT, `${name}-${width}.webp`);
      // Si la foto original es más angosta, se guarda en su tamaño (sin agrandar)
      await sharp(src)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: QUALITY, effort: 5 })
        .toFile(dest);
      created++;
    }

    const largest = path.join(OUT, `${name}-${widths[widths.length - 1]}.webp`);
    before += stat.size;
    after += fs.statSync(largest).size;

    manifest[key] = {
      width: meta.width,
      height: meta.height,
      widths,
      mtime: stat.mtimeMs,
      size: stat.size,
    };
  }

  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`Imágenes revisadas: ${files.length} · archivos generados: ${created}`);
  if (before) {
    console.log(
      `Peso de las procesadas: ${(before / 1048576).toFixed(1)} MB → ${(after / 1048576).toFixed(1)} MB (versión más grande de cada una)`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
