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
  // Round sprite so points are soft dots, never square; size is fixed
  // (no attenuation) so a star drifting near the camera can't blow up.
  const starTexture = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.35, 'rgba(255,255,255,0.7)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();

  function makeStarLayer(count, spread, size, color) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < positions.length; i++) {
      positions[i] = THREE.MathUtils.randFloatSpread(spread);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color,
      size,
      map: starTexture,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);
    return points;
  }
  // sizes are now in screen pixels (attenuation off)
  const starsNear = makeStarLayer(900, 140, 3.6, 0xffffff);
  const starsFar = makeStarLayer(1400, 240, 2.2, 0xffffff);

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
    new THREE.MeshBasicMaterial({ color: 0x2ee6c5, transparent: true, opacity: 0.55 })
  );
  planetRing.rotation.x = Math.PI / 2.3;
  planet.add(planetBody, planetRing);
  planet.position.set(-45, 5, -9);
  scene.add(planet);

  // ---- Spaceship: a holographic "blueprint" cruiser ----
  // Dark faceted hull wrapped in glowing cyan wireframe = architecture
  // schematic meets technology. Crosses left -> right on a loop, nose-first.
  // Shared so the theme switcher can recolor the ship's blueprint lines.
  const shipEdgeMat = new THREE.LineBasicMaterial({ color: 0x2ee6c5, transparent: true, opacity: 0.9 });

  function makeShip() {
    const ship = new THREE.Group();
    // Blueprint look: crisp edge lines over a faint translucent hull.
    const edgeMat = shipEdgeMat;
    const hullMat = new THREE.MeshBasicMaterial({ color: 0x06141c, transparent: true, opacity: 0.5 });

    // Add a part as faint hull + bright wireframe edges, sharing one transform.
    function part(geo, t) {
      t = t || {};
      const fill = new THREE.Mesh(geo, hullMat);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat);
      [fill, edges].forEach((o) => {
        o.rotation.set(t.rx || 0, t.ry || 0, t.rz || 0);
        o.position.set(t.x || 0, t.y || 0, t.z || 0);
      });
      ship.add(fill, edges);
    }

    part(new THREE.CylinderGeometry(0.45, 0.7, 3, 14), { rz: -Math.PI / 2 });        // fuselage
    part(new THREE.ConeGeometry(0.5, 1.6, 14), { rz: -Math.PI / 2, x: 2.2 });        // nose
    part(new THREE.BoxGeometry(1.7, 0.12, 3), { x: -0.3 });                           // wings
    part(new THREE.BoxGeometry(1, 0.9, 0.12), { x: -1.3, y: 0.5 });                   // dorsal fin

    // Red engine: bright core + soft halo at the tail (-x)
    const engine = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xff3b30 })
    );
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(0.78, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xff5a3c, transparent: true, opacity: 0.35 })
    );
    engine.position.x = halo.position.x = -1.95;
    ship.add(engine, halo);

    ship.scale.setScalar(2);
    return ship;
  }
  const ship = makeShip();
  scene.add(ship);

  const SHIP = { startX: -75, endX: 75, y: 14, z: -9, cycle: 19 }; // seconds per crossing

  // ---- Theme-aware colors (dark glow vs light blueprint-ink) ----
  const SCENE_THEME = {
    dark:  { star: 0xffffff, ship: 0x2ee6c5, ring: 0x2ee6c5 },
    light: { star: 0x0e6b78, ship: 0x0c6b61, ring: 0x0d9488 },
  };
  function applySceneTheme(name) {
    const c = SCENE_THEME[name] || SCENE_THEME.dark;
    starsNear.material.color.set(c.star);
    starsFar.material.color.set(c.star);
    shipEdgeMat.color.set(c.ship);
    planetRing.material.color.set(c.ring);
  }
  applySceneTheme(document.documentElement.getAttribute('data-theme') || 'dark');

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

    // spaceship crossing: left -> right, then loops
    const t = (elapsed % SHIP.cycle) / SHIP.cycle;
    ship.position.x = SHIP.startX + (SHIP.endX - SHIP.startX) * t;
    ship.position.y = SHIP.y + Math.sin(elapsed * 0.9) * 0.7 - scrollY * 0.012;
    ship.position.z = SHIP.z;
    ship.rotation.z = -0.12;            // slight bank
    ship.rotation.y = Math.sin(elapsed * 0.5) * 0.06;

    renderer.render(scene, camera);
  }

  if (reduceMotion) {
    // Accessible: draw one static frame, no animation loop.
    renderFrame(0);
    window.addEventListener('scroll', () => renderFrame(0), { passive: true });
    window.addEventListener('themechange', (e) => { applySceneTheme(e.detail); renderFrame(0); });
    return;
  }

  // Live recolor when the user toggles the theme
  window.addEventListener('themechange', (e) => applySceneTheme(e.detail));

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
