import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';

// ============================================================
//  Samuel Martinez - Portfolio
//  Section 4: Three.js scene
//  Two-layer parallax starfield + orbiting planet + profile panel
//  Guards: WebGL detection, reduced-motion, pause when tab hidden
// ============================================================

const canvas = document.querySelector('#bg');

// ---- WebGL support guard: fall back to a static gradient ----
function webglAvailable() {
  try {
    const test = document.createElement('canvas');
    return !!(window.WebGLRenderingContext &&
      (test.getContext('webgl') || test.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

if (!webglAvailable()) {
  document.body.classList.add('no-webgl');
} else {
  initScene();
}

function initScene() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 30);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // ---- Lighting ----
  const pointLight = new THREE.PointLight(0xffffff, 1.1);
  pointLight.position.set(20, 18, 20);
  scene.add(pointLight, new THREE.AmbientLight(0x6699ff, 0.45));

  // ---- Two-layer starfield (parallax depth) ----
  function makeStarLayer(count, spread, size, color) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < positions.length; i++) {
      positions[i] = THREE.MathUtils.randFloatSpread(spread);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color, size, sizeAttenuation: true, transparent: true, opacity: 0.9 });
    const points = new THREE.Points(geo, mat);
    scene.add(points);
    return points;
  }
  const starsNear = makeStarLayer(900, 140, 0.65, 0xffffff);
  const starsFar = makeStarLayer(1400, 240, 0.4, 0xb9a7ff);

  // ---- Orbiting planet (upper-right margin) ----
  const planet = new THREE.Group();
  const planetBody = new THREE.Mesh(
    new THREE.SphereGeometry(5, 48, 48),
    new THREE.MeshStandardMaterial({
      color: 0x1e6fb0,
      emissive: 0x06243f,
      roughness: 0.55,
      metalness: 0.25,
    })
  );
  const planetRing = new THREE.Mesh(
    new THREE.TorusGeometry(8, 0.35, 16, 120),
    new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.55 })
  );
  planetRing.rotation.x = Math.PI / 2.3;
  planet.add(planetBody, planetRing);
  planet.position.set(-45, 5, -9);
  scene.add(planet);

  // ---- Scroll parallax ----
  let scrollY = window.scrollY;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  // ---- Resize ----
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ---- Render ----
  function renderFrame(elapsed) {
    // gentle planet rotation + orbit drift
    planet.rotation.y = elapsed * 0.15;
    planetBody.rotation.y = elapsed * 0.2;
    planet.position.y = 5 - scrollY * 0.01;

    // starfield parallax: layers drift at different rates
    starsNear.rotation.y = elapsed * 0.01;
    starsNear.position.y = scrollY * 0.004;
    starsFar.rotation.y = elapsed * 0.004;
    starsFar.position.y = scrollY * 0.0015;

    renderer.render(scene, camera);
  }

  if (reduceMotion) {
    // Accessible: draw one static frame, no animation loop.
    renderFrame(0);
    window.addEventListener('scroll', () => renderFrame(0), { passive: true });
    return;
  }

  const clock = new THREE.Clock();
  let running = true;

  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);
    renderFrame(clock.getElapsedTime());
  }

  // Pause rendering when the tab is hidden (saves CPU/GPU/battery)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
    } else if (!running) {
      running = true;
      clock.start();
      animate();
    }
  });

  animate();
}
