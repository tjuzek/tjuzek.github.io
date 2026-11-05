/* Sleep sounds: LIN 3042. Plays sleep EEG sped up (audification). Nothing is stored or sent.
 *
 * Clips: data/<id>.bin, 16-bit samples at 100 Hz, one common gain (meta.uv_per_unit).
 *   Played by putting the samples into an AudioBuffer whose sample rate is 100 x speed
 *   (10, 20 or 40 kHz), so the browser does the resampling. If a browser refuses that rate,
 *   the buffer is made at the context's own rate and playbackRate does the speed-up instead.
 * Night: data/night.mp3, rendered at 200x; other speeds via playbackRate (pitch moves with it,
 *   as it should: faster playback is higher).
 */
(function () {
  'use strict';
  var FS = 100;
  var MIN_LISTEN = 6;               // seconds: short clips loop until about this long
  var FADE = 0.012;                 // seconds of fade at the clip edges, against clicks
  var STRIP_UV = 100;               // strip half-height in microvolts, the same for every card
  var STAGE_NAME = { W: 'awake', N1: 'N1, light sleep', N2: 'N2', N3: 'N3, deep sleep', REM: 'REM sleep' };
  var LONG_NAME = { W: 'awake', N1: 'light sleep', N2: 'stage 2 sleep', N3: 'deep sleep',
    REM: 'rapid eye movement sleep' };
  var HYP_ROWS = ['W', 'REM', 'N1', 'N2', 'N3'];
  var CODE = { W: 'W', '1': 'N1', '2': 'N2', '3': 'N3', R: 'REM', '?': '?' };

  var speed = 200;
  var meta = null;
  var ctx = null;
  var samples = {};                 // id -> Float32Array in [-1, 1]
  var current = null;               // { stop: fn }
  var nightBuf = null;

  function $(id) { return document.getElementById(id); }
  function css(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#000'; }
  function clipMeta(id) { return meta.clips.filter(function (c) { return c.id === id; })[0]; }
  function fmt(s) { return s < 10 ? s.toFixed(1) + ' s' : Math.round(s) + ' s'; }

  function audio() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function loadClip(id) {
    if (samples[id]) return Promise.resolve(samples[id]);
    return fetch('data/' + id + '.bin').then(function (r) {
      if (!r.ok) throw new Error('could not load ' + id);
      return r.arrayBuffer();
    }).then(function (ab) {
      var dv = new DataView(ab), n = ab.byteLength / 2, out = new Float32Array(n);
      for (var i = 0; i < n; i++) out[i] = dv.getInt16(2 * i, true) / 32767;
      samples[id] = out;
      return out;
    });
  }

  function fade(data, rate) {
    var k = Math.min(Math.floor(FADE * rate), Math.floor(data.length / 4));
    for (var i = 0; i < k; i++) {
      var g = i / k;
      data[i] *= g;
      data[data.length - 1 - i] *= g;
    }
  }

  function clipBuffer(x) {
    var ac = audio(), rate = FS * speed, buf, playbackRate = 1;
    try {
      buf = ac.createBuffer(1, x.length, rate);
      buf.getChannelData(0).set(x);
    } catch (e) {
      rate = ac.sampleRate;                 // fallback: base speed rate/100, then slow it down
      buf = ac.createBuffer(1, x.length, rate);
      buf.getChannelData(0).set(x);
      playbackRate = (FS * speed) / rate;
    }
    fade(buf.getChannelData(0), rate);
    return { buf: buf, playbackRate: playbackRate, seconds: x.length / (FS * speed) };
  }

  function stopCurrent() {
    if (current) { var c = current; current = null; c.stop(); }
  }

  /* ---------- clip cards ---------- */

  function setDur(card) {
    var c = clipMeta(card.getAttribute('data-clip'));
    var s = c.minutes * 60 / speed;
    var times = Math.max(1, Math.ceil(MIN_LISTEN / s - 1e-9));
    card.querySelector('.dur').textContent = c.minutes + ' min of sleep in ' + fmt(s) +
      (times > 1 ? ', played ' + times + ' times' : '');
  }

  function playCard(card) {
    var btn = card.querySelector('.play'), bar = card.querySelector('.bar i');
    var id = card.getAttribute('data-clip');
    if (btn.getAttribute('data-on')) { stopCurrent(); return; }
    stopCurrent();
    audio();
    btn.textContent = 'Loading';
    loadClip(id).then(function (x) {
      var cb = clipBuffer(x), ac = audio();
      var src = ac.createBufferSource();
      src.buffer = cb.buf;
      src.playbackRate.value = cb.playbackRate;
      src.loop = true;
      src.connect(ac.destination);
      var times = Math.max(1, Math.ceil(MIN_LISTEN / cb.seconds - 1e-9));
      var total = times * cb.seconds, t0 = ac.currentTime + 0.05, raf = 0, done = false;
      src.start(t0);
      src.stop(t0 + total);
      btn.textContent = 'Stop';
      btn.setAttribute('data-on', '1');
      function tick() {
        if (done) return;
        var f = Math.max(0, Math.min(1, (ac.currentTime - t0) / total));
        bar.style.width = (100 * f) + '%';
        raf = requestAnimationFrame(tick);
      }
      function finish() {
        if (done) return;
        done = true;
        cancelAnimationFrame(raf);
        bar.style.width = '0';
        btn.textContent = 'Play';
        btn.removeAttribute('data-on');
        if (current && current.src === src) current = null;
      }
      src.onended = finish;
      current = { src: src, stop: function () { try { src.stop(); } catch (e) { /* already stopped */ } finish(); } };
      tick();
    }).catch(function (e) {
      btn.textContent = 'Play';
      card.querySelector('.dur').textContent = 'Could not load the clip. Please reload the page.';
      if (window.console) console.error(e);
    });
  }

  function drawStrip(card) {
    var cv = card.querySelector('canvas.strip');
    if (!cv || cv.hidden) return;
    var id = card.getAttribute('data-clip'), c = clipMeta(id);
    loadClip(id).then(function (x) {
      var dpr = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
      if (!w) return;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      var g = cv.getContext('2d');
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      var top = 4, bottom = h - 18, mid = (top + bottom) / 2, half = (bottom - top) / 2;
      var pxPerUnit = half / (STRIP_UV / meta.uv_per_unit / 32767);
      // time ticks: every second, longer every 5 s
      g.strokeStyle = css('--line'); g.lineWidth = 1;
      g.fillStyle = css('--muted'); g.font = '11px system-ui, sans-serif'; g.textAlign = 'center';
      for (var s = 0; s <= 30; s++) {
        var tx = Math.round(s / 30 * (w - 1)) + 0.5;
        g.beginPath(); g.moveTo(tx, bottom + 2); g.lineTo(tx, bottom + (s % 5 ? 5 : 9)); g.stroke();
        if (s % 5 === 0 && s > 0 && s < 30) g.fillText(s + ' s', tx, h - 1);
      }
      g.save();
      g.beginPath(); g.rect(0, top - 2, w, bottom - top + 4); g.clip();
      g.strokeStyle = css('--ink'); g.lineWidth = 1;
      g.beginPath();
      var a = c.strip_epoch * 30 * FS, n = 30 * FS;
      for (var i = 0; i < n; i++) {
        var px = i / (n - 1) * (w - 1), py = mid - x[a + i] * pxPerUnit;
        if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.stroke();
      g.restore();
      // scale bar: 50 microvolts
      var sb = 50 / STRIP_UV * half;
      g.strokeStyle = css('--garnet'); g.lineWidth = 2;
      g.beginPath(); g.moveTo(w - 3, mid - sb / 2); g.lineTo(w - 3, mid + sb / 2); g.stroke();
      g.textAlign = 'right';
      var tw = g.measureText('50 µV').width;
      g.fillStyle = css('--bg');
      g.fillRect(w - 11 - tw, mid - 8, tw + 5, 15);
      g.fillStyle = css('--garnet');
      g.fillText('50 µV', w - 8, mid + 4);
    });
  }

  function reveal(card) {
    var c = clipMeta(card.getAttribute('data-clip'));
    var p = card.querySelector('.answer');
    p.innerHTML = '<strong>' + c.stage + '</strong> (' + LONG_NAME[c.stage] + '), as scored by the ' +
      'technicians. From recording ' + c.recording + ': ' + c.rule + '.';
    p.hidden = false;
    card.querySelector('.reveal').hidden = true;
    var cv = card.querySelector('canvas.strip');
    cv.hidden = false;
    cv.setAttribute('aria-label', '30 seconds of ' + STAGE_NAME[c.stage] + ' EEG');
    drawStrip(card);
  }

  /* ---------- the night ---------- */

  var night = { playing: false, offset: 0, t0: 0, rate: 1, src: null, raf: 0 };

  function nightStages() { return meta.night.stages; }
  function nightSeconds() { return meta.night.n_epochs * 30 / meta.night_speed; }   // at 200x

  function clockAt(epoch) {
    var p = meta.night.record_start.split('.');
    var t = (+p[0] * 3600 + +p[1] * 60 + +p[2] + (meta.night.start_epoch + epoch) * 30) % 86400;
    var hh = Math.floor(t / 3600), mm = Math.floor((t % 3600) / 60);
    return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
  }

  function nightPos() {   // fraction of the night, 0..1
    var s = night.offset;
    if (night.playing && ctx) s += (ctx.currentTime - night.t0) * night.rate;
    return Math.max(0, Math.min(1, s / nightSeconds()));
  }

  function drawHyp() {
    var cv = $('hyp');
    var dpr = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !meta) return;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    var g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    var left = 44, right = w - 6, top = 8, bottom = h - 22;
    var st = nightStages(), n = st.length;
    var rowY = function (code) {
      var k = HYP_ROWS.indexOf(CODE[code]);
      if (k < 0) k = 0;
      return top + k * (bottom - top) / (HYP_ROWS.length - 1);
    };
    var xAt = function (ep) { return left + ep / n * (right - left); };
    g.font = '11.5px system-ui, sans-serif'; g.fillStyle = css('--muted'); g.textAlign = 'right';
    g.strokeStyle = css('--line'); g.lineWidth = 1;
    HYP_ROWS.forEach(function (r, k) {
      var y = top + k * (bottom - top) / (HYP_ROWS.length - 1);
      g.fillText(r, left - 8, y + 4);
      g.beginPath(); g.moveTo(left, Math.round(y) + 0.5); g.lineTo(right, Math.round(y) + 0.5); g.stroke();
    });
    // hour ticks
    g.textAlign = 'center';
    var every = (right - left) / (n / 120) < 45 ? 2 : 1;   // label every 2nd hour when narrow
    for (var ep = 0; ep <= n; ep++) {
      var c = clockAt(ep);
      if (c.slice(3) === '00') {
        var tx = Math.round(xAt(ep)) + 0.5;
        g.beginPath(); g.moveTo(tx, bottom + 2); g.lineTo(tx, bottom + 7); g.stroke();
        if (+c.slice(0, 2) % every === 0 && tx + 18 <= w) g.fillText(c, tx, h - 4);
      }
    }
    // the stage line
    g.strokeStyle = css('--ink'); g.lineWidth = 1.5;
    g.beginPath();
    for (var i = 0; i < n; i++) {
      var y = rowY(st[i]);
      if (i === 0) g.moveTo(xAt(0), y); else g.lineTo(xAt(i), y);
      g.lineTo(xAt(i + 1), y);
    }
    g.stroke();
    // REM in garnet, thick
    g.strokeStyle = css('--garnet'); g.lineWidth = 5;
    for (i = 0; i < n; i++) {
      if (st[i] !== 'R') continue;
      var j = i;
      while (j < n && st[j] === 'R') j++;
      g.beginPath(); g.moveTo(xAt(i), rowY('R')); g.lineTo(xAt(j), rowY('R')); g.stroke();
      i = j - 1;
    }
    // playhead
    var f = nightPos(), px = xAt(f * n);
    g.strokeStyle = css('--gold'); g.lineWidth = 3;
    g.beginPath(); g.moveTo(px, top - 4); g.lineTo(px, bottom + 2); g.stroke();
    var e = Math.min(n - 1, Math.floor(f * n)), code = CODE[st[e]];
    $('hyp-readout').textContent = clockAt(e) + ' at night: ' +
      (code === '?' ? 'not scored' : (STAGE_NAME[code] || code));
    $('night-bar').style.width = (100 * f) + '%';
  }

  function setNightDur() {
    var s = meta.night.n_epochs / 120, played = nightSeconds() * meta.night_speed / speed;
    $('night-dur').textContent = s.toFixed(0) + ' hours in ' + (played >= 120 ?
      Math.floor(played / 60) + ' min ' + Math.round(played % 60) + ' s' : Math.round(played) + ' s');
  }

  function loadNight() {
    if (nightBuf) return Promise.resolve(nightBuf);
    var ac = audio();
    return fetch('data/night.mp3').then(function (r) {
      if (!r.ok) throw new Error('could not load the night');
      return r.arrayBuffer();
    }).then(function (ab) {
      return new Promise(function (res, rej) { ac.decodeAudioData(ab, res, rej); });
    }).then(function (b) { nightBuf = b; return b; });
  }

  function nightTick() {
    drawHyp();
    if (night.playing) night.raf = requestAnimationFrame(nightTick);
  }

  function nightStop(keepPos) {
    if (!night.playing) return;
    night.offset = nightPos() * nightSeconds();
    night.playing = false;
    cancelAnimationFrame(night.raf);
    try { night.src.onended = null; night.src.stop(); } catch (e) { /* already stopped */ }
    if (current && current.src === night.src) current = null;
    night.src = null;
    if (!keepPos && night.offset >= nightSeconds() - 0.05) night.offset = 0;
    $('night-play').textContent = 'Play';
    $('night-play').removeAttribute('data-on');
    drawHyp();
  }

  function nightStart() {
    var btn = $('night-play');
    stopCurrent();
    btn.textContent = 'Loading';
    loadNight().then(function (b) {
      var ac = audio();
      if (night.offset >= nightSeconds() - 0.05) night.offset = 0;
      var src = ac.createBufferSource();
      src.buffer = b;
      night.rate = speed / meta.night_speed;
      src.playbackRate.value = night.rate;
      src.connect(ac.destination);
      night.t0 = ac.currentTime + 0.05;
      src.start(night.t0, Math.min(night.offset, b.duration - 0.01));
      src.onended = function () {
        if (night.src !== src) return;
        nightStop(false);
        night.offset = 0;
        drawHyp();
      };
      night.src = src;
      night.playing = true;
      btn.textContent = 'Pause';
      btn.setAttribute('data-on', '1');
      current = { src: src, stop: function () { nightStop(true); } };
      nightTick();
    }).catch(function (e) {
      btn.textContent = 'Play';
      $('night-dur').textContent = 'Could not load the night. Please reload the page.';
      if (window.console) console.error(e);
    });
  }

  function nightSeek(ev) {
    var cv = $('hyp'), r = cv.getBoundingClientRect(), left = 44, right = r.width - 6;
    var f = Math.max(0, Math.min(1, (ev.clientX - r.left - left) / (right - left)));
    var wasPlaying = night.playing;
    if (wasPlaying) nightStop(true);
    night.offset = f * nightSeconds();
    if (wasPlaying) nightStart(); else drawHyp();
  }

  /* ---------- speed ---------- */

  function setSpeed(s) {
    speed = s;
    document.querySelectorAll('.speed button').forEach(function (b) {
      b.setAttribute('aria-pressed', +b.getAttribute('data-speed') === s ? 'true' : 'false');
    });
    $('speed-say').textContent = 'At ' + s + '×, a 1 Hz wave becomes ' + s + ' Hz, a 10 Hz wave ' +
      (10 * s >= 1000 ? (10 * s / 1000) + ' kHz' : 10 * s + ' Hz') + ', and 10 minutes of sleep last ' +
      fmt(600 / s) + '.';
    document.querySelectorAll('.card[data-clip]').forEach(setDur);
    setNightDur();
    var nightWas = night.playing;
    stopCurrent();
    if (nightWas) nightStart();
  }

  /* ---------- start ---------- */

  fetch('data/meta.json').then(function (r) { return r.json(); }).then(function (m) {
    meta = m;
    document.querySelectorAll('.speed button').forEach(function (b) {
      b.addEventListener('click', function () { setSpeed(+b.getAttribute('data-speed')); });
    });
    document.querySelectorAll('.card[data-clip]').forEach(function (card) {
      card.querySelector('.play').addEventListener('click', function () { playCard(card); });
      var rv = card.querySelector('.reveal');
      if (rv) rv.addEventListener('click', function () { reveal(card); });
      drawStrip(card);
    });
    $('night-play').addEventListener('click', function () {
      if (night.playing) { stopCurrent(); } else { nightStart(); }
    });
    $('hyp').addEventListener('click', nightSeek);
    setSpeed(200);
    drawHyp();
    var rt = 0;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        document.querySelectorAll('.card[data-clip]').forEach(drawStrip);
        drawHyp();
      }, 150);
    });
  }).catch(function (e) {
    if (window.console) console.error(e);
  });
})();
