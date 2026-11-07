import { fmt, fromPrice } from '../data/catalog.js';
import { art } from './art.js';

const chev = (d) => `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="${d === 'l' ? 'M10 3 5 8l5 5' : 'M6 3l5 5-5 5'}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export function productCard(p) {
  const from = fromPrice(p);
  const soldOut = p.models.every((m) => m.soldOut);
  return `
  <article class="pcard${soldOut ? ' pcard--sold' : ''}" data-tilt>
    <a class="pcard__link" href="/producto.html?id=${p.id}" aria-label="${p.name}"></a>
    <span class="pcard__badge">${p.badge || ''}</span>
    <h3>${p.name}</h3>
    <p>${p.tagline}</p>
    <div class="pcard__art">${art(p.art, p.tint)}</div>
    ${p.colors ? `<div class="pcard__swatches">${p.colors.map((c) => `<i style="background:${c.hex}" title="${c.name}"></i>`).join('')}</div>` : ''}
    <div class="pcard__foot">
      <span class="pcard__price">${from != null ? `Desde <strong>${fmt(from, p.currency)}</strong>` : '<strong>Consultar precio</strong>'}</span>
      <a class="btn" href="/producto.html?id=${p.id}">${from != null ? 'Comprar' : 'Consultar'}</a>
    </div>
  </article>`;
}

/** A horizontally scrolling shelf with prev/next controls. */
export function shelf(items, label) {
  return `
  <div class="shelf-wrap">
    <div class="shelf" role="list" aria-label="${label}">${items.map((p) => `<div role="listitem">${productCard(p)}</div>`).join('')}</div>
    <div class="shelf-nav"><button type="button" data-dir="-1" aria-label="Anterior">${chev('l')}</button><button type="button" data-dir="1" aria-label="Siguiente">${chev('r')}</button></div>
  </div>`;
}

export function wireShelves(root = document) {
  root.querySelectorAll('.shelf-wrap').forEach((w) => {
    const s = w.querySelector('.shelf');
    const [prev, next] = w.querySelectorAll('.shelf-nav button');
    const update = () => {
      prev.disabled = s.scrollLeft < 8;
      next.disabled = s.scrollLeft + s.clientWidth > s.scrollWidth - 8;
      w.querySelector('.shelf-nav').hidden = s.scrollWidth <= s.clientWidth + 4;
    };
    w.querySelectorAll('.shelf-nav button').forEach((b) => b.addEventListener('click', () => {
      s.scrollBy({ left: Number(b.dataset.dir) * s.clientWidth * 0.8, behavior: 'smooth' });
    }));
    s.addEventListener('scroll', update, { passive: true });
    new ResizeObserver(update).observe(s);
    update();
  });
}
