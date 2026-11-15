/**
 * Binary Orbital Mechanics — Two-Body Physics Simulation (Bodies B & V)
 * Numerical integration of two celestial bodies under Newtonian gravity.
 */

// --- Canvas & Context Setup ---
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initStarfield();
  if (currentState === 'solitude') {
    bodyB.x = width / 2;
    bodyB.y = height / 2;
  }
});

// --- Simulation Trajectory Profiles ---
const profiles = {
  orbit: {
    title: 'Phase I: Stable Elliptical Orbit',
    quote: 'Gravitational coupling between Body B (warm) and Body V (cool) in barycentric motion.',
    status: 'Coupled Orbit',
    buttonId: 'btn-state-orbit'
  },
  tension: {
    title: 'Phase II: Periapsis Acceleration',
    quote: 'Gravitational flux increases orbital velocity and tightens periapsis distance.',
    status: 'High Pull',
    buttonId: 'btn-state-tension'
  },
  letgo: {
    title: 'Phase III: Hyperbolic Escape',
    quote: 'Body V exceeds parabolic escape velocity, entering an open hyperbolic trajectory.',
    status: 'Escape Drift',
    buttonId: 'btn-state-letgo'
  },
  solitude: {
    title: 'Phase IV: Body B Equilibrium',
    quote: 'Body B in isolated gravitational equilibrium, accompanied by minor satellite particles.',
    status: 'Body B Center',
    buttonId: 'btn-state-solitude'
  }
};

let currentState = 'orbit';

// --- Simulation Parameters ---
let G = 1.0;              // Gravitational constant scalar
let trailAlpha = 0.04;    // Canvas clear opacity (trail persistence)
let simSpeed = 1.0;       // Integration time step scalar (dt)
let tetherActive = true;  // Gravitational bond state

// --- Background Starfield ---
const starsBg = [];
function initStarfield() {
  starsBg.length = 0;
  const numStars = Math.floor((width * height) / 4000);
  for (let i = 0; i < numStars; i++) {
    starsBg.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.7 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2
    });
  }
}
initStarfield();

// --- Celestial Body Class ---
class CelestialBody {
  constructor(x, y, vx, vy, mass, radius, colorCore, colorGlow, label) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.mass = mass;
    this.radius = radius;
    this.colorCore = colorCore;
    this.colorGlow = colorGlow;
    this.label = label;
    this.history = [];
    this.maxHistory = 150;
    this.isDragged = false;
    this.pulsePhase = Math.random() * Math.PI * 2;
  }

  updateTrail() {
    this.history.push({ x: this.x, y: this.y });
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  drawTrail(ctx) {
    if (this.history.length < 2) return;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.history[0].x, this.history[0].y);

    for (let i = 1; i < this.history.length; i++) {
      ctx.lineTo(this.history[i].x, this.history[i].y);
    }

    ctx.strokeStyle = this.colorGlow;
    ctx.lineWidth = 2.0;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 12;
    ctx.shadowColor = this.colorGlow;
    ctx.stroke();
    ctx.restore();
  }

  draw(ctx) {
    ctx.save();
    this.pulsePhase += 0.04;
    const pulse = Math.sin(this.pulsePhase) * 1.2;
    const r = Math.max(3, this.radius + pulse);

    // Multi-layer corona
    const gradient = ctx.createRadialGradient(
      this.x, this.y, r * 0.1,
      this.x, this.y, r * 3.5
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.25, this.colorCore);
    gradient.addColorStop(0.65, this.colorGlow);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Solid core
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = this.colorCore;
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * 0.65, 0, Math.PI * 2);
    ctx.fill();

    // Technical Label
    ctx.font = '500 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.fillText(this.label, this.x, this.y - r * 2.0);

    ctx.restore();
  }
}

// Instantiate Body B (Warm) & Body V (Cool)
let bodyB, bodyV;

function setupOrbits(mode = 'orbit') {
  const cx = width / 2;
  const cy = height / 2;
  const orbitRadius = Math.min(width, height) * 0.22;

  if (mode === 'orbit' || mode === 'tension') {
    tetherActive = true;
    
    // Calculated orbital velocity: v = sqrt(G * M / r)
    const speed = Math.sqrt((G * 1200) / orbitRadius) * 0.9;

    bodyB = new CelestialBody(
      cx, cy + orbitRadius * 0.4,
      -speed * 0.35, 0,
      1200, 16,
      '#ffaa75', 'rgba(255, 170, 117, 0.45)',
      'Body B'
    );

    bodyV = new CelestialBody(
      cx, cy - orbitRadius * 0.8,
      speed * 0.8, 0,
      500, 12,
      '#70b6ff', 'rgba(112, 182, 255, 0.45)',
      'Body V'
    );
  } else if (mode === 'letgo') {
    tetherActive = false;

    // Grant hyperbolic escape velocity
    const angle = Math.atan2(bodyV.y - bodyB.y, bodyV.x - bodyB.x);
    const tangentialSpeed = 3.6;
    bodyV.vx = Math.cos(angle + Math.PI / 2) * tangentialSpeed + Math.cos(angle) * 1.5;
    bodyV.vy = Math.sin(angle + Math.PI / 2) * tangentialSpeed + Math.sin(angle) * 1.5;
    
    bodyB.vx *= 0.4;
    bodyB.vy *= 0.4;

    spawnStardust((bodyB.x + bodyV.x) / 2, (bodyB.y + bodyV.y) / 2, 45, '#70b6ff');
  } else if (mode === 'solitude') {
    tetherActive = false;
    bodyB.x = cx;
    bodyB.y = cy;
    bodyB.vx = 0;
    bodyB.vy = 0;
    bodyB.radius = 17;
    bodyB.colorCore = '#ffaa75';
    bodyB.colorGlow = 'rgba(255, 170, 117, 0.5)';

    // Move Body V off-screen
    bodyV.x = width + 500;
    bodyV.y = -500;
    bodyV.vx = 0;
    bodyV.vy = 0;

    initSolitudeSatellites();
  }
}

// --- Dynamic Particle Stardust ---
const particles = [];

function spawnStardust(x, y, count = 5, color = 'rgba(255,255,255,0.7)') {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 1.8 + 0.3;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 2 + 0.5,
      alpha: 1.0,
      decay: Math.random() * 0.015 + 0.008,
      color
    });
  }
}

// Satellites orbiting Body B in Isolated Equilibrium mode
const solitudeSatellites = [];
function initSolitudeSatellites() {
  solitudeSatellites.length = 0;
  const count = 12;
  for (let i = 0; i < count; i++) {
    solitudeSatellites.push({
      distance: 60 + Math.random() * 120,
      angle: (i / count) * Math.PI * 2,
      speed: (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
      size: Math.random() * 1.8 + 0.8,
      color: Math.random() > 0.5 ? '#ffaa75' : '#ffd285',
      alpha: Math.random() * 0.6 + 0.3
    });
  }
}

// --- Text Rasterization to Particles ---
const textParticles = [];

function disperseTextAsParticles(text) {
  if (!text || !text.trim()) return;

  const offCanvas = document.createElement('canvas');
  const offCtx = offCanvas.getContext('2d');
  offCanvas.width = 800;
  offCanvas.height = 200;

  offCtx.fillStyle = '#ffffff';
  offCtx.font = '500 22px "Plus Jakarta Sans", sans-serif';
  offCtx.textAlign = 'center';
  offCtx.textBaseline = 'middle';

  const words = text.split(' ');
  let line = '';
  const lines = [];
  const maxWidth = 700;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = offCtx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lines.push(line);
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  const startY = 100 - (lines.length - 1) * 16;
  lines.forEach((l, idx) => {
    offCtx.fillText(l.trim(), 400, startY + idx * 30);
  });

  const imgData = offCtx.getImageData(0, 0, 800, 200);
  const data = imgData.data;
  const startCanvasX = width / 2 - 400;
  const startCanvasY = height / 2 - 100;

  const step = 4;
  for (let y = 0; y < 200; y += step) {
    for (let x = 0; x < 800; x += step) {
      const index = (y * 800 + x) * 4;
      if (data[index + 3] > 140) {
        textParticles.push({
          x: startCanvasX + x,
          y: startCanvasY + y,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -Math.random() * 0.8 - 0.3,
          size: Math.random() * 1.8 + 0.8,
          alpha: 1.0,
          dissolving: false,
          dissolveTimer: 180 + Math.random() * 60,
          color: Math.random() > 0.4 ? '#ffffff' : '#70b6ff'
        });
      }
    }
  }

  if (audioCtx && soundEnabled) {
    playChime();
  }
}

// --- Gravitational Tether Graphic ---
function drawTether(ctx) {
  if (!tetherActive || currentState === 'solitude') return;

  const dx = bodyV.x - bodyB.x;
  const dy = bodyV.y - bodyB.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(bodyB.x, bodyB.y);

  const midX = (bodyB.x + bodyV.x) / 2;
  const midY = (bodyB.y + bodyV.y) / 2;
  const normalX = -dy / dist;
  const normalY = dx / dist;

  const tensionFactor = currentState === 'tension' ? 12 : 3;
  const wave = Math.sin(Date.now() * 0.008) * tensionFactor;

  ctx.quadraticCurveTo(
    midX + normalX * wave,
    midY + normalY * wave,
    bodyV.x,
    bodyV.y
  );

  const tetherGrad = ctx.createLinearGradient(bodyB.x, bodyB.y, bodyV.x, bodyV.y);
  tetherGrad.addColorStop(0, 'rgba(255, 170, 117, 0.4)');
  tetherGrad.addColorStop(0.5, currentState === 'tension' ? 'rgba(255, 220, 160, 0.7)' : 'rgba(255, 255, 255, 0.25)');
  tetherGrad.addColorStop(1, 'rgba(112, 182, 255, 0.4)');

  ctx.strokeStyle = tetherGrad;
  ctx.lineWidth = currentState === 'tension' ? 2.2 : 1.2;
  ctx.setLineDash([4, 4]);
  ctx.lineDashOffset = -Date.now() * 0.02;
  ctx.shadowColor = currentState === 'tension' ? '#ffaa75' : '#ffffff';
  ctx.shadowBlur = 8;
  ctx.stroke();
  ctx.restore();
}

// --- Physics Integration Loop ---
function updatePhysics() {
  if (currentState === 'solitude') {
    const targetX = width / 2;
    const targetY = height / 2;
    bodyB.x += (targetX - bodyB.x) * 0.05;
    bodyB.y += (targetY - bodyB.y) * 0.05;
    bodyB.vx = 0;
    bodyB.vy = 0;
    bodyB.updateTrail();
    return;
  }

  const dx = bodyV.x - bodyB.x;
  const dy = bodyV.y - bodyB.y;
  const distSq = dx * dx + dy * dy;
  const dist = Math.sqrt(distSq);

  // Softening parameter to prevent singularity at r = 0
  const softening = 45;
  const effectiveDistSq = distSq + softening * softening;

  let force = 0;
  if (tetherActive) {
    let multiplier = G;
    if (currentState === 'tension') multiplier *= 1.8;
    force = (multiplier * bodyB.mass * bodyV.mass) / effectiveDistSq;

    const fx = (force * dx) / dist;
    const fy = (force * dy) / dist;

    // a = F / m
    if (!bodyB.isDragged) {
      bodyB.vx += (fx / bodyB.mass) * simSpeed;
      bodyB.vy += (fy / bodyB.mass) * simSpeed;
    }
    if (!bodyV.isDragged) {
      bodyV.vx -= (fx / bodyV.mass) * simSpeed;
      bodyV.vy -= (fy / bodyV.mass) * simSpeed;
    }
  } else if (currentState === 'letgo') {
    force = (0.08 * bodyB.mass * bodyV.mass) / effectiveDistSq;
    const fx = (force * dx) / dist;
    const fy = (force * dy) / dist;
    bodyV.vx -= (fx / bodyV.mass) * 0.1 * simSpeed;
    bodyV.vy -= (fy / bodyV.mass) * 0.1 * simSpeed;

    bodyB.vx *= 0.985;
    bodyB.vy *= 0.985;
    const cx = width / 2;
    const cy = height / 2;
    bodyB.x += (cx - bodyB.x) * 0.005;
    bodyB.y += (cy - bodyB.y) * 0.005;
  }

  // Velocity integration
  if (!bodyB.isDragged) {
    bodyB.x += bodyB.vx * simSpeed;
    bodyB.y += bodyB.vy * simSpeed;
  }
  if (!bodyV.isDragged) {
    bodyV.x += bodyV.vx * simSpeed;
    bodyV.y += bodyV.vy * simSpeed;
  }

  // Soft center-of-mass barycentric damping
  if (tetherActive && !bodyB.isDragged && !bodyV.isDragged) {
    const totalMass = bodyB.mass + bodyV.mass;
    const comX = (bodyB.x * bodyB.mass + bodyV.x * bodyV.mass) / totalMass;
    const comY = (bodyB.y * bodyB.mass + bodyV.y * bodyV.mass) / totalMass;
    const centerPull = 0.002;
    bodyB.x += ((width / 2) - comX) * centerPull;
    bodyB.y += ((height / 2) - comY) * centerPull;
    bodyV.x += ((width / 2) - comX) * centerPull;
    bodyV.y += ((height / 2) - comY) * centerPull;
  }

  bodyB.updateTrail();
  bodyV.updateTrail();

  // Particle emission
  if (Math.random() < 0.3) {
    spawnStardust(bodyB.x, bodyB.y, 1, 'rgba(255, 170, 117, 0.4)');
  }
  if (Math.random() < 0.3) {
    spawnStardust(bodyV.x, bodyV.y, 1, 'rgba(112, 182, 255, 0.4)');
  }

  // Update UI Metrics
  document.getElementById('metric-dist').textContent = `${Math.round(dist)} AU`;
  document.getElementById('metric-force').textContent = tetherActive
    ? currentState === 'tension' ? 'High Tension' : 'Stable Barycenter'
    : 'Hyperbolic Escape';
}

// --- Render Loop ---
function animate() {
  requestAnimationFrame(animate);

  // Background trail clear
  ctx.fillStyle = `rgba(3, 5, 10, ${trailAlpha})`;
  ctx.fillRect(0, 0, width, height);

  // Background stars
  ctx.save();
  for (let i = 0; i < starsBg.length; i++) {
    const s = starsBg[i];
    s.phase += s.pulseSpeed;
    const currentAlpha = s.alpha * (0.6 + 0.4 * Math.sin(s.phase));
    ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Draw Trails
  bodyB.drawTrail(ctx);
  if (currentState !== 'solitude') {
    bodyV.drawTrail(ctx);
    drawTether(ctx);
  }

  // Physics update
  updatePhysics();

  // Draw celestial bodies
  bodyB.draw(ctx);
  if (currentState !== 'solitude') {
    bodyV.draw(ctx);
  }

  // Isolated equilibrium mode satellites
  if (currentState === 'solitude') {
    ctx.save();
    for (let i = 0; i < solitudeSatellites.length; i++) {
      const sat = solitudeSatellites[i];
      sat.angle += sat.speed;
      const sx = bodyB.x + Math.cos(sat.angle) * sat.distance;
      const sy = bodyB.y + Math.sin(sat.angle) * sat.distance * 0.6;

      ctx.fillStyle = sat.color;
      ctx.shadowColor = sat.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(sx, sy, sat.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Draw & update Stardust Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= p.decay;

    if (p.alpha <= 0) {
      particles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.alpha;
    ctx.shadowBlur = 6;
    ctx.shadowColor = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Draw & update Text Particles
  for (let i = textParticles.length - 1; i >= 0; i--) {
    const tp = textParticles[i];

    if (!tp.dissolving) {
      tp.dissolveTimer--;
      if (tp.dissolveTimer <= 0) {
        tp.dissolving = true;
        tp.vx = (Math.random() - 0.5) * 2;
        tp.vy = -Math.random() * 2.2 - 0.5;
      }
    } else {
      tp.x += tp.vx;
      tp.y += tp.vy;
      tp.alpha -= 0.009;
    }

    if (tp.alpha <= 0) {
      textParticles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.fillStyle = tp.color;
    ctx.globalAlpha = tp.alpha;
    ctx.shadowColor = tp.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(tp.x, tp.y, tp.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Start simulation
setupOrbits('orbit');
animate();

// --- Mouse / Touch Dragging & Particle Injection ---
let draggedBody = null;

function getEventPos(e) {
  if (e.touches && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  return { x: e.clientX, y: e.clientY };
}

function handlePointerDown(e) {
  const pos = getEventPos(e);
  const dB = Math.hypot(pos.x - bodyB.x, pos.y - bodyB.y);
  const dV = Math.hypot(pos.x - bodyV.x, pos.y - bodyV.y);

  if (dB < bodyB.radius * 2.5) {
    draggedBody = bodyB;
    bodyB.isDragged = true;
  } else if (dV < bodyV.radius * 2.5 && currentState !== 'solitude') {
    draggedBody = bodyV;
    bodyV.isDragged = true;
  } else {
    // Clicked empty space: inject particle mass
    spawnStardust(pos.x, pos.y, 16, '#70b6ff');
  }
}

function handlePointerMove(e) {
  if (!draggedBody) return;
  const pos = getEventPos(e);
  draggedBody.vx = (pos.x - draggedBody.x) * 0.3;
  draggedBody.vy = (pos.y - draggedBody.y) * 0.3;
  draggedBody.x = pos.x;
  draggedBody.y = pos.y;
}

function handlePointerUp() {
  if (draggedBody) {
    draggedBody.isDragged = false;
    draggedBody = null;
  }
}

window.addEventListener('mousedown', handlePointerDown);
window.addEventListener('mousemove', handlePointerMove);
window.addEventListener('mouseup', handlePointerUp);

window.addEventListener('touchstart', handlePointerDown, { passive: true });
window.addEventListener('touchmove', handlePointerMove, { passive: true });
window.addEventListener('touchend', handlePointerUp);

// --- Trajectory Profile Management ---
function setProfile(stateKey) {
  if (!profiles[stateKey]) return;
  currentState = stateKey;

  const data = profiles[stateKey];
  document.getElementById('chapter-title').textContent = data.title;
  document.getElementById('poetic-quote').textContent = data.quote;
  document.getElementById('system-status').textContent = data.status;

  document.querySelectorAll('.state-buttons .btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeBtn = document.getElementById(data.buttonId);
  if (activeBtn) activeBtn.classList.add('active');

  setupOrbits(stateKey);

  if (audioCtx && soundEnabled) {
    adaptAudioChord(stateKey);
  }
}

document.querySelectorAll('.state-buttons .btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetState = btn.getAttribute('data-state');
    setProfile(targetState);
  });
});

// --- Physics Sliders ---
const sliderGravity = document.getElementById('slider-gravity');
const valGravity = document.getElementById('val-gravity');
sliderGravity.addEventListener('input', (e) => {
  G = parseFloat(e.target.value);
  valGravity.textContent = `${G.toFixed(1)}x`;
});

const sliderTrail = document.getElementById('slider-trail');
const valTrail = document.getElementById('val-trail');
sliderTrail.addEventListener('input', (e) => {
  trailAlpha = parseFloat(e.target.value);
  valTrail.textContent = trailAlpha < 0.03 ? 'High' : trailAlpha > 0.08 ? 'Low' : 'Medium';
});

const sliderSpeed = document.getElementById('slider-speed');
const valSpeed = document.getElementById('val-speed');
sliderSpeed.addEventListener('input', (e) => {
  simSpeed = parseFloat(e.target.value);
  valSpeed.textContent = `${simSpeed.toFixed(1)}x`;
});

// Reset Button
document.getElementById('btn-reset').addEventListener('click', () => {
  setProfile('orbit');
});

// --- Text Particle Projection Modal ---
const modal = document.getElementById('whisper-modal');
const openModalBtn = document.getElementById('btn-open-whisper');
const closeModalBtn = document.getElementById('modal-close');
const dissolveBtn = document.getElementById('dissolve-btn');
const whisperInput = document.getElementById('whisper-input');

openModalBtn.addEventListener('click', () => {
  modal.classList.remove('hidden');
  whisperInput.focus();
});

closeModalBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
});

dissolveBtn.addEventListener('click', () => {
  const text = whisperInput.value;
  if (text.trim()) {
    disperseTextAsParticles(text);
    whisperInput.value = '';
    modal.classList.add('hidden');
  }
});

// --- Generative Harmonic Audio (Web Audio API) ---
let audioCtx = null;
let soundEnabled = false;
let oscillators = [];
let masterGain = null;
let filterNode = null;

const chords = {
  orbit: [130.81, 164.81, 196.00, 246.94],     // C3, E3, G3, B3 (Major 7th harmonic)
  tension: [123.47, 146.83, 174.61, 220.00],   // B2, D3, F3, A3 (Harmonic tension)
  letgo: [110.00, 164.81, 220.00, 293.66],     // A2, E3, A3, D4 (Open suspended harmonic)
  solitude: [130.81, 196.00, 261.63, 329.63]   // C3, G3, C4, E4 (Fundamental fifths)
};

function initAudio() {
  if (audioCtx) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContext();

  masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0.001, audioCtx.currentTime);

  filterNode = audioCtx.createBiquadFilter();
  filterNode.type = 'lowpass';
  filterNode.frequency.setValueAtTime(320, audioCtx.currentTime);

  const delay = audioCtx.createDelay();
  delay.delayTime.value = 0.55;
  const delayFeedback = audioCtx.createGain();
  delayFeedback.gain.value = 0.35;

  masterGain.connect(filterNode);
  filterNode.connect(audioCtx.destination);
  filterNode.connect(delay);
  delay.connect(delayFeedback);
  delayFeedback.connect(delay);
  delayFeedback.connect(audioCtx.destination);

  createOscillators(chords[currentState]);
}

function createOscillators(chordFreqs) {
  oscillators.forEach(osc => {
    try { osc.stop(); osc.disconnect(); } catch (e) {}
  });
  oscillators = [];

  chordFreqs.forEach((freq, idx) => {
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();

    osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    oscGain.gain.value = 0.08 / chordFreqs.length;

    osc.connect(oscGain);
    oscGain.connect(masterGain);
    osc.start();
    oscillators.push(osc);
  });
}

function adaptAudioChord(stateKey) {
  if (!audioCtx || !soundEnabled) return;
  const targetChord = chords[stateKey] || chords.orbit;
  oscillators.forEach((osc, idx) => {
    if (targetChord[idx]) {
      osc.frequency.exponentialRampToValueAtTime(
        targetChord[idx],
        audioCtx.currentTime + 3.0
      );
    }
  });
}

function playChime() {
  if (!audioCtx) return;
  const chimeFreqs = [523.25, 659.25, 783.99, 1046.50];
  chimeFreqs.forEach((freq, idx) => {
    setTimeout(() => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 2.6);
    }, idx * 120);
  });
}

const btnSound = document.getElementById('btn-sound');
const soundIcon = document.getElementById('sound-icon');
const soundText = document.getElementById('sound-text');

btnSound.addEventListener('click', () => {
  if (!audioCtx) {
    initAudio();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  soundEnabled = !soundEnabled;
  if (soundEnabled) {
    masterGain.gain.setTargetAtTime(0.18, audioCtx.currentTime, 1.5);
    soundIcon.textContent = '🔊';
    soundText.textContent = 'Audio On';
    btnSound.classList.add('active');
  } else {
    masterGain.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.8);
    soundIcon.textContent = '🔇';
    soundText.textContent = 'Audio Off';
    btnSound.classList.remove('active');
  }
});
