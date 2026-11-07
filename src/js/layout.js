// Global chrome: nav, mobile menu, search, bag drawer, footer.
import { CONFIG, waLink } from '../config.js';
import { categories, products, fmt, fromPrice, CATALOG_DATE } from '../data/catalog.js';
import { bag } from './cart.js';
import { art } from './art.js';

export const LOGO = `<svg class="logo" viewBox="0 0 100 100" aria-hidden="true">
  <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="4"/>
  <path d="M36 22 V64 A16 16 0 1 0 52 48 H44" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round"/>
  <path d="M60 58 A8 8 0 1 0 60 70" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
</svg>`;

const I = {
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12.2a1 1 0 0 1-1 .8H7a1 1 0 0 1-1-.8z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor"/></svg>',
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8.6 8.4c.2-.5.5-.5.8-.5h.5c.2 0 .4 0 .6.5l.7 1.6c.1.2 0 .4-.1.6l-.5.6c-.1.1-.2.3 0 .5.6 1 1.4 1.8 2.5 2.4.2.1.4.1.5 0l.7-.8c.2-.2.4-.2.6-.1l1.5.7c.3.1.4.3.4.5 0 .6-.3 1.4-1 1.7-.6.3-1.5.4-3-.3a9.6 9.6 0 0 1-4-3.6c-.8-1.3-.7-2.5-.2-3.2z" fill="currentColor"/></svg>',
};
export const ICONS = I;

const NAV = [
  ['Tienda', '/tienda.html'],
  ['iPhone', '/tienda.html#iphone'],
  ['Mac', '/tienda.html#mac'],
  ['iPad', '/tienda.html#ipad'],
  ['Watch', '/tienda.html#watch'],
  ['AirPods', '/tienda.html#airpods'],
  ['Accesorios', '/tienda.html#accesorios'],
  ['Dyson', '/tienda.html#dyson'],
  ['Servicios', '/servicios.html'],
];

export function mountLayout() {
  const header = document.createElement('header');
  header.className = 'gnav';
  header.innerHTML = `
    <nav class="gnav__inner" aria-label="Principal">
      <a class="gnav__brand" href="/" aria-label="${CONFIG.brand} inicio">${LOGO}<span>${CONFIG.brand}</span></a>
      <ul class="gnav__links">${NAV.map(([l, h]) => `<li><a href="${h}">${l}</a></li>`).join('')}</ul>
      <div class="gnav__actions">
        <button class="icon-btn" data-open-search aria-label="Buscar">${I.search}</button>
        <button class="icon-btn bag-btn" data-open-bag aria-label="Bolsa">${I.bag}<span class="bag-count" hidden>0</span></button>
        <button class="icon-btn burger" data-open-menu aria-label="Menú" aria-expanded="false"><span></span><span></span></button>
      </div>
    </nav>
    <div class="mmenu" hidden>
      <ul>${NAV.map(([l, h]) => `<li><a href="${h}">${l}</a></li>`).join('')}</ul>
      <a class="mmenu__wa" href="${waLink()}" target="_blank" rel="noopener">${I.wa} Escríbenos por WhatsApp</a>
    </div>`;
  document.body.prepend(header);

  const promo = document.createElement('div');
  promo.className = 'ribbon';
  promo.innerHTML = `<p>Compra tu iPhone 18 y obtén <strong>50% de descuento</strong> en tu funda original Apple + protector de regalo. <a href="/producto.html?id=iphone-18">Comprar ›</a></p>`;
  header.after(promo);

  // Bag drawer
  const drawer = document.createElement('aside');
  drawer.className = 'drawer';
  drawer.setAttribute('aria-label', 'Bolsa');
  drawer.innerHTML = `
    <div class="drawer__scrim" data-close-bag></div>
    <div class="drawer__panel" role="dialog" aria-modal="true" aria-labelledby="bag-title">
      <header><h2 id="bag-title">Tu bolsa</h2><button class="icon-btn" data-close-bag aria-label="Cerrar">${I.close}</button></header>
      <div class="drawer__items"></div>
      <footer>
        <div class="drawer__total"><span>Total</span><strong data-bag-total>$0</strong></div>
        <a class="btn btn--primary btn--block" data-checkout target="_blank" rel="noopener">${I.wa} Pedir por WhatsApp</a>
        <p class="fine">Confirmamos disponibilidad, entrega y forma de pago por WhatsApp. Recibimos tu dispositivo como parte de pago.</p>
      </footer>
    </div>`;
  document.body.append(drawer);

  // Search overlay
  const search = document.createElement('div');
  search.className = 'search';
  search.hidden = true;
  search.innerHTML = `
    <div class="search__panel" role="dialog" aria-modal="true" aria-label="Buscar">
      <div class="search__bar">${I.search}<input type="search" placeholder="Buscar en Bencar" aria-label="Buscar productos" autocomplete="off"/><button class="icon-btn" data-close-search aria-label="Cerrar">${I.close}</button></div>
      <div class="search__results"></div>
    </div>`;
  document.body.append(search);

  // Footer
  const footer = document.createElement('footer');
  footer.className = 'gfoot';
  footer.innerHTML = `
    <div class="wrap">
      <div class="gfoot__top">
        <a class="gfoot__brand" href="/">${LOGO}<span>${CONFIG.brand}</span></a>
        <p>${CONFIG.tagline}. Catálogo ${CATALOG_DATE}. Precios sujetos a cambio y disponibilidad.</p>
      </div>
      <div class="gfoot__cols">
        <div><h3>Comprar</h3><ul>${categories.map((c) => `<li><a href="/tienda.html#${c.id}">${c.name}</a></li>`).join('')}</ul></div>
        <div><h3>Servicios</h3><ul>
          <li><a href="/servicios.html#servicio-tecnico">Servicio Técnico</a></li>
          <li><a href="/servicios.html#compra-venta">Compra y Venta</a></li>
          <li><a href="/servicios.html#presupuesto">Plan a tu medida</a></li>
          <li><a href="/servicios.html#repuestos">Repuestos para vehículos</a></li>
          <li><a href="/servicios.html#vehiculos">Venta de vehículos</a></li>
          <li><a href="/servicios.html#dinamicas">Dinámicas Bencar</a></li></ul></div>
        <div><h3>Contacto</h3><ul>
          <li><a href="tel:${CONFIG.phoneTel}">${CONFIG.phoneDisplay}</a></li>
          <li><a href="${waLink()}" target="_blank" rel="noopener">WhatsApp</a></li>
          <li><a href="${CONFIG.instagram}" target="_blank" rel="noopener">Instagram ${CONFIG.instagramHandle}</a></li>
          <li>${CONFIG.country}</li></ul></div>
      </div>
      <div class="gfoot__legal">
        <p>© ${new Date().getFullYear()} ${CONFIG.brand}. Todos los derechos reservados.</p>
        <p>Apple, iPhone, iPad, Mac, Apple Watch y AirPods son marcas de Apple Inc. Bencar es un revendedor independiente. Dyson y Anker son marcas de sus respectivos dueños.</p>
      </div>
    </div>`;
  document.body.append(footer);

  // Floating WhatsApp
  const fab = document.createElement('a');
  fab.className = 'fab';
  fab.href = waLink('¡Hola Bencar! Tengo una consulta.');
  fab.target = '_blank'; fab.rel = 'noopener';
  fab.setAttribute('aria-label', 'Escríbenos por WhatsApp');
  fab.innerHTML = I.wa;
  document.body.append(fab);

  wireNav(header);
  wireBag(drawer);
  wireSearch(search);
}

function wireNav(header) {
  let last = 0;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 8);
    header.classList.toggle('is-hidden', y > 400 && y > last && !document.body.classList.contains('menu-open'));
    last = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const burger = header.querySelector('[data-open-menu]');
  const menu = header.querySelector('.mmenu');
  burger.addEventListener('click', () => {
    const open = !document.body.classList.contains('menu-open');
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.toggle('is-open', open));
    if (!open) setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 500);
  });
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => burger.click()));

  const path = location.pathname.replace(/index\.html$/, '');
  header.querySelectorAll('.gnav__links a').forEach((a) => {
    if (a.getAttribute('href') === path) a.setAttribute('aria-current', 'page');
  });
}

function wireBag(drawer) {
  const list = drawer.querySelector('.drawer__items');
  const count = document.querySelector('.bag-count');
  const total = drawer.querySelector('[data-bag-total]');
  const checkout = drawer.querySelector('[data-checkout]');

  bag.subscribe((items) => {
    count.textContent = bag.count;
    count.hidden = !bag.count;
    total.textContent = bag.totalLabel();
    checkout.href = bag.checkoutLink();
    checkout.toggleAttribute('aria-disabled', !items.length);
    list.innerHTML = items.length ? items.map((i) => `
      <article class="line">
        <div class="line__art">${art(i.art, i.tint)}</div>
        <div class="line__info">
          <h3>${i.name}</h3>
          <p>${[i.model, i.option, i.color].filter(Boolean).join(' · ')}</p>
          <div class="qty">
            <button data-q="${i.key}" data-d="-1" aria-label="Quitar uno">−</button><span>${i.qty}</span><button data-q="${i.key}" data-d="1" aria-label="Agregar uno">+</button>
          </div>
        </div>
        <strong class="line__price">${i.price == null ? 'Consultar' : fmt(i.price * i.qty, i.currency)}</strong>
      </article>`).join('') : `<div class="empty"><p>Tu bolsa está vacía.</p><a class="link" href="/tienda.html">Explorar la tienda ›</a></div>`;
  });

  list.addEventListener('click', (e) => {
    const b = e.target.closest('[data-q]');
    if (!b) return;
    const it = bag.items.find((i) => i.key === b.dataset.q);
    if (it) bag.setQty(it.key, it.qty + Number(b.dataset.d));
  });
  checkout.addEventListener('click', (e) => { if (!bag.items.length) e.preventDefault(); });

  const open = () => { drawer.classList.add('is-open'); document.documentElement.classList.add('lock'); drawer.querySelector('.drawer__panel header button').focus(); };
  const close = () => { drawer.classList.remove('is-open'); document.documentElement.classList.remove('lock'); };
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-open-bag]')) open();
    if (e.target.closest('[data-close-bag]')) close();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  window.addEventListener('bencar:open-bag', open);
}

function wireSearch(el) {
  const input = el.querySelector('input');
  const results = el.querySelector('.search__results');
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const quick = ['iPhone 18', 'MacBook Air', 'AirPods Pro 3', 'Apple Watch', 'Funda', 'Dyson'];
  const render = () => {
    const q = norm(input.value.trim());
    if (!q) {
      results.innerHTML = `<p class="search__label">Búsquedas rápidas</p><ul class="search__quick">${quick.map((x) => `<li><button type="button" data-q="${x}">→ ${x}</button></li>`).join('')}</ul>`;
      return;
    }
    const hits = products.filter((p) => norm(`${p.name} ${p.tagline} ${p.cat}`).includes(q)).slice(0, 8);
    results.innerHTML = hits.length
      ? `<p class="search__label">Productos</p><ul class="search__hits">${hits.map((p) => `<li><a href="/producto.html?id=${p.id}"><span class="search__art">${art(p.art, p.tint)}</span><span><strong>${p.name}</strong><em>${fromPrice(p) ? `Desde ${fmt(fromPrice(p), p.currency)}` : 'Consultar precio'}</em></span></a></li>`).join('')}</ul>`
      : `<p class="search__label">Sin resultados para “${input.value}”.</p>`;
  };
  input.addEventListener('input', render);
  results.addEventListener('click', (e) => { const b = e.target.closest('[data-q]'); if (b) { input.value = b.dataset.q; render(); input.focus(); } });
  const open = () => { el.hidden = false; requestAnimationFrame(() => el.classList.add('is-open')); render(); setTimeout(() => input.focus(), 50); document.documentElement.classList.add('lock'); };
  const close = () => { el.classList.remove('is-open'); document.documentElement.classList.remove('lock'); setTimeout(() => { el.hidden = true; }, 350); };
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-open-search]')) open();
    if (e.target.closest('[data-close-search]') || e.target === el) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !el.hidden) close();
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); }
  });
}
