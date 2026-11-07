# Bencar — Productos Apple y más

Premium online store for **Bencar** (Instagram [@ben_car63](https://www.instagram.com/ben_car63/)), styled after the Apple Store.

- **Stack:** Vite · three.js (procedural 3D devices, no model files) · GSAP + ScrollTrigger · Lenis smooth scroll
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
| Phone, WhatsApp number, WhatsApp group link, Instagram | `src/config.js` |
| Colours, type, spacing | `:root` tokens in `src/styles/main.css` |

`price: null` shows **"Consultar"** (the catalogue's "DM").

## Motion inventory

- Hero: letter-by-letter BENCAR intro, a 3D wave field (the catalogue's wave motif), and a 3D phone that rises, spins to show its cameras and settles, scrubbed to scroll with feature callouts
- Pinned iPhone 18 lineup: the phone rotates and changes finish per model, with progress bars
- MacBook lid that opens as you scroll
- Text that lights up word by word, split-text reveals, parallax tiles, 3D tilt and glare on cards, magnetic buttons
- Page transition curtain, add-to-bag animation that flies the product into the bag, search (⌘K), a car that drives across on scroll
- Fully respects `prefers-reduced-motion`; shows SVG art when WebGL isn't available
