/**
 * UPGRADE — Interaktív motor
 * Élő, mozgó szemcséjű Airbrush Virág + Virághoz Stilizált Airbrush Nyíl + Szekcióváltó Átmenet + Lenyitható Szolgáltatások
 */

document.addEventListener('DOMContentLoaded', () => {
  initAirbrushFlower();
  initFloatingPhysics();
  initScrollTransition();
  initExpertPictograms();
  initExpandableServices();
  initContactForm();
  initFooterLiquidHover();
});

/* =====================================================================
   1. PROCEDURÁLIS GRAFFITI / AIRBRUSH VIRÁG ÉLŐ SZEMCSE-MOZGÁSSAL
   ===================================================================== */
let currentSprayColor = '#0a0a0a';
let rebuildSprayCore = null;

function sampleBezier(p0, p1, p2, p3, steps) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    const x = u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0];
    const y = u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1];
    pts.push([x, y, t]);
  }
  return pts;
}

function initAirbrushFlower() {
  const canvas = document.getElementById('sprayFlowerCanvas');
  const dualityCanvas = document.getElementById('dualityFlowerCanvas');
  const statementCanvas = document.getElementById('statementFlowerCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dualityCtx = dualityCanvas ? dualityCanvas.getContext('2d') : null;
  const statementCtx = statementCanvas ? statementCanvas.getContext('2d') : null;

  const coreCanvas = document.createElement('canvas');
  coreCanvas.width = canvas.width;
  coreCanvas.height = canvas.height;
  const coreCtx = coreCanvas.getContext('2d');

  // Világos (#ece9e2) spray mag a sötét (#0a0a0a) hátterű PIAC/KÓD szekció virágához
  const lightCoreCanvas = document.createElement('canvas');
  lightCoreCanvas.width = canvas.width;
  lightCoreCanvas.height = canvas.height;
  const lightCoreCtx = lightCoreCanvas.getContext('2d');

  // Vibráns piros (#ff1a1a) spray mag a szolgáltatások szekció szövege mögötti virághoz
  const redCoreCanvas = document.createElement('canvas');
  redCoreCanvas.width = canvas.width;
  redCoreCanvas.height = canvas.height;
  const redCoreCtx = redCoreCanvas.getContext('2d');

  const particles = [];

  const petals = [
    [[245, 230], [200, 115], [268, 72], [278, 210]],
    [[278, 210], [335, 105], [402, 142], [308, 240]],
    [[308, 240], [435, 210], [455, 282], [318, 282]],
    [[318, 282], [442, 365], [375, 448], [278, 318]],
    [[272, 312], [250, 442], [172, 415], [235, 292]],
    [[235, 292], [105, 322], [115, 230], [245, 250]]
  ];

  petals.forEach((curve, idx) => {
    const isFadedTail = idx === 3;
    const points = sampleBezier(curve[0], curve[1], curve[2], curve[3], 90);

    points.forEach(([x, y, t]) => {
      const isMistZone = isFadedTail && t > 0.35 && t < 0.85;
      const radius = isMistZone ? 27 : 14.5;
      const density = isMistZone ? 26 : 20;
      const mistMult = isMistZone ? 1.85 : 1.0;

      for (let i = 0; i < density; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = (Math.random() + Math.random()) * 0.5 * radius * (1.35 * mistMult);
        const bx = x + Math.cos(angle) * r;
        const by = y + Math.sin(angle) * r;
        const size = Math.random() < 0.82 ? 1.2 : 2.0;
        const alpha = Math.random() * 0.55 + 0.18;

        const distRatio = r / (radius * 1.35);
        const amp = (isMistZone ? 4.2 : 2.2) * (0.4 + distRatio * 0.9);
        const speed = 1.2 + Math.random() * 1.8;
        const phaseX = Math.random() * Math.PI * 2;
        const phaseY = Math.random() * Math.PI * 2;

        particles.push({ bx, by, size, alpha, amp, speed, phaseX, phaseY });
      }
    });
  });

  function renderCoreOnCtx(targetCtx, c0, c1) {
    targetCtx.clearRect(0, 0, canvas.width, canvas.height);

    petals.forEach((curve, idx) => {
      const isFadedTail = idx === 3;
      const points = sampleBezier(curve[0], curve[1], curve[2], curve[3], 90);

      points.forEach(([x, y, t]) => {
        const isMistZone = isFadedTail && t > 0.35 && t < 0.85;
        const radius = isMistZone ? 26 : 14;
        const grad = targetCtx.createRadialGradient(x, y, 0, x, y, radius * 0.9);
        grad.addColorStop(0, c0);
        grad.addColorStop(0.6, c1);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        targetCtx.fillStyle = grad;
        targetCtx.beginPath();
        targetCtx.arc(x, y, radius * 0.9, 0, Math.PI * 2);
        targetCtx.fill();
      });
    });
  }

  function renderCore(color) {
    if (color === '#0a0a0a') {
      renderCoreOnCtx(coreCtx, 'rgba(10,10,10,0.20)', 'rgba(10,10,10,0.05)');
    } else {
      renderCoreOnCtx(coreCtx, 'rgba(255,26,26,0.20)', 'rgba(255,26,26,0.05)');
    }
  }

  renderCore(currentSprayColor);
  renderCoreOnCtx(lightCoreCtx, 'rgba(236,233,226,0.20)', 'rgba(236,233,226,0.05)');
  renderCoreOnCtx(redCoreCtx, 'rgba(255,26,26,0.20)', 'rgba(255,26,26,0.05)');
  rebuildSprayCore = renderCore;

  let grainTime = 0;
  function animateGrains() {
    grainTime += 0.022;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(coreCanvas, 0, 0);

    if (dualityCtx && dualityCanvas) {
      dualityCtx.clearRect(0, 0, dualityCanvas.width, dualityCanvas.height);
      dualityCtx.drawImage(lightCoreCanvas, 0, 0);
      dualityCtx.fillStyle = '#ece9e2';
    }

    if (statementCtx && statementCanvas) {
      statementCtx.clearRect(0, 0, statementCanvas.width, statementCanvas.height);
      statementCtx.drawImage(redCoreCanvas, 0, 0);
      statementCtx.fillStyle = '#ff1a1a';
    }

    ctx.fillStyle = currentSprayColor;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const dx = Math.sin(grainTime * p.speed + p.phaseX) * p.amp;
      const dy = Math.cos(grainTime * (p.speed * 0.85) + p.phaseY) * p.amp;
      const px = p.bx + dx;
      const py = p.by + dy;
      ctx.globalAlpha = p.alpha;
      ctx.fillRect(px, py, p.size, p.size);

      if (dualityCtx) {
        dualityCtx.globalAlpha = p.alpha;
        dualityCtx.fillRect(px, py, p.size, p.size);
      }

      if (statementCtx) {
        statementCtx.globalAlpha = p.alpha;
        statementCtx.fillRect(px, py, p.size, p.size);
      }
    }
    ctx.globalAlpha = 1;
    if (dualityCtx) dualityCtx.globalAlpha = 1;
    if (statementCtx) statementCtx.globalAlpha = 1;

    requestAnimationFrame(animateGrains);
  }

  requestAnimationFrame(animateGrains);
}

/* =====================================================================
   2. LEBEGŐ FIZIKA ÉS SHAKE EFFEKT A HERO VIRÁGRA
   ===================================================================== */
function initFloatingPhysics() {
  const wrap = document.getElementById('floatingFlower');
  const dualityWrap = document.getElementById('dualityFlower');
  const statementWrap = document.getElementById('statementFlower');
  const stage = document.getElementById('hero-stage');
  if (!wrap || !stage) return;

  let isDragging = false;
  let dragMoved = false;
  let startX = 0;
  let startY = 0;
  let offsetX = 0;
  let offsetY = 0;
  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;
  let currentRot = 0;

  let dualityX = 0;
  let dualityY = 0;
  let dualitySpin = 0;

  let statementX = 0;
  let statementY = 0;
  let statementSpin = 0;
  let time = 0;

  window.addEventListener('mousemove', (e) => {
    const normX = (e.clientX / window.innerWidth - 0.5) * 2;
    const normY = (e.clientY / window.innerHeight - 0.5) * 2;
    mouseX = normX * 28;
    mouseY = normY * 28;

    if (isDragging) {
      dragMoved = true;
      offsetX = e.clientX - startX;
      offsetY = e.clientY - startY;
    }
  });

  wrap.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragMoved = false;
    startX = e.clientX - offsetX;
    startY = e.clientY - offsetY;
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  function toggleColor() {
    currentSprayColor = currentSprayColor === '#0a0a0a' ? '#ff1a1a' : '#0a0a0a';
    if (rebuildSprayCore) {
      rebuildSprayCore(currentSprayColor);
    }
  }

  wrap.addEventListener('click', () => {
    if (dragMoved) return;
    toggleColor();
  });

  function animate() {
    time += 0.018;
    const floatY = Math.sin(time) * 14;
    const floatRot = Math.cos(time * 0.7) * 4;

    if (!isDragging) {
      offsetX *= 0.94;
      offsetY *= 0.94;
    }

    const targetX = mouseX + offsetX;
    const targetY = mouseY + offsetY + floatY;
    const targetRot = floatRot + (targetX * 0.08);

    currentX += (targetX - currentX) * 0.09;
    currentY += (targetY - currentY) * 0.09;
    currentRot += (targetRot - currentRot) * 0.09;

    wrap.style.transform = `translate(calc(-50% + ${currentX.toFixed(1)}px), calc(-50% + ${currentY.toFixed(1)}px)) rotate(${currentRot.toFixed(2)}deg)`;

    if (dualityWrap) {
      dualitySpin = (dualitySpin + 0.14) % 360;
      const dTargetX = (mouseX * 0.65) + Math.cos(time * 1.1) * 6;
      const dTargetY = (mouseY * 0.65) + Math.sin(time * 0.95) * 8;

      dualityX += (dTargetX - dualityX) * 0.09;
      dualityY += (dTargetY - dualityY) * 0.09;

      dualityWrap.style.transform = `translate(calc(-50% + ${dualityX.toFixed(1)}px), calc(-50% + ${dualityY.toFixed(1)}px)) rotate(${dualitySpin.toFixed(2)}deg)`;
    }

    if (statementWrap) {
      statementSpin = (statementSpin + 0.14) % 360;
      const sTargetX = (mouseX * 0.65) + Math.sin(time * 1.15) * 6;
      const sTargetY = (mouseY * 0.65) + Math.cos(time * 0.95) * 8;

      statementX += (sTargetX - statementX) * 0.09;
      statementY += (sTargetY - statementY) * 0.09;

      statementWrap.style.transform = `translate(calc(-50% + ${statementX.toFixed(1)}px), calc(-50% + ${statementY.toFixed(1)}px)) rotate(${statementSpin.toFixed(2)}deg)`;
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

/* =====================================================================
   3. SZEKCIÓVÁLTÓ EDITORIAL ÁTMENET (GÖRGESS LEJJEBB KATTINTÁSKOR)
   ===================================================================== */
function initScrollTransition() {
  const btn = document.getElementById('scrollDownBtn');
  const curtain = document.getElementById('sectionCurtain');
  const targetSection = document.getElementById('duality');

  if (!btn || !curtain || !targetSection) return;

  btn.addEventListener('click', (e) => {
    e.preventDefault();

    if (curtain.classList.contains('is-animating')) return;
    curtain.classList.add('is-animating');
    targetSection.classList.remove('reveal-active');

    // When the red & ink curtain covers the viewport, jump cleanly to the section and reveal
    setTimeout(() => {
      const topNavHeight = 82;
      const targetTop = targetSection.getBoundingClientRect().top + window.scrollY - topNavHeight;
      window.scrollTo({ top: targetTop, behavior: 'instant' });
      targetSection.classList.add('reveal-active');
    }, 460);

    setTimeout(() => {
      curtain.classList.remove('is-animating');
    }, 1180);
  });
}

/* =====================================================================
   3B. PIAC ÉS KÓD — 3+3 PIKTOGRAM ÉS HOVER INFOGRAFIKA
   ===================================================================== */
function initExpertPictograms() {
  const zones = document.querySelectorAll('.expert-interactive-zone');

  zones.forEach((zone) => {
    const triggers = zone.querySelectorAll('.pictogram-trigger');
    const cards = zone.querySelectorAll('.infographic-card');

    function activateCard(targetId, activeBtn) {
      triggers.forEach((t) => t.classList.toggle('is-active', t === activeBtn));
      cards.forEach((c) => c.classList.toggle('is-visible', c.id === targetId));
    }

    function clearZone() {
      triggers.forEach((t) => t.classList.remove('is-active'));
      cards.forEach((c) => c.classList.remove('is-visible'));
    }

    triggers.forEach((btn) => {
      const targetId = btn.getAttribute('data-target');
      btn.addEventListener('mouseenter', () => activateCard(targetId, btn));
      btn.addEventListener('focus', () => activateCard(targetId, btn));
      btn.addEventListener('click', () => activateCard(targetId, btn));
    });

    zone.addEventListener('mouseleave', clearZone);
  });
}

/* =====================================================================
   4. LENYITHATÓ SZOLGÁLTATÁSOK (ACCORDION)
   ===================================================================== */
function initExpandableServices() {
  const items = document.querySelectorAll('.track-item');

  items.forEach((item) => {
    const row = item.querySelector('.track-row');
    const details = item.querySelector('.track-details');
    const label = item.querySelector('.expand-label');
    const icon = item.querySelector('.expand-icon');

    if (!row || !details) return;

    function toggleItem() {
      const isOpen = item.classList.contains('is-open');

      if (isOpen) {
        item.classList.remove('is-open');
        row.classList.remove('active-track');
        row.setAttribute('aria-expanded', 'false');
        details.style.maxHeight = '0px';
        if (label) label.textContent = 'Bővebben';
        if (icon) icon.textContent = '+';
      } else {
        item.classList.add('is-open');
        row.classList.add('active-track');
        row.setAttribute('aria-expanded', 'true');
        details.style.maxHeight = details.scrollHeight + 'px';
        if (label) label.textContent = 'Bezárás';
        if (icon) icon.textContent = '−';
      }
    }

    row.addEventListener('click', toggleItem);
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleItem();
      }
    });
  });
}

/* =====================================================================
   5. MINIMALISTA KAPCSOLATI ŰRLAP
   ===================================================================== */
function initContactForm() {
  const form = document.getElementById('leadForm');
  const status = document.getElementById('formFeedback');
  if (!form || !status) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    status.textContent = 'Üzenet elküldve — 24 órán belül jelentkezünk.';
    form.reset();
  });
}

/* =====================================================================
   6. LÁBLÉC HOVER LIQUID GRADIENT (3D SELYEM + HALFTONE TÖBBRÉTEGŰ PIROS)
   ===================================================================== */
function initFooterLiquidHover() {
  const word = document.getElementById('footerGiantWord');
  if (!word) return;

  let mouseOffsetX = 0;
  let mouseOffsetY = 0;
  let smoothOffsetX = 0;
  let smoothOffsetY = 0;

  word.addEventListener('mousemove', (e) => {
    const rect = word.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      mouseOffsetX = (((e.clientX - rect.left) / rect.width) - 0.5) * 32;
      mouseOffsetY = (((e.clientY - rect.top) / rect.height) - 0.5) * 32;
    }
  });

  word.addEventListener('mouseleave', () => {
    mouseOffsetX = 0;
    mouseOffsetY = 0;
  });

  let t = 0;

  function updateLiquid() {
    t += 0.018;

    smoothOffsetX += (mouseOffsetX - smoothOffsetX) * 0.045;
    smoothOffsetY += (mouseOffsetY - smoothOffsetY) * 0.045;

    // 1. Fehéren izzó világospiros / korall selyem-gerinc
    const lx1 = 52 + Math.sin(t * 1.15) * 36 + Math.cos(t * 0.6) * 8 + smoothOffsetX;
    const ly1 = 50 + Math.cos(t * 1.55) * 38 + smoothOffsetY;
    const rw1 = 26 + Math.sin(t * 1.8) * 7;
    const rh1 = 82 + Math.cos(t * 1.3) * 22;

    // 2. Mély feketés-bordó árnyékredő (közvetlenül a fénygerinc mellett örvénylik)
    const lx2 = 46 + Math.sin(t * 1.15 - 0.85) * 38 - smoothOffsetX * 0.6;
    const ly2 = 46 + Math.cos(t * 1.55 - 0.75) * 40 - smoothOffsetY * 0.6;
    const rw2 = 25 + Math.cos(t * 1.6) * 6;
    const rh2 = 88 + Math.sin(t * 1.2) * 20;

    // 3. Másodlagos neon-skarlát hullámhegy
    const lx3 = 50 + Math.cos(t * 0.95 + 2.4) * 40 + smoothOffsetX * 0.5;
    const ly3 = 54 + Math.sin(t * 1.4 + 1.9) * 36 + smoothOffsetY * 0.5;
    const rw3 = 24 + Math.sin(t * 1.5 + 1.1) * 6;
    const rh3 = 78 + Math.cos(t * 1.4 + 0.9) * 18;

    // 4. Másodlagos sötétkarmazsin mélyedés
    const lx4 = 54 + Math.sin(t * 1.3 + 3.8) * 38 - smoothOffsetX * 0.4;
    const ly4 = 48 + Math.cos(t * 1.1 + 2.9) * 36 - smoothOffsetY * 0.4;
    const rw4 = 25 + Math.cos(t * 1.7 + 2.0) * 6;
    const rh4 = 84 + Math.sin(t * 1.35 + 1.5) * 20;

    // Alap 10-árnyalatú selyem-gradiens szög és fázis
    const angle = 126 + Math.sin(t * 0.75) * 38;
    const posX = 50 + Math.sin(t * 0.9) * 48;
    const posY = 50 + Math.cos(t * 1.1) * 48;

    word.style.setProperty('--lx1', `${lx1.toFixed(2)}%`);
    word.style.setProperty('--ly1', `${ly1.toFixed(2)}%`);
    word.style.setProperty('--rw1', `${rw1.toFixed(2)}%`);
    word.style.setProperty('--rh1', `${rh1.toFixed(2)}%`);

    word.style.setProperty('--lx2', `${lx2.toFixed(2)}%`);
    word.style.setProperty('--ly2', `${ly2.toFixed(2)}%`);
    word.style.setProperty('--rw2', `${rw2.toFixed(2)}%`);
    word.style.setProperty('--rh2', `${rh2.toFixed(2)}%`);

    word.style.setProperty('--lx3', `${lx3.toFixed(2)}%`);
    word.style.setProperty('--ly3', `${ly3.toFixed(2)}%`);
    word.style.setProperty('--rw3', `${rw3.toFixed(2)}%`);
    word.style.setProperty('--rh3', `${rh3.toFixed(2)}%`);

    word.style.setProperty('--lx4', `${lx4.toFixed(2)}%`);
    word.style.setProperty('--ly4', `${ly4.toFixed(2)}%`);
    word.style.setProperty('--rw4', `${rw4.toFixed(2)}%`);
    word.style.setProperty('--rh4', `${rh4.toFixed(2)}%`);

    word.style.setProperty('--l-angle', `${angle.toFixed(1)}deg`);
    word.style.setProperty('--l-pos-x', `${posX.toFixed(2)}%`);
    word.style.setProperty('--l-pos-y', `${posY.toFixed(2)}%`);

    requestAnimationFrame(updateLiquid);
  }

  requestAnimationFrame(updateLiquid);
}
