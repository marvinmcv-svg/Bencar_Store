// Shared three.js stage: renderer, studio lighting, resize and visibility-aware loop.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}

export function createStage(container, { fov = 30, z = 10, alpha = true, exposure = 1.05 } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = exposure;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 200);
  camera.position.set(0, 0, z);

  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(4, 6, 6);
  const rim = new THREE.DirectionalLight(0x9cc3ff, 2.4); rim.position.set(-6, 2, -4);
  scene.add(key, rim, new THREE.AmbientLight(0xffffff, 0.25));

  const tickers = new Set();
  let visible = true, raf = 0;
  const clock = new THREE.Clock();

  const resize = () => {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize); ro.observe(container); resize();

  const loop = () => {
    raf = requestAnimationFrame(loop);
    if (!visible) return;
    const t = clock.getElapsedTime();
    tickers.forEach((fn) => fn(t));
    renderer.render(scene, camera);
  };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '100px' }).observe(container);
  loop();

  return {
    THREE, renderer, scene, camera,
    onTick: (fn) => tickers.add(fn),
    dispose: () => { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); },
  };
}

/** Flowing line "waves" — echoes the wave motif of the Bencar catalogue. */
export function makeWaves(THREE_, { lines = 46, points = 160, width = 26, color = 0x9fc1ff, opacity = 0.32 } = {}) {
  const group = new THREE.Group();
  const mats = [];
  for (let i = 0; i < lines; i++) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(points * 3), 3));
    const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity: opacity * (0.35 + 0.65 * Math.sin((i / lines) * Math.PI)) });
    mats.push(m);
    group.add(new THREE.Line(geo, m));
  }
  group.userData.update = (t, amp = 1) => {
    group.children.forEach((line, i) => {
      const arr = line.geometry.attributes.position.array;
      const k = i / lines;
      for (let p = 0; p < points; p++) {
        const u = p / (points - 1);
        const x = (u - 0.5) * width;
        const env = Math.sin(u * Math.PI);
        const y = amp * env * (Math.sin(u * 6.0 + t * 0.6 + k * 2.4) * 1.2 + Math.sin(u * 13.0 - t * 0.4 + k * 5.0) * 0.35) + (k - 0.5) * 1.6;
        const z = Math.cos(u * 4.0 + t * 0.3 + k * 3.0) * 1.4 * env;
        arr[p * 3] = x; arr[p * 3 + 1] = y; arr[p * 3 + 2] = z;
      }
      line.geometry.attributes.position.needsUpdate = true;
    });
  };
  group.userData.setOpacity = (f) => mats.forEach((m, i) => { m.opacity = opacity * f * (0.35 + 0.65 * Math.sin((i / lines) * Math.PI)); });
  return group;
}
