// 3D Bencar badge built from the traced logo outline:
// black lacquered disc + chrome ring + extruded chrome "bc" mark,
// plus a particle cloud that converges onto the logo for the entrance.
import * as THREE from 'three';
import { MARK, MARK_CENTER, ICON_RING } from '../brand.js';

const [MX, MY] = MARK_CENTER;

function markShape() {
  return new THREE.Shape(MARK.map(([x, y]) => new THREE.Vector2(x - MX, y - MY)));
}

/** Evenly spaced points along a closed polyline. */
function samplePerimeter(pts, n) {
  const segs = [];
  let total = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    segs.push([a, b, l]); total += l;
  }
  const out = [];
  for (let k = 0; k < n; k++) {
    let d = (k / n) * total;
    for (const [a, b, l] of segs) {
      if (d <= l) { const t = d / l; out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); break; }
      d -= l;
    }
  }
  return out;
}

export function makeLogo3D() {
  const group = new THREE.Group();
  const R = ICON_RING.r - ICON_RING.w / 2;

  // Disc — the black badge from the official logo.
  const discMat = new THREE.MeshPhysicalMaterial({ color: 0x050505, metalness: 0.5, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.12, transparent: true });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.35, R + 0.35, 0.5, 128, 1), discMat);
  disc.rotation.x = Math.PI / 2;
  disc.position.z = -0.75;
  group.add(disc);

  // Chrome ring, drawn along its path (drawRange sweeps it in).
  const chrome = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.06, envMapIntensity: 1.4, clearcoat: 1, clearcoatRoughness: 0.05, transparent: true });
  const circle = new THREE.EllipseCurve(0, 0, R, R, Math.PI / 2, Math.PI / 2 + Math.PI * 2, false);
  const path3 = new THREE.CatmullRomCurve3(circle.getPoints(240).map((p) => new THREE.Vector3(p.x, p.y, 0)), true);
  const ringGeo = new THREE.TubeGeometry(path3, 360, 0.14, 20, true);
  const ring = new THREE.Mesh(ringGeo, chrome);
  group.add(ring);
  const ringCount = ringGeo.index.count;

  // Extruded mark.
  const markGeo = new THREE.ExtrudeGeometry(markShape(), {
    depth: 0.7, bevelEnabled: true, bevelThickness: 0.16, bevelSize: 0.08, bevelSegments: 10, curveSegments: 32,
  });
  markGeo.translate(0, 0, -0.35);
  markGeo.computeVertexNormals();
  // Mark: glossy white, like the white mark on the official black badge.
  const markMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.05, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.04, sheen: 0.4, transparent: true });
  const mark = new THREE.Mesh(markGeo, markMat);
  const markPivot = new THREE.Group();
  markPivot.add(mark);
  group.add(markPivot);

  // Particle cloud — each particle has a random start and a target on the logo.
  const outline = samplePerimeter(MARK.map(([x, y]) => [x - MX, y - MY]), 1400);
  const ringPts = Array.from({ length: 700 }, (_, i) => {
    const a = (i / 700) * Math.PI * 2;
    return [Math.cos(a) * R, Math.sin(a) * R];
  });
  const targets = [...outline, ...ringPts];
  const N = targets.length;
  const start = new Float32Array(N * 3), end = new Float32Array(N * 3), pos = new Float32Array(N * 3), seed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const u = Math.random(), v = Math.random();
    const th = u * Math.PI * 2, ph = Math.acos(2 * v - 1), r = 9 + Math.random() * 16;
    start[i * 3] = r * Math.sin(ph) * Math.cos(th);
    start[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    start[i * 3 + 2] = r * Math.cos(ph) - 4;
    end[i * 3] = targets[i][0];
    end[i * 3 + 1] = targets[i][1];
    end[i * 3 + 2] = (Math.random() - 0.5) * 0.3 + 0.45;
    seed[i] = Math.random();
  }
  pos.set(start);
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const sprite = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'); const rg = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(0.3, 'rgba(255,255,255,.6)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = rg; g.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); return t;
  })();
  const pMat = new THREE.PointsMaterial({ size: 0.09, map: sprite, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffffff, opacity: 0.95 });
  const points = new THREE.Points(pGeo, pMat);
  group.add(points);

  // A moving light that sweeps a glint across the chrome.
  const sweep = new THREE.PointLight(0xffffff, 0, 14, 1.6);
  sweep.position.set(-8, 2, 3);
  group.add(sweep);

  // Animation state (tweened by GSAP from the page).
  const state = {
    gather: 0,     // 0 = particles scattered, 1 = on the logo
    sparkle: 1,    // particle opacity
    ring: 0,       // 0..1 ring drawn
    mark: 0,       // 0..1 mark arrived
    disc: 0,       // 0..1 disc visible
    sweepX: -8, sweepI: 0,
    opacity: 1,
  };

  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const update = (time) => {
    // particles
    for (let i = 0; i < N; i++) {
      const d = seed[i] * 0.35;
      const t = ease(Math.min(1, Math.max(0, (state.gather - d) / (1 - d))));
      const wob = (1 - t) * 0.6;
      pos[i * 3] = start[i * 3] + (end[i * 3] - start[i * 3]) * t + Math.sin(time * 1.3 + i) * wob;
      pos[i * 3 + 1] = start[i * 3 + 1] + (end[i * 3 + 1] - start[i * 3 + 1]) * t + Math.cos(time * 1.1 + i * 0.7) * wob;
      pos[i * 3 + 2] = start[i * 3 + 2] + (end[i * 3 + 2] - start[i * 3 + 2]) * t;
    }
    pGeo.attributes.position.needsUpdate = true;
    pMat.opacity = state.sparkle * state.opacity * (0.75 + 0.25 * Math.sin(time * 6));
    points.visible = pMat.opacity > 0.01;

    ringGeo.setDrawRange(0, Math.floor(ringCount * state.ring / 3) * 3);
    ring.visible = state.ring > 0.001;
    chrome.opacity = state.opacity;

    const m = state.mark;
    markPivot.visible = m > 0.001;
    markPivot.position.z = (1 - m) * -9;
    markPivot.rotation.y = (1 - m) * -Math.PI * 1.25;
    markPivot.scale.set(0.6 + 0.4 * m, 0.6 + 0.4 * m, Math.max(0.01, m));
    markMat.opacity = Math.min(1, m * 2) * state.opacity;

    disc.visible = state.disc > 0.001;
    disc.scale.setScalar(0.85 + 0.15 * state.disc);
    discMat.opacity = state.disc * state.opacity;

    sweep.position.x = state.sweepX;
    sweep.intensity = state.sweepI;
  };
  update(0);

  group.userData = { state, update };
  return group;
}
