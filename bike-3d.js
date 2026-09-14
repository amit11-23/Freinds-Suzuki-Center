/**
 * FRIENDS SUZUKI CENTER — 3D INTERACTIVE BIKE STUDIO
 * Powered by Three.js WebGL (with resilient Blueprint fallback)
 * 
 * Features:
 * - 360° Orbit Controls (drag, rotate, zoom)
 * - Procedural high-detail Suzuki motorcycle with metallic engine, alloy wheels, disc brakes & blue tank
 * - Interactive 3D Hotspot Pins (Engine, Brakes, Tyres, Electrical/Battery, Oil/Exhaust)
 * - Cinematic camera transition to inspected components
 * - Synchronized diagnostic inspector panel with real-time specs & direct booking
 */

(function () {
  'use strict';

  // Part Diagnostic Data
  const PART_DATA = {
    engine: {
      title: 'Engine Service & Tuning',
      badge: 'CRITICAL DIAGNOSTIC',
      icon: 'fa-solid fa-bolt-lightning',
      desc: 'Comprehensive Suzuki 4-stroke & FI engine diagnostic. Covers valve clearance calibration, carburettor/fuel injector ultrasonic cleaning, spark plug inspection, compression check, and idle RPM tuning to restore peak power and factory fuel mileage.',
      checks: '14-Point Engine & Timing Inspection',
      time: '~90 - 120 Minutes',
      price: 'Starting ₹499*',
      warranty: '30-Day Performance Guarantee',
      tip: 'Regular valve tuning every 4,000 km keeps the engine smooth, runs cooler, and prevents overheating.',
      cameraPos: { x: 1.2, y: 0.4, z: 1.4 },
      target: { x: 0, y: 0, z: 0 }
    },
    brakes: {
      title: 'Disc & Drum Brake Overhaul',
      badge: 'SAFETY ESSENTIAL',
      icon: 'fa-solid fa-circle-stop',
      desc: 'Front disc rotor cleaning, hydraulic brake bleeding with DOT4 fluid, brake pad wear measurement, caliper piston seal inspection, and rear drum shoe re-lining with Combined Braking System (CBS) balance calibration.',
      checks: 'Hydraulic Bleed, Rotor Truing & Pad Check',
      time: '~45 - 60 Minutes',
      price: 'Starting ₹199*',
      warranty: 'Free Checkup Within 15 Days',
      tip: 'Worn brake pads create deep grooves on costly disc rotors. Replace pads before they drop below 2mm thickness.',
      cameraPos: { x: 2.2, y: 0.2, z: 1.2 },
      target: { x: 1.4, y: -0.2, z: 0 }
    },
    tyres: {
      title: 'Tyre, Wheel & Rim Balancing',
      badge: 'STABILITY & MILEAGE',
      icon: 'fa-solid fa-ring',
      desc: 'Tread depth wear analysis, tubeless puncture vulcanization, rim bend straightening, spoke tensioning, high-precision wheel balancing, and high-purity nitrogen inflation for optimal road grip and wet cornering safety.',
      checks: 'Rim Truing, Pressure & Tread Analysis',
      time: '~30 - 45 Minutes',
      price: 'Starting ₹149*',
      warranty: '100% Leak-Proof Guarantee',
      tip: 'Maintaining 32 PSI rear and 29 PSI front tyre pressure increases your bike’s fuel average by up to 10%.',
      cameraPos: { x: 2.3, y: -0.2, z: 0.9 },
      target: { x: 1.35, y: -0.4, z: 0 }
    },
    battery: {
      title: 'Electrical & Battery Diagnostics',
      badge: 'TECH INSPECTION',
      icon: 'fa-solid fa-car-battery',
      desc: 'Digital multimeter battery cranking test, self-starter carbon brush inspection, starter relay check, RR unit (rectifier-regulator) output check, wiring harness de-oxidation, and EFI sensor fault clearing.',
      checks: 'Battery Health, Alternator & Self-Start Test',
      time: '~30 - 60 Minutes',
      price: 'Starting ₹249*',
      warranty: 'Genuine Suzuki Electrical Spares',
      tip: 'If your self-starter clicks weakly in morning cold starts, get your battery tested immediately to avoid sudden stranding.',
      cameraPos: { x: 0.2, y: 0.9, z: 1.6 },
      target: { x: -0.2, y: 0.35, z: 0 }
    },
    exhaust: {
      title: 'Oil Change & Exhaust Tuning',
      badge: 'LUBRICATION CARE',
      icon: 'fa-solid fa-oil-can',
      desc: 'Full oil drain, magnetic sump plug sludge removal, fresh OEM Suzuki Ecstar 10W40 synthetic oil refill, genuine filter replacement, exhaust silencer carbon cleanout, and drive chain cleaning & lubrication.',
      checks: '100% Synthetic Suzuki Oil + Filter + Chain Lube',
      time: '~25 - 35 Minutes',
      price: 'Starting ₹399*',
      warranty: 'Genuine Suzuki Ecstar Certified',
      tip: 'Changing engine oil every 2,500 - 3,000 km is the single most vital habit to guarantee your engine lasts over 1,00,000 km.',
      cameraPos: { x: -1.3, y: 0.3, z: 1.6 },
      target: { x: -0.6, y: -0.2, z: 0 }
    }
  };

  let scene, camera, renderer, controls;
  let bikeGroup;
  const hotspotMeshes = [];
  let isTransitioning = false;
  let transitionProgress = 0;
  let startCamPos = { x: 0, y: 0, z: 0 };
  let startTargetPos = { x: 0, y: 0, z: 0 };
  let endCamPos = { x: 0, y: 0, z: 0 };
  let endTargetPos = { x: 0, y: 0, z: 0 };

  function init3DStudio() {
    const container = document.getElementById('canvas-3d-container');
    const canvas = document.getElementById('three-bike-canvas');
    if (!container || !canvas) return;

    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
      renderFallbackBlueprint(canvas, container);
      setupTabs();
      return;
    }

    try {
      const width = container.clientWidth || 700;
      const height = container.clientHeight || 500;

      // 1. Scene Setup
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0f19);
      scene.fog = new THREE.FogExp2(0x0a0f19, 0.08);

      // 2. Camera Setup
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(2.8, 1.4, 2.8);

      // 3. Renderer Setup
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // 4. Orbit Controls (if available)
      if (typeof THREE.OrbitControls !== 'undefined') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxPolarAngle = Math.PI / 2 + 0.05;
        controls.minDistance = 1.6;
        controls.maxDistance = 5.5;
        controls.target.set(0, 0, 0);
      }

      // 5. Lighting
      setupLighting();

      // 6. Build High-Detail 3D Motorcycle
      bikeGroup = new THREE.Group();
      buildMotorcycle(bikeGroup);
      scene.add(bikeGroup);

      // 7. Add Interactive 3D Hotspot Pins
      createHotspots();

      // 8. Ground Platform
      createPlatform();

      // 9. Interaction Listeners
      setupRaycasting(canvas);
      setupTabs();

      // 10. Animation Loop
      animate();

      // 11. Window Resize
      window.addEventListener('resize', () => {
        if (!container || !camera || !renderer) return;
        const nw = container.clientWidth;
        const nh = container.clientHeight;
        if (nw > 0 && nh > 0) {
          camera.aspect = nw / nh;
          camera.updateProjectionMatrix();
          renderer.setSize(nw, nh);
        }
      });
    } catch (err) {
      console.warn('3D initialization fallback:', err);
      renderFallbackBlueprint(canvas, container);
      setupTabs();
    }
  }

  function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x2a3b5c, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(4, 6, 4);
    scene.add(keyLight);

    const blueRim = new THREE.DirectionalLight(0x0066ff, 2.5);
    blueRim.position.set(-4, 3, -3);
    scene.add(blueRim);

    const redRim = new THREE.PointLight(0xe60012, 2.0, 8);
    redRim.position.set(0, 1.5, -3);
    scene.add(redRim);
  }

  function createPlatform() {
    const discGeo = new THREE.CylinderGeometry(2.3, 2.35, 0.08, 48);
    const discMat = new THREE.MeshStandardMaterial({ color: 0x111928, roughness: 0.4, metalness: 0.8 });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.position.y = -0.82;
    scene.add(disc);

    const ringGeo = new THREE.RingGeometry(2.1, 2.15, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x0066ff, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.77;
    scene.add(ring);
  }

  function buildMotorcycle(parent) {
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.85, metalness: 0.1 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.15, metalness: 0.95 });
    const suzukiBlueMat = new THREE.MeshStandardMaterial({ color: 0x0047ba, roughness: 0.25, metalness: 0.75 });
    const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x242e42, roughness: 0.45, metalness: 0.8 });
    const redBrakeMat = new THREE.MeshStandardMaterial({ color: 0xe60012, roughness: 0.3, metalness: 0.6 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffb703, roughness: 0.2, metalness: 0.9 });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x11141a, roughness: 0.9, metalness: 0.05 });
    const lightLensMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, emissive: 0x60a5fa, emissiveIntensity: 0.7 });

    // Front Wheel
    const frontWheel = new THREE.Group();
    frontWheel.position.set(1.4, -0.2, 0);
    const frontTire = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.12, 20, 48), tireMat);
    frontWheel.add(frontTire);
    const frontHub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.18, 24), darkMetalMat);
    frontHub.rotation.x = Math.PI / 2;
    frontWheel.add(frontHub);

    for (let i = 0; i < 5; i++) {
      const angle = (i * (Math.PI * 2)) / 5;
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.48, 0.03), suzukiBlueMat);
      spoke.position.set(Math.cos(angle) * 0.25, Math.sin(angle) * 0.25, 0);
      spoke.rotation.z = angle + Math.PI / 2;
      frontWheel.add(spoke);
    }
    const discBrake = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.4, 32), chromeMat);
    discBrake.position.z = 0.08;
    frontWheel.add(discBrake);
    const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.1), redBrakeMat);
    caliper.position.set(0.26, 0.2, 0.08);
    frontWheel.add(caliper);
    parent.add(frontWheel);

    // Rear Wheel
    const rearWheel = new THREE.Group();
    rearWheel.position.set(-1.4, -0.2, 0);
    const rearTire = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.15, 20, 48), tireMat);
    rearWheel.add(rearTire);
    const rearHub = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.22, 24), darkMetalMat);
    rearHub.rotation.x = Math.PI / 2;
    rearWheel.add(rearHub);

    for (let i = 0; i < 5; i++) {
      const angle = (i * (Math.PI * 2)) / 5;
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.46, 0.04), suzukiBlueMat);
      spoke.position.set(Math.cos(angle) * 0.24, Math.sin(angle) * 0.24, 0);
      spoke.rotation.z = angle + Math.PI / 2;
      rearWheel.add(spoke);
    }
    const rearDisc = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.35, 32), chromeMat);
    rearDisc.position.z = -0.1;
    rearWheel.add(rearDisc);
    parent.add(rearWheel);

    // Front Forks & Handlebars
    const forkGroup = new THREE.Group();
    forkGroup.position.set(1.4, -0.2, 0);
    const forkL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.1, 16), goldMat);
    forkL.position.set(-0.25, 0.5, 0.12);
    forkL.rotation.z = -0.42;
    forkGroup.add(forkL);
    const forkR = forkL.clone();
    forkR.position.z = -0.12;
    forkGroup.add(forkR);

    const handlebar = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.72, 16), chromeMat);
    handlebar.rotation.x = Math.PI / 2;
    handlebar.position.set(-0.46, 1.02, 0);
    forkGroup.add(handlebar);

    const headlight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.16), lightLensMat);
    headlight.position.set(-0.2, 0.9, 0);
    forkGroup.add(headlight);
    parent.add(forkGroup);

    // Frame & Engine
    const frameBar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.28), darkMetalMat);
    frameBar.position.set(0.35, 0.4, 0);
    frameBar.rotation.z = -0.45;
    parent.add(frameBar);

    const engineGroup = new THREE.Group();
    engineGroup.position.set(0, -0.05, 0);
    const crankcase = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.32, 24), chromeMat);
    crankcase.rotation.x = Math.PI / 2;
    engineGroup.add(crankcase);

    for (let f = 0; f < 5; f++) {
      const fin = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.015, 16), chromeMat);
      fin.position.set(0.06 + f * 0.02, 0.12 + f * 0.06, 0);
      fin.rotation.z = -0.35;
      engineGroup.add(fin);
    }
    const sparkPlug = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.12, 8), redBrakeMat);
    sparkPlug.position.set(0.2, 0.44, 0);
    engineGroup.add(sparkPlug);
    parent.add(engineGroup);

    // Fuel Tank & Seat
    const tankGeo = new THREE.SphereGeometry(0.42, 24, 20);
    tankGeo.scale(1.4, 0.75, 0.7);
    const tank = new THREE.Mesh(tankGeo, suzukiBlueMat);
    tank.position.set(0.25, 0.58, 0);
    parent.add(tank);

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.12, 0.24), seatMat);
    seat.position.set(-0.4, 0.52, 0);
    seat.rotation.z = 0.08;
    parent.add(seat);

    // Muffler Exhaust
    const muffler = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.65, 16), chromeMat);
    muffler.position.set(-0.95, -0.2, 0.26);
    muffler.rotation.z = 1.45;
    parent.add(muffler);
  }

  function createHotspots() {
    const pinConfigs = [
      { key: 'engine', pos: [0.08, 0.12, 0.35], color: 0x0066ff },
      { key: 'brakes', pos: [1.4, -0.1, 0.3], color: 0xe60012 },
      { key: 'tyres', pos: [1.38, -0.48, 0.22], color: 0x00f0ff },
      { key: 'battery', pos: [-0.25, 0.42, 0.25], color: 0xffb703 },
      { key: 'exhaust', pos: [-0.85, -0.18, 0.35], color: 0x25d366 }
    ];

    pinConfigs.forEach((cfg) => {
      const pinGroup = new THREE.Group();
      pinGroup.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);

      const haloGeo = new THREE.RingGeometry(0.07, 0.09, 24);
      const haloMat = new THREE.MeshBasicMaterial({ color: cfg.color, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      pinGroup.add(halo);

      const sphereGeo = new THREE.SphereGeometry(0.045, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      pinGroup.add(sphere);

      pinGroup.userData = { key: cfg.key, halo: halo };
      scene.add(pinGroup);
      hotspotMeshes.push(pinGroup);
    });
  }

  function setupRaycasting(canvas) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    canvas.addEventListener('click', (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const interactive = [];
      hotspotMeshes.forEach((pin) => {
        pin.traverse((c) => {
          if (c.isMesh) {
            c.userData.parentPin = pin;
            interactive.push(c);
          }
        });
      });

      const hits = raycaster.intersectObjects(interactive, false);
      if (hits.length > 0) {
        const pin = hits[0].object.userData.parentPin;
        if (pin && pin.userData.key) {
          selectPart(pin.userData.key);
        }
      }
    });
  }

  function selectPart(partKey) {
    const data = PART_DATA[partKey];
    if (!data) return;

    // Update Part Selector Tabs
    document.querySelectorAll('.part-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.part === partKey);
    });

    // Update Inspector Side Panel
    const title = document.getElementById('inspector-title');
    const badge = document.getElementById('inspector-badge');
    const desc = document.getElementById('inspector-desc');
    const checks = document.getElementById('inspector-checks');
    const time = document.getElementById('inspector-time');
    const price = document.getElementById('inspector-price');
    const warranty = document.getElementById('inspector-warranty');
    const icon = document.getElementById('inspector-icon');
    const waBtn = document.getElementById('inspector-wa-btn');
    const bookBtn = document.getElementById('inspector-book-btn');

    if (title) title.textContent = data.title;
    if (badge) badge.textContent = data.badge;
    if (desc) desc.textContent = data.desc;
    if (checks) checks.textContent = data.checks;
    if (time) time.textContent = data.time;
    if (price) price.textContent = data.price;
    if (warranty) warranty.textContent = data.warranty;
    if (icon) icon.innerHTML = `<i class="${data.icon}"></i>`;

    if (waBtn) {
      const msg = encodeURIComponent(`Hello Friends Suzuki Center, I would like to inquire about ${data.title} at 35F Block, Sri Ganganagar.`);
      waBtn.href = `https://wa.me/919887598016?text=${msg}`;
    }

    if (bookBtn) {
      bookBtn.dataset.service = data.title;
    }

    // Camera Pan
    if (controls && camera) {
      startCamPos = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
      startTargetPos = { x: controls.target.x, y: controls.target.y, z: controls.target.z };
      endCamPos = { ...data.cameraPos };
      endTargetPos = { ...data.target };
      transitionProgress = 0;
      isTransitioning = true;
    }
  }

  function setupTabs() {
    document.querySelectorAll('.part-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const part = btn.dataset.part;
        if (part) selectPart(part);
      });
    });

    const btnReset = document.getElementById('btn-reset-camera');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (!controls || !camera) return;
        startCamPos = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
        startTargetPos = { x: controls.target.x, y: controls.target.y, z: controls.target.z };
        endCamPos = { x: 2.8, y: 1.4, z: 2.8 };
        endTargetPos = { x: 0, y: 0, z: 0 };
        transitionProgress = 0;
        isTransitioning = true;
      });
    }
  }

  function animate() {
    requestAnimationFrame(animate);

    const time = performance.now() * 0.003;
    hotspotMeshes.forEach((pin, idx) => {
      const scale = 1 + Math.sin(time + idx * 1.5) * 0.22;
      pin.userData.halo.scale.set(scale, scale, scale);
      pin.quaternion.copy(camera.quaternion);
    });

    if (isTransitioning) {
      transitionProgress += 0.04;
      if (transitionProgress >= 1) {
        transitionProgress = 1;
        isTransitioning = false;
      }
      const t = 1 - Math.pow(1 - transitionProgress, 3);
      camera.position.x = startCamPos.x + (endCamPos.x - startCamPos.x) * t;
      camera.position.y = startCamPos.y + (endCamPos.y - startCamPos.y) * t;
      camera.position.z = startCamPos.z + (endCamPos.z - startCamPos.z) * t;
      controls.target.x = startTargetPos.x + (endTargetPos.x - startTargetPos.x) * t;
      controls.target.y = startTargetPos.y + (endTargetPos.y - startTargetPos.y) * t;
      controls.target.z = startTargetPos.z + (endTargetPos.z - startTargetPos.z) * t;
    }

    if (controls) controls.update();
    if (renderer && scene && camera) renderer.render(scene, camera);
  }

  // Fallback 2D Blueprint when Three.js isn't loaded
  function renderFallbackBlueprint(canvas, container) {
    const ctx = canvas.getContext('2d');
    const w = (canvas.width = container.clientWidth || 700);
    const h = (canvas.height = container.clientHeight || 500);

    ctx.fillStyle = '#0a0f19';
    ctx.fillRect(0, 0, w, h);

    // Draw blueprint grid
    ctx.strokeStyle = 'rgba(0, 102, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Centered Bike Graphic
    ctx.fillStyle = '#0066FF';
    ctx.font = 'bold 18px Chakra Petch, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏍️ SUZUKI INTERACTIVE DIAGNOSTIC STUDIO', w / 2, 60);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '14px Plus Jakarta Sans, sans-serif';
    ctx.fillText('Click any component button above (Engine, Brakes, Tyres, Electricals, Oil)', w / 2, 90);
    ctx.fillText('to inspect workshop procedures, time estimates, and pricing.', w / 2, 115);

    // Interactive Blueprint Hotspot circles
    const hotspots = [
      { key: 'engine', x: w / 2, y: h / 2 + 10, label: 'ENGINE BLOCK' },
      { key: 'brakes', x: w / 2 + 180, y: h / 2 + 30, label: 'DISC BRAKES' },
      { key: 'tyres', x: w / 2 + 200, y: h / 2 + 100, label: 'TYRES & RIMS' },
      { key: 'battery', x: w / 2 - 60, y: h / 2 - 40, label: 'BATTERY / ELECTRICALS' },
      { key: 'exhaust', x: w / 2 - 170, y: h / 2 + 70, label: 'OIL & EXHAUST' }
    ];

    hotspots.forEach((spot) => {
      ctx.beginPath();
      ctx.arc(spot.x, spot.y, 24, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 102, 255, 0.2)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#0066FF';
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px Chakra Petch, sans-serif';
      ctx.fillText(spot.label, spot.x, spot.y + 38);
    });

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      hotspots.forEach((spot) => {
        if (Math.hypot(cx - spot.x, cy - spot.y) < 35) {
          selectPart(spot.key);
        }
      });
    });
  }

  window.selectBikePart = selectPart;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init3DStudio);
  } else {
    init3DStudio();
  }
})();
