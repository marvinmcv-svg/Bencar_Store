import { boot, ready, gsap, reduced, split } from '../core.js';
import { CONFIG, waLink } from '../../config.js';
import { products, byId, fmt, fromPrice } from '../../data/catalog.js';
import { art } from '../art.js';
import { shelf, wireShelves } from '../cards.js';
import { createStage, makeWaves, webglOK } from '../three/stage.js';
import { makePhone, makeLaptop } from '../three/devices.js';

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
      <a class="btn btn--ghost" ${t.cls.includes('dark') || t.cls.includes('navy') ? 'style="--fg:#6fb1ff"' : ''} href="/tienda.html#${byId(t.id).cat}">Ver más</a>
    </div>
    <div class="tile__art" data-parallax="-12">${art(t.art, t.tint)}</div>
  </article>`).join('');

document.getElementById('featured').innerHTML = shelf(products.filter((p) => p.featured), 'Lo más buscado');
wireShelves();

document.querySelector('[data-wa]').href = waLink('¡Hola Bencar! Quiero información.');
document.querySelector('[data-wa]').target = '_blank';
document.querySelector('[data-ig]').href = CONFIG.instagram;

// Story panels — iPhone 18 lineup, prices straight from the catalogue.
const ip18 = byId('iphone-18');
const STORY_TINTS = [0xc9ccd2, 0x2f4a6b, 0xd9c3a0];
const LINES = [
  ['Pro', 'Potencia profesional, en tu bolsillo.'],
  ['Pro Max', 'Más pantalla. Más batería. Más todo.'],
  ['DUO', 'El nuevo integrante de la familia.'],
];
document.getElementById('story-copy').innerHTML = ip18.models.map((m, i) => `
  <article class="story__panel" data-panel="${i}">
    <p class="eyebrow" style="color:#ffb38a">iPhone ${m.name}</p>
    <h3>${LINES[i][1]}</h3>
    <p>Desde <strong>${fmt(m.options[0].price, 'USD')}</strong>. Hasta 2TB.</p>
    <div class="story__prices">${m.options.map((o) => `<div><span>${o.label}</span><strong>${fmt(o.price, 'USD')}</strong></div>`).join('')}</div>
    <div class="hero__ctas" style="justify-content:flex-start;margin-top:26px"><a class="btn" href="/producto.html?id=iphone-18&model=${i}">Comprar ${m.name}</a></div>
  </article>`).join('');
document.getElementById('story-progress').innerHTML = ip18.models.map(() => '<i><b></b></i>').join('');

// ── Hero ──────────────────────────────────────────────────────────────────
function hero() {
  const title = document.getElementById('hero-title');
  const chars = split(title, { chars: true });
  const sub = document.getElementById('hero-sub');
  const stageEl = document.getElementById('hero-stage');
  const feats = gsap.utils.toArray('.hero__feat');
  const container = document.getElementById('hero-canvas');

  let phone, waves, stage;
  const state = { py: -3.5, px: 0, ry: -0.5, rx: 0.35, rz: 0, s: 1, amp: 1, waveY: 0 };

  if (GL) {
    stage = createStage(container, { fov: 30, z: 11 });
    waves = makeWaves(stage.THREE, { color: 0x9fc1ff, opacity: 0.38 });
    waves.position.set(0, 0, -6); waves.scale.setScalar(1.15);
    stage.scene.add(waves);
    phone = makePhone({ color: 0xc9ccd2 });
    stage.scene.add(phone);
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    window.addEventListener('pointermove', (e) => { pointer.tx = (e.clientX / innerWidth - 0.5); pointer.ty = (e.clientY / innerHeight - 0.5); }, { passive: true });
    stage.onTick((t) => {
      pointer.x += (pointer.tx - pointer.x) * 0.05; pointer.y += (pointer.ty - pointer.y) * 0.05;
      waves.userData.update(t, state.amp);
      waves.position.y = state.waveY;
      const s = state.s * (isMobile() ? 0.82 : 1);
      phone.scale.setScalar(s);
      phone.position.set(state.px * (isMobile() ? 0 : 1), state.py + Math.sin(t * 1.2) * 0.05, 0);
      phone.rotation.set(state.rx + pointer.y * 0.25, state.ry + pointer.x * 0.5, state.rz);
    });
  } else {
    container.innerHTML = `<div class="fallback-art">${art('phone', '#c9ccd2')}</div>`;
  }

  gsap.set(stageEl.children, { opacity: 0, y: 30 });
  if (reduced) { gsap.set(stageEl.children, { opacity: 1, y: 0 }); state.py = 0; state.ry = 0.4; return; }

  // Intro
  gsap.timeline({ delay: 0.5 })
    .from(chars, { yPercent: 120, opacity: 0, rotateX: -80, duration: 1.4, ease: 'expo.out', stagger: 0.06 })
    .from(sub, { opacity: 0, y: 20, letterSpacing: '0.8em', duration: 1.4, ease: 'expo.out' }, 0.4)
    .from(state, { py: -7, ry: -1.4, duration: 2.4, ease: 'expo.out' }, 0.3)
    .from('#hero-scroll', { opacity: 0, duration: 1 }, 1);

  // Scroll choreography
  const tl = gsap.timeline({ defaults: { ease: 'none' },
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: 1 } });
  tl.to('#hero-scroll', { opacity: 0, duration: 0.2 }, 0)
    .to(title, { scale: 1.6, opacity: 0, filter: 'blur(12px)', duration: 0.9 }, 0)
    .to(sub, { opacity: 0, y: -40, duration: 0.5 }, 0)
    .to(state, { py: 0, ry: 0.35, rx: 0, s: 1.1, amp: 0.55, duration: 1 }, 0)
    .to(state, { ry: Math.PI + 0.45, rz: -0.08, duration: 1.2 }, 1)
    .fromTo(feats[0], { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.4 }, 1.1)
    .to(state, { px: 1.6, ry: Math.PI * 2 - 0.5, rz: 0.05, duration: 1.2 }, 2.2)
    .fromTo(feats[1], { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.4 }, 2.3)
    .fromTo(feats[2], { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.4 }, 2.7)
    .to(feats, { opacity: 0, y: -30, duration: 0.4, stagger: 0.05 }, 3.4)
    .to(state, { px: 0, py: 0.75, ry: Math.PI * 2 + 0.25, rx: 0.08, rz: 0, s: 0.92, amp: 0.25, waveY: 1.2, duration: 1 }, 3.4)
    .to(stageEl.children, { opacity: 1, y: 0, stagger: 0.08, duration: 0.4 }, 4.0);
}

// ── Story (pinned lineup) ────────────────────────────────────────────────
function story() {
  const panels = gsap.utils.toArray('.story__panel');
  const bars = gsap.utils.toArray('#story-progress b');
  const container = document.getElementById('story-canvas');
  const state = { ry: -0.6, x: 1.9, colorIdx: 0 };
  let phone;
  if (GL) {
    const stage = createStage(container, { fov: 28, z: 11, exposure: 1.1 });
    phone = makePhone({ color: STORY_TINTS[0] });
    stage.scene.add(phone);
    const spot = new stage.THREE.PointLight(0xffb38a, 30, 20); spot.position.set(-3, 3, 4); stage.scene.add(spot);
    const target = new stage.THREE.Color(STORY_TINTS[0]);
    stage.onTick((t) => {
      const mats = [phone.userData.frame.material, phone.userData.back.material];
      mats.forEach((m) => m.color.lerp(target, 0.08));
      phone.userData.plateau.material.color.lerp(target.clone().multiplyScalar(0.85), 0.08);
      phone.position.set(isMobile() ? 0 : state.x, isMobile() ? 1.1 : 0, 0);
      phone.scale.setScalar(isMobile() ? 0.78 : 1.12);
      phone.rotation.set(0.12 + Math.sin(t * 0.8) * 0.04, state.ry, -0.06);
    });
    state.setColor = (i) => target.set(STORY_TINTS[i]);
  } else {
    container.innerHTML = `<div class="fallback-art" style="left:45%">${art('phone', '#2f4a6b')}</div>`;
  }
  if (reduced) { panels.forEach((p) => gsap.set(p, { opacity: 1 })); return; }

  const tl = gsap.timeline({ defaults: { ease: 'none' },
    scrollTrigger: { trigger: '.story', start: 'top top', end: 'bottom bottom', scrub: 0.8,
      onUpdate: (st) => {
        const i = Math.min(panels.length - 1, Math.floor(st.progress * panels.length * 0.999));
        if (state.setColor && state.colorIdx !== i) { state.colorIdx = i; state.setColor(i); }
      } } });
  tl.to(state, { ry: Math.PI * 4 - 0.6, duration: panels.length, ease: 'none' }, 0);
  panels.forEach((p, i) => {
    tl.fromTo(p, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.25 }, i + 0.02)
      .fromTo(bars[i], { scaleY: 0 }, { scaleY: 1, duration: 1 }, i);
    if (i < panels.length - 1) tl.to(p, { opacity: 0, y: -60, duration: 0.2 }, i + 0.8);
  });
}

// ── Mac lid ───────────────────────────────────────────────────────────────
function lid() {
  const container = document.getElementById('lid-canvas');
  if (!GL) { container.innerHTML = `<div class="fallback-art">${art('laptop', '#c7d3de')}</div>`; return; }
  const stage = createStage(container, { fov: 26, z: 12 });
  const laptop = makeLaptop({ color: 0xc7d3de });
  stage.scene.add(laptop);
  const st = { open: reduced ? 1 : 0, rx: 0.55, s: 0.9, y: -0.7 };
  stage.onTick(() => {
    laptop.userData.setOpen(st.open);
    laptop.rotation.set(st.rx, -0.0, 0);
    laptop.scale.setScalar(st.s * (isMobile() ? 0.7 : 1));
    laptop.position.y = st.y;
  });
  if (reduced) return;
  gsap.timeline({ scrollTrigger: { trigger: '.lid', start: 'top top', end: 'bottom bottom', scrub: 1 } })
    .fromTo(st, { open: 0, rx: 0.9, s: 0.75 }, { open: 1, rx: 0.2, s: 1.05, ease: 'power2.inOut', duration: 1 });
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
