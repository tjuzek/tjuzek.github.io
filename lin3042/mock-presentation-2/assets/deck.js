/* deck.js: runtime for the LIN 3042 mock article presentation (17 November 2026), version 2: the same slides
   with Tommie's intensified text (built by build_mock2.py); each slide's type shrinks until the slide fits.
   Built on the engine of
   "What Is Left to Write?" (WK talk, 1 October 2026) as carried on in "Copy, Contract, Tilt" (13 November 2026):
   the same keys, numbering, jump box and WK's line bundles as the background.
   URL switches:  ?present (trap F5, Ctrl+R and Tab)   ?motion=on|off   ?clean (open with the rubric colours off)
                  ?print-pdf (reveal's print view)
   Our keys:      R: rubric colours on/off (which row of the presentation rubric each part meets; slide 2 is the key)
                  G: jump to a slide by its number (A1, A2 for the appendix), Enter to go, Esc to cancel
   Dev keys:      K key test (for the clicker)
   Reveal keys:   PageDown/PageUp, arrows, Space: step   B or . : black   O: overview */
(function () {
  'use strict';
  var params = new URLSearchParams(location.search);
  var PRESENT = params.has('present');
  var PRINT = /print-pdf/i.test(location.search);
  var html = document.documentElement;

  /* ---- motion: follow the OS setting unless ?motion=on ---- */
  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* old browser */ }
  if (params.get('motion') === 'off' || (reduce && params.get('motion') !== 'on')) html.classList.add('motion-off');
  if (PRINT) html.classList.add('is-print');

  /* ---- a small toast for feedback ---- */
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
    r: 'rubric colours on/off', R: 'rubric colours on/off', k: 'close this', K: 'close this', F11: 'browser full screen'
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

  /* ---- the background: the WK deck's three bundles of lines, periodic over 1920 units, drawn twice as wide,
          drifted by a composited transform. The slide states in deck.css (quiet, thanks) set their strength. ---- */
  var SVGNS = 'http://www.w3.org/2000/svg';
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
    html.classList.add('bg-lines');
    buildLines(host);
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

  /* ---- rubric colours (R): a section's data-rubric names the rubric rows it serves, data-rubric-note what it covers
          there; parts marked data-rb get a bar in that row's colour (deck.css). On by default; R or ?clean hides them.
          Slide 2 is the key. ---- */
  var ROWS = {
    '1': '1 \u00b7 The article and its question', '2': '2 \u00b7 What the researchers did', '3': '3 \u00b7 One piece of evidence',
    '4': '4 \u00b7 Critique', '5': '5 \u00b7 The instructor\u2019s question', '6': '6 \u00b7 Why this article',
    'B1': 'Bonus 1 \u00b7 Timing', 'B2': 'Bonus 2 \u00b7 A second question', 'aside': 'Not on the rubric'
  };
  if (params.has('clean')) html.classList.add('hide-rubric');
  function tagRubric() {
    Array.prototype.forEach.call(document.querySelectorAll('.reveal .slides > section[data-rubric]'), function (s) {
      var tag = document.createElement('div');
      tag.className = 'rubric-tag';
      tag.setAttribute('aria-hidden', 'true');
      s.getAttribute('data-rubric').split(/\s+/).filter(Boolean).forEach(function (k) {
        var c = document.createElement('span');
        c.className = 'rc';
        c.setAttribute('data-rr', k);
        c.textContent = ROWS[k] || k;
        tag.appendChild(c);
      });
      var note = s.getAttribute('data-rubric-note');
      if (note) { var n = document.createElement('span'); n.className = 'rn'; n.textContent = note; tag.appendChild(n); }
      s.appendChild(tag);
    });
  }
  function toggleRubric() {
    var hidden = html.classList.toggle('hide-rubric');
    toast(hidden ? 'Rubric colours off' : 'Rubric colours on');
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

  /* ---- G: a small box for a slide number. Nothing moves until Enter; a bad entry keeps the box open;
          Esc, G or a click elsewhere closes it. ---- */
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

  /* ---- version 2: each slide's type shrinks until the slide fits. deck.css multiplies every text size by --fs; this finds
          the largest --fs (0.3 to 1) at which nothing in the frame crosses its padding. Hidden steps keep their room,
          so the fit holds at every step. Run once the fonts are in; the slides stay hidden until then. ---- */
  var FIT_SEL = 'p, h1, h2, h3, .rr, .hyp, .wc, .c, .chart, .figcard, .split';
  function overflows(s) {
    var f = s.querySelector('.frame');
    if (!f) return false;
    var fr = f.getBoundingClientRect(), k = fr.height / (f.offsetHeight || 1080), cs = getComputedStyle(f);
    var top = fr.top + (parseFloat(cs.paddingTop) - 2) * k, bot = fr.bottom - (parseFloat(cs.paddingBottom) - 2) * k;
    var right = fr.right - (parseFloat(cs.paddingRight) - 2) * k;
    var els = f.querySelectorAll(FIT_SEL);
    for (var i = 0; i < els.length; i++) {
      var r = els[i].getBoundingClientRect();
      if (r.height && (r.top < top || r.bottom > bot || r.right > right)) return true;
    }
    return false;
  }
  function fitSlides() {
    html.classList.add('fitting');
    try {
      Array.prototype.forEach.call(document.querySelectorAll('.reveal .slides section'), function (s) {
        if (!s.querySelector('.frame')) return;
        var shown = s.style.display, lo = 0.3, hi = 1;
        s.style.display = 'block';
        s.style.setProperty('--fs', '1');
        if (overflows(s)) {
          for (var n = 0; n < 12; n++) {
            var mid = (lo + hi) / 2;
            s.style.setProperty('--fs', mid.toFixed(4));
            if (overflows(s)) hi = mid; else lo = mid;
          }
          s.style.setProperty('--fs', lo.toFixed(4));
          if (overflows(s)) console.warn('fit: ' + s.id + ' still overflows at the smallest type');
        }
        s.setAttribute('data-fs', s.style.getPropertyValue('--fs'));
        s.style.display = shown;
      });
    } finally {
      html.classList.remove('fitting', 'unfit');
    }
  }
  html.classList.add('unfit');
  setTimeout(function () { html.classList.remove('unfit'); }, 6000);   // never stay hidden, whatever happens

  function start() {
    /* version 2: the plain look, no background */
    numberSlides();
    tagRubric();
    if (window.DeckCharts) window.DeckCharts.buildAll();
    window.Reveal.initialize({
      width: 1920, height: 1080, margin: 0, center: false, minScale: 0.2, maxScale: 2,
      controls: false, progress: true, slideNumber: false, jumpToSlide: false,   // numbers and G are ours
      hash: true, history: false, fragmentInURL: true,
      transition: 'none', transitionSpeed: 'default', backgroundTransition: 'none',
      keyboard: { 27: null },
      navigationMode: 'linear',
      hideCursorTime: 2500,
      pdfMaxPagesPerSlide: 1, pdfSeparateFragments: true
    }).then(function () {
      window.Reveal.addKeyBinding({ keyCode: 75, key: 'K', description: 'Key test (dev)' }, toggleKeyTest);
      window.Reveal.addKeyBinding({ keyCode: 71, key: 'G', description: 'Jump to a slide by number' }, openJump);
      window.Reveal.addKeyBinding({ keyCode: 82, key: 'R', description: 'Rubric colours on/off' }, toggleRubric);
      if (PRESENT) toast('Presenting: F5, Ctrl+R and Tab are off');
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitSlides); else fitSlides();
    });
  }

  if (PRINT && document.fonts && document.fonts.ready) document.fonts.ready.then(start);
  else start();
})();
