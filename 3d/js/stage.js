// ExoClass × Singapore · 3D stage (three@0.160.0, ES module).
// Story driven by scroll: 8 scattered tools -> 8 arms each pick up one admin job -> one system.
// Lazy: three.js loads after first paint + idle. Paused off-screen. Reduced motion / no WebGL -> still images.
const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';

const stage = document.getElementById('stage');
const canvas = document.getElementById('stageCanvas');
const still = document.getElementById('stageStill');
const tip = document.getElementById('stageTip');
const stepsEl = document.getElementById('steps');
const steps = Array.prototype.slice.call(document.querySelectorAll('.step'));
const Q = new URLSearchParams(location.search);
const STILL = Q.get('still'); // QA only: '0' scattered or '1' docked, renders one frame
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const track = (n, p) => { if (window.exoTrack) window.exoTrack(n, p); };
const STILLS = ['img/stage-still-0.webp', 'img/stage-still-1.webp'];

// 8 jobs. Each "today" tool on the front of a card, the ExoClass job on the back.
const JOBS = [
  { job: 'Registration', old: 'Paper forms', i: 'form', o: 'form', tip: 'Parents pick a group and sign up from your website. Spots update live.' },
  { job: 'Payments', old: 'Bank transfers', i: 'coin', o: 'coin', tip: 'Invoices go out on their own.' },
  { job: 'Reminders', old: 'Reminder texts', i: 'bell', o: 'phone', tip: "Payment reminders go out too, so you don't have to ask." },
  { job: 'Contracts', old: 'Printed contracts', i: 'pen', o: 'pen', tip: "Parents sign online. Every contract is stored with the child's record." },
  { job: 'Attendance', old: 'Sign-in sheet', i: 'check', o: 'form', tip: 'Coaches tick who came, on their phone, in seconds.' },
  { job: 'Schedule', old: 'Wall calendar', i: 'cal', o: 'cal', tip: 'Schedules sit in the parent portal, next to invoices and contracts.' },
  { job: 'Messages', old: 'Group chats', i: 'chat', o: 'chat', tip: 'Parents find answers in one place, so fewer questions reach you.' },
  { job: 'Reports', old: 'Spreadsheet', i: 'chart', o: 'grid', tip: 'Statistics and analytics, the way The Power of Sport uses them.' },
];
const ICONS = {
  form: 'M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8 8h8M8 12h8M8 16h5',
  coin: 'M21 12a9 9 0 1 1-18 0a9 9 0 1 1 18 0zM15 9.5c-.6-1-1.7-1.5-3-1.5-1.7 0-3 .9-3 2s1.3 1.7 3 2 3 .9 3 2-1.3 2-3 2c-1.3 0-2.4-.5-3-1.5M12 6v2M12 16v2',
  bell: 'M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 21h4',
  phone: 'M9 2h6a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 18h2',
  pen: 'M4 20h4L19 9l-4-4L4 16zM13 7l4 4',
  check: 'M5 12.5l4.5 4.5L19 7',
  cal: 'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM3 10h18M8 3v4M16 3v4',
  chat: 'M4 5h16v11H9l-5 4z',
  chart: 'M4 20h16M7 16v-5M12 16V7M17 16v-8',
  grid: 'M3 5h18v14H3zM3 10h18M3 15h18M9 5v14M15 5v14',
};

// ---------- scroll progress (also used without 3D) ----------
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
let P = 0;
function readProgress() {
  if (STILL !== null) { P = +STILL; return; }
  const r = stepsEl.getBoundingClientRect(), vh = innerHeight;
  P = clamp((vh * 0.62 - r.top) / Math.max(1, r.height - vh * 0.3), 0, 1);
}
let lastStep = -1, maxStep = -1;
function markSteps() {
  readProgress();
  const k = P < 0.3 ? 0 : P < 0.62 ? 1 : 2;
  if (k === lastStep) return;
  lastStep = k;
  steps.forEach((s, i) => s.classList.toggle('on', i === k));
  if (stage.classList.contains('no3d')) still.src = STILLS[k === 2 ? 1 : 0];
  if (k > maxStep) { maxStep = k; if (k > 0) track('engage', { what: 'stage_step', step: k }); }
}
addEventListener('scroll', markSteps, { passive: true });
addEventListener('resize', markSteps);

function hasGL() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); }
  catch (e) { return false; }
}
function fallback() { stage.classList.add('no3d'); stage.classList.remove('ready'); lastStep = -1; markSteps(); }

// 3D is desktop-only: phones (< 768 px) get the light still-image version, three.js never loads
const PHONE = innerWidth < 768 && STILL === null;
if (reduce || PHONE || !hasGL() || Q.get('no3d') === '1') {
  fallback();
} else {
  markSteps();
  // wait for the hero intro (about 1.5 s) so the 3D never competes with first paint or the headline
  const go = () => setTimeout(() => (window.requestIdleCallback ? requestIdleCallback(() => boot().catch(onFail), { timeout: 1500 }) : boot().catch(onFail)), STILL !== null ? 0 : 1500);
  if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
}
function onFail(e) { console.warn('[3d] fallback:', e && e.message); fallback(); }

// ---------- the scene ----------
async function boot() {
  const THREE = await import(THREE_URL);
  try { await Promise.race([document.fonts.load('800 60px "Plus Jakarta Sans"'), new Promise((r) => setTimeout(r, 1500))]); } catch (e) {}

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); fallback(); });

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xe6dff0, 2.0));
  const key = new THREE.DirectionalLight(0xffffff, 2.0); key.position.set(2.5, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fd0f2, 0.9); rim.position.set(-4, 1, -3); scene.add(rim);

  // one mascot: coral octopus sampled from the Eight arms film (frame at 25 s): head #FB7865, highlight #F69F83
  const CORAL = new THREE.Color('#FB7865'), CORAL_L = new THREE.Color('#F9A188'), CORAL_D = new THREE.Color('#EC6552');

  // octopus (same coral mascot as the Eight arms film): head gradient, eyes, 8 bead arms in one instanced draw call
  const oct = new THREE.Group(); scene.add(oct);
  const headGeo = new THREE.SphereGeometry(0.6, 48, 32);
  { const pos = headGeo.attributes.position, col = [], c = new THREE.Color();
    for (let k = 0; k < pos.count; k++) { const t = clamp((pos.getY(k) + 0.6) / 1.2, 0, 1); c.copy(CORAL_D).lerp(CORAL_L, sstep(0.05, 0.95, t)); col.push(c.r, c.g, c.b); }
    headGeo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); }
  const skin = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.42, metalness: 0 });
  const head = new THREE.Mesh(headGeo, skin); head.scale.set(1, 1.1, 0.95); head.position.y = 0.32; oct.add(head);
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 });
  const ink = new THREE.MeshStandardMaterial({ color: 0x2e2b33, roughness: 0.3 });
  const eyes = [];
  for (const sx of [-1, 1]) {
    const eye = new THREE.Group(); eye.position.set(sx * 0.22, 0.4, 0.5); head.add(eye);
    const w = new THREE.Mesh(new THREE.SphereGeometry(0.15, 24, 16), white); eye.add(w);
    const pup = new THREE.Mesh(new THREE.SphereGeometry(0.078, 20, 14), ink); pup.position.z = 0.1; eye.add(pup);
    const gl = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 8), white); gl.position.set(0.03, 0.035, 0.17); eye.add(gl);
    eyes.push({ eye, pup });
  }
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.024, 8, 24, Math.PI), ink);
  smile.rotation.z = Math.PI; smile.position.set(0, 0.2, 0.585); head.add(smile);

  const NA = 8, NS = 28;
  const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 14, 10), new THREE.MeshStandardMaterial({ roughness: 0.45 }), NA * NS);
  { const c = new THREE.Color(); for (let a = 0; a < NA; a++) for (let s = 0; s < NS; s++) { c.copy(CORAL).lerp(CORAL_L, (s / (NS - 1)) * 0.7); beads.setColorAt(a * NS + s, c); } }
  oct.add(beads);

  // cards: front = today's tool, back = ExoClass job
  const CW = 1.0, CH = 0.5;
  function cardTex(label, sub, icon, job) {
    const W = 512, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    g.beginPath(); g.roundRect(6, 6, W - 12, H - 12, 36);
    g.fillStyle = job ? '#FFFFFF' : '#ECE8F1'; g.fill();
    g.lineWidth = 6; g.strokeStyle = job ? '#AE4197' : '#C9C1D6'; if (!job) g.setLineDash([18, 12]); g.stroke(); g.setLineDash([]);
    g.save(); g.translate(34, 70); g.fillStyle = job ? '#F4F2F9' : '#DED7E6'; g.beginPath(); g.roundRect(0, 0, 116, 116, 26); g.fill();
    g.translate(22, 22); g.scale(3, 3); g.lineWidth = 2.2; g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = job ? '#AE4197' : '#6E6878'; g.stroke(new Path2D(ICONS[icon])); g.restore();
    g.fillStyle = job ? '#2E2B33' : '#55505C'; g.textBaseline = 'alphabetic';
    let fs = 54; g.font = `800 ${fs}px "Plus Jakarta Sans", system-ui, sans-serif`;
    while (g.measureText(label).width > W - 200 && fs > 30) { fs -= 2; g.font = `800 ${fs}px "Plus Jakarta Sans", system-ui, sans-serif`; }
    g.fillText(label, 172, 136);
    g.font = `700 32px "Plus Jakarta Sans", system-ui, sans-serif`; g.fillStyle = job ? '#AE4197' : '#7A7484';
    g.fillText(sub, 172, 182);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  }
  const plane = new THREE.PlaneGeometry(CW, CH);
  const cards = JOBS.map((j, i) => {
    const grp = new THREE.Group();
    const front = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ map: cardTex(j.old, 'today', j.o, false), transparent: true, alphaTest: 0.5 }));
    const back = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ map: cardTex(j.job, 'ExoClass', j.i, true), transparent: true, alphaTest: 0.5 }));
    back.rotation.y = Math.PI; back.position.z = -0.002;
    front.userData.i = back.userData.i = i;
    grp.add(front, back); scene.add(grp);
    return { grp, front, back, scat: new THREE.Vector3(), rot: new THREE.Euler(), dock: new THREE.Vector3(), side: i < 4 ? -1 : 1 };
  });
  const hitList = cards.flatMap((c) => [c.front, c.back]);

  // deterministic scatter (seeded) so every visitor sees the same mess
  // hand-placed mess (same for every visitor): x/y as share of the view, z = depth
  const scatterBase = [
    [-0.55, 0.88, -0.7, 0.25, 0.5, 0.12], [-0.82, 0.36, 0.35, -0.2, 0.35, -0.16], [-0.72, -0.78, 0.6, 0.3, 0.45, 0.2], [-0.86, -0.22, -1.3, -0.25, 0.6, -0.08],
    [0.8, 0.52, -0.35, 0.2, -0.5, 0.22], [0.5, 0.96, -1.5, -0.3, -0.35, -0.1], [0.82, -0.32, 0.7, 0.25, -0.45, -0.18], [0.58, -0.9, -0.8, -0.2, -0.6, 0.12],
  ].map(([x, y, z, rx, ry, rz]) => ({ x, y, z, rx, ry, rz }));

  // layout depends on canvas aspect
  let visW = 4, visH = 4, dist = 8;
  function layout() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const needW = 4.4, needH = 3.9;
    dist = Math.max(needW / (2 * tan * camera.aspect), needH / (2 * tan));
    visH = 2 * dist * tan; visW = visH * camera.aspect;
    camera.updateProjectionMatrix();
    const colX = Math.min(1.45, visW / 2 - CW / 2 - 0.22);
    const dy = clamp(visH * 0.15, 0.6, 0.82);
    cards.forEach((c, i) => {
      const row = i % 4;
      c.dock.set(c.side * colX, (1.5 - row) * dy + 0.08, 0.35);
      const b = scatterBase[i];
      c.scat.set(b.x * (visW / 2 - 0.62), b.y * (visH / 2 - 0.4) + 0.05, b.z);
      c.rot.set(b.rx, b.ry, b.rz);
    });
  }
  new ResizeObserver(() => { layout(); if (!running) render(performance.now()); }).observe(stage);
  layout();

  // interaction: hover / tap a card or an arm
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(9, 9);
  let hover = -1, picked = -1, lastPick = 0, pointerIn = false, look = new THREE.Vector2();
  function pick(e) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    look.copy(ndc);
    ray.setFromCamera(ndc, camera);
    const h = ray.intersectObjects(hitList, false)[0];
    if (h) return h.object.userData.i;
    const b = ray.intersectObject(beads, false)[0];
    return b ? Math.floor(b.instanceId / NS) : -1;
  }
  canvas.addEventListener('pointermove', (e) => { pointerIn = true; hover = pick(e); canvas.style.cursor = hover >= 0 ? 'pointer' : ''; });
  canvas.addEventListener('pointerleave', () => { pointerIn = false; hover = -1; });
  canvas.addEventListener('click', (e) => {
    const i = pick(e); if (i < 0) return;
    picked = i; lastPick = performance.now();
    track('engage', { what: 'stage_card', job: JOBS[i].job.toLowerCase(), state: S > 0.5 ? 'exoclass' : 'today' });
  });

  // per-frame state
  const tmp = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3(), T = new THREE.Vector3(), Pt = new THREE.Vector3();
  const M = new THREE.Matrix4(), Qn = new THREE.Quaternion(), Sc = new THREE.Vector3();
  const lift = new Float32Array(NA);
  let S = 0, sm = 0, autoI = 0, autoT = 0, shown = -2, prev = 0;

  function setTip(i, docked) {
    const key = i < 0 ? -1 : i * 2 + (docked ? 1 : 0);
    if (key === shown) return; shown = key;
    if (i < 0) { tip.classList.remove('on'); return; }
    const j = JOBS[i];
    tip.innerHTML = docked ? '<b>' + j.job + '.</b> ' + j.tip : '<b>Today:</b> ' + j.old.toLowerCase() + ', for ' + j.job.toLowerCase() + '.';
    tip.classList.add('on');
  }

  function render(now) {
    const t = STILL !== null ? 2.0 : now / 1000;
    readProgress();
    const dt = prev ? Math.min(0.25, (now - prev) / 1000) : 1; prev = now;
    sm += (P - sm) * (STILL !== null ? 1 : 1 - Math.exp(-dt * 5)); // frame-rate independent
    S = sm;
    const settle = sstep(0.62, 0.9, S); // calm octopus once everything is docked

    // who is highlighted: pointer > recent tap > auto-cycle (docked only, so phones see it without tapping)
    let hi = hover;
    if (hi < 0 && picked >= 0 && now - lastPick < 4000) hi = picked;
    if (hi < 0 && settle > 0.9 && !pointerIn && STILL === null) {
      if (now - autoT > 2400) { autoT = now; autoI = (autoI + 1) % NA; }
      hi = autoI;
    }
    setTip(STILL !== null ? -1 : hi, S > 0.5);

    // camera: deeper and a little off-axis while messy, settles when docked
    camera.position.set(look.x * 0.25, 0.15 + look.y * 0.15, dist * (1.12 - 0.12 * settle));
    camera.lookAt(0, 0.05, 0);

    // octopus
    const worry = 1 - settle;
    oct.position.y = -0.18 + Math.sin(t * 1.3) * 0.04;
    head.rotation.z = Math.sin(t * 1.1) * 0.05 * (0.4 + worry);
    head.rotation.y = (hi >= 0 ? cards[hi].side * 0.18 : 0) + look.x * 0.2;
    const blink = (t % 4.2) < 0.12 ? 0.15 : 1;
    eyes.forEach(({ eye, pup }) => {
      eye.scale.y = blink;
      const tx = hi >= 0 ? cards[hi].side * 0.04 : Math.sin(t * 2.3) * 0.04 * worry;
      pup.position.x = tx; pup.position.y = hi >= 0 ? 0.0 : Math.cos(t * 1.7) * 0.03 * worry;
    });

    // cards: scattered in depth -> flip to the ExoClass side -> docked to their arm
    cards.forEach((c, i) => {
      const s = sstep(0.16 + i * 0.035, 0.5 + i * 0.035, S);
      const e = s * s * (3 - 2 * s);
      const dx = Math.sin(t * 0.7 + i * 1.7) * 0.07 * (1 - e), dyy = Math.cos(t * 0.9 + i) * 0.06 * (1 - e);
      c.grp.position.set(
        THREE.MathUtils.lerp(c.scat.x + dx, c.dock.x, e),
        THREE.MathUtils.lerp(c.scat.y + dyy, c.dock.y, e),
        THREE.MathUtils.lerp(c.scat.z, c.dock.z, e));
      c.grp.rotation.set(c.rot.x * (1 - e), THREE.MathUtils.lerp(c.rot.y, Math.PI, sstep(0.25, 0.85, s)), c.rot.z * (1 - e));
      lift[i] += ((i === hi ? 1 : 0) - lift[i]) * 0.15;
      const k = 1 + lift[i] * 0.12; c.grp.scale.set(k, k, k);
      c.grp.position.z += lift[i] * 0.25;
      c.s = s;
    });

    // arms: each arm reaches for its card, grabs it, carries it to its dock
    const headY = oct.position.y;
    for (let a = 0; a < NA; a++) {
      const c = cards[a], side = c.side, row = a % 4;
      const ang = side < 0 ? Math.PI * (0.62 + row * 0.12) : Math.PI * (0.38 - row * 0.12);
      B.set(Math.cos(ang) * 0.36, headY + 0.02 - row * 0.02, 0.12 + Math.sin(ang) * 0.08);
      // relaxed tip (curled below the head) vs grip point on the card's inner edge
      tmp.set(side * (0.42 + row * 0.3), headY - 0.85 + row * 0.1, 0.55 - row * 0.28);
      const grip = sstep(0.0, 0.3, c.s) * (1 - 0.0);
      Pt.copy(c.grp.position); Pt.x -= side * (CW / 2 - 0.06) * c.grp.scale.x; Pt.z -= 0.02;
      T.copy(tmp).lerp(Pt, grip);
      C.copy(B).lerp(T, 0.5); C.x += side * 0.35; C.y -= 0.45 * (1 - grip * 0.6); C.z += 0.25;
      const len = B.distanceTo(T);
      const wave = (0.06 + 0.07 * worry) * (1 + lift[a]);
      for (let s = 0; s < NS; s++) {
        const u = s / (NS - 1), iu = 1 - u;
        Pt.set(iu * iu * B.x + 2 * u * iu * C.x + u * u * T.x, iu * iu * B.y + 2 * u * iu * C.y + u * u * T.y, iu * iu * B.z + 2 * u * iu * C.z + u * u * T.z);
        const w = Math.sin(t * (2.2 + worry * 1.4) - u * 6 + a * 0.9) * wave * Math.sin(u * Math.PI);
        Pt.y += w; Pt.z += w * 0.6;
        const rad = (0.15 * iu + 0.045 * u) * (0.85 + 0.15 * Math.min(1, 1.6 / Math.max(len, 0.5)));
        Sc.set(rad, rad, rad);
        M.compose(Pt, Qn, Sc);
        beads.setMatrixAt(a * NS + s, M);
      }
    }
    beads.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);
  }

  // loop only while the stage is on screen and the tab is visible
  let running = false, onScreen = true, raf = 0;
  function loop(now) { if (!running) return; render(now); raf = requestAnimationFrame(loop); }
  function update() {
    const want = onScreen && !document.hidden && STILL === null;
    if (want && !running) { running = true; raf = requestAnimationFrame(loop); }
    else if (!want && running) { running = false; cancelAnimationFrame(raf); }
  }
  new IntersectionObserver((es) => { onScreen = es[0].isIntersecting; update(); }, { rootMargin: '100px' }).observe(stage);
  document.addEventListener('visibilitychange', update);

  render(performance.now());
  stage.classList.add('ready');
  window.__stage = { ready: true, running: () => running };
  update();
}
