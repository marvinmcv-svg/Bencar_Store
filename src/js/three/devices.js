// Procedural 3D devices built from primitives — no model files to download.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { MARK, MARK_CENTER } from '../brand.js';

function drawMark(g, cx, cy, size) {
  const [mx, my] = MARK_CENTER;
  const k = size / 7.2;
  g.save(); g.translate(cx, cy); g.beginPath();
  MARK.forEach(([x, y], i) => { const px = (x - mx) * k, py = -(y - my) * k; i ? g.lineTo(px, py) : g.moveTo(px, py); });
  g.closePath(); g.fill();
  g.lineWidth = size * 0.035; g.beginPath(); g.arc(0, 0, size * 0.48, 0, Math.PI * 2); g.stroke(); g.restore();
}

export function screenTexture({ w = 512, h = 1100, title = 'BenCar', sub = 'Productos Apple y más', radius = 70 } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#000000');
  grad.addColorStop(0.5, '#1c1c1e');
  grad.addColorStop(0.8, '#48484a');
  grad.addColorStop(1, '#8e8e93');
  g.fillStyle = grad;
  g.beginPath(); g.roundRect(0, 0, w, h, radius); g.fill();
  // soft orbs
  for (const [x, y, r, col] of [[w * 0.2, h * 0.8, w * 0.7, 'rgba(255,255,255,.18)'], [w * 0.9, h * 0.2, w * 0.6, 'rgba(255,255,255,.12)']]) {
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = rg; g.fillRect(0, 0, w, h);
  }
  g.fillStyle = '#fff';
  g.textAlign = 'center';
  if (h > w) {
    g.font = `600 ${w * 0.26}px Inter, system-ui, sans-serif`;
    g.fillText('9:41', w / 2, h * 0.24);
    g.font = `500 ${w * 0.05}px Inter, system-ui, sans-serif`;
    g.globalAlpha = 0.85;
    g.fillText('Sábado 7 de noviembre', w / 2, h * 0.1);
    g.globalAlpha = 1;
    // dynamic island
    g.fillStyle = '#000';
    g.beginPath(); g.roundRect(w * 0.33, h * 0.022, w * 0.34, h * 0.042, h * 0.021); g.fill();
    g.fillStyle = '#fff'; g.strokeStyle = '#fff';
    drawMark(g, w / 2, h * 0.58, w * 0.42);
    g.font = `700 ${w * 0.11}px Inter, system-ui, sans-serif`;
    g.fillText(title, w / 2, h * 0.86);
    g.font = `400 ${w * 0.045}px Inter, system-ui, sans-serif`;
    g.globalAlpha = 0.8; g.fillText(sub, w / 2, h * 0.9);
  } else {
    g.strokeStyle = '#fff';
    drawMark(g, w / 2, h * 0.36, h * 0.3);
    g.font = `700 ${h * 0.12}px Inter, system-ui, sans-serif`;
    g.fillText(title, w / 2, h * 0.68);
    g.font = `400 ${h * 0.055}px Inter, system-ui, sans-serif`;
    g.globalAlpha = 0.85; g.fillText(sub, w / 2, h * 0.76);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function display(tex, w, h) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })));
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.04, transparent: true, opacity: 0.12, clearcoat: 1 }));
  glass.position.z = 0.002; g.add(glass);
  return g;
}

const metalMat = (color, rough = 0.28) => new THREE.MeshPhysicalMaterial({ color, metalness: 1, roughness: rough, clearcoat: 0.6, clearcoatRoughness: 0.2 });
const glassBack = (color) => new THREE.MeshPhysicalMaterial({ color, metalness: 0.2, roughness: 0.45, clearcoat: 1, clearcoatRoughness: 0.08 });

function cameraLens(r) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.06, 48), metalMat(0x2a2c31, 0.2));
  ring.rotation.x = Math.PI / 2;
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.78, r * 0.78, 0.07, 48),
    new THREE.MeshPhysicalMaterial({ color: 0x0a0d18, metalness: 0.4, roughness: 0.05, clearcoat: 1, iridescence: 1, iridescenceIOR: 1.6 }));
  glass.rotation.x = Math.PI / 2; glass.position.z = 0.005;
  g.add(ring, glass);
  return g;
}

/** iPhone-like slab. ~1.5 x 3.1 units. */
export function makePhone({ color = 0xc9ccd2, screen } = {}) {
  const group = new THREE.Group();
  const W = 1.5, H = 3.1, D = 0.17;
  const frame = new THREE.Mesh(new RoundedBoxGeometry(W, H, D, 8, 0.2), metalMat(color, 0.22));
  group.add(frame);

  const front = display(screen || screenTexture(), W - 0.06, H - 0.06);
  front.position.z = D / 2 + 0.002;
  group.add(front);

  const back = new THREE.Mesh(new RoundedBoxGeometry(W - 0.05, H - 0.05, 0.01, 4, 0.18), glassBack(color));
  back.position.z = -D / 2 - 0.004;
  group.add(back);

  const plateau = new THREE.Mesh(new RoundedBoxGeometry(0.78, 0.82, 0.06, 6, 0.16), glassBack(new THREE.Color(color).multiplyScalar(0.85)));
  plateau.position.set(-0.3, 1.04, -D / 2 - 0.03);
  group.add(plateau);
  const lensPos = [[-0.47, 1.22], [-0.47, 0.86], [-0.13, 1.04]];
  for (const [x, y] of lensPos) {
    const l = cameraLens(0.14);
    l.rotation.y = Math.PI;
    l.position.set(x, y, -D / 2 - 0.07);
    group.add(l);
  }
  const flash = new THREE.Mesh(new THREE.CircleGeometry(0.035, 24), new THREE.MeshBasicMaterial({ color: 0xfff6e0 }));
  flash.position.set(-0.13, 1.33, -D / 2 - 0.062); flash.rotation.y = Math.PI;
  group.add(flash);

  // side buttons
  const btn = (y, h, side = 1) => {
    const b = new THREE.Mesh(new RoundedBoxGeometry(0.03, h, 0.07, 2, 0.015), metalMat(color, 0.3));
    b.position.set(side * (W / 2 + 0.01), y, 0);
    group.add(b);
  };
  btn(0.75, 0.38, 1); btn(0.9, 0.18, -1); btn(0.55, 0.28, -1); btn(0.2, 0.28, -1);
  group.userData = { frame, back, plateau };
  return group;
}

/** Laptop with an openable lid: set group.userData.setOpen(0..1). */
export function makeLaptop({ color = 0xc7d3de, screen } = {}) {
  const group = new THREE.Group();
  const W = 3.6, Dp = 2.45, T = 0.09;
  const mat = metalMat(color, 0.32);
  const base = new THREE.Mesh(new RoundedBoxGeometry(W, T, Dp, 6, 0.04), mat);
  group.add(base);
  const deck = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.86, Dp * 0.42), new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.7 }));
  deck.rotation.x = -Math.PI / 2; deck.position.set(0, T / 2 + 0.001, -0.25);
  group.add(deck);
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.36, Dp * 0.3), new THREE.MeshPhysicalMaterial({ color, metalness: 0.6, roughness: 0.25 }));
  pad.rotation.x = -Math.PI / 2; pad.position.set(0, T / 2 + 0.002, 0.7);
  group.add(pad);

  const hinge = new THREE.Group();
  hinge.position.set(0, T / 2, -Dp / 2);
  group.add(hinge);
  const lid = new THREE.Mesh(new RoundedBoxGeometry(W, Dp - 0.1, 0.06, 6, 0.03), mat);
  lid.position.set(0, (Dp - 0.1) / 2, 0);
  hinge.add(lid);
  const bezel = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.08, Dp - 0.18), new THREE.MeshStandardMaterial({ color: 0x050506, roughness: 0.3 }));
  bezel.position.set(0, (Dp - 0.1) / 2, 0.031);
  hinge.add(bezel);
  const tex = screen || screenTexture({ w: 1400, h: 900, radius: 20 });
  const disp = display(tex, W - 0.22, Dp - 0.34);
  disp.position.set(0, (Dp - 0.1) / 2, 0.033);
  hinge.add(disp);

  group.userData.setOpen = (t) => { hinge.rotation.x = -Math.PI / 2 + t * (Math.PI / 2 + 0.28); };
  group.userData.setOpen(1);
  return group;
}

export function makeTablet({ color = 0x9fb4cc, screen } = {}) {
  const group = new THREE.Group();
  const W = 2.3, H = 3.1, D = 0.08;
  group.add(new THREE.Mesh(new RoundedBoxGeometry(W, H, D, 6, 0.04), metalMat(color, 0.3)));
  const bez = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.04, H - 0.04), new THREE.MeshStandardMaterial({ color: 0x050506, roughness: 0.2 }));
  bez.position.z = D / 2 + 0.001; group.add(bez);
  const tex = screen || screenTexture({ w: 900, h: 1200, radius: 30 });
  const disp = display(tex, W - 0.2, H - 0.2);
  disp.position.z = D / 2 + 0.002; group.add(disp);
  const cam = cameraLens(0.1); cam.rotation.y = Math.PI; cam.position.set(-W / 2 + 0.3, H / 2 - 0.3, -D / 2 - 0.03); group.add(cam);
  return group;
}

export function makeWatch({ color = 0x2d3137 } = {}) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new RoundedBoxGeometry(1.5, 1.8, 0.42, 10, 0.32), metalMat(color, 0.2));
  group.add(body);
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, 512, 512);
  g.lineCap = 'round';
  [[150, '#ff2d55', 0.78], [112, '#a6ff00', 0.62], [74, '#00e0ff', 0.9]].forEach(([r, col, p]) => {
    g.lineWidth = 32; g.strokeStyle = col + '33'; g.beginPath(); g.arc(256, 256, r, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = col; g.beginPath(); g.arc(256, 256, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p); g.stroke();
  });
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const face = new THREE.Mesh(new RoundedBoxGeometry(1.3, 1.6, 0.02, 8, 0.009), new THREE.MeshPhysicalMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: tex, clearcoat: 1, roughness: 0.05 }));
  face.position.z = 0.215; group.add(face);
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.14, 32), metalMat(color, 0.25));
  crown.rotation.z = Math.PI / 2; crown.position.set(0.8, 0.3, 0); group.add(crown);
  const band = new THREE.MeshStandardMaterial({ color: new THREE.Color(color).multiplyScalar(0.8), roughness: 0.8 });
  for (const s of [1, -1]) {
    const b = new THREE.Mesh(new RoundedBoxGeometry(1.1, 1.6, 0.16, 4, 0.07), band);
    b.position.set(0, s * 1.55, -0.08); b.rotation.x = s * 0.18; group.add(b);
  }
  return group;
}

export function makeBudsCase() {
  const group = new THREE.Group();
  const white = new THREE.MeshPhysicalMaterial({ color: 0xf6f6f4, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.15 });
  const bottom = new THREE.Mesh(new RoundedBoxGeometry(1.9, 1.15, 0.8, 10, 0.36), white);
  group.add(bottom);
  const hinge = new THREE.Group(); hinge.position.set(0, 0.55, -0.4); group.add(hinge);
  const lid = new THREE.Mesh(new RoundedBoxGeometry(1.9, 0.5, 0.8, 10, 0.2), white);
  lid.position.set(0, 0.24, 0.4); hinge.add(lid);
  const led = new THREE.Mesh(new THREE.CircleGeometry(0.03, 16), new THREE.MeshBasicMaterial({ color: 0x8ed36a }));
  led.position.set(0, 0.15, 0.401); group.add(led);
  const buds = new THREE.Group(); group.add(buds);
  for (const s of [-1, 1]) {
    const bud = new THREE.Group();
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 32), white); head.scale.set(1, 1.1, 0.9);
    const stem = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.6, 8, 16), white); stem.position.y = -0.42;
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 24), new THREE.MeshStandardMaterial({ color: 0x2a2d33, roughness: 0.9 }));
    mesh.position.set(0, 0.04, 0.16); mesh.scale.set(1, 1, 0.3);
    bud.add(head, stem, mesh); bud.position.set(s * 0.42, 0.55, 0); buds.add(bud);
  }
  group.userData.setOpen = (t) => {
    hinge.rotation.x = -t * 1.9;
    buds.position.y = t * 0.75;
    buds.children.forEach((b, i) => { b.rotation.z = (i ? -1 : 1) * t * 0.25; });
  };
  group.userData.setOpen(0.8);
  return group;
}

export const MAKERS = { phone: makePhone, laptop: makeLaptop, tablet: makeTablet, watch: makeWatch, buds: makeBudsCase };
