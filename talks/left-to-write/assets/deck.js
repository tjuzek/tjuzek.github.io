/* deck.js: runtime for "What Is Left to Write?" (v0.1, 28 September 2026).
   URL switches:  ?present (trap F5, Ctrl+R and Tab)   ?motion=on|off   ?palette=flyer|richter|ink
                  ?grey=canvas|horizon   ?print-pdf (reveal's print view)
   Dev keys:      K key test (for the clicker)   P palette   Y grey treatment
   Reveal keys:   PageDown/PageUp, arrows, Space: step   B or . : black   O: overview   G: jump to slide */
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

  /* ---- palette and grey treatment (remembered per browser; storage may be unavailable) ---- */
  var PALETTES = ['flyer', 'richter', 'ink'];
  var GREYS = ['canvas', 'horizon'];
  function load(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function save(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* private window */ } }
  function pick(list, v, d) { return list.indexOf(v) >= 0 ? v : d; }
  html.setAttribute('data-palette', pick(PALETTES, params.get('palette') || load('wltw.palette'), 'flyer'));
  html.setAttribute('data-grey', pick(GREYS, params.get('grey') || load('wltw.grey'), 'canvas'));

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
    o: 'overview', O: 'overview', g: 'jump to slide', G: 'jump to slide', Home: 'first slide', End: 'last slide',
    p: 'palette (dev)', P: 'palette (dev)', y: 'grey treatment (dev)', Y: 'grey treatment (dev)',
    k: 'close this', K: 'close this', F11: 'browser full screen'
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

  /* ---- the waves: three bundles of lines echoing the flyer (our own drawing, not its artwork).
          Periodic over 1920 units, drawn twice as wide, drifted by a composited transform. ---- */
  var SVGNS = 'http://www.w3.org/2000/svg';
  function buildWaves() {
    var host = document.createElement('div');
    host.className = 'waves';
    host.setAttribute('aria-hidden', 'true');
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
    document.body.insertBefore(host, document.body.firstChild);
  }

  function cyclePalette() {
    var cur = html.getAttribute('data-palette');
    var next = PALETTES[(PALETTES.indexOf(cur) + 1) % PALETTES.length];
    html.setAttribute('data-palette', next);
    save('wltw.palette', next);
    toast('Palette: ' + next);
  }
  function cycleGrey() {
    var cur = html.getAttribute('data-grey');
    var next = GREYS[(GREYS.indexOf(cur) + 1) % GREYS.length];
    html.setAttribute('data-grey', next);
    save('wltw.grey', next);
    toast('Grey treatment: ' + next);
  }

  function start() {
    if (!PRINT) buildWaves();
    if (window.DeckCharts) window.DeckCharts.buildAll();
    window.Reveal.initialize({
      width: 1920, height: 1080, margin: 0, center: false, minScale: 0.2, maxScale: 2,
      controls: false, progress: true, slideNumber: false,
      hash: true, history: false, fragmentInURL: true,
      transition: 'fade', transitionSpeed: 'default', backgroundTransition: 'fade',
      keyboard: { 27: null },
      navigationMode: 'linear',
      hideCursorTime: 2500,
      pdfMaxPagesPerSlide: 1, pdfSeparateFragments: true
    }).then(function () {
      window.Reveal.addKeyBinding({ keyCode: 75, key: 'K', description: 'Key test (dev)' }, toggleKeyTest);
      window.Reveal.addKeyBinding({ keyCode: 80, key: 'P', description: 'Cycle palette (dev)' }, cyclePalette);
      window.Reveal.addKeyBinding({ keyCode: 89, key: 'Y', description: 'Cycle grey treatment (dev)' }, cycleGrey);
      if (PRESENT) toast('Presenting: F5, Ctrl+R and Tab are off');
    });
  }

  if (PRINT && document.fonts && document.fonts.ready) document.fonts.ready.then(start);
  else start();
})();
