/* charts.js: the figures for "What Is Left to Write?" (v0.1, 28 September 2026).
   Inline SVG only (canvas prints blank). Every plotted value carries the EVIDENCE.md row it
   comes from (ev) or is marked pending: checked against the shipped TSV on 28 Sep 2026 but not
   yet logged in EVIDENCE.md. State is CSS-driven: hidden step markers (reveal fragments) are read
   with :has() in deck.css, so back-navigation, URL jumps and print all land right.
   Colours come from deck.css tokens and were checked with the dataviz validator. */
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
    var s = el('svg', { viewBox: '0 0 ' + w + ' ' + h, role: 'img', 'aria-label': label }, host);
    return s;
  }
  function mark(node, ev, pending) {
    if (ev) node.setAttribute('data-ev', ev);
    if (pending) node.setAttribute('data-pending', 'tsv-2026-09-28');
    return node;
  }
  function lineLength(pts) {
    var L = 0;
    for (var i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    return Math.ceil(L) + 4;
  }
  function polyline(parent, pts, cls) {
    var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
    var p = el('path', { d: d, 'class': cls }, parent);
    p.style.setProperty('--len', lineLength(pts));
    return p;
  }

  /* ------------------------------------------------------------------------------------------
     1. The rise and the return, by generation (uniform tier; em dashes per million tokens).
        Source: _archive/nsf-career-2026/poc/emdash/results/uniform/grid_volume_share.tsv
     ------------------------------------------------------------------------------------------ */
  var GENS = [
    { key: '3.5', label: 'GPT-3.5', date: 'Jan 2024' },
    { key: '4o',  label: 'GPT-4o',  date: '2024' },
    { key: '4.1', label: 'GPT-4.1', date: 'Apr 2025' },
    { key: '5',   label: 'GPT-5',   date: 'Aug 2025' },
    { key: '5.2', label: 'GPT-5.2', date: 'Dec 2025' },
    { key: '5.4', label: 'GPT-5.4', date: 'Mar 2026' }
  ];
  var RISE = {
    news: {
      title: 'Em dashes per million tokens, news continuations',
      ymax: 5000, ystep: 1000,
      human: { v: 1078.3, label: 'human news (CC-News): 1,078', ev: '§2.2' },
      flagship: [
        { g: '3.5', runs: [92.5, 92.7], pending: true },
        { g: '4o',  runs: [478.8, 612.4], pending: true },
        { g: '4.1', runs: [3406.9, 4161.2], ev: '§1.2' },
        { g: '5',   runs: [2875.1, 2760.7], pending: true },
        { g: '5.2', runs: [2034.6, 2342.4], pending: true },
        { g: '5.4', runs: [924.4, 837.3], ev: '§1.5' }
      ],
      small: [
        { g: '4o',  name: '4o-mini',  runs: [437.6, 526.1], pending: true },
        { g: '4.1', name: '4.1-nano', runs: [1228.0, 1142.5], pending: true },
        { g: '5',   name: '5-nano',   runs: [1274.3, 1447.9], pending: true },
        { g: '5.4', name: '5.4-nano', runs: [4203.4, 4553.0], ev: '§1.6' }
      ],
      labels: [
        { g: '4.1', dx: -12, above: 4161.2, text: '3.2 to 3.9 × human', ev: '§1.2' },
        { g: '5.4', dx: -12, below: 837.3, text: '0.8 to 0.9 ×', ev: '§1.5' },
        { g: '5.4', dx: 12, above: 4553.0, text: '3.9 to 4.2 ×', ev: '§1.6' }
      ]
    },
    science: {
      title: 'Em dashes per million tokens, science continuations',
      ymax: 2500, ystep: 500,
      human: { v: 0, label: 'human science: 0 in 28,988 tokens', ev: '§1.3' },
      flagship: [
        { g: '3.5', runs: [0, 0], pending: true },
        { g: '4o',  runs: [173.8, 86.8], ev: '§1.4' },
        { g: '4.1', runs: [2287.8, 2077.1], ev: '§1.3' },
        { g: '5',   runs: [2094.5, 1564.0], pending: true },
        { g: '5.2', runs: [417.0, 914.8], pending: true },
        { g: '5.4', runs: [84.6, 42.4], ev: '§1.4' }
      ],
      small: [
        { g: '4o',  name: '4o-mini',  runs: [173.9, 216.9], ev: '§1.4' },
        { g: '4.1', name: '4.1-nano', runs: [646.8, 514.4], pending: true },
        { g: '5',   name: '5-nano',   runs: [997.4, 582.7], pending: true },
        { g: '5.4', name: '5.4-nano', runs: [1712.3, 1329.0], ev: '§1.7' }
      ],
      labels: [
        { g: '4.1', dx: -12, above: 2287.8, text: '2,077 to 2,288', ev: '§1.3' },
        { g: '5.4', dx: 12, above: 1712.3, text: '1,329 to 1,712', ev: '§1.7' }
      ]
    }
  };

  function riseChart(host, which) {
    var D = RISE[which];
    var W = 1656, H = 700, m = { l: 150, r: 330, t: 60, b: 140 };
    var pw = W - m.l - m.r, ph = H - m.t - m.b;
    var svg = svgFor(host, W, H, D.title);
    var x = function (key) { var i = GENS.findIndex(function (q) { return q.key === key; }); return m.l + (i + 0.5) * pw / GENS.length; };
    var y = function (v) { return m.t + ph - (v / D.ymax) * ph; };

    // grid + ticks
    var grid = g(svg, 'grid st-0'), ticks = g(svg, 'tick st-0');
    for (var v = 0; v <= D.ymax; v += D.ystep) {
      el('line', { x1: m.l, x2: m.l + pw, y1: y(v), y2: y(v) }, grid);
      txt(ticks, m.l - 22, y(v) + 10, fmt(v), '', { 'text-anchor': 'end' });
    }
    // the zero floor: Richter grey (uniform-tier floors 124 to 138 per million, EVIDENCE §3.1)
    var fl = g(svg, 'floor st-0');
    mark(el('rect', { x: m.l, y: y(138), width: pw, height: y(0) - y(138) }, fl), '§3.1');
    txt(fl, m.l + pw + 18, y(0) - 4, 'grey: cannot be told', 'label-2', {});
    txt(fl, m.l + pw + 18, y(0) + 30, 'from zero', 'label-2', {});
    // x labels
    var xl = g(svg, 'st-0');
    GENS.forEach(function (q) {
      txt(xl, x(q.key), m.t + ph + 50, q.label, 'xlab', { 'text-anchor': 'middle' });
      txt(xl, x(q.key), m.t + ph + 84, q.date, 'xlab-2', { 'text-anchor': 'middle' });
    });
    // human reference
    var ref = g(svg, 'ref st-0');
    mark(el('line', { x1: m.l, x2: m.l + pw, y1: y(D.human.v), y2: y(D.human.v) }, ref), D.human.ev);
    var hy = D.human.v === 0 ? y(0) - 96 : y(D.human.v) + 10;
    txt(ref, m.l + pw + 18, hy, D.human.label.split(':')[0], '', {});
    txt(ref, m.l + pw + 18, hy + 36, D.human.label.split(':')[1].trim(), 'label-2', {});

    function series(rows, cls, step, dx) {
      var grp = g(svg, 'st-' + step);
      var pts = rows.map(function (r) { return [x(r.g) + dx, y((r.runs[0] + r.runs[1]) / 2)]; });
      polyline(grp, pts, 'line draw ' + cls);
      rows.forEach(function (r) {
        r.runs.forEach(function (val) {
          var c = el('circle', { cx: x(r.g) + dx, cy: y(val), r: 11, 'class': 'dot ' + cls }, grp);
          mark(c, r.ev, r.pending);
          var t = el('title', null, c); t.textContent = (r.name || r.g) + ': ' + fmt(val, 1) + ' per million' + (r.pending ? ' (pending EVIDENCE row)' : ' (' + r.ev + ')');
        });
      });
      return grp;
    }
    series(D.flagship, 'gold', 1, -12);
    series(D.small, 'blue', 2, 12);

    // legend (appears with its series)
    var lg1 = g(svg, 'legend st-1'), lg2 = g(svg, 'legend st-2');
    el('circle', { cx: m.l + 14, cy: 24, r: 11, 'class': 'dot gold' }, lg1);
    txt(lg1, m.l + 36, 34, 'flagship models (two runs each)', '');
    el('circle', { cx: m.l + 560, cy: 24, r: 11, 'class': 'dot blue' }, lg2);
    txt(lg2, m.l + 582, 34, 'small tier: mini and nano', '');

    // direct labels (step 3), placed above or below the runs they describe
    var lab = g(svg, 'st-3');
    (D.labels || []).forEach(function (L) {
      var ly = L.above !== undefined ? y(L.above) - 30 : y(L.below) + 50;
      mark(txt(lab, x(L.g) + L.dx, ly, L.text, 'label', { 'text-anchor': 'middle' }), L.ev);
    });
    // pending note (to be removed once the rows are in EVIDENCE.md)
    var pend = g(svg, 'st-0');
    txt(pend, m.l, H - 8, 'PENDING EVIDENCE ROWS: GPT-3.5, GPT-5, GPT-5.2, and the 2024 to 2025 small tier (checked against the TSV, 28 Sep)', 'pendingmark', {});
  }

  /* ------------------------------------------------------------------------------------------
     2. The reference problem: two human news corpora (EVIDENCE §2.1 to §2.4).
     ------------------------------------------------------------------------------------------ */
  function referenceChart(host) {
    var W = 1656, H = 700, m = { l: 150, r: 520, t: 50, b: 130 };
    var pw = W - m.l - m.r, ph = H - m.t - m.b, ymax = 4500;
    var svg = svgFor(host, W, H, 'Em dashes per million tokens: two human news corpora and GPT-4.1');
    var y = function (v) { return m.t + ph - (v / ymax) * ph; };
    var grid = g(svg, 'grid st-0'), ticks = g(svg, 'tick st-0');
    for (var v = 0; v <= 4000; v += 1000) {
      el('line', { x1: m.l, x2: m.l + pw, y1: y(v), y2: y(v) }, grid);
      txt(ticks, m.l - 22, y(v) + 10, fmt(v), '', { 'text-anchor': 'end' });
    }
    var bw = 120, slots = [m.l + pw * 0.17, m.l + pw * 0.5, m.l + pw * 0.83];
    function column(step, cx, val, cls, lab1, lab2, ev, valueLabel) {
      var grp = g(svg, 'st-' + step);
      var r = el('rect', { x: cx - bw / 2, y: y(val), width: bw, height: Math.max(0.001, y(0) - y(val)), rx: 8, 'class': 'bar grow ' + cls }, grp);
      mark(r, ev);
      txt(grp, cx, m.t + ph + 48, lab1, 'xlab', { 'text-anchor': 'middle' });
      txt(grp, cx, m.t + ph + 84, lab2, 'xlab-2', { 'text-anchor': 'middle' });
      txt(grp, cx, y(val) - 22, valueLabel, 'label', { 'text-anchor': 'middle' });
      return grp;
    }
    var c1 = column(1, slots[0], 0, 'neutral', 'human news', 'WMT', '§2.1', '0.0');
    // the WMT zero sits on the baseline: a visible stub so it reads as "measured, and zero"
    el('rect', { x: slots[0] - bw / 2, y: y(0) - 4, width: bw, height: 4, 'class': 'neutral' }, c1);
    column(2, slots[1], 1078.3, 'neutral', 'human news', 'CC-News', '§2.2', '1,078');
    var c3 = column(3, slots[2], 3406.9, 'gold', 'GPT-4.1', 'news', '§1.2', '');
    // the two runs (3,406.9 and 4,161.2) as a whisker above the bar
    var wk = g(c3, 'whisker');
    mark(el('line', { x1: slots[2], x2: slots[2], y1: y(3406.9), y2: y(4161.2) }, wk), '§1.2');
    el('line', { x1: slots[2] - 26, x2: slots[2] + 26, y1: y(4161.2), y2: y(4161.2) }, wk);
    txt(c3, slots[2], y(4161.2) - 24, '3,407 to 4,161', 'label', { 'text-anchor': 'middle' });
    txt(c3, slots[2], y(4161.2) - 62, 'two runs', 'label-2', { 'text-anchor': 'middle' });

    // side notes: right column
    var nx = m.l + pw + 50;
    var s1 = g(svg, 'st-1');
    mark(txt(s1, nx, 40, 'WMT: 0 in 91,317 tokens,', 'label-2', {}), '§2.1');
    txt(s1, nx, 76, 'so \u201cbelow 33 per million\u201d', 'label-2', {});
    txt(s1, nx, 112, 'WORK IN PROGRESS: 0 in 3.5 million', 'wipmark', {});
    var s2 = g(svg, 'st-2');
    mark(txt(s2, nx, 196, 'CC-News: same language, same', 'label-2', {}), '§2.2');
    txt(s2, nx, 232, 'register label, other corpus', 'label-2', {});
    txt(s2, nx, 268, 'WORK IN PROGRESS: 1,117 in 3.4 million', 'wipmark', {});
    var s4 = g(svg, 'st-4');
    mark(txt(s4, nx, 372, 'against WMT: infinitely more', 'label', {}), '§2.4');
    mark(txt(s4, nx, 422, 'against CC-News: about 4 ×', 'label', {}), '§2.4');
    txt(s4, nx, 466, 'both computed correctly', 'label-2', {});
  }

  /* ------------------------------------------------------------------------------------------
     3. Four up, two down: base to instruction-tuned, six open families (EVIDENCE §3.3 to §3.4).
        Science continuations, 42,000 items per model (deep-N tier, dash_and_lexical_by_model.tsv).
     ------------------------------------------------------------------------------------------ */
  var FAMILIES = [
    { name: 'Gemma-3',   base: 14.6, inst: 172.3, dir: 'up' },
    { name: 'Yi-1.5',    base: 11.9, inst: 80.3,  dir: 'up' },
    { name: 'OLMo-2',    base: 7.5,  inst: 33.3,  dir: 'up' },
    { name: 'Falcon3',   base: 0.7,  inst: 20.6,  dir: 'up' },
    { name: 'Llama-3.1', base: 6.8,  inst: 4.2,   dir: 'down' },
    { name: 'Mistral',   base: 15.9, inst: 1.3,   dir: 'down' }
  ];
  function slopeChart(host) {
    var W = 1100, H = 760, m = { l: 150, r: 330, t: 60, b: 90 };
    var pw = W - m.l - m.r, ph = H - m.t - m.b;
    var lo = Math.log10(0.5), hi = Math.log10(300);
    var y = function (v) { return m.t + ph - (Math.log10(v) - lo) / (hi - lo) * ph; };
    var xb = m.l + 40, xi = m.l + pw - 40;
    var svg = svgFor(host, W, H, 'Em dashes per million tokens, base versus instruction-tuned, six open model families');
    var grid = g(svg, 'grid st-0'), ticks = g(svg, 'tick st-0');
    [1, 10, 100].forEach(function (v) {
      el('line', { x1: m.l, x2: m.l + pw, y1: y(v), y2: y(v) }, grid);
      txt(ticks, m.l - 22, y(v) + 10, fmt(v), '', { 'text-anchor': 'end' });
    });
    var ax = g(svg, 'st-0');
    txt(ax, xb, m.t + ph + 56, 'base', 'xlab', { 'text-anchor': 'middle' });
    txt(ax, xi, m.t + ph + 56, 'instruction-tuned', 'xlab', { 'text-anchor': 'middle' });
    ['up', 'down'].forEach(function (dir, k) {
      var grp = g(svg, 'st-' + (k + 1));
      FAMILIES.filter(function (f) { return f.dir === dir; }).forEach(function (f) {
        var cls = dir === 'up' ? 'gold' : 'blue';
        var p = polyline(grp, [[xb, y(f.base)], [xi, y(f.inst)]], 'line draw ' + cls);
        mark(p, dir === 'up' ? '§3.3' : '§3.4');
        mark(el('circle', { cx: xb, cy: y(f.base), r: 10, 'class': 'dot ' + cls }, grp), dir === 'up' ? '§3.3' : '§3.4');
        mark(el('circle', { cx: xi, cy: y(f.inst), r: 10, 'class': 'dot ' + cls }, grp), dir === 'up' ? '§3.3' : '§3.4');
        var t = txt(grp, xi + 26, y(f.inst) + 10, f.name, 'label', {});
        var v = el('tspan', { 'class': 'label-2', dx: 14 }, t); v.textContent = fmt(f.inst, 1);
        var tt = el('title', null, t); tt.textContent = f.name + ': ' + fmt(f.base, 1) + ' to ' + fmt(f.inst, 1) + ' per million';
      });
    });
  }

  /* ------------------------------------------------------------------------------------------
     4. 7,806 entries and about 39 innocent flags (EVIDENCE §5.1, §7 case C).
     ------------------------------------------------------------------------------------------ */
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function dotsChart(host) {
    var cols = 130, rows = 60, extra = 6, pitch = 12;       // 130 x 60 + 6 = 7,806
    var W = cols * pitch + 8, H = (rows + 1) * pitch + 8;
    var svg = svgFor(host, W, H, '7,806 entries, of which about 39 would be flagged innocently at a 0.5 per cent false-positive rate');
    var defs = el('defs', null, svg);
    var pat = el('pattern', { id: 'pdot', width: pitch, height: pitch, patternUnits: 'userSpaceOnUse' }, defs);
    el('circle', { cx: pitch / 2, cy: pitch / 2, r: 3.3, 'class': 'neutral mass' }, pat);
    var grp1 = g(svg, 'st-1');
    mark(el('rect', { x: 4, y: 4, width: cols * pitch, height: rows * pitch, fill: 'url(#pdot)' }, grp1), '§5.1');
    for (var i = 0; i < extra; i++) el('circle', { cx: 4 + i * pitch + pitch / 2, cy: 4 + rows * pitch + pitch / 2, r: 3.3, 'class': 'neutral mass' }, grp1);
    var rnd = mulberry32(7806), seen = {}, picks = [];
    while (picks.length < 39) { var k = Math.floor(rnd() * 7806); if (!seen[k]) { seen[k] = 1; picks.push(k); } }
    var grp2 = g(svg, 'st-2');
    picks.forEach(function (k) {
      var r = Math.floor(k / cols), c = k % cols;
      var cx = 4 + c * pitch + pitch / 2, cy = 4 + r * pitch + pitch / 2;
      mark(el('circle', { cx: cx, cy: cy, r: 9, 'class': 'dot red pop' }, grp2), '§7');
    });
  }

  /* ------------------------------------------------------------------------------------------
     5. The loop (convention to avoidance), drawn as a ring around the mark.
     ------------------------------------------------------------------------------------------ */
  var LOOP = ['human convention', 'training data', 'model behaviour', 'folk heuristic', 'automated detection', 'public accusation', 'human avoidance'];
  function loopChart(host) {
    var W = 1656, H = 820, cx = W / 2, cy = 410, R = 300;
    var svg = svgFor(host, W, H, 'The loop: human convention, training data, model behaviour, folk heuristic, automated detection, public accusation, human avoidance');
    var defs = el('defs', null, svg);
    var mk = el('marker', { id: 'arrow', viewBox: '0 0 12 12', refX: 9, refY: 6, markerWidth: 9, markerHeight: 9, orient: 'auto-start-reverse' }, defs);
    el('path', { d: 'M1 1 L11 6 L1 11 z', 'class': 'arrowhead' }, mk);
    var n = LOOP.length;
    var ang = function (i) { return -Math.PI / 2 + i * 2 * Math.PI / n; };
    var pos = function (i, r) { return [cx + (r || R) * Math.cos(ang(i)), cy + (r || R) * Math.sin(ang(i))]; };
    var steps = [[0, 1, 2], [3, 4, 5], [6]];
    steps.forEach(function (idx, s) {
      var grp = g(svg, 'st-' + (s + 1));
      idx.forEach(function (i) {
        // arc from node i to node i+1
        var a0 = ang(i) + 0.16, a1 = ang(i + 1) - 0.16;
        var p0 = [cx + R * Math.cos(a0), cy + R * Math.sin(a0)], p1 = [cx + R * Math.cos(a1), cy + R * Math.sin(a1)];
        var arc = el('path', { d: 'M' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + ' A ' + R + ' ' + R + ' 0 0 1 ' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1), 'class': 'loop-arc', 'marker-end': 'url(#arrow)' }, grp);
        var p = pos(i);
        el('circle', { cx: p[0], cy: p[1], r: 14, 'class': 'loop-node' + (i === 2 || i === 4 ? ' hot' : '') }, grp);
        var q = pos(i, R + 58);
        var anchor = Math.abs(Math.cos(ang(i))) < 0.2 ? 'middle' : (Math.cos(ang(i)) > 0 ? 'start' : 'end');
        var dy = Math.sin(ang(i)) < -0.9 ? -8 : (Math.sin(ang(i)) > 0.6 ? 26 : 11);
        txt(grp, q[0], q[1] + dy, LOOP[i], 'loop-label', { 'text-anchor': anchor });
      });
    });
    var mid = g(svg, 'st-0');
    txt(mid, cx, cy + 60, '—', 'loop-dash', { 'text-anchor': 'middle' });
  }

  /* ------------------------------------------------------------------------------------------
     6. Circling back (schematic, Tommie's view): approach to a ceiling set by readers' agreement.
     ------------------------------------------------------------------------------------------ */
  function ceilingChart(host) {
    var W = 1656, H = 700, m = { l: 90, r: 520, t: 60, b: 90 };
    var pw = W - m.l - m.r, ph = H - m.t - m.b;
    var svg = svgFor(host, W, H, 'Schematic: agreement with readers approaches a ceiling set by how far readers agree with one another');
    var X = function (u) { return m.l + u * pw; }, Y = function (v) { return m.t + ph - v * ph; };
    var ax = g(svg, 'axis st-0');
    el('line', { x1: m.l, x2: m.l + pw, y1: Y(0), y2: Y(0) }, ax);
    el('line', { x1: m.l, x2: m.l, y1: Y(0), y2: Y(1) }, ax);
    var al = g(svg, 'st-0');
    txt(al, m.l + pw, Y(0) + 50, 'training on human preference', 'xlab', { 'text-anchor': 'end' });
    txt(al, m.l - 20, Y(1) - 20, 'agreement with readers', 'xlab', { 'text-anchor': 'start' });
    txt(al, m.l + pw + 40, Y(1) - 20, 'SCHEMATIC: TOMMIE’S VIEW', 'pendingmark', {});
    var C = 0.78;
    // step 1: saturating approach
    var s1 = g(svg, 'st-1'), pts = [];
    for (var u = 0; u <= 1.0001; u += 0.02) pts.push([X(u), Y(C * (1 - Math.exp(-4.2 * u)))]);
    polyline(s1, pts, 'line draw inkstroke');
    var r1 = g(svg, 'ref st-1');
    el('line', { x1: m.l, x2: m.l + pw, y1: Y(C), y2: Y(C) }, r1);
    txt(r1, m.l + pw + 24, Y(C) + 10, 'how far readers agree', '', {});
    txt(r1, m.l + pw + 24, Y(C) + 46, 'with one another', 'label-2', {});
    // step 2: whose readers? a second ceiling
    var r2 = g(svg, 'ref st-2');
    var C2 = 0.52;
    el('line', { x1: m.l, x2: m.l + pw, y1: Y(C2), y2: Y(C2) }, r2);
    txt(r2, m.l + pw + 24, Y(C2) + 10, 'another readership', '', {});
    txt(r2, m.l + pw + 24, Y(C2) + 46, 'qualities, in the plural', 'label-2', {});
    // step 3: the rival reading (Goodhart): push a learned proxy of preference too far and
    // agreement with readers peaks, then falls. Drawn below the ceiling, never above it.
    var s3 = g(svg, 'st-3'), pts3 = [];
    for (var w = 0; w <= 1.0001; w += 0.02) {
      var v = 1.05 * C * (1 - Math.exp(-6 * w)) - 0.5 * Math.pow(w, 1.8);
      pts3.push([X(w), Y(Math.max(0, v))]);
    }
    polyline(s3, pts3, 'line draw gold');
    txt(s3, X(0.98), Y(0.2), 'or push the proxy too far,', 'label', { 'text-anchor': 'end' });
    txt(s3, X(0.98), Y(0.2) + 42, 'and agreement falls: Goodhart', 'label-2', { 'text-anchor': 'end' });
  }

  /* ------------------------------------------------------------------------------------------
     7. Beyond the mark: stance (EVIDENCE §13.5). Abdulhai, White et al., arXiv 2603.18161 (2026),
        Figure 6, redrawn: essays on "Does money lead to happiness?", shares for / neutral / against,
        as published. Their pies coded for and against in green and red; here gold and blue around
        a Richter-grey middle, and each bar is centred on its neutral share, so the grey widens
        from the centre. Rows are the paper's three groups (Human, LLM-Influenced, LLM).
     ------------------------------------------------------------------------------------------ */
  var STANCE = [
    { step: 1, label: 'Wrote alone', sub: 'no AI', group: 'Human', v: [32.6, 39.5, 27.9] },
    { step: 2, label: 'Used AI lightly', sub: 'advice, look-ups', group: 'LLM-Influenced', v: [31.0, 44.8, 24.1] },
    { step: 3, label: 'Let AI write', sub: 'much of the essay', group: 'LLM', v: [22.2, 66.7, 11.1] }
  ];
  function stanceChart(host) {
    var W = 1656, H = 420, xa = 430, xb = 1640, bh = 84, gap = 4, rowY = [118, 236, 354];
    var maxL = 0, maxR = 0;
    STANCE.forEach(function (r) { maxL = Math.max(maxL, r.v[0] + r.v[1] / 2); maxR = Math.max(maxR, r.v[2] + r.v[1] / 2); });
    var s = (xb - xa) / (maxL + maxR), cx = xa + maxL * s;
    var svg = svgFor(host, W, H, 'Stance of essays on whether money leads to happiness. Wrote alone: 32.6% for, 39.5% neutral, 27.9% against. Used AI lightly: 31.0, 44.8, 24.1. Let AI write much of the essay: 22.2, 66.7, 11.1.');
    // legend: swatches in the marks' colours, words in text tokens
    var lg = g(svg, 'legend st-0'), lx = xa;
    [['for', 'for'], ['nostance', 'neutral: takes no side'], ['against', 'against']].forEach(function (k) {
      el('rect', { x: lx, y: 8, width: 26, height: 26, rx: 5, 'class': k[0] }, lg);
      txt(lg, lx + 38, 31, k[1], '');
      lx += 38 + k[1].length * 12.6 + 64;         // Inter at 28px: about 12.6 units per character
    });
    STANCE.forEach(function (r, i) {
      var y = rowY[i], half = r.v[1] / 2;
      var grp = g(svg, 'st-' + r.step);
      txt(grp, 0, y - 4, r.label, 'label', {});
      txt(grp, 0, y + 32, r.sub, 'label-2', {});
      var bars = g(grp, 'grow-x');
      bars.style.transformOrigin = cx.toFixed(1) + 'px 0px';
      var labs = g(grp, 'late');
      [
        { cls: 'for', name: 'for', v: r.v[0], a: cx - (half + r.v[0]) * s, b: cx - half * s - gap / 2 },
        { cls: 'nostance', name: 'neutral', v: r.v[1], a: cx - half * s + gap / 2, b: cx + half * s - gap / 2 },
        { cls: 'against', name: 'against', v: r.v[2], a: cx + half * s + gap / 2, b: cx + (half + r.v[2]) * s }
      ].forEach(function (sg) {
        var rect = mark(el('rect', { x: sg.a.toFixed(1), y: y - bh / 2, width: (sg.b - sg.a).toFixed(1), height: bh, rx: 6, 'class': 'bar ' + sg.cls }, bars), '§13.5');
        var tt = el('title', null, rect);
        tt.textContent = r.label + ' (' + r.group + '): ' + sg.name + ' ' + fmt(sg.v, 1) + '%';
        txt(labs, ((sg.a + sg.b) / 2).toFixed(1), y + 11, fmt(sg.v, 1) + '%', 'seglabel', { 'text-anchor': 'middle' });
      });
    });
  }

  /* ------------------------------------------------------------------------------------------
     8. Provenance: one open model, stage by stage (EVIDENCE §16, work in progress; §3.2).
        OLMo-2's published training data, counted 29 Sep 2026 (the ledger in wk-talk/olmo-ledger/),
        against the model's own rate. Colour is who wrote the text: people (grey), other models
        (blue), OLMo itself (gold). Log scale; every dot labelled. Per million spaCy tokens.
     ------------------------------------------------------------------------------------------ */
  var PROV = [
    { step: 1, stage: 'Pretraining', label: 'web text, 95% of the mix', v: 491.4, kind: 'neutral', ev: '§16.2' },
    { step: 2, stage: 'Instruction tuning', label: 'answers written by people', v: 184.6, kind: 'neutral', ev: '§16.4' },
    { step: 2, stage: '', label: 'answers from ChatGPT (WildChat)', v: 1032.0, kind: 'blue', ev: '§16.4' },
    { step: 3, stage: 'Preference tuning', label: 'preferred answers', v: 411.4, kind: 'blue', ev: '§16.5' },
    { step: 3, stage: '', label: 'rejected answers', v: 628.4, kind: 'blue', ev: '§16.5' },
    { step: 4, stage: 'OLMo-2 7B writing science', label: 'before post-training', v: 7.5, kind: 'gold', ev: '§3.2' },
    { step: 4, stage: '', label: 'after post-training', v: 33.3, kind: 'gold', ev: '§3.2' }
  ];
  function provenanceChart(host) {
    var W = 1656, H = 640, m = { l: 560, r: 170, t: 78, b: 70 };
    var pw = W - m.l - m.r, lo = 0, hi = Math.log10(2000);
    var x = function (v) { return m.l + (Math.log10(v) - lo) / (hi - lo) * pw; };
    var svg = svgFor(host, W, H, 'Em dashes per million tokens in OLMo-2 training data by stage, and in the model\'s own science writing');
    // legend: who wrote the text
    var lg = g(svg, 'legend st-0'), lx = m.l;
    [['neutral', 'written by people'], ['blue', 'written by other models'], ['gold', 'written by OLMo itself']].forEach(function (k) {
      el('circle', { cx: lx + 11, cy: 22, r: 11, 'class': 'dot ' + k[0] }, lg);
      txt(lg, lx + 32, 32, k[1], '');
      lx += 32 + k[1].length * 12.6 + 56;
    });
    // rows, with a little extra space between stages
    var y = m.t + 30, ys = [];
    PROV.forEach(function (r, i) { if (i && r.stage) y += 22; ys.push(y); y += 64; });
    var plotBottom = y - 30;
    // grid and ticks
    var grid = g(svg, 'grid st-0'), ticks = g(svg, 'tick st-0');
    [1, 10, 100, 1000].forEach(function (v) {
      el('line', { x1: x(v), x2: x(v), y1: m.t + 8, y2: plotBottom }, grid);
      txt(ticks, x(v), plotBottom + 40, fmt(v), '', { 'text-anchor': 'middle' });
    });
    txt(g(svg, 'st-0'), 0, plotBottom + 40, 'em dashes per million tokens', 'xlab-2', {});
    PROV.forEach(function (r, i) {
      var grp = g(svg, 'st-' + r.step), yy = ys[i];
      if (r.stage) txt(grp, 0, yy - 14, r.stage.toUpperCase(), 'xlab-2', { 'letter-spacing': '0.08em' });
      txt(grp, 0, yy + 20, r.label, 'label-2', {});
      el('line', { x1: m.l, x2: m.l + pw, y1: yy + 10, y2: yy + 10, 'class': 'rowguide' }, grp);
      var c = mark(el('circle', { cx: x(r.v), cy: yy + 10, r: 12, 'class': 'dot ' + r.kind }, grp), r.ev);
      var t = el('title', null, c); t.textContent = (r.stage ? r.stage + ': ' : '') + r.label + ', ' + fmt(r.v, 1) + ' per million tokens';
      var left = r.label === 'before post-training';     // keep the arrow's start clear
      txt(grp, x(r.v) + (left ? -24 : 24), yy + 20, fmt(r.v, r.v < 100 ? 1 : 0), 'label', left ? { 'text-anchor': 'end' } : {});
    });
    // step 4: about four times, base to instruct (EVIDENCE §3.2: "by about 4.4×")
    var s4 = g(svg, 'st-4'), a = ys[5] + 10, b = ys[6] + 10, xa = x(7.5), xb = x(33.3);
    var defs = el('defs', null, svg);
    var mk = el('marker', { id: 'arrow-prov', viewBox: '0 0 12 12', refX: 9, refY: 6, markerWidth: 7, markerHeight: 7, orient: 'auto' }, defs);
    el('path', { d: 'M1 1 L11 6 L1 11 z', 'class': 'gold' }, mk);
    var ang = Math.atan2(b - a, xb - xa);
    var arrow = el('line', { x1: xa + 18 * Math.cos(ang), y1: a + 18 * Math.sin(ang), x2: xb - 22 * Math.cos(ang), y2: b - 22 * Math.sin(ang),
                             'class': 'gold', 'stroke-width': 3, 'marker-end': 'url(#arrow-prov)' }, s4);
    mark(arrow, '§3.2');
    txt(s4, (xa + xb) / 2 + 16, (a + b) / 2 - 6, 'about 4 ×', 'label-2', {});
  }

  /* ------------------------------------------------------------------------------------------
     9. The same stages in one model's own writing: OLMo-2 1B, four checkpoints, each continuing
        the uniform tier's 600 news first halves (greedy, first 200 words), next to the data of its
        stage (EVIDENCE §16.2, §16.7, §16.8; work in progress). Uniform-tier prompts: never on a
        slide with deep-N numbers. Linear scale; whiskers are exact 95% intervals (4 to 18 dashes).
     ------------------------------------------------------------------------------------------ */
  var ONEB = [
    { stage: 'pretraining', ckpt: 'base', data: 491.4, dataLabel: 'web text', dataEv: '§16.2', v: 29.8, lo: 8, hi: 76 },
    { stage: 'instruction tuning', ckpt: 'SFT', data: 373.4, dataLabel: 'its answers', dataEv: '§16.7', v: 213.6, lo: 107, hi: 382 },
    { stage: 'preference tuning', ckpt: 'DPO', data: 412.1, dataLabel: 'preferred answers', dataEv: '§16.7', v: 143.7, lo: 85, hi: 227 },
    { stage: 'maths reinforcement', ckpt: 'final', data: null, dataLabel: 'no text to count', v: 77.1, lo: 33, hi: 152 }
  ];
  function provenance1bChart(host) {
    var W = 1656, H = 650, m = { l: 150, r: 40, t: 80, b: 110 };
    var pw = W - m.l - m.r, ph = H - m.t - m.b, ymax = 600;
    var y = function (v) { return m.t + ph - v / ymax * ph; };
    var col = function (i) { return m.l + (i + 0.5) * pw / ONEB.length; };
    var svg = svgFor(host, W, H, 'OLMo-2 1B: em dashes per million tokens in the training data of each stage and in the model\'s own news continuations after that stage');
    var lg = g(svg, 'legend st-0'), lx = m.l;
    [['neutral', 'what it was trained on at this stage'], ['gold', 'what it writes after it (continuing news)']].forEach(function (k) {
      el('circle', { cx: lx + 11, cy: 22, r: 11, 'class': 'dot ' + k[0] }, lg);
      txt(lg, lx + 32, 32, k[1], '');
      lx += 32 + k[1].length * 12.6 + 64;
    });
    var grid = g(svg, 'grid st-0'), ticks = g(svg, 'tick st-0');
    for (var v = 0; v <= ymax; v += 100) {
      el('line', { x1: m.l, x2: m.l + pw, y1: y(v), y2: y(v) }, grid);
      txt(ticks, m.l - 22, y(v) + 10, fmt(v), '', { 'text-anchor': 'end' });
    }
    var xl = g(svg, 'st-0');
    ONEB.forEach(function (r, i) {
      txt(xl, col(i), m.t + ph + 48, r.stage, 'xlab', { 'text-anchor': 'middle' });
      txt(xl, col(i), m.t + ph + 84, r.ckpt === 'final' ? 'the final model' : 'then the ' + r.ckpt + ' model', 'xlab-2', { 'text-anchor': 'middle' });
    });
    txt(xl, 0, m.t - 24, 'em dashes per million tokens', 'xlab-2', {});
    // step 1: the data of each stage
    var s1 = g(svg, 'st-1');
    ONEB.forEach(function (r, i) {
      var cx = col(i) - 62;
      if (r.data === null) {
        txt(s1, cx, y(0) - 30, r.dataLabel, 'xlab-2', { 'text-anchor': 'middle' });
        return;
      }
      var c = mark(el('circle', { cx: cx, cy: y(r.data), r: 13, 'class': 'dot neutral' }, s1), r.dataEv);
      var t = el('title', null, c); t.textContent = r.stage + ', ' + r.dataLabel + ': ' + fmt(r.data, 1) + ' per million tokens';
      txt(s1, cx - 26, y(r.data) + 10, fmt(r.data, 0), 'label', { 'text-anchor': 'end' });
      txt(s1, cx + 14, y(r.data) - 28, r.dataLabel, 'label-2', { 'text-anchor': 'end' });
    });
    // step 2: the base model; step 3: the post-trained models (gold, with 95% intervals)
    ONEB.forEach(function (r, i) {
      var grp = g(svg, 'st-' + (i === 0 ? 2 : 3)), cx = col(i) + 62;
      var wk = g(grp, 'whisker');
      mark(el('line', { x1: cx, x2: cx, y1: y(r.lo), y2: y(r.hi) }, wk), '§16.8');
      el('line', { x1: cx - 16, x2: cx + 16, y1: y(r.hi), y2: y(r.hi) }, wk);
      el('line', { x1: cx - 16, x2: cx + 16, y1: y(r.lo), y2: y(r.lo) }, wk);
      var c = mark(el('circle', { cx: cx, cy: y(r.v), r: 13, 'class': 'dot gold' }, grp), '§16.8');
      var t = el('title', null, c); t.textContent = 'after ' + r.stage + ': ' + fmt(r.v, 1) + ' per million tokens (95% range ' + r.lo + ' to ' + r.hi + ')';
      txt(grp, cx + 28, y(r.v) + 10, fmt(r.v, 0), 'label', {});
    });
  }

  var BUILDERS = {
    'provenance': provenanceChart,
    'provenance-1b': provenance1bChart,
    'rise-news': function (h) { riseChart(h, 'news'); },
    'rise-science': function (h) { riseChart(h, 'science'); },
    'reference': referenceChart,
    'slope': slopeChart,
    'dots': dotsChart,
    'loop': loopChart,
    'ceiling': ceilingChart,
    'stance': stanceChart
  };
  function buildAll() {
    Array.prototype.forEach.call(document.querySelectorAll('.chart[data-chart]'), function (host) {
      var b = BUILDERS[host.getAttribute('data-chart')];
      if (b && !host.firstChild) b(host);
    });
  }
  window.DeckCharts = { buildAll: buildAll };
})();
