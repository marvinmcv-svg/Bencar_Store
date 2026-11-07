// Motion core: smooth scroll, scroll-triggered reveals, split text, magnetic buttons,
// page transitions. Everything degrades to static content with reduced motion.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { mountLayout, LOGO } from './layout.js';
import { art } from './art.js';
import { mountKleber } from './kleber/chat.js';

gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };

export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export let lenis = null;

/** Wraps each word (and optionally char) in spans for staggered reveals. */
export function split(el, { chars = false } = {}) {
  if (el.dataset.splitDone) return el.querySelectorAll(chars ? '.ch' : '.w');
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((tok) => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) { frag.append(document.createTextNode(tok)); return; }
          const w = document.createElement('span'); w.className = 'w';
          const inner = document.createElement('span'); inner.className = 'wi';
          if (chars) [...tok].forEach((c) => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; inner.append(s); });
          else inner.textContent = tok;
          w.append(inner); frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
  };
  walk(el);
  el.dataset.splitDone = '1';
  el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
  return el.querySelectorAll(chars ? '.ch' : '.wi');
}

function reveals() {
  if (reduced) return;
  gsap.utils.toArray('[data-split]').forEach((el) => {
    const parts = split(el);
    gsap.from(parts, { yPercent: 110, rotate: 4, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.045,
      scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    const d = parseFloat(el.dataset.delay || 0);
    gsap.from(el, { y: 48, opacity: 0, duration: 1.1, ease: 'expo.out', delay: d, scrollTrigger: { trigger: el, start: 'top 90%' } });
  });
  gsap.utils.toArray('[data-stagger]').forEach((el) => {
    gsap.from(el.children, { y: 60, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 85%' } });
  });
  gsap.utils.toArray('[data-parallax]').forEach((el) => {
    gsap.to(el, { yPercent: parseFloat(el.dataset.parallax) || -15, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  // Apple-style text that lights up word by word as you scroll.
  gsap.utils.toArray('[data-highlight]').forEach((el) => {
    const parts = split(el);
    gsap.fromTo(parts, { opacity: 0.16 }, { opacity: 1, stagger: 0.1, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } });
  });
  gsap.utils.toArray('[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const o = { v: 0 };
    gsap.to(o, { v: end, duration: 2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' },
      onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString('en-US'); } });
  });
}

function magnetic() {
  if (reduced || !matchMedia('(hover:hover)').matches) return;
  document.querySelectorAll('.btn, [data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.25);
      yTo((e.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

/** 3D tilt + glare on cards. */
export function tilt(root = document) {
  if (reduced || !matchMedia('(hover:hover)').matches) return;
  root.querySelectorAll('[data-tilt]').forEach((el) => {
    if (el.dataset.tiltOn) return; el.dataset.tiltOn = '1';
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3' });
    gsap.set(el, { transformPerspective: 900 });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      ry((px - 0.5) * 8); rx((0.5 - py) * 8);
      el.style.setProperty('--gx', `${px * 100}%`); el.style.setProperty('--gy', `${py * 100}%`);
    });
    el.addEventListener('pointerleave', () => { rx(0); ry(0); });
  });
}

function transitions() {
  const curtain = document.createElement('div');
  curtain.className = 'curtain';
  curtain.innerHTML = `<div class="curtain__logo">${LOGO}</div>`;
  document.body.append(curtain);
  if (reduced) return;
  // Enter: only after an in-site navigation, and never on the home page,
  // which opens straight into its logo animation.
  const fromSite = document.referrer && new URL(document.referrer).origin === location.origin;
  if (fromSite && !document.body.classList.contains('home')) {
    gsap.fromTo(curtain, { yPercent: 0 }, { yPercent: -100, duration: 0.9, ease: 'expo.inOut', delay: 0.05 });
  }
  // Leave
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.search === location.search) {
      const el = url.hash && document.querySelector(url.hash);
      if (el && lenis) { e.preventDefault(); lenis.scrollTo(el, { offset: -110 }); history.replaceState(null, '', url.hash); }
      return;
    }
    e.preventDefault();
    gsap.fromTo(curtain, { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: 'expo.in', onComplete: () => { location.href = url.href; } });
  });
  window.addEventListener('pageshow', (e) => { if (e.persisted) gsap.set(curtain, { yPercent: -100 }); });
}

export function toast(html) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.append(t); }
  t.innerHTML = html;
  gsap.killTweensOf(t);
  gsap.fromTo(t, { y: 30, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out' });
  gsap.to(t, { y: 20, opacity: 0, duration: 0.4, delay: 2.6, ease: 'power2.in' });
}

/** Flies a product thumbnail into the bag icon. */
export function flyToBag(fromEl, type, tint, img) {
  const target = document.querySelector('.bag-btn');
  if (!fromEl || !target || reduced) return;
  const a = fromEl.getBoundingClientRect(), b = target.getBoundingClientRect();
  const ghost = document.createElement('div');
  ghost.className = 'ghost';
  ghost.innerHTML = img ? `<img src="${img}" alt=""/>` : art(type, tint);
  Object.assign(ghost.style, { left: `${a.left + a.width / 2 - 60}px`, top: `${a.top + a.height / 2 - 60}px` });
  document.body.append(ghost);
  gsap.timeline({ onComplete: () => ghost.remove() })
    .to(ghost, { x: b.left + b.width / 2 - (a.left + a.width / 2), duration: 0.9, ease: 'power2.inOut' }, 0)
    .to(ghost, { y: b.top + b.height / 2 - (a.top + a.height / 2), duration: 0.9, ease: 'back.in(1.4)' }, 0)
    .to(ghost, { scale: 0.12, opacity: 0.4, duration: 0.9, ease: 'power2.in' }, 0)
    .fromTo(target, { scale: 1 }, { scale: 1.35, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' }, 0.82);
}

export function boot() {
  mountLayout();
  if (!reduced) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const el = document.querySelector(a.getAttribute('href'));
      if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -70 }); }
    });
  }
  const lockObs = new MutationObserver(() => {
    const locked = document.documentElement.classList.contains('lock');
    if (lenis) locked ? lenis.stop() : lenis.start();
  });
  lockObs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  transitions();
  mountKleber();
}

/** Call after page content is rendered. */
export function ready() {
  reveals();
  magnetic();
  tilt();
  requestAnimationFrame(() => ScrollTrigger.refresh());
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
}
