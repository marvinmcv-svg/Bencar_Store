import { boot, ready, gsap, reduced, toast, flyToBag } from '../core.js';
import { waLink } from '../../config.js';
import { byId, products, fmt, fromPrice } from '../../data/catalog.js';
import { art } from '../art.js';
import { shelf, wireShelves } from '../cards.js';
import { bag } from '../cart.js';
import { ICONS } from '../layout.js';

boot();

const params = new URLSearchParams(location.search);
const p = byId(params.get('id')) || byId('iphone-18');
document.title = `Comprar ${p.name} · Bencar`;

const OPT_LABEL = { iphone: 'la capacidad', ipad: 'la capacidad', mac: 'la capacidad', watch: 'el tamaño', fundas: 'tu modelo', protectores: 'el tipo' };
const firstAvailable = () => Math.max(0, p.models.findIndex((m) => !m.soldOut));
const sel = {
  model: Math.min(p.models.length - 1, Math.max(0, Number(params.get('model')) || firstAvailable())),
  option: 0,
  color: p.colors ? 0 : -1,
};
if (p.models[sel.model].soldOut) sel.model = firstAvailable();

// ── Header ────────────────────────────────────────────────────────────────
const from = fromPrice(p);
document.getElementById('pdp-head').innerHTML = `
  ${p.badge ? `<p class="eyebrow">${p.badge}</p>` : ''}
  <h1 class="display" data-split>Comprar ${p.name}</h1>
  <p data-reveal>${from != null ? `Desde ${fmt(from, p.currency)}` : 'Precio a consultar'} · ${p.tagline}</p>`;

// ── Form ──────────────────────────────────────────────────────────────────
const form = document.getElementById('pdp-form');
const info = (icon, text, cls = '') => `<div class="note ${cls}">${icon}<p>${text}</p></div>`;
const giftIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
const infoIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 11v6M12 7.5v.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

function render() {
  const model = p.models[sel.model];
  const opts = model.options;
  if (sel.option >= opts.length) sel.option = 0;
  const opt = opts[sel.option];
  const showModels = p.models.length > 1;
  const showOpts = opts.length > 1 || (opts[0] && !['Estándar', 'Consultar'].includes(opts[0].label));

  form.innerHTML = `
    ${p.promo ? info(giftIcon, p.promo, 'note--promo') : ''}
    ${showModels ? `
    <fieldset class="opt" style="border:0;padding:0;margin:0">
      <h2>Modelo. <span>¿Cuál es el mejor para ti?</span></h2>
      <div class="opt__choices" role="radiogroup" aria-label="Modelo">
        ${p.models.map((m, i) => {
          const mf = m.options.map((o) => o.price).filter((x) => x != null);
          return `<button type="button" class="choice" role="radio" data-model="${i}" aria-checked="${i === sel.model}" ${m.soldOut ? 'disabled' : ''}>
            <strong>${p.cat === 'iphone' ? 'iPhone ' : ''}${m.name}</strong>
            ${m.soldOut ? '<span class="sold">Agotado</span>' : `<small>${mf.length ? `Desde ${fmt(Math.min(...mf), p.currency)}` : 'Consultar'}</small>`}
          </button>`;
        }).join('')}
      </div>
    </fieldset>` : ''}
    ${p.colors ? `
    <div class="opt">
      <h2>Color. <span>${p.colors[sel.color].name}</span></h2>
      <div class="colors" role="radiogroup" aria-label="Color">
        ${p.colors.map((c, i) => `<button type="button" class="color" role="radio" aria-label="${c.name}" aria-checked="${i === sel.color}" data-color="${i}" style="background:${c.hex}"></button>`).join('')}
      </div>
    </div>` : ''}
    ${showOpts ? `
    <div class="opt">
      <h2>Elige ${OPT_LABEL[p.cat] || 'una opción'}.${showModels ? ` <span>${model.name}</span>` : ''}</h2>
      <div class="opt__choices ${opts.length > 3 ? 'opt__choices--2' : ''}" role="radiogroup" aria-label="Opción">
        ${opts.map((o, i) => `<button type="button" class="choice" role="radio" data-opt="${i}" aria-checked="${i === sel.option}">
          <strong>${o.label}</strong><small>${fmt(o.price, p.currency)}</small></button>`).join('')}
      </div>
    </div>` : ''}
    ${p.compat ? `<div class="opt"><h2>Compatibilidad.</h2><div class="compat">${p.compat.map((c) => `<span>${c}</span>`).join('')}</div></div>` : ''}
    ${p.note ? info(infoIcon, p.note) : ''}
    ${info(infoIcon, 'Recibimos tu dispositivo usado como parte de pago. Consulta por seminuevos y por nuestro servicio técnico puerta a puerta.')}
    <div class="summary">
      <div class="summary__price" aria-live="polite">${fmt(opt?.price ?? null, p.currency)}
        <small>${[p.name, showModels ? model.name : '', showOpts ? opt?.label : '', p.colors ? p.colors[sel.color].name : ''].filter(Boolean).join(' · ')}</small></div>
      <div class="summary__ctas">
        <button type="button" class="btn" data-add>${opt?.price == null ? 'Agregar y consultar' : 'Agregar a la bolsa'}</button>
        <a class="btn btn--ghost" data-ask target="_blank" rel="noopener" aria-label="Consultar por WhatsApp">${ICONS.wa}</a>
      </div>
    </div>`;

  const spec = [showModels ? model.name : '', showOpts ? opt?.label : '', p.colors ? p.colors[sel.color].name : ''].filter(Boolean).join(' · ');
  form.querySelector('[data-ask]').href = waLink(`¡Hola Bencar! Quiero consultar por: ${p.name}${spec ? ` (${spec})` : ''}.`);
}

form.addEventListener('click', (e) => {
  const t = e.target.closest('button');
  if (!t || t.disabled) return;
  if (t.dataset.model != null) { sel.model = Number(t.dataset.model); sel.option = 0; render(); pulse(); }
  else if (t.dataset.opt != null) { sel.option = Number(t.dataset.opt); render(); }
  else if (t.dataset.color != null) { sel.color = Number(t.dataset.color); render(); viewer.setTint?.(p.colors[sel.color].hex); }
  else if (t.hasAttribute('data-add')) addToBag(t);
});

function addToBag(btn) {
  const model = p.models[sel.model];
  const opt = model.options[sel.option];
  bag.add({
    id: p.id, name: p.name, art: p.art, tint: p.colors ? p.colors[sel.color].hex : p.tint, img: p.images[0] || '',
    model: p.models.length > 1 ? model.name : '', option: opt && !['Estándar'].includes(opt.label) ? opt.label : '',
    color: p.colors ? p.colors[sel.color].name : '', price: opt?.price ?? null, currency: p.currency,
  });
  flyToBag(document.getElementById('stage'), p.art, p.colors ? p.colors[sel.color].hex : p.tint, p.images[0]);
  setTimeout(() => toast(`Agregado a tu bolsa. <button type="button" data-open-bag>Ver bolsa</button>`), 700);
  if (!reduced) gsap.fromTo(btn, { scale: 0.94 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1,.4)' });
}

// ── Gallery (real photos from the Bencar catalogue) ───────────────────────
const viewer = {};
function pulse() { viewer.spin?.(); }

function mountViewer() {
  const stageEl = document.getElementById('stage');
  const thumbs = document.getElementById('thumbs');
  const imgs = p.images.length ? p.images : [null];
  let current = 0;
  const node = (src) => (src
    ? `<img src="${src}" alt="${p.name}" decoding="async"/>`
    : art(p.art, p.colors ? p.colors[sel.color].hex : p.tint));
  stageEl.innerHTML = node(imgs[0]);
  thumbs.innerHTML = imgs.length > 1 ? imgs.map((src, i) => `<button type="button" role="tab" aria-label="Foto ${i + 1}" aria-current="${i === 0}" data-i="${i}"><img src="${src}" alt=""/></button>`).join('') : '';

  const show = (i) => {
    if (i === current) return;
    const dir = i > current ? 1 : -1;
    current = i;
    const old = stageEl.firstElementChild;
    stageEl.insertAdjacentHTML('beforeend', node(imgs[i]));
    const next = stageEl.lastElementChild;
    thumbs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-current', String(Number(b.dataset.i) === i)));
    if (reduced) { old.remove(); return; }
    gsap.fromTo(next, { xPercent: 30 * dir, opacity: 0, scale: 0.92, rotationY: -25 * dir, transformPerspective: 1000 }, { xPercent: 0, opacity: 1, scale: 1, rotationY: 0, duration: 0.9, ease: 'expo.out' });
    gsap.to(old, { xPercent: -30 * dir, opacity: 0, scale: 0.92, duration: 0.6, ease: 'expo.out', onComplete: () => old.remove() });
  };
  thumbs.addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b) show(Number(b.dataset.i)); });
  // swipe
  let sx = null;
  stageEl.addEventListener('pointerdown', (e) => { sx = e.clientX; });
  stageEl.addEventListener('pointerup', (e) => {
    if (sx == null) return; const dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 40 && imgs.length > 1) show((current + (dx < 0 ? 1 : imgs.length - 1)) % imgs.length);
  });

  if (!reduced) {
    gsap.from(stageEl.firstElementChild, { y: 80, opacity: 0, scale: 0.9, duration: 1.4, ease: 'expo.out', delay: 0.3 });
    // 3D tilt following the pointer
    stageEl.addEventListener('pointermove', (e) => {
      const r = stageEl.getBoundingClientRect();
      gsap.to(stageEl.lastElementChild, { rotationY: ((e.clientX - r.left) / r.width - 0.5) * 18, rotationX: (0.5 - (e.clientY - r.top) / r.height) * 12, transformPerspective: 1000, duration: 0.8, ease: 'power3' });
    });
    stageEl.addEventListener('pointerleave', () => gsap.to(stageEl.lastElementChild, { rotationX: 0, rotationY: 0, duration: 1, ease: 'expo.out' }));
  }
  viewer.setTint = (hex) => { if (!p.images.length) stageEl.lastElementChild.outerHTML = art(p.art, hex); };
  viewer.spin = () => {
    // jump to the model's photo when there is one per model (e.g. iPhone 18 DUO)
    if (p.id === 'iphone-18' && imgs.length > 1) show(sel.model === 2 ? 1 : 0);
    else if (!reduced) gsap.fromTo(stageEl.lastElementChild, { scale: 0.94 }, { scale: 1, duration: 0.9, ease: 'elastic.out(1,.5)' });
  };
}

// ── Related ───────────────────────────────────────────────────────────────
const related = [...products.filter((x) => x.cat === p.cat && x.id !== p.id), ...products.filter((x) => x.featured && x.cat !== p.cat)].slice(0, 8);
document.getElementById('related').innerHTML = shelf(related, 'Relacionados');
wireShelves();

render();
mountViewer();
ready();
if (!reduced) gsap.from('#pdp-form > *', { y: 40, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.07, delay: 0.3 });
