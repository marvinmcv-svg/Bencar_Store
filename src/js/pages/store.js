import { boot, ready, gsap, ScrollTrigger, lenis, reduced, tilt } from '../core.js';
import { waLink } from '../../config.js';
import { categories, byCat } from '../../data/catalog.js';
import { art } from '../art.js';
import { shelf, wireShelves } from '../cards.js';
import { LOGO } from '../layout.js';

boot();

document.getElementById('mini-logo').innerHTML = LOGO;
document.querySelector('[data-wa]').href = waLink('¡Hola Bencar! Necesito ayuda para elegir un producto.');

const RAIL_TINT = { iphone: '#5b7a99', mac: '#c7d3de', ipad: '#9fb4cc', watch: '#2d3137', fundas: '#c97b63', dyson: '#b3485f' };
document.getElementById('rail').innerHTML = categories.map((c) =>
  `<a href="#${c.id}">${art(c.art, RAIL_TINT[c.id])}<span>${c.name}</span></a>`).join('');

const filters = document.getElementById('filters');
filters.innerHTML = [`<button class="chip" aria-pressed="true" data-f="all">Todo</button>`,
  ...categories.map((c) => `<button class="chip" aria-pressed="false" data-f="${c.id}">${c.name}</button>`)].join('');

const sections = document.getElementById('sections');
sections.innerHTML = categories.map((c) => `
  <section class="store-sec" id="${c.id}" data-cat="${c.id}">
    <div class="wrap section__head" style="margin-bottom:12px">
      <h2 data-reveal>${c.name}. <span>${c.blurb}</span></h2>
    </div>
    ${shelf(byCat(c.id), c.name)}
  </section>`).join('');
wireShelves(sections);

function applyFilter(f) {
  filters.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.f === f)));
  const secs = sections.querySelectorAll('.store-sec');
  secs.forEach((s) => { s.hidden = f !== 'all' && s.dataset.cat !== f; });
  if (!reduced) gsap.fromTo(sections.querySelectorAll('.store-sec:not([hidden]) .pcard'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.04 });
  ScrollTrigger.refresh();
  tilt(sections);
}
filters.addEventListener('click', (e) => {
  const b = e.target.closest('[data-f]');
  if (!b) return;
  applyFilter(b.dataset.f);
  const top = filters.getBoundingClientRect().top + window.scrollY - 52;
  lenis ? lenis.scrollTo(top) : window.scrollTo({ top });
});

// Rail links -> filter + scroll
document.getElementById('rail').addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (!a) return;
  applyFilter('all');
});

ready();

if (location.hash) {
  const el = document.querySelector(location.hash);
  if (el) setTimeout(() => (lenis ? lenis.scrollTo(el, { offset: -110, immediate: true }) : el.scrollIntoView()), 120);
}
