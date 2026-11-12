/* dye.js: the background of "Copy, Contract, Tilt" (11 November 2026): three plumes of dye wavering in water.
   It replaces the WK deck's line bundles but keeps their composition: each plume is pulled loosely towards
   one of the old wave centre-lines (gold, violet, blue), and the centre-lines drift as the bundles did.

   How it is drawn (cheap on purpose; the talk runs on a laptop):
   - a low-resolution canvas (480 x 270) stretched by CSS to the screen; the upscale blurs it for free;
   - particles carried by a divergence-free ("curl") flow made of a few sine waves, plus a slow current
     along each plume, a loose pull towards its centre-line, and a little jitter (diffusion);
   - each particle is a soft, faint sprite (source-over, so dense dye saturates to its colour, not to white); trails
     fade with 'destination-out', so the canvas
     stays transparent over the page's own ground colour (palette changes need no repaint);
   - colours come from CSS (--wave-a, --wave-b, --wave-c) and are re-read twice a second, so fades apply.

   API: Dye.mount(host, opts) -> { inject(xw, yw, n, plume), still(), dispose() }
        World coordinates are a 1920 x 1080 frame (the slide's own), whatever the screen size.
   opts: count (particles per plume, default 210), colourEl (element whose CSS gives the colours),
         paused() (return true to idle: hidden slides, the Q&A light), still (draw one frame, no motion),
         startEmpty (the plumes fill in over a few seconds, for the opening drop of dye). */
(function () {
  'use strict';
  var W = 480, H = 270, SX = W / 1920;
  var PLUMES = [   // the WK bundles' centre-lines (deck.js v1.00): gold, violet, blue
    { cy: 650, amp: 185, k1: 1, k2: 3, b: 30, ph: 0.4 + 0.7, dir: 1, speed: 12, spread: 30, alpha: 0.026 },
    { cy: 420, amp: 225, k1: 1, k2: 2, b: 44, ph: 2.2 + 0.6, dir: -1, speed: 8.7, spread: 36, alpha: 0.034 },
    { cy: 790, amp: 130, k1: 2, k2: 3, b: 22, ph: 4.1 + 0.7, dir: 1, speed: 8.7, spread: 24, alpha: 0.022 }
  ];
  // the flow: psi = sum a sin(kx x + ky y + w T + p); u = dpsi/dy, v = -dpsi/dx (divergence-free)
  var FLOW = [
    { a: 36, kx: 0.0071, ky: 0.0093, w: 0.21, p: 0.3 },
    { a: 26, kx: -0.0112, ky: 0.0061, w: 0.17, p: 1.9 },
    { a: 18, kx: 0.0157, ky: -0.0134, w: 0.29, p: 4.2 },
    { a: 13, kx: -0.0043, ky: -0.0189, w: 0.13, p: 2.6 }
  ];
  var TAU = Math.PI * 2;

  function centreY(P, x, t) {
    var u = TAU * (x + P.dir * P.speed * t) / 1920;
    return P.cy + P.amp * Math.sin(P.k1 * u + P.ph) + P.b * Math.sin(P.k2 * u + P.ph * 1.7);
  }
  function gauss() { var u = 1 - Math.random(), v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v); }

  // normalise any CSS colour to [r, g, b] through a canvas
  var probe = null;
  function rgbOf(str, fb) {
    try {
      if (!probe) probe = document.createElement('canvas').getContext('2d');
      probe.fillStyle = '#000'; probe.fillStyle = (str || '').trim() || fb;
      var s = probe.fillStyle;
      if (s.charAt(0) === '#') return [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
      var m = s.match(/[\d.]+/g); return [+m[0], +m[1], +m[2]];
    } catch (e) { return [128, 128, 128]; }
  }
  function sprite(rgb) {
    var c = document.createElement('canvas'), R = 32;
    c.width = c.height = R * 2;
    var x = c.getContext('2d'), gr = x.createRadialGradient(R, R, 0, R, R, R);
    var s = rgb[0] + ',' + rgb[1] + ',' + rgb[2];
    gr.addColorStop(0, 'rgba(' + s + ',1)');
    gr.addColorStop(0.4, 'rgba(' + s + ',0.5)');
    gr.addColorStop(1, 'rgba(' + s + ',0)');
    x.fillStyle = gr; x.fillRect(0, 0, R * 2, R * 2);
    return c;
  }

  function mount(host, opts) {
    opts = opts || {};
    var perPlume = opts.count || 260;
    var colourEl = opts.colourEl || document.body;
    var paused = opts.paused || function () { return false; };
    var canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    canvas.className = 'dye';
    host.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    ctx.setTransform(SX, 0, 0, SX, 0, 0);       // draw in world units

    var colKey = '', sprites = [];
    function readColours(force) {
      var cs = getComputedStyle(colourEl);
      var cols = ['--wave-a', '--wave-b', '--wave-c'].map(function (k) { return cs.getPropertyValue(k); });
      var key = cols.join('|');
      if (!force && key === colKey) return false;
      colKey = key;
      var fb = ['#a88f55', '#8b6cff', '#4a6fc0'];
      sprites = cols.map(function (c, i) { return sprite(rgbOf(c, fb[i])); });
      return true;
    }
    readColours(true);

    var parts = [], T = 0;                     // T: simulated seconds
    function spawn(p, plumeIdx, anywhere) {
      var P = PLUMES[plumeIdx];
      p.plume = plumeIdx;
      p.x = anywhere ? Math.random() * 2000 - 40 : (P.dir > 0 ? -60 - Math.random() * 80 : 1980 + Math.random() * 80);
      p.off = gauss() * P.spread;
      p.y = centreY(P, p.x, T) + p.off + gauss() * 6;
      p.vx = 0; p.vy = 0;
      p.cur = P.dir * (0.35 + Math.random() * 0.55);   // the current along the plume, world units per frame
      p.age = anywhere ? Math.random() * 300 : 0;
      p.life = 420 + Math.random() * 520;
      p.cloud = Math.random() < 0.55;                     // clouds (large, faint) and filaments (small)
      p.r = p.cloud ? 46 + Math.random() * 40 : 14 + Math.random() * 14;
      p.inj = false;
      return p;
    }
    var target = perPlume * 3, born = 0;
    var startEmpty = !!opts.startEmpty, fillSecs = 7;
    if (!startEmpty) { for (var i = 0; i < target; i++) parts.push(spawn({}, i % 3, true)); born = target; }

    function inject(xw, yw, n, plumeIdx) {
      for (var i = 0; i < n; i++) {
        var a = Math.random() * TAU, sp = 0.6 + Math.random() * 2.2;
        var pl = plumeIdx === undefined ? (Math.random() < 0.6 ? 0 : (Math.random() < 0.5 ? 1 : 2)) : plumeIdx;
        var p = spawn({}, pl, false);
        p.x = xw + Math.cos(a) * 6; p.y = yw + Math.sin(a) * 6;
        p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp * 0.7;
        p.age = 0; p.life = 520 + Math.random() * 420; p.inj = true; p.r = 14 + Math.random() * 12;
        parts.push(p);
      }
    }

    function step(dt) {
      T += dt / 60;
      if (startEmpty && born < target) {        // the plumes fill in over fillSecs
        var want = Math.min(target, Math.floor(target * T / fillSecs));
        while (born < want) { parts.push(spawn({}, born % 3, false)); born++; }
      }
      var kappa = 0.0055;
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i], P = PLUMES[p.plume];
        var u = 0, v = 0;
        for (var j = 0; j < FLOW.length; j++) {
          var F = FLOW[j], c = Math.cos(F.kx * p.x + F.ky * p.y + F.w * T + F.p) * F.a;
          u += F.ky * c; v -= F.kx * c;
        }
        var k = p.inj ? kappa * Math.min(1, p.age / 240) : kappa;
        var pull = (centreY(P, p.x, T) + p.off - p.y) * k;
        p.vx *= 0.985; p.vy *= 0.985;             // the injection's push dies away
        p.x += (p.cur + u + p.vx + (Math.random() - 0.5) * 0.3) * dt;
        p.y += (v + pull + p.vy + (Math.random() - 0.5) * 0.3) * dt;
        p.age += dt;
        var out = p.x < -160 || p.x > 2080;
        if (p.age > p.life || out) {
          if (p.inj) { parts.splice(i, 1); continue; }
          spawn(p, p.plume, !out && Math.random() < 0.85);
          if (!out) p.age = 0;
        }
      }
    }
    function draw(dt) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,' + Math.min(0.5, 0.02 * dt).toFixed(4) + ')';
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.globalCompositeOperation = 'source-over';   // dye saturates to its own colour, never to white
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i], P = PLUMES[p.plume];
        var env = Math.sin(Math.PI * Math.min(1, p.age / p.life));
        var a = P.alpha * env * (p.inj ? 3 : (p.cloud ? 0.55 : 1.1));
        if (a < 0.0015) continue;
        ctx.globalAlpha = a;
        ctx.drawImage(sprites[p.plume], p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    var raf = 0, last = 0, colT = 0, alive = true;
    function frame(now) {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      if (!last) last = now;
      var dt = Math.min(3, (now - last) / (1000 / 60));
      last = now;
      if (document.hidden || paused()) return;
      colT += dt;
      if (colT > 30) { colT = 0; readColours(false); }
      step(dt);
      draw(dt);
    }
    function still() {                          // reduced motion: settle the plumes, draw one frame
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      if (born < target) { while (born < target) { parts.push(spawn({}, born % 3, true)); born++; } }
      for (var s = 0; s < 260; s++) { step(1); if (s > 180) draw(1); }
    }
    if (opts.still) still();
    else raf = requestAnimationFrame(frame);
    if (opts.still) setInterval(function () {      // a palette change repaints the still frame
      if (!readColours(false)) return;
      ctx.clearRect(0, 0, 1920, 1080);
      for (var s = 0; s < 80; s++) { step(1); draw(1); }
    }, 500);

    return {
      inject: inject,
      still: still,
      count: function () { return parts.length; },
      dispose: function () { alive = false; if (raf) cancelAnimationFrame(raf); canvas.remove(); }
    };
  }

  window.Dye = { mount: mount, plumes: PLUMES };
})();
