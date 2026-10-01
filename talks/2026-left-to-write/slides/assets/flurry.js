/* flurry.js: the panel slide's moving light (Tommie, 30 Sep: "waves in an animation in the colours of the
   presentation in a calm, stylish motion during the panel, e.g. inspired by lubuntu's screensaver 'flurry'").
   Our own code, after the idea of the old Flurry screensaver: three streams in the deck's wave colours drift on
   slow paths and shed sparks that glow where they overlap (additive light) and fade into trails.
   Runs only while the panel slide is showing; a still frame under reduced motion; nothing in print. */
(function () {
  'use strict';
  var W = 1920, H = 1080;
  var canvas = null, ctx = null, raf = 0, last = 0, t = 0, streams = [], sparks = [], bg = [5, 5, 7];
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
    var cols = [rgb(cs.getPropertyValue('--w-gold'), [168, 143, 85]),
                rgb(cs.getPropertyValue('--w-violet'), [108, 95, 174]),
                rgb(cs.getPropertyValue('--w-blue'), [74, 111, 192])];
    // each stream: its colour (lifted a little for light), and a slow path of two sines per axis
    streams = cols.map(function (c, i) {
      return { c: lift(c, 0.25), ph: i * 2.09, ax: 0.15 + i * 0.023, bx: 0.061 + i * 0.013,
               ay: 0.112 + i * 0.019, by: 0.077 - i * 0.009, x: W / 2, y: H / 2 };
    });
    sparks = [];
    ctx.fillStyle = 'rgb(' + bg.join(',') + ')';
    ctx.fillRect(0, 0, W, H);
    return true;
  }

  function head(s, tt) {
    return [W / 2 + 560 * Math.sin(s.ax * tt + s.ph) + 220 * Math.sin(s.bx * tt * 1.7 + s.ph * 1.3),
            H / 2 + 270 * Math.sin(s.ay * tt + s.ph * 0.7) + 120 * Math.cos(s.by * tt * 1.9 + s.ph)];
  }

  function frame(dt) {
    t += dt * 0.016;                                            // seconds, roughly
    // fade what was drawn towards the ground: the trails
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(' + bg.join(',') + ',0.032)';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    streams.forEach(function (s) {
      var p = head(s, t), vx = p[0] - s.x, vy = p[1] - s.y;
      for (var k = 0; k < 6; k++) {
        var a = Math.random() * Math.PI * 2, r = Math.random() * 1.7;
        sparks.push({ x: p[0], y: p[1], vx: vx * 0.9 + Math.cos(a) * r, vy: vy * 0.9 + Math.sin(a) * r,
                      life: 1, decay: 0.003 + Math.random() * 0.0035, c: s.c, w: 1 + Math.random() * 1.6 });
      }
      s.x = p[0]; s.y = p[1];
    });
    for (var i = sparks.length - 1; i >= 0; i--) {
      var q = sparks[i], px = q.x, py = q.y;
      // a gentle swirl about the centre, and drag
      var dx = q.x - W / 2, dy = q.y - H / 2;
      q.vx += -dy * 0.00005 * dt; q.vy += dx * 0.00005 * dt;
      q.vx *= Math.pow(0.993, dt); q.vy *= Math.pow(0.993, dt);
      q.x += q.vx * dt; q.y += q.vy * dt;
      q.life -= q.decay * dt;
      if (q.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.strokeStyle = 'rgba(' + q.c.join(',') + ',' + (q.life * 0.2).toFixed(3) + ')';
      ctx.lineWidth = q.w;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(q.x, q.y); ctx.stroke();
    }
    if (sparks.length > 7000) sparks.splice(0, sparks.length - 7000);
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
    if (html.classList.contains('motion-off')) {          // reduced motion: one still frame, drawn at once
      for (var i = 0; i < 260; i++) frame(1);
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
