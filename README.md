# Bencar — Productos Apple y más

Premium online store for **Bencar** (Instagram [@ben_car63](https://www.instagram.com/ben_car63/)), styled after the Apple Store.

- **Stack:** Vite · three.js (3D logo) · GSAP + ScrollTrigger · Lenis smooth scroll
- **Product imagery:** official Apple Store photos (several angles per product) in `public/products/apple/`; the hero's iPhone 18 Pro is an image sequence from Apple's own animation in `public/seq/iphone18/`. Anker items keep the photos from the Bencar catalogue.
- **Kleber, the AI receptionist:** chat widget on every page (`src/js/kleber/`). Answers come from DeepSeek (via NVIDIA's API) through `api/kleber.js` (a Vercel function) when `NVIDIA_API_KEY` is set in the Vercel project; without it Kleber answers from the catalogue on his own and hands off to WhatsApp.
- **Pages:** `index.html` (home), `tienda.html` (store), `producto.html?id=…` (configurator), `servicios.html` (services)
- **Checkout:** the bag sends a pre-filled order to WhatsApp, with totals in USD and Bs.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/ (deploy to Vercel/Netlify/any host)
```

## Editing content

| What | Where |
| --- | --- |
| Products, prices, models, colours, services | `src/data/catalog.js` (taken from the Canva catalogue, Octubre 2026) |
| Product photos (per product, per colour) | `src/data/images.js` |
| Kleber's personality and rules | `SYSTEM` in `api/kleber.js` |
| Phone, WhatsApp number, WhatsApp group link, Instagram | `src/config.js` |
| Colours, type, spacing | `:root` tokens in `src/styles/main.css` |

`price: null` shows **"Consultar"** (the catalogue's "DM").

## Motion inventory

- Hero: opens straight into the 3D logo animation (no loading screen), then Apple's iPhone 18 Pro footage scrubbed to scroll with feature callouts
- Pinned iPhone 18 lineup: real Apple photos turn through their angles and change finish per model
- Product pages: rotating gallery (auto-turns through Apple's angles, drag to spin, swaps photos per colour)
- MacBook Air photo that tilts open as you scroll
- Text that lights up word by word, split-text reveals, parallax tiles, 3D tilt and glare on cards, magnetic buttons
- Page transition curtain, add-to-bag animation that flies the product into the bag, search (⌘K), a car that drives across on scroll
- Fully respects `prefers-reduced-motion`; shows SVG art when WebGL isn't available

## Tests

```bash
npm run dev                 # in one terminal
node tests/e2e.cjs          # every link on every page + search, bag, filters, gallery, Kleber, mobile menu
node tests/hit.cjs          # every visible button really receives its own click
```
