/* deck.js: runtime for "Copy, Contract, Tilt" (maths seminar, 13 November 2026). Built on the engine of
   "What Is Left to Write?" (WK talk, 1 October 2026): the same keys, numbering and jump box.
   URL switches:  ?present (trap F5, Ctrl+R and Tab)   ?motion=on|off   ?palette=violet|lilac|electric|wk
                  ?bg=waves (the WK line bundles instead of the dye, a fallback for a weak projector machine)
                  ?dye=deep (the dye on a float16 canvas: true colours, brighter plumes; for comparison)
                  ?print-pdf (reveal's print view)
   Dev keys:      K key test (for the clicker)   P palette (the violet: four candidates)
   Our keys:      G: jump to a slide by its number (A1, A2 for the appendix), Enter to go, Esc to cancel
   Reveal keys:   PageDown/PageUp, arrows, Space: step   B or . : black   O: overview */
(function () {
  'use strict';
  var params = new URLSearchParams(location.search);
  var PRESENT = params.has('present');
  var PRINT = /print-pdf/i.test(location.search);
  var html = document.documentElement;

  /* ---- motion: follow the OS setting unless ?motion=on (GNOME's "reduce animation" would
          otherwise silently switch the animations off at the podium) ---- */
  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* old browser */ }
  if (params.get('motion') === 'off' || (reduce && params.get('motion') !== 'on')) html.classList.add('motion-off');
  if (PRINT) html.classList.add('is-print');

  /* ---- palette: the violet, four candidates (remembered per browser; storage may be unavailable) ---- */
  var PALETTES = ['violet', 'lilac', 'electric', 'wk'];
  function load(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function save(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* private window */ } }
  function pick(list, v, d) { return list.indexOf(v) >= 0 ? v : d; }
  html.setAttribute('data-palette', pick(PALETTES, params.get('palette') || load('cct.palette') || html.getAttribute('data-palette'), 'violet'));

  /* ---- a small toast for dev feedback ---- */
  var toastEl = null, toastTimer = 0;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; document.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, 1500);
  }

  /* ---- key test overlay (K): shows what each clicker button sends ---- */
  var ACTIONS = {
    PageDown: 'next step', PageUp: 'previous step', ArrowRight: 'next step', ArrowLeft: 'previous step',
    ArrowDown: 'next step', ArrowUp: 'previous step', ' ': 'next step', '.': 'black screen on/off',
    b: 'black screen on/off', B: 'black screen on/off', v: 'black screen on/off', F5: PRESENT ? 'blocked (would reload)' : 'reload (blocked with ?present)',
    Escape: 'nothing (overview is O)', Tab: PRESENT ? 'blocked' : 'moves focus (blocked with ?present)',
    o: 'overview', O: 'overview', g: 'jump to slide (number, Enter)', G: 'jump to slide (number, Enter)', Home: 'first slide', End: 'last slide',
    p: 'palette (dev)', P: 'palette (dev)', k: 'close this', K: 'close this', F11: 'browser full screen'
  };
  var kt = null, ktBody = null, ktOpen = false;
  function buildKeyTest() {
    kt = document.createElement('div');
    kt.className = 'keytest';
    kt.innerHTML = '<h2>Key test</h2><p>Press each clicker button. Nothing moves while this is open. Press K to close.</p>' +
      '<table><thead><tr><th>key</th><th>code</th><th>keyCode</th><th>modifiers</th><th>what the deck does</th></tr></thead><tbody></tbody></table>';
    document.body.appendChild(kt);
    ktBody = kt.querySelector('tbody');
  }
  function toggleKeyTest() {
    if (!kt) buildKeyTest();
    ktOpen = !ktOpen;
    kt.classList.toggle('on', ktOpen);
  }
  window.addEventListener('keydown', function (e) {
    if (!ktOpen) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (e.key === 'k' || e.key === 'K') { toggleKeyTest(); return; }
    var mods = ['ctrlKey', 'shiftKey', 'altKey', 'metaKey'].filter(function (m) { return e[m]; }).map(function (m) { return m.replace('Key', ''); }).join('+') || '-';
    var tr = document.createElement('tr');
    [e.key === ' ' ? 'Space' : e.key, e.code, String(e.keyCode), mods, ACTIONS[e.key] || 'nothing'].forEach(function (v, i) {
      var td = document.createElement('td'); td.textContent = v; if (i === 4) td.className = 'act'; tr.appendChild(td);
    });
    ktBody.insertBefore(tr, ktBody.firstChild);
    while (ktBody.children.length > 12) ktBody.removeChild(ktBody.lastChild);
  }, true);

  /* ---- reload guard while presenting (registered after the key test, so the test sees F5 too) ---- */
  window.addEventListener('keydown', function (e) {
    if (!PRESENT) return;
    var k = e.key;
    var reload = k === 'F5' || ((e.ctrlKey || e.metaKey) && (k === 'r' || k === 'R'));
    if (reload || k === 'Tab') {
      e.preventDefault();
      e.stopImmediatePropagation();
      toast((k === 'Tab' ? 'Tab' : 'Reload') + ' ignored while presenting');
    }
  }, true);

  /* ---- the background. Default: dye in water (assets/dye.js). ?bg=waves: the WK deck's three bundles of
          lines, periodic over 1920 units, drawn twice as wide, drifted by a composited transform.
          Both live in div.waves > .amp, so the slide states in deck.css (quiet, swell, panel) apply to either. ---- */
  var SVGNS = 'http://www.w3.org/2000/svg';
  var dye = null;
  function buildLines(host) {
    var bundles = [
      { cls: 'ba', cy: 650, amp: 185, k1: 1, k2: 3, b: 30, n: 16, dphi: 0.095, ph0: 0.4, drift: '', op0: 0.16, op1: 0.62 },
      { cls: 'bb', cy: 420, amp: 225, k1: 1, k2: 2, b: 44, n: 14, dphi: 0.085, ph0: 2.2, drift: 'slow rev', op0: 0.14, op1: 0.5 },
      { cls: 'bc', cy: 790, amp: 130, k1: 2, k2: 3, b: 22, n: 12, dphi: 0.12, ph0: 4.1, drift: 'slow', op0: 0.12, op1: 0.46 }
    ];
    bundles.forEach(function (B) {
      var drift = document.createElement('div');
      drift.className = ('drift ' + B.drift).trim();
      var svg = document.createElementNS(SVGNS, 'svg');
      svg.setAttribute('viewBox', '0 0 3840 1080');
      svg.setAttribute('preserveAspectRatio', 'none');
      svg.setAttribute('class', B.cls);
      var amp = document.createElementNS(SVGNS, 'g');
      amp.setAttribute('class', 'amp');
      for (var i = 0; i < B.n; i++) {
        var phi = B.ph0 + i * B.dphi, A = B.amp * (1 - i * 0.02), off = (i - B.n / 2) * 3.2, d = '';
        for (var x = 0; x <= 3840; x += 16) {
          var t = 2 * Math.PI * x / 1920;
          var yv = B.cy + off + A * Math.sin(B.k1 * t + phi) + B.b * Math.sin(B.k2 * t + phi * 1.7);
          d += (x ? 'L' : 'M') + x + ' ' + yv.toFixed(1);
        }
        var p = document.createElementNS(SVGNS, 'path');
        p.setAttribute('d', d);
        p.setAttribute('stroke-opacity', (B.op0 + (B.op1 - B.op0) * Math.sin(Math.PI * (i + 0.5) / B.n)).toFixed(2));
        amp.appendChild(p);
      }
      svg.appendChild(amp);
      drift.appendChild(svg);
      host.appendChild(drift);
    });
  }
  function buildBackground() {
    var host = document.createElement('div');
    host.className = 'waves';
    host.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(host, document.body.firstChild);
    if (params.get('bg') === 'waves' || !window.Dye) { html.classList.add('bg-lines'); buildLines(host); return; }
    var amp = document.createElement('div');
    amp.className = 'amp';
    host.appendChild(amp);
    dye = window.Dye.mount(amp, {
      colourEl: document.body,
      still: html.classList.contains('motion-off'),
      startEmpty: html.classList.contains('from-dark'),
      deep: params.get('dye') === 'deep'
    });
  }
  /* the opening: one drop of dye, from the title's em dash */
  function dropDye() {
    if (!dye || html.classList.contains('motion-off')) return;
    var d = document.querySelector('#title .title-dash');
    if (!d) return;
    var r = d.getBoundingClientRect();
    if (!r.width) return;
    var xw = (r.left + r.width / 2) / window.innerWidth * 1920, yw = (r.top + r.height / 2) / window.innerHeight * 1080;
    dye.inject(xw, yw, 170);
  }

  /* ---- slide numbers: small, for reference. Counted slides are 1 to N in order, the uncounted
          appendix A1, A2. The title's number shows only in the overview (O). ---- */
  var SLIDES = [], COUNTED = 0, APPENDIX = 0;
  function numberSlides() {
    Array.prototype.forEach.call(document.querySelectorAll('.reveal .slides > section'), function (s) {
      var label = s.getAttribute('data-visibility') === 'uncounted' ? 'A' + (++APPENDIX) : String(++COUNTED);
      SLIDES.push({ label: label, section: s });
      var no = document.createElement('span');
      no.className = 'slide-no' + (s.id === 'title' ? ' overview-only' : '');
      no.setAttribute('aria-hidden', 'true');
      no.textContent = label;
      s.appendChild(no);
    });
  }
  function slideTitle(s) {
    var h = s.querySelector('.kicker, .title-main, .h1, .h2, .h3');
    var t = (h ? h.textContent : s.id).replace(/\s+/g, ' ').trim();
    return t.length > 44 ? t.slice(0, 42) + '…' : t;
  }
  function findSlide(v) {
    if (/^\d+$/.test(v)) v = String(parseInt(v, 10));
    else if (/^A\d+$/.test(v)) v = 'A' + parseInt(v.slice(1), 10);
    else return null;
    for (var i = 0; i < SLIDES.length; i++) if (SLIDES[i].label === v) return SLIDES[i];
    return null;
  }

  /* ---- G: a small box for a slide number. Nothing moves until Enter (no preview flashes on the
          projector); a bad entry keeps the box open; Esc, G or a click elsewhere closes it. ---- */
  var jumpEl = null, jumpInput = null, jumpHint = null;
  function range() { return '1 to ' + COUNTED + (APPENDIX ? ', A1 to A' + APPENDIX : ''); }
  function buildJump() {
    jumpEl = document.createElement('div');
    jumpEl.className = 'jump';
    jumpEl.innerHTML = '<span class="jump-label">Go to</span>' +
      '<input type="text" inputmode="numeric" autocomplete="off" spellcheck="false" maxlength="4" aria-label="Slide number">' +
      '<span class="jump-hint" aria-live="polite"></span>';
    document.body.appendChild(jumpEl);
    jumpInput = jumpEl.querySelector('input');
    jumpHint = jumpEl.querySelector('.jump-hint');
    jumpInput.addEventListener('input', function () {
      var v = jumpInput.value.toUpperCase().replace(/[^0-9A]/g, '');
      if (v !== jumpInput.value) jumpInput.value = v;
      var hit = findSlide(v);
      jumpEl.classList.remove('bad');
      jumpHint.textContent = hit ? slideTitle(hit.section) : (v ? '' : range() + ', then Enter');
    });
    jumpInput.addEventListener('keydown', function (e) {
      e.stopPropagation();
      if (e.key === 'Enter') { e.preventDefault(); confirmJump(); }
      else if (e.key === 'Escape' || e.key === 'g' || e.key === 'G') { e.preventDefault(); closeJump(); }
    });
    jumpInput.addEventListener('blur', closeJump);
  }
  function openJump() {
    if (!jumpEl) buildJump();
    jumpInput.value = '';
    jumpHint.textContent = range() + ', then Enter';
    jumpEl.classList.remove('bad');
    jumpEl.classList.add('on');
    jumpInput.focus();
  }
  function closeJump() {
    if (!jumpEl || !jumpEl.classList.contains('on')) return;
    jumpEl.classList.remove('on', 'bad');
    jumpInput.blur();
  }
  function confirmJump() {
    var v = jumpInput.value, hit = findSlide(v);
    if (!hit) {
      jumpEl.classList.remove('bad');
      void jumpEl.offsetWidth;                      // restart the shake
      jumpEl.classList.add('bad');
      jumpHint.textContent = (v ? 'No slide ' + v + ': ' : 'A number: ') + range();
      jumpInput.select();
      return;
    }
    closeJump();
    var idx = window.Reveal.getIndices(hit.section);
    if (window.Reveal.isOverview()) window.Reveal.toggleOverview(false);
    window.Reveal.slide(idx.h, idx.v, -1);          // land on the slide's first state
  }

  function cyclePalette() {
    var cur = html.getAttribute('data-palette');
    var next = PALETTES[(PALETTES.indexOf(cur) + 1) % PALETTES.length];
    html.setAttribute('data-palette', next);
    save('cct.palette', next);
    toast('Palette: ' + next);
  }

  /* ---- opening on the title slide: the dark of the talk page lifts once the slides are ready,
          and the drop of dye falls from the title's em dash ---- */
  function liftDark() {
    if (!html.classList.contains('from-dark') || html.classList.contains('lifting')) return;
    setTimeout(function () {
      html.classList.add('lifting');
      setTimeout(dropDye, 700);
      setTimeout(function () { html.classList.remove('from-dark'); html.classList.remove('lifting'); }, 2000);
    }, 400);
  }
  if (html.classList.contains('from-dark')) setTimeout(liftDark, 5000);

  function start() {
    if (!PRINT) buildBackground();
    numberSlides();
    if (window.DeckCharts) window.DeckCharts.buildAll();
    window.Reveal.initialize({
      width: 1920, height: 1080, margin: 0, center: false, minScale: 0.2, maxScale: 2,
      controls: false, progress: true, slideNumber: false, jumpToSlide: false,   // numbers and G are ours
      hash: true, history: false, fragmentInURL: true,
      transition: 'fade', transitionSpeed: 'default', backgroundTransition: 'fade',
      keyboard: { 27: null },
      navigationMode: 'linear',
      hideCursorTime: 2500,
      pdfMaxPagesPerSlide: 1, pdfSeparateFragments: true
    }).then(function () {
      window.Reveal.addKeyBinding({ keyCode: 75, key: 'K', description: 'Key test (dev)' }, toggleKeyTest);
      window.Reveal.addKeyBinding({ keyCode: 80, key: 'P', description: 'Cycle palette (dev)' }, cyclePalette);
      window.Reveal.addKeyBinding({ keyCode: 71, key: 'G', description: 'Jump to a slide by number' }, openJump);
      if (PRESENT) toast('Presenting: F5, Ctrl+R and Tab are off');
      liftDark();
    });
  }

  if (PRINT && document.fonts && document.fonts.ready) document.fonts.ready.then(start);
  else start();
  window.DeckDye = { get: function () { return dye; }, drop: dropDye };
})();
