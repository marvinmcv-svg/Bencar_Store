import { boot, ready, gsap, reduced, split, lenis } from '../core.js';
import { CONFIG, waLink } from '../../config.js';
import { products, categories, byId, fmt, fromPrice } from '../../data/catalog.js';
import { art } from '../art.js';
import { shelf, wireShelves } from '../cards.js';
import { createStage, makeWaves, webglOK } from '../three/stage.js';
import { makeLogo3D } from '../three/logo3d.js';
import { logoSVG } from '../brand.js';
import { thumb } from '../layout.js';

boot();

const isMobile = () => window.innerWidth < 760;
const GL = webglOK();

// ── Static content from catalogue ─────────────────────────────────────────
const TILES = [
  { id: 'iphone-17', cls: 'tile--dark', title: 'iPhone 17 Pro', copy: 'Pro y Pro Max desde $1,320.', art: 'phone', tint: '#5b7a99' },
  { id: 'macbook-air', cls: '', title: 'MacBook Air', copy: 'Chip M5. Desde $1,575.', art: 'laptop', tint: '#c7d3de' },
  { id: 'watch-ultra-3', cls: 'tile--navy', title: 'Apple Watch Ultra 3', copy: 'Titanio. 49 mm. $1,070.', art: 'watch', tint: '#b9b2a6' },
  { id: 'airpods-pro-3', cls: 'tile--warm', title: 'AirPods Pro 3', copy: 'Sound Canceling. $310.', art: 'buds' },
  { id: 'ipad-air', cls: '', title: 'iPad Air', copy: 'Chip M3. Desde $899.', art: 'tablet', tint: '#9fb4cc' },
  { id: 'dyson-airwrap', cls: 'tile--dark', title: 'Dyson', copy: 'Airwrap, Supersonic y Airstrait.', art: 'dyson', tint: '#b3485f' },
];
document.getElementById('tiles').innerHTML = TILES.map((t) => `
  <article class="tile ${t.cls}">
    <h3 data-reveal>${t.title}</h3>
    <p data-reveal data-delay=".05">${t.copy}</p>
    <div class="ctas" data-reveal data-delay=".1">
      <a class="btn" href="/producto.html?id=${t.id}">Comprar</a>
      <a class="btn btn--ghost" ${t.cls.includes('dark') || t.cls.includes('navy') ? 'style="--fg:#fff"' : ''} href="/tienda.html#${byId(t.id).cat}">Ver más</a>
    </div>
    <div class="tile__art" data-parallax="-12">${thumb(byId(t.id))}</div>
  </article>`).join('');

// Shop by category — first thing under the hero, so visitors see what Bencar sells.
const CAT_IMG = { iphone: 'iphone-17', mac: 'macbook-air', ipad: 'ipad-air', watch: 'watch-ultra-3', airpods: 'airpods-pro-3', accesorios: 'airtag', anker: 'anker-nano-pro-20' };
document.getElementById('cats').innerHTML = categories.map((c) => {
  const src = CAT_IMG[c.id] && byId(CAT_IMG[c.id])?.images[0];
  return `<a href="/tienda.html#${c.id}">${src ? `<img src="${src}" alt="" loading="lazy"/>` : art(c.art)}<span>${c.name}</span></a>`;
}).join('') + `<a href="/servicios.html"><svg class="art cats__svc" viewBox="0 0 40 40" aria-hidden="true"><path d="M24 8a8 8 0 0 0-7.4 11L8 27.6a2.8 2.8 0 0 0 4 4l8.6-8.6A8 8 0 0 0 31 16l-5 1-3-3 1-5z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg><span>Servicios</span></a>`;

document.getElementById('featured').innerHTML = shelf(products.filter((p) => p.featured), 'Lo más buscado');
wireShelves();

document.querySelector('[data-wa]').href = waLink('¡Hola Bencar! Quiero información.');
document.querySelector('[data-wa]').target = '_blank';
document.querySelector('[data-ig]').href = CONFIG.instagram;

// Story panels — iPhone 18 lineup, prices straight from the catalogue.
const ip18 = byId('iphone-18');
const LINES = [
  ['Pro', 'Potencia profesional, en tu bolsillo.'],
  ['Pro Max', 'Más pantalla. Más batería. Más todo.'],
  ['Duo', 'El nuevo integrante de la familia.'],
];
document.getElementById('story-copy').innerHTML = ip18.models.map((m, i) => `
  <article class="story__panel" data-panel="${i}">
    <p class="eyebrow" style="color:#a1a1a6">iPhone ${m.name}</p>
    <h3>${LINES[i][1]}</h3>
    <p>Desde <strong>${fmt(m.options[0].price, 'USD')}</strong>. Hasta 2TB.</p>
    <div class="story__prices">${m.options.map((o) => `<div><span>${o.label}</span><strong>${fmt(o.price, 'USD')}</strong></div>`).join('')}</div>
    <div class="hero__ctas" style="justify-content:flex-start;margin-top:26px"><a class="btn" href="/producto.html?id=iphone-18&model=${i}">Comprar ${m.name}</a></div>
  </article>`).join('');
document.getElementById('story-progress').innerHTML = ip18.models.map(() => '<i><b></b></i>').join('');

// ── Hero: animated 3D logo first, then Apple's own iPhone 18 Pro footage ──
// The phone is a real image sequence (frames of Apple's iPhone 18 Pro camera
// animation) drawn to a canvas and scrubbed by scroll, Apple-site style.
const SEQ = { count: 100, src: (i) => `/seq/iphone18/${String(i + 1).padStart(3, '0')}.webp` };

function heroSequence(canvas) {
  const ctx = canvas.getContext('2d');
  const frames = new Array(SEQ.count);
  let want = 0, drawn = -1;
  const load = (i) => new Promise((res) => {
    if (frames[i]) return res();
    const im = new Image(); im.decoding = 'async';
    im.onload = () => { frames[i] = im; if (i === want) draw(true); res(); };
    im.onerror = res; im.src = SEQ.src(i);
  });
  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = canvas.clientWidth * dpr; canvas.height = canvas.clientHeight * dpr;
    draw(true);
  };
  function draw(force) {
    let i = want;
    while (i > 0 && !frames[i]) i--; // nearest frame that is ready
    const im = frames[i];
    if (!im || (!force && i === drawn)) return;
    drawn = i;
    const { width: w, height: h } = canvas;
    // Landscape screens: cover. Portrait phones: "cover" would crop the 4:3
    // footage to a lens close-up, so show most of the phone, a little above centre.
    const portrait = h > w * 1.1;
    const sc = portrait ? (w / im.width) * 1.55 : Math.max(w / im.width, h / im.height);
    const iw = im.width * sc, ih = im.height * sc;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
    ctx.drawImage(im, (w - iw) / 2, portrait ? h * 0.4 - ih / 2 : (h - ih) / 2, iw, ih);
  }
  new ResizeObserver(size).observe(canvas);
  return {
    first: () => load(0).then(size),
    all: async () => { for (let i = 0; i < SEQ.count; i += 4) load(i); for (let i = 0; i < SEQ.count; i++) await load(i); },
    set: (p) => { want = Math.round(Math.max(0, Math.min(1, p)) * (SEQ.count - 1)); draw(false); },
  };
}

function hero() {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  const word = document.getElementById('hero-word');
  const chars = split(word, { chars: true });
  const tag = document.getElementById('hero-tag');
  const lockup = document.getElementById('hero-lockup');
  const flash = document.getElementById('hero-flash');
  const stageEl = document.getElementById('hero-stage');
  const feats = gsap.utils.toArray('.hero__feat');
  const container = document.getElementById('hero-canvas');
  const seqCanvas = document.getElementById('hero-seq');
  const unlock = () => document.body.classList.remove('intro-lock');
  const seq = heroSequence(seqCanvas);
  seq.first();

  let waves, stage, logo;
  const state = { amp: 0.4, waveY: -1.5, waveOp: 0, frame: 0 };
  const L = { y: 0.9, z: 0, ry: 0, rx: 0, s: 1, op: 1 };

  if (GL) {
    stage = createStage(container, { fov: 30, z: 16, exposure: 1.15 });
    waves = makeWaves(stage.THREE, { color: 0xffffff, opacity: 0.22 });
    waves.position.set(0, 0, -6); waves.scale.setScalar(1.15);
    stage.scene.add(waves);
    logo = makeLogo3D();
    stage.scene.add(logo);
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    window.addEventListener('pointermove', (e) => { pointer.tx = (e.clientX / innerWidth - 0.5); pointer.ty = (e.clientY / innerHeight - 0.5); }, { passive: true });
    stage.onTick((t) => {
      pointer.x += (pointer.tx - pointer.x) * 0.05; pointer.y += (pointer.ty - pointer.y) * 0.05;
      waves.userData.update(t, state.amp);
      waves.userData.setOpacity(state.waveOp);
      waves.position.y = state.waveY;
      waves.visible = state.waveOp > 0.01;
      const ls = L.s * (isMobile() ? 0.3 : 0.42);
      logo.scale.setScalar(ls);
      logo.position.set(0, L.y * (isMobile() ? 0.9 : 1) + Math.sin(t * 1.1) * 0.05, L.z);
      logo.rotation.set(L.rx + pointer.y * 0.35 + Math.sin(t * 0.7) * 0.03, L.ry + pointer.x * 0.55, 0);
      logo.userData.state.opacity = L.op;
      logo.visible = L.op > 0.01;
      logo.userData.update(t);
    });
  } else {
    container.innerHTML = `<div class="fallback-art hero__logo2d" style="color:#fff">${logoSVG({ ring: 'icon', cls: 'art' })}</div>`;
  }
  document.body.classList.remove('hero-pending');
  gsap.set(stageEl.children, { opacity: 0, y: 30 });
  gsap.set(seqCanvas, { opacity: 0 });

  // ── Entrance: starts on the very first frame, no loading screen ──
  lenis?.stop();
  const intro = gsap.timeline({ onComplete: () => { lenis?.start(); seq.all(); } });
  if (logo) {
    const S = logo.userData.state;
    intro
      .to(S, { gather: 1, duration: 2.2, ease: 'power2.inOut' }, 0)
      .to(stage.camera.position, { z: 11, duration: 3.2, ease: 'expo.inOut' }, 0)
      .to(S, { ring: 1, duration: 1.4, ease: 'expo.inOut' }, 0.6)
      .to(S, { mark: 1, duration: 1.4, ease: 'expo.out' }, 1.3)
      .fromTo(flash, { opacity: 0 }, { opacity: 0.85, duration: 0.18, ease: 'power2.out' }, 2.05)
      .to(flash, { opacity: 0, duration: 0.9, ease: 'power2.out' }, 2.23)
      .to(S, { disc: 1, duration: 1.2, ease: 'expo.out' }, 2.05)
      .to(S, { sparkle: 0, duration: 1.4, ease: 'power2.out' }, 2.1)
      .fromTo(S, { sweepX: -9, sweepI: 0 }, { sweepX: 9, sweepI: 90, duration: 1.8, ease: 'power2.inOut' }, 2.2)
      .to(S, { sweepI: 0, duration: 0.6 }, 3.8)
      .to(state, { waveOp: 1, waveY: 0, duration: 2.4, ease: 'expo.out' }, 2.1);
  } else {
    intro.from('.hero__logo2d', { scale: 0.6, opacity: 0, rotationY: -120, transformPerspective: 900, duration: 1.8, ease: 'expo.out' }, 0);
  }
  const t0 = logo ? 2.3 : 0.8;
  intro
    .from(chars, { yPercent: 120, opacity: 0, rotateX: -90, duration: 1.3, ease: 'expo.out', stagger: 0.06 }, t0)
    .from(tag, { opacity: 0, y: 16, letterSpacing: '0.9em', duration: 1.4, ease: 'expo.out' }, t0 + 0.3)
    .add(unlock, t0 + 0.6)
    .from('#hero-scroll', { opacity: 0, duration: 1 }, t0 + 0.8);
  window.__bencarIntro = intro; // handy for QA / screenshots
  const skip = () => { if (intro.isActive()) intro.progress(1); unlock(); lenis?.start(); };
  ['wheel', 'touchstart', 'keydown'].forEach((ev) => window.addEventListener(ev, skip, { once: true, passive: true }));

  // ── Scroll: logo flies off, Apple's iPhone 18 Pro footage takes over ──
  const tl = gsap.timeline({ defaults: { ease: 'none' },
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: 0.6 } });
  tl.to('#hero-scroll', { opacity: 0, duration: 0.2 }, 0)
    .to(L, { ry: Math.PI * 1.15, rx: -0.25, z: -6, y: 2.6, op: 0, duration: 1.1, ease: 'power2.in' }, 0)
    .to('.hero__logo2d', { opacity: 0, scale: 0.7, duration: 0.8 }, 0)
    .to(state, { waveOp: 0, duration: 0.8 }, 0.2)
    .to(lockup, { opacity: 0, y: -60, filter: 'blur(10px)', duration: 0.7 }, 0)
    .to(seqCanvas, { opacity: 1, duration: 0.6 }, 0.5)
    .to(state, { frame: 1, duration: 3.6, onUpdate: () => seq.set(state.frame) }, 0.7);
  if (isMobile()) {
    // Phones: one caption at a time, in the same spot under the footage.
    feats.forEach((f, i) => {
      const at = 1.3 + i * 0.9;
      tl.fromTo(f, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.3 }, at)
        .to(f, { opacity: 0, y: -24, duration: 0.25 }, at + 0.65);
    });
  } else {
    tl.fromTo(feats[0], { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.4 }, 1.5)
      .fromTo(feats[1], { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.4 }, 2.4)
      .fromTo(feats[2], { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.4 }, 3.1)
      .to(feats, { opacity: 0, y: -30, duration: 0.4, stagger: 0.05 }, 4.0);
  }
  tl
    .to(seqCanvas, { opacity: 0.32, scale: 0.94, duration: 0.6 }, 4.3)
    .to(stageEl.children, { opacity: 1, y: 0, stagger: 0.08, duration: 0.4 }, 4.6);
}

// ── Story (pinned lineup): real Apple photos, one finish per model ───────
// Each panel turns the phone through Apple's product angles as you scroll.
const ANGLE_ORDER = ['', '_av6', '_av3', '_av2'];
function story() {
  const panels = gsap.utils.toArray('.story__panel');
  const bars = gsap.utils.toArray('#story-progress b');
  const container = document.getElementById('story-canvas');
  const sets = ip18.models.map((m, i) => {
    // The Duo has its own finishes and photos; the Pro models show one Pro finish each.
    const set = m.colorImages?.[0] || ip18.colorImages[i] || ip18.images;
    return ANGLE_ORDER.map((suf) => set.find((src) => src.endsWith(`-202609${suf}.webp`))).filter(Boolean);
  });
  container.innerHTML = `<div class="story__phone">${sets.map((set, m) => set.map((src, a) =>
    `<img src="${src}" alt="" data-m="${m}" data-a="${a}" loading="lazy" decoding="async"/>`).join('')).join('')}</div>`;
  const imgs = [...container.querySelectorAll('img')];
  let shown = null;
  const show = (m, a) => {
    const el = imgs.find((x) => +x.dataset.m === m && +x.dataset.a === a) || imgs[0];
    if (el === shown) return;
    const prev = shown; shown = el;
    gsap.to(el, { opacity: 1, rotationY: 0, scale: 1, duration: 0.7, ease: 'expo.out', overwrite: true });
    if (prev) gsap.to(prev, { opacity: 0, rotationY: -25, scale: 0.96, duration: 0.5, ease: 'power2.out', overwrite: true });
  };
  gsap.set(imgs, { opacity: 0, rotationY: 25, scale: 0.96, transformPerspective: 1200 });
  show(0, 0);
  panels[0].classList.add('is-active');
  if (reduced) { panels.forEach((p) => { gsap.set(p, { opacity: 1 }); p.classList.add('is-active'); }); return; }

  const tl = gsap.timeline({ defaults: { ease: 'none' },
    scrollTrigger: { trigger: '.story', start: 'top top', end: 'bottom bottom', scrub: 0.8,
      onUpdate: (st) => {
        const x = st.progress * panels.length * 0.9999;
        const m = Math.min(panels.length - 1, Math.floor(x));
        const n = sets[m].length;
        show(m, Math.min(n - 1, Math.floor((x - m) * n)));
        panels.forEach((p, i) => p.classList.toggle('is-active', i === m));
      } } });
  const axis = isMobile() ? 'scaleX' : 'scaleY';
  tl.fromTo('.story__phone', { y: 20 }, { y: -20, duration: panels.length }, 0);
  panels.forEach((p, i) => {
    tl.fromTo(p, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.25 }, i + 0.02)
      .fromTo(bars[i], { [axis]: 0 }, { [axis]: 1, duration: 1 }, i);
    if (i < panels.length - 1) tl.to(p, { opacity: 0, y: -60, duration: 0.2 }, i + 0.8);
  });
}

// ── Mac: the real MacBook Air photo "opens" towards you on scroll ─────────
function lid() {
  const container = document.getElementById('lid-canvas');
  const mba = byId('macbook-air');
  container.innerHTML = `<div class="lid__mac"><img src="${mba.images[0]}" alt="MacBook Air" loading="lazy" decoding="async"/></div>`;
  if (reduced) return;
  gsap.timeline({ scrollTrigger: { trigger: '.lid', start: 'top top', end: 'bottom bottom', scrub: 1 } })
    .fromTo('.lid__mac img', { rotationX: 72, scale: 0.78, y: 60, transformPerspective: 1400, transformOrigin: '50% 100%' },
      { rotationX: 0, scale: 1.02, y: 0, ease: 'power2.inOut', duration: 1 });
}

// ── Small scenes ─────────────────────────────────────────────────────────
function details() {
  if (reduced) return;
  gsap.fromTo('.steps__bar', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '#steps', start: 'top 75%', end: 'bottom 55%', scrub: true } });
  gsap.from('.step', { y: 40, opacity: 0, stagger: 0.15, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '#steps', start: 'top 80%' } });
  gsap.from('.step__dot', { scale: 0.3, stagger: 0.15, duration: 1.2, ease: 'elastic.out(1, .5)', scrollTrigger: { trigger: '#steps', start: 'top 80%' } });
  const car = document.getElementById('car');
  gsap.fromTo(car, { x: 0 }, { x: () => car.parentElement.clientWidth + 280, ease: 'none', scrollTrigger: { trigger: car.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 } });
}

hero();
story();
lid();
details();
ready();
