/* charts.js: the figures for the LIN 3042 mock article presentation (17 November 2026). Helpers from the
   WK deck's charts.js (as carried on in "Copy, Contract, Tilt").
   Inline SVG only (canvas prints blank). Every plotted value carries the row of the module's EVIDENCE.md it
   comes from (data-ev), which check_evidence.py checks against the paper. State is CSS-driven: hidden step
   markers (reveal fragments) are read with :has() in deck.css, so back-navigation, URL jumps and print land right.
   Colour: before = neutral grey (hollow), after = gold (filled), as on the timeline. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    if (attrs) for (var k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function txt(parent, x, y, s, cls, extra) {
    var t = el('text', Object.assign({ x: x, y: y, 'class': cls || '' }, extra || {}), parent);
    t.textContent = s;
    return t;
  }
  function g(parent, cls, extra) { return el('g', Object.assign({ 'class': cls || '' }, extra || {}), parent); }
  function fmt(n, d) { return Number(n).toLocaleString('en-GB', { maximumFractionDigits: d === undefined ? 0 : d, minimumFractionDigits: d || 0 }); }
  function svgFor(host, w, h, label) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, role: 'img', 'aria-label': label }, host);
  }
  function mark(node, ev) { if (ev) node.setAttribute('data-ev', ev); return node; }
  function tip(node, s) { var t = el('title', null, node); t.textContent = s; return node; }

  /* ------------------------------------------------------------------------------------------
     1. The timeline (slide "counting"). Step 0: the five years. Step 1: before (2020-21), 2022 left out
        with ChatGPT's release marked, after (2023-24). Paper l.111 (windows); release date: citation-audit.md.
     ------------------------------------------------------------------------------------------ */
  function timelineChart(host) {
    var W = 1656, H = 232, CW = 316, GAP = 19, Y = 92, CH = 84;
    var svg = svgFor(host, W, H, 'Timeline: 2020 and 2021 are before, 2022 is left out (ChatGPT released 30 November 2022), 2023 and 2024 are after.');
    var defs = el('defs', null, svg);
    var pat = el('pattern', { id: 'tl-hatch', width: 18, height: 18, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    el('line', { x1: 0, y1: 0, x2: 0, y2: 18, style: 'stroke: var(--axis); stroke-width: 6' }, pat);
    var years = [2020, 2021, 2022, 2023, 2024];
    var cx = function (i) { return i * (CW + GAP); };
    var base = g(svg, 'st-0');
    years.forEach(function (yr, i) {
      var cls = i < 2 ? 'cell-before' : (i === 2 ? 'cell-out' : 'cell-after');
      mark(el('rect', { x: cx(i) + 2, y: Y, width: CW - 4, height: CH, rx: 12, 'class': cls }, base), 'W1');
      txt(base, cx(i) + CW / 2, Y + CH / 2 + 12, String(yr), i === 2 ? 'yr-out' : 'yr', { 'text-anchor': 'middle' });
    });
    var ann = g(svg, 'st-1');
    function bracket(i0, i1, cls, label) {
      var x0 = cx(i0) + 10, x1 = cx(i1) + CW - 10, y = 70;
      el('path', { d: 'M' + x0 + ' ' + (y + 12) + ' L' + x0 + ' ' + y + ' L' + x1 + ' ' + y + ' L' + x1 + ' ' + (y + 12), 'class': 'brk ' + cls }, ann);
      txt(ann, (x0 + x1) / 2, y - 18, label, 'brk-lab ' + cls, { 'text-anchor': 'middle' });
    }
    bracket(0, 1, 'before', 'BEFORE: 2020–21');
    bracket(3, 4, 'after', 'AFTER: 2023–24');
    txt(ann, cx(2) + CW / 2, Y + CH + 38, 'left out', 'label-2', { 'text-anchor': 'middle' });
    var xg = cx(2) + 2 + (CW - 4) * (334 / 365);          // 30 November: day 334 of 365
    var gp = g(ann, 'gpt');
    el('line', { x1: xg, y1: 44, x2: xg, y2: Y + CH + 6 }, gp);
    mark(txt(gp, xg - 10, 32, 'ChatGPT, 30 Nov 2022', '', { 'text-anchor': 'end' }), 'C5');
  }

  /* ------------------------------------------------------------------------------------------
     2. English examples, occurrences per million tokens (slide "counting"): paper Table 4 (l.604-622).
        Hollow grey = 2020-21, filled gold = 2023-24; the change as printed in the table.
     ------------------------------------------------------------------------------------------ */
  var PM = [
    ['additionally', 15.21, 22.62, '+48.7'],
    ['emphasize', 17.94, 25.69, '+43.2'],
    ['dedication', 7.40, 12.01, '+62.3'],
    ['importance', 39.86, 44.13, '+10.7']
  ];
  function perMillionChart(host) {
    var W = 760, H = 336, X0 = 236, X1 = 690, MAX = 50, AX = 296;
    var sx = function (v) { return X0 + (X1 - X0) * v / MAX; };
    var svg = svgFor(host, W, H, 'English AI words in news, occurrences per million tokens, 2020-21 and 2023-24 (paper, Table 4).');
    var grid = g(svg, 'grid st-0');
    var ax = g(svg, 'axis st-0');
    var ticks = g(svg, 'tick st-0');
    [0, 10, 20, 30, 40, 50].forEach(function (v) {
      if (v) el('line', { x1: sx(v), x2: sx(v), y1: 52, y2: AX }, grid);
      txt(ticks, sx(v), AX + 34, String(v), '', { 'text-anchor': 'middle' });
    });
    el('line', { x1: X0, x2: X1, y1: AX, y2: AX }, ax);
    var leg = g(svg, 'legend st-0');
    el('circle', { cx: X0 + 8, cy: 18, r: 9, 'class': 'dot hollow neutral' }, leg);
    txt(leg, X0 + 26, 27, '2020–21', '');
    el('circle', { cx: X0 + 190, cy: 18, r: 11, 'class': 'dot gold' }, leg);
    txt(leg, X0 + 208, 27, '2023–24', '');
    PM.forEach(function (r, i) {
      var y = 84 + i * 60;
      var row = g(svg, 'st-0');
      txt(row, X0 - 20, y + 11, r[0], 'word', { 'text-anchor': 'end' });
      el('line', { x1: sx(r[1]) + 10, x2: sx(r[2]) - 10, y1: y, y2: y, 'class': 'conn' }, row);
      tip(mark(el('circle', { cx: sx(r[1]), cy: y, r: 11, 'class': 'dot hollow neutral' }, row), 'T4'),
          r[0] + ', 2020–21: ' + fmt(r[1], 2) + ' per million');
      tip(mark(el('circle', { cx: sx(r[2]), cy: y, r: 13, 'class': 'dot gold' }, row), 'T4'),
          r[0] + ', 2023–24: ' + fmt(r[2], 2) + ' per million');
      mark(txt(row, sx(r[2]) + 22, y + 9, r[3] + '%', 'chg'), 'T4');
    });
  }

  var BUILDERS = {
    'timeline': timelineChart,
    'per-million': perMillionChart
  };
  function buildAll() {
    Array.prototype.forEach.call(document.querySelectorAll('.chart[data-chart]'), function (host) {
      var b = BUILDERS[host.getAttribute('data-chart')];
      if (b && !host.firstChild) b(host);
    });
  }
  window.DeckCharts = { buildAll: buildAll, data: { PM: PM } };
})();
