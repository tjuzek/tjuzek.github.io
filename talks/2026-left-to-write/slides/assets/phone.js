/* phone.js: the phone version of "What Is Left to Write?" (phone.html; Tommie, 1 October 2026).
   Reads the slides from index.html at load, so there is one text to keep; shows every build in its final state,
   one slide at a time. Tap, or swipe left, for the next slide; swipe right, or the bar's left arrow, for the one
   before; tap the number in the bar for all slides. The charts are the deck's own (charts.js); tap one to see it
   full screen, sideways on an upright phone. The panel's moving light is left out: it is for the room.
   This page loads deck.css and charts.js but not deck.js or reveal.js; the desktop slides are untouched. */
(function () {
  'use strict';
  var SRC = 'index.html';
  var ILL_W = 517;                                   // the survey drawings' width on the projector (deck.css)
  var deck = document.getElementById('ph-deck');
  var prevB = document.querySelector('.ph-prev'), nextB = document.querySelector('.ph-next');
  var whereB = document.querySelector('.ph-where');
  var noEl = whereB.querySelector('.ph-no'), ofEl = whereB.querySelector('.ph-of');
  var prog = document.querySelector('.ph-progress span');
  var theme = document.querySelector('meta[name="theme-color"]');
  var SLIDES = [], cur = -1, LAST = 0;
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

  /* ---- from the deck's sections to static slides ---- */
  function clean(sec) {
    each(sec.querySelectorAll('.step-marker, canvas'), function (n) { n.parentNode.removeChild(n); });
    [sec].concat(Array.prototype.slice.call(sec.querySelectorAll('*'))).forEach(function (n) {
      n.removeAttribute('style');                    // the projector's sizes; phone.css sets its own
      n.removeAttribute('data-fragment-index');
      n.classList.remove('fragment', 'rise');
    });
  }
  function titleOf(sec) {
    var h = sec.querySelector('.title-main, .h1, .h2, .h3') || sec.querySelector('.kicker');
    var t = (h ? h.textContent : sec.id).replace(/\s+/g, ' ').trim();
    return t.length > 64 ? t.slice(0, 62).replace(/\s+\S*$/, '') + '…' : t;
  }
  // ids inside a chart (the arrow marker, the dot pattern) made unique, so each chart refers to its own
  function uniqueIds(root, suf) {
    var ids = Array.prototype.map.call(root.querySelectorAll('[id]'), function (n) { var o = n.id; n.id = o + suf; return o; });
    if (!ids.length) return;
    each(root.querySelectorAll('*'), function (n) {
      each(Array.prototype.slice.call(n.attributes), function (a) {
        var v = a.value, w = v;
        ids.forEach(function (o) {
          w = w.split('url(#' + o + ')').join('url(#' + o + suf + ')');
          if (w === '#' + o) w = '#' + o + suf;
        });
        if (w !== v) n.setAttribute(a.name, w);
      });
    });
  }

  function build(text) {
    var doc = new DOMParser().parseFromString(text, 'text/html');
    var counted = 0, app = 0;
    deck.innerHTML = '';
    each(doc.querySelectorAll('.reveal .slides > section'), function (s) {
      // numbered as on the projector: counted slides 1 to N, the appendix A1 to A3
      var label = s.getAttribute('data-visibility') === 'uncounted' ? 'A' + (++app) : String(++counted);
      if (s.id === 'panel') return;
      var sec = document.importNode(s, true);
      clean(sec);
      var state = sec.getAttribute('data-state') || 'plain';
      if (state === 'grey' && sec.querySelector('.colour-returns')) state = 'colour';   // the build's end: the gold dash is back
      sec.removeAttribute('data-timing');
      sec.removeAttribute('data-visibility');
      sec.setAttribute('data-state', state);
      sec.setAttribute('aria-label', 'Slide ' + label);
      sec.className = 'ph-slide';
      deck.appendChild(sec);
      SLIDES.push({ el: sec, label: label, title: titleOf(sec) });
      if (/^\d+$/.test(label)) LAST = Math.max(LAST, +label);
    });
    if (window.DeckCharts) window.DeckCharts.buildAll();
    each(deck.querySelectorAll('.chart'), function (c, k) {
      var svg = c.querySelector('svg');
      if (!svg) return;
      uniqueIds(svg, '-c' + k);
      c.setAttribute('role', 'button');
      c.setAttribute('tabindex', '0');
      c.setAttribute('aria-label', 'Enlarge the chart. ' + (svg.getAttribute('aria-label') || ''));
      var hint = document.createElement('p');
      hint.className = 'ph-hint';
      hint.textContent = 'Tap the chart to enlarge it';
      c.parentNode.insertBefore(hint, c.nextSibling);
    });
    buildList();
    go(fromHash());
  }

  /* ---- moving between slides ---- */
  function go(i) {
    if (!SLIDES.length) return;
    i = Math.max(0, Math.min(SLIDES.length - 1, i));
    if (i === cur) return;
    if (cur >= 0) SLIDES[cur].el.classList.remove('is-current');
    cur = i;
    var S = SLIDES[i];
    S.el.classList.add('is-current');
    S.el.scrollTop = 0;
    document.body.setAttribute('data-state', S.el.getAttribute('data-state'));
    noEl.textContent = S.label;
    ofEl.textContent = /^\d+$/.test(S.label) ? '/ ' + LAST : '· appendix';
    whereB.setAttribute('aria-label', 'Slide ' + S.label + ': all slides');
    prog.style.width = ((i + 1) / SLIDES.length * 100).toFixed(2) + '%';
    prevB.disabled = i === 0;
    nextB.disabled = i === SLIDES.length - 1;
    try { history.replaceState(history.state, '', '#' + S.el.id); } catch (e) { /* file:// */ }
    if (theme) theme.setAttribute('content', getComputedStyle(document.body).getPropertyValue('--ground').trim() || '#050507');
    fitDrawings();
  }
  function fromHash() {
    var h = decodeURIComponent(location.hash.replace(/^#\/?/, '').split('/')[0] || '');
    if (!h) return 0;
    if (h === 'panel') return SLIDES.length - 1;
    for (var i = 0; i < SLIDES.length; i++) if (SLIDES[i].el.id === h || SLIDES[i].label === h.toUpperCase()) return i;
    return 0;
  }
  window.addEventListener('hashchange', function () { if (!overlay()) go(fromHash()); });

  // the survey drawings keep their projector geometry and are zoomed to the column they sit in
  function fitDrawings() {
    var S = SLIDES[cur];
    if (!S) return;
    each(S.el.querySelectorAll('#survey .step'), function (st) {
      if (st.clientWidth) st.style.setProperty('--illz', Math.min(1, st.clientWidth / ILL_W).toFixed(3));
    });
  }

  function zoomed() { return !!(window.visualViewport && window.visualViewport.scale > 1.05); }

  /* tap: the next slide (links, buttons and charts do their own thing); swipe: next or previous */
  var lastSwipe = 0, t0 = null;
  deck.addEventListener('click', function (e) {
    var t = e.target;
    var c = t.closest && t.closest('.chart');
    if (c) { openViewer(c); return; }
    if (t.closest && t.closest('a, button, input, select, textarea')) return;
    if (Date.now() - lastSwipe < 500 || zoomed()) return;
    if (window.getSelection && String(window.getSelection())) return;
    go(cur + 1);
  });
  deck.addEventListener('touchstart', function (e) {
    t0 = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() } : null;
  }, { passive: true });
  deck.addEventListener('touchmove', function (e) { if (e.touches.length > 1) t0 = null; }, { passive: true });
  deck.addEventListener('touchend', function (e) {
    if (!t0) return;
    var p = e.changedTouches[0], dx = p.clientX - t0.x, dy = p.clientY - t0.y, dt = Date.now() - t0.t;
    t0 = null;
    if (zoomed()) return;
    if (Math.abs(dx) > 48 && Math.abs(dx) > 1.5 * Math.abs(dy) && dt < 900) {
      lastSwipe = Date.now();
      go(cur + (dx < 0 ? 1 : -1));
    }
  }, { passive: true });
  prevB.addEventListener('click', function () { go(cur - 1); });
  nextB.addEventListener('click', function () { go(cur + 1); });
  whereB.addEventListener('click', openList);

  document.addEventListener('keydown', function (e) {
    var k = e.key;
    if (overlay()) {
      if (k === 'Escape') { e.preventDefault(); closeOverlay(); }
      return;
    }
    var onChart = e.target.closest && e.target.closest('.chart');
    if (onChart && (k === 'Enter' || k === ' ')) { e.preventDefault(); openViewer(onChart); return; }
    if (e.target.closest && e.target.closest('a, button') && (k === 'Enter' || k === ' ')) return;
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (k === 'ArrowRight' || k === 'PageDown' || k === ' ') { e.preventDefault(); go(cur + 1); }
    else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); go(cur - 1); }
    else if (k === 'Home') { e.preventDefault(); go(0); }
    else if (k === 'End') { e.preventDefault(); go(SLIDES.length - 1); }
  });

  /* ---- overlays: all slides, and a chart enlarged. Each takes a history entry, so a phone's back button closes it ---- */
  var list = document.createElement('div');
  list.className = 'ph-list';
  list.setAttribute('role', 'dialog');
  list.setAttribute('aria-label', 'All slides');
  list.innerHTML = '<div class="ph-list-in"><div class="ph-list-head"><p class="kicker">What Is Left to Write?</p>' +
    '<button type="button" class="ph-close" aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 5.5l13 13M18.5 5.5l-13 13"/></svg></button></div>' +
    '<ol></ol><p class="ph-list-foot">On a laptop or a large screen: <a class="ph-full" href="index.html?desktop">the full slides</a>, with every build.</p></div>';
  document.body.appendChild(list);
  var listOl = list.querySelector('ol'), fullA = list.querySelector('.ph-full');
  list.querySelector('.ph-close').addEventListener('click', function () { closeOverlay(); });

  var viewer = document.createElement('div');
  viewer.className = 'ph-viewer';
  viewer.setAttribute('role', 'dialog');
  viewer.setAttribute('aria-label', 'Chart, enlarged');
  viewer.innerHTML = '<div class="ph-viewer-in"><div class="chart"></div><p class="ph-viewer-note"></p></div>';
  document.body.appendChild(viewer);
  var vChart = viewer.querySelector('.chart'), vNote = viewer.querySelector('.ph-viewer-note');
  viewer.addEventListener('click', function () { closeOverlay(); });

  var pendingGo = null;
  function overlay() { return list.classList.contains('on') || viewer.classList.contains('on'); }
  function pushOverlay() { try { history.pushState({ phOverlay: 1 }, '', location.href); } catch (e) { /* file:// */ } }
  function hideOverlays() {
    list.classList.remove('on');
    viewer.classList.remove('on');
    vChart.innerHTML = '';
    deck.removeAttribute('aria-hidden');
  }
  // closing goes back through history when the overlay took an entry; the slide to show (if any) follows on popstate
  function closeOverlay(then) {
    if (history.state && history.state.phOverlay) { pendingGo = then === undefined ? null : then; history.back(); return; }
    hideOverlays();
    if (then !== undefined) go(then);
  }
  window.addEventListener('popstate', function () {
    if (!overlay()) return;
    hideOverlays();
    if (pendingGo !== null) { var i = pendingGo; pendingGo = null; go(i); }
  });

  function buildList() {
    listOl.innerHTML = '';
    SLIDES.forEach(function (S, i) {
      var li = document.createElement('li'), b = document.createElement('button'), n = document.createElement('span'), t = document.createElement('span');
      b.type = 'button';
      n.className = 'n'; n.textContent = S.label;
      t.className = 't'; t.textContent = S.title;
      b.appendChild(n); b.appendChild(t);
      b.addEventListener('click', function () { closeOverlay(i); });
      li.appendChild(b);
      listOl.appendChild(li);
    });
  }
  function openList() {
    if (!SLIDES.length || overlay()) return;
    each(listOl.querySelectorAll('button'), function (b, i) { b.setAttribute('aria-current', i === cur ? 'true' : 'false'); });
    fullA.setAttribute('href', 'index.html?desktop#/' + SLIDES[cur].el.id);
    list.classList.add('on');
    deck.setAttribute('aria-hidden', 'true');
    pushOverlay();
    var b = listOl.querySelectorAll('button')[cur];
    if (b) { b.scrollIntoView({ block: 'center' }); b.focus({ preventScroll: true }); }
  }

  function orient() {
    var rot = window.innerHeight > window.innerWidth;
    viewer.classList.toggle('rot', rot);
    vNote.textContent = rot ? 'Turn your phone to read it · tap to close' : 'Tap to close';
  }
  function openViewer(c) {
    var svg = c.querySelector('svg');
    if (!svg || overlay()) return;
    var copy = svg.cloneNode(true);
    uniqueIds(copy, '-v');
    vChart.innerHTML = '';
    vChart.appendChild(copy);
    orient();
    viewer.classList.add('on');
    deck.setAttribute('aria-hidden', 'true');
    pushOverlay();
  }
  window.addEventListener('resize', function () { fitDrawings(); if (viewer.classList.contains('on')) orient(); });

  /* ---- start ---- */
  fetch(SRC, { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
    .then(build)
    .catch(function () {
      deck.innerHTML = '<p class="ph-note">The slides could not be loaded here. <a href="index.html?desktop">Open the full slides</a>.</p>';
    });

  // for checking (the screenshot tour)
  window.PhoneDeck = {
    count: function () { return SLIDES.length; },
    go: function (i) { go(i); },
    current: function () { return SLIDES[cur] ? SLIDES[cur].el : null; }
  };
})();
