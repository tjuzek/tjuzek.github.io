/* flurry.js: the panel slide's moving light. Tommie, 30 Sep: first "waves in an animation in the colours of the
   presentation in a calm, stylish motion during the panel, e.g. inspired by lubuntu's screensaver 'flurry'", then
   "I like the sparks. but the general design is waves". So: the deck's own three wave bundles (the geometry of
   deck.js's buildWaves), drawn in light, rolling, breathing and drifting slowly; and glints that run along single
   lines, trailing light and shedding a few sparks that drift off and fade. Our own code.
   Runs only while the panel slide is showing; a still frame under reduced motion; nothing in print. */
(function () {
  'use strict';
  var W = 1920, H = 1080, STEP = 12;
  var SPREAD = 1.45, AMP = 1.55;     // Tommie, 30 Sep: more of the screen, even a bit out: bundles further apart, waves taller
  var canvas = null, ctx = null, raf = 0, last = 0, t = 0, bg = [5, 5, 7];
  var bundles = [], glints = [], sparks = [], untilGlint = 0;
  var html = document.documentElement;

  function rgb(v, fallback) {
    v = (v || '').trim();
    var m = /^#([0-9a-f]{6})$/i.exec(v);
    if (m) return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)];
    m = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/i.exec(v);
    if (m) return [+m[1], +m[2], +m[3]];
    return fallback;
  }
  function lift(c, k) { return c.map(function (x) { return Math.min(255, Math.round(x + (255 - x) * k)); }); }

  function setup() {
    canvas = document.querySelector('#panel canvas.flurry');
    if (!canvas) return false;
    ctx = canvas.getContext('2d');
    var cs = getComputedStyle(html);
    bg = rgb(cs.getPropertyValue('--bg'), bg);
    var gold = rgb(cs.getPropertyValue('--w-gold'), [168, 143, 85]);
    var violet = rgb(cs.getPropertyValue('--w-violet'), [108, 95, 174]);
    var blue = rgb(cs.getPropertyValue('--w-blue'), [74, 111, 192]);
    // the background's bundles (deck.js), each with its own slow roll (w), breath (br) and drift (v, px per second)
    bundles = [
      { c: lift(gold, 0.2), cy: 650, amp: 185, k1: 1, k2: 3, b: 30, n: 16, dphi: 0.095, ph0: 0.4, op0: 0.16, op1: 0.62, w: 0.11, v: -18, br: 0.13 },
      { c: lift(violet, 0.25), cy: 420, amp: 225, k1: 1, k2: 2, b: 44, n: 14, dphi: 0.085, ph0: 2.2, op0: 0.14, op1: 0.5, w: -0.08, v: 12, br: 0.09 },
      { c: lift(blue, 0.25), cy: 790, amp: 130, k1: 2, k2: 3, b: 22, n: 12, dphi: 0.12, ph0: 4.1, op0: 0.12, op1: 0.46, w: 0.14, v: -9, br: 0.17 }
    ];
    glints = []; sparks = [];
    return true;
  }

  // the y of line i of bundle B at x, at time t (the background's formula, set in motion)
  function lineY(B, i, x) {
    var breath = 0.86 + 0.18 * Math.sin(B.br * t + B.ph0);
    var phi = B.ph0 + i * B.dphi + B.w * t, A = B.amp * (1 - i * 0.02) * breath, off = (i - B.n / 2) * 3.2;
    var tau = 2 * Math.PI * (x - B.v * t) / 1920;
    var cy = H / 2 + (B.cy - 620) * SPREAD, wave = A * Math.sin(B.k1 * tau + phi) + B.b * Math.sin(B.k2 * tau + phi * 1.7);
    return cy + off * 1.6 + wave * AMP;
  }

  function frame(dt) {
    t += dt / 60;                                               // seconds
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgb(' + bg.join(',') + ')';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = 1.7;
    bundles.forEach(function (B) {
      for (var i = 0; i < B.n; i++) {
        var op = (B.op0 + (B.op1 - B.op0) * Math.sin(Math.PI * (i + 0.5) / B.n)) * 0.72;
        ctx.strokeStyle = 'rgba(' + B.c.join(',') + ',' + op.toFixed(3) + ')';
        ctx.beginPath();
        for (var x = -STEP; x <= W + STEP; x += STEP) {
          var y = lineY(B, i, x);
          if (x < 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    });
    // glints: light running along one line, now and then
    untilGlint -= dt / 60;
    if (untilGlint <= 0 && glints.length < 7) {
      var B = bundles[Math.floor(Math.random() * bundles.length)];
      var dir = Math.random() < 0.5 ? 1 : -1;
      glints.push({ B: B, i: Math.floor(Math.random() * B.n), x: dir > 0 ? -40 : W + 40, dir: dir,
                    sp: 110 + Math.random() * 90, life: 0 });
      untilGlint = 0.9 + Math.random() * 1.6;
    }
    for (var g = glints.length - 1; g >= 0; g--) {
      var G = glints[g];
      G.x += G.dir * G.sp * dt / 60; G.life += dt / 60;
      if (G.x < -80 || G.x > W + 80) { glints.splice(g, 1); continue; }
      var fade = Math.min(1, G.life / 1.2);
      // the tail: the last 240 px of the line behind the glint, brightening towards it
      for (var k = 0; k < 20; k++) {
        var x0 = G.x - G.dir * (k + 1) * 12, x1 = G.x - G.dir * k * 12;
        ctx.strokeStyle = 'rgba(' + lift(G.B.c, 0.4).join(',') + ',' + (fade * 0.5 * (1 - k / 20)).toFixed(3) + ')';
        ctx.lineWidth = 2.8 - k * 0.1;
        ctx.beginPath(); ctx.moveTo(x0, lineY(G.B, G.i, x0)); ctx.lineTo(x1, lineY(G.B, G.i, x1)); ctx.stroke();
      }
      var gy = lineY(G.B, G.i, G.x);
      var hc = lift(G.B.c, 0.6).join(','), glow = ctx.createRadialGradient(G.x, gy, 0, G.x, gy, 30);
      glow.addColorStop(0, 'rgba(' + hc + ',' + (fade * 0.42).toFixed(3) + ')');
      glow.addColorStop(1, 'rgba(' + hc + ',0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(G.x, gy, 30, 0, 2 * Math.PI); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,' + (fade * 0.75).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(G.x, gy, 2.6, 0, 2 * Math.PI); ctx.fill();
      // a few sparks shed as it passes
      if (Math.random() < 1.2 * dt) {
        var a = Math.random() * Math.PI * 2, r = 0.5 + Math.random() * 1.8;
        sparks.push({ x: G.x, y: gy, vx: Math.cos(a) * r - G.dir * 0.3, vy: Math.sin(a) * r, life: 1,
                      decay: 0.005 + Math.random() * 0.006, c: lift(G.B.c, 0.5), w: 1.8 + Math.random() * 1.4 });
      }
    }
    for (var s = sparks.length - 1; s >= 0; s--) {
      var q = sparks[s];
      q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= Math.pow(0.985, dt); q.vy *= Math.pow(0.985, dt);
      q.life -= q.decay * dt;
      if (q.life <= 0) { sparks.splice(s, 1); continue; }
      ctx.strokeStyle = 'rgba(' + q.c.join(',') + ',' + (q.life * 0.6).toFixed(3) + ')';
      ctx.lineWidth = q.w;
      ctx.beginPath(); ctx.moveTo(q.x - q.vx * 6, q.y - q.vy * 6); ctx.lineTo(q.x, q.y); ctx.stroke();
    }
  }

  function loop(now) {
    var dt = last ? Math.min(3, (now - last) / 16.67) : 1;
    last = now;
    frame(dt);
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (html.classList.contains('is-print') || raf) return;
    if (!ctx && !setup()) return;
    if (html.classList.contains('motion-off')) {            // reduced motion: one still frame
      t = 20; frame(0);
      return;
    }
    last = 0;
    raf = requestAnimationFrame(loop);
  }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }

  function onSlide(e) {
    var s = e && e.currentSlide;
    if (s && s.id === 'panel') start(); else stop();
  }
  // reveal dispatches its events on the .reveal element; they bubble to the document
  document.addEventListener('ready', onSlide);
  document.addEventListener('slidechanged', onSlide);
})();
