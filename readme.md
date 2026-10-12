# 100puntadas Ecommerce

Ecommerce desarrollado para **100puntadas**, una tienda online especializada en beachwear, bikinis, crochet, sets y piezas artesanales. El proyecto fue construido con una arquitectura full-stack basada en **Node.js + Express**, vistas renderizadas en servidor, base de datos relacional con **PostgreSQL**, integración de **pasarela de pago**, y automatización de correos transaccionales mediante **Gmail SMTP**.

## Descripción

Este proyecto permite a los usuarios explorar el catálogo de productos, seleccionar variantes como talla, estilo y color, agregar artículos al carrito, aplicar promociones automáticas y completar el proceso de compra mediante checkout con pago en línea.

Además, incluye persistencia de carrito, cálculo de envío, descuentos por promociones, almacenamiento de órdenes y notificaciones por correo.

## Tecnologías utilizadas

### Backend

- Node.js
- Express.js
- PostgreSQL
- Gmail SMTP (Nodemailer)
- Pasarela de pago

### Frontend

- HTML5
- CSS3
- JavaScript
- EJS para renderizado dinámico

### Base de datos

- PostgreSQL
- Modelado relacional para:
  - productos
  - variantes
  - órdenes
  - usuarios
  - carrito
  - descuentos

## Funcionalidades principales

- Catálogo dinámico por categorías
  - bikinis
  - one pieces
  - crochet
  - sets

- Vista individual de producto
- Selector de tallas
- Selector de estilos
- Selector de colores
- Carrito persistente con localStorage
- Compra directa con “Buy Now”
- Checkout con resumen de compra
- Cálculo automático de:
  - subtotal
  - envío
  - descuentos
  - total final

- Sistema de promociones
- Exclusión de productos en descuento especial
- Integración con pasarela de pago
- Envío de correos de confirmación
- Diseño responsive
- Optimización de imágenes WebP/JPEG

## Instalación

Clona el repositorio:

```bash
git clone https://github.com/luisbossa/100Puntadas-store
cd 100puntadas
```

## Ejecución en desarrollo

```bash
npm install
npm run dev   # http://localhost:3000 (se reinicia solo al guardar)
```

### Variables de entorno (`.env`)

| Variable | Uso |
| --- | --- |
| `DATABASE_URL` | Conexión a PostgreSQL (Neon en producción, local en desarrollo). SSL se activa solo si no es `localhost`; `DATABASE_SSL=true/false` lo fuerza |
| `MAIL_USER`, `MAIL_PASS` | Cuenta de Gmail para los correos |
| `ONVOPAY_PUBLIC_KEY`, `ONVOPAY_SECRET_KEY` | Claves de ONVO Pay |
| `ONVOPAY_WEBHOOK_SECRET` | Secreto del webhook de ONVO (empieza con `webhook_secret_`) |
| `SINPE_WEBHOOK_SECRET` | Secreto que debe enviar quien llame a `/webhooks/sinpe-paid` (header `X-Webhook-Secret`) |
| `ORDER_TOKEN_SECRET` | Firma los enlaces de pago de cada orden |

## Estructura del proyecto

```
views/
  layout.ejs        Estructura común (head, header, footer, carrito).
  partials/         header, footer y tarjeta de producto reutilizables.
public/css/
  tokens.css        Colores, tipografías y medidas de la marca (variables CSS).
  reset.css         Normalización del navegador.
  base.css          Tipografía base, contenedores y utilidades de accesibilidad.
  header.css · footer.css · cart.css    Componentes presentes en todas las páginas.
  home.css · product.css · sizes.css · policy.css    Una hoja por página.
public/js/
  pricing.js        Reglas de descuento y envío (las usa el navegador y el servidor).
utils/catalog.js    Lee productos y colecciones de la base de datos (caché de 30 s).
utils/shop.js       Arma los datos de la home, la página de producto y los relacionados.
```

Cada vista declara sus propios `<link>` y `<script>`; el layout los coloca en el `<head>` y al final del `<body>`.
Las páginas de compra (checkout, pago SINPE/tarjeta, confirmación) usan `views/checkout-layout.ejs`.

Otros archivos de datos: `data/colors.js` (colores de sets/enterizos), `data/testimonials.js` (carrusel de la home).

## Imágenes y rendimiento

```bash
npm run images
```

Genera versiones WebP livianas (160, 400, 800 y 1200 px) en `public/images/opt/` y el manifiesto `data/image-manifest.json`.
Las vistas usan el helper `img()` (`utils/images.js`) para que cada dispositivo descargue solo el tamaño que necesita.
**Correrlo cada vez que se agreguen o cambien fotos** (solo procesa las nuevas) y subir la carpeta `opt/` con el resto.

- CSS y JS se sirven con `?v=<versión>` y caché de 1 año; cada deploy cambia la versión.
- Imágenes y fuentes: caché de 30 días. Las fuentes están en `woff2` (`public/css/fonts.css`).

## Productos

Los productos, sus fotos, tallas, coberturas y colecciones viven en la base de datos y se administran
desde el **panel BBoard** (agregar, editar, ocultar, eliminar). La tienda los lee con `utils/catalog.js`:
los cambios se ven en menos de 30 segundos. El checkout siempre consulta precio y stock actuales.

- Agotado: stock 0 en el panel. "Bajo pedido" (sin límite): sin control de unidades.
- Oferta: precio anterior en el panel (el % del badge se calcula solo).
- El inventario se descuenta automáticamente cuando un pedido pasa a pagado (trigger en la base de datos)
  y se devuelve si un pedido pagado se cancela.
- Las fotos subidas desde el panel van a Vercel Blob; no requieren `npm run images`.

## Ejecución en producción

```bash
npm start
```

## Flujo de compra

1. Usuario entra al catálogo.
2. Selecciona producto.
3. Escoge talla, bottom y color.
4. Agrega al carrito o compra directa.
5. Checkout calcula promociones.
6. Usuario completa pago.
7. Orden se guarda en PostgreSQL.
8. Se envía correo de confirmación con Gmail.

## Integración de correo

Se utiliza **Nodemailer con Gmail SMTP** para:

- confirmación de compra
- resumen de pedido
- notificaciones internas
- seguimiento de orden

## Pasarela de pago

El checkout está preparado para integrarse con una pasarela de pago externa.

Incluye:

- validación de monto
- resumen de compra
- persistencia de orden
- redirección post-pago
- confirmación por correo

## Responsive Design

El sitio fue diseñado mobile-first con adaptación para:

- smartphones
- tablets
- laptops
- desktop

## Autor

Desarrollado por Bstudio.

Proyecto ecommerce personalizado para la marca **100puntadas**.

## Licencia

Este proyecto fue desarrollado para uso comercial privado de la marca 100puntadas.
