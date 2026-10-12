// Miniatura liviana (160px) de una foto de producto, generada por `npm run images`
window.thumbnail = (src) =>
  /^\/images\/(?!opt\/).+\.\w+$/.test(src || "")
    ? "/images/opt" + src.slice("/images".length).replace(/\.\w+$/, "") + "-160.webp"
    : src;
