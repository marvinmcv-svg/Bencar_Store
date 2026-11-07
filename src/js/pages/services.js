import { boot, ready, gsap, reduced } from '../core.js';
import { CONFIG, waLink } from '../../config.js';
import { services } from '../../data/catalog.js';
import { createStage, makeWaves, webglOK } from '../three/stage.js';

boot();

const svc = Object.fromEntries(services.map((s) => [s.id, s]));
document.getElementById('tec-body').textContent = svc['servicio-tecnico'].body;
document.getElementById('cv-rules').innerHTML = svc['compra-venta'].rules.map((r) => `<li>${r}</li>`).join('');
document.getElementById('sell').innerHTML = svc.vehiculos.sell.map((r) => `<li>${r}</li>`).join('');
document.getElementById('buy').innerHTML = svc.vehiculos.buy.map((r) => `<li>${r}</li>`).join('');

document.querySelectorAll('[data-wa]').forEach((a) => { a.href = waLink(a.dataset.wa); });
document.querySelectorAll('[data-tel]').forEach((a) => { a.href = `tel:${CONFIG.phoneTel}`; a.textContent = `Llamar ${CONFIG.phoneDisplay}`; });
document.querySelectorAll('[data-ig]').forEach((a) => { a.href = CONFIG.instagram; });
document.getElementById('group-link').href = CONFIG.whatsappGroup || waLink('¡Hola Bencar! Quiero unirme al grupo de Dinámicas.');

if (webglOK()) {
  const stage = createStage(document.getElementById('svc-canvas'), { fov: 35, z: 12 });
  const waves = makeWaves(stage.THREE, { lines: 60, color: 0x9fc1ff, opacity: 0.42, width: 30 });
  waves.rotation.z = -0.25; waves.position.set(3, -1, -3);
  stage.scene.add(waves);
  const st = { amp: 1 };
  stage.onTick((t) => waves.userData.update(reduced ? 0 : t, st.amp));
  if (!reduced) gsap.to(st, { amp: 2.2, ease: 'none', scrollTrigger: { trigger: '.svc-hero', start: 'top top', end: 'bottom top', scrub: true } });
}

if (!reduced) {
  gsap.fromTo('.steps__bar', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '#steps', start: 'top 75%', end: 'bottom 55%', scrub: true } });
  gsap.from('.step__dot', { scale: 0.3, opacity: 0, stagger: 0.15, duration: 1.2, ease: 'elastic.out(1, .5)', scrollTrigger: { trigger: '#steps', start: 'top 80%' } });
  const car = document.getElementById('car');
  gsap.fromTo(car, { x: 0 }, { x: () => car.parentElement.clientWidth + 280, ease: 'none', scrollTrigger: { trigger: car.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 } });
  gsap.to('#gear', { rotation: 360, transformOrigin: '50% 50%', ease: 'none', scrollTrigger: { trigger: '#repuestos', start: 'top bottom', end: 'bottom top', scrub: 1 } });
}

ready();
