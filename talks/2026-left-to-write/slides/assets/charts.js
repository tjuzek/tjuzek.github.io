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
    var W = 1656, H = 610, m = { l: 150, r: 520, t: 50, b: 130 };   // 610 (was 700): room for the two-line takeaway
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
  // mode 'turn' (the transition before the flags, Tommie 30 Sep): the whole ring at once, the measured half dimmed
  // (convention, training data, model behaviour) and the half about people lit (heuristic, detection, accusation, avoidance)
  function loopChart(host, mode) {
    var W = 1656, H = 820, cx = W / 2, cy = 410, R = 300, turn = mode === 'turn';
    var svg = svgFor(host, W, H, 'The loop: human convention, training data, model behaviour, folk heuristic, automated detection, public accusation, human avoidance');
    var defs = el('defs', null, svg);
    var mk = el('marker', { id: 'arrow', viewBox: '0 0 12 12', refX: 9, refY: 6, markerWidth: 9, markerHeight: 9, orient: 'auto-start-reverse' }, defs);
    el('path', { d: 'M1 1 L11 6 L1 11 z', 'class': 'arrowhead' }, mk);
    var n = LOOP.length;
    var ang = function (i) { return -Math.PI / 2 + i * 2 * Math.PI / n; };
    var pos = function (i, r) { return [cx + (r || R) * Math.cos(ang(i)), cy + (r || R) * Math.sin(ang(i))]; };
    var steps = turn ? [[0, 1, 2, 3, 4, 5, 6]] : [[0, 1, 2], [3, 4, 5], [6]];
    steps.forEach(function (idx, s) {
      var grp = g(svg, turn ? 'st-0' : 'st-' + (s + 1));
      idx.forEach(function (i) {
        var past = turn && i <= 2, sub = turn ? g(grp, past ? 'loop-past' : 'loop-now') : grp;
        // arc from node i to node i+1
        var a0 = ang(i) + 0.16, a1 = ang(i + 1) - 0.16;
        var p0 = [cx + R * Math.cos(a0), cy + R * Math.sin(a0)], p1 = [cx + R * Math.cos(a1), cy + R * Math.sin(a1)];
        // in the turn, the arc out of model behaviour belongs to the lit half: it is the step being taken
        var arcGrp = turn ? (i >= 2 ? g(grp, 'loop-now') : sub) : grp;
        var arc = el('path', { d: 'M' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + ' A ' + R + ' ' + R + ' 0 0 1 ' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1), 'class': 'loop-arc', 'marker-end': 'url(#arrow)' }, arcGrp);
        var p = pos(i);
        el('circle', { cx: p[0], cy: p[1], r: 14, 'class': 'loop-node' + ((turn ? i >= 3 : (i === 2 || i === 4)) ? ' hot' : '') }, sub);
        var q = pos(i, R + 58);
        var anchor = Math.abs(Math.cos(ang(i))) < 0.2 ? 'middle' : (Math.cos(ang(i)) > 0 ? 'start' : 'end');
        var dy = Math.sin(ang(i)) < -0.9 ? -8 : (Math.sin(ang(i)) > 0.6 ? 26 : 11);
        txt(sub, q[0], q[1] + dy, LOOP[i], 'loop-label', { 'text-anchor': anchor });
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
        a Richter-grey middle, as 100% bars (centred on the neutral share until 30 Sep). Rows are the
        paper's three groups (Human, LLM-Influenced, LLM).
     ------------------------------------------------------------------------------------------ */
  var STANCE = [
    { step: 1, label: 'Wrote alone', sub: 'no AI', group: 'Human', v: [32.6, 39.5, 27.9] },
    { step: 2, label: 'Used AI lightly', sub: 'advice, look-ups', group: 'LLM-Influenced', v: [31.0, 44.8, 24.1] },
    { step: 3, label: 'Let AI write', sub: 'much of the essay', group: 'LLM', v: [22.2, 66.7, 11.1] }
  ];
  function stanceChart(host) {
    // 100% bars since 30 Sep (Tommie: the centred bars read as misaligned): every row starts and ends at the same
    // place; for from the left, neutral in the middle, against to the right
    var W = 1656, H = 420, xa = 430, xb = 1640, bh = 84, gap = 4, rowY = [118, 236, 354];
    var s = (xb - xa) / 100;
    var svg = svgFor(host, W, H, 'Stance of essays on whether money leads to happiness. Wrote alone: 32.6% for, 39.5% neutral, 27.9% against. Used AI lightly: 31.0, 44.8, 24.1. Let AI write much of the essay: 22.2, 66.7, 11.1.');
    // legend: swatches in the marks' colours, words in text tokens
    var lg = g(svg, 'legend st-0'), lx = xa;
    [['for', 'for'], ['nostance', 'neutral: takes no side'], ['against', 'against']].forEach(function (k) {
      el('rect', { x: lx, y: 8, width: 26, height: 26, rx: 5, 'class': k[0] }, lg);
      txt(lg, lx + 38, 31, k[1], '');
      lx += 38 + k[1].length * 12.6 + 64;         // Inter at 28px: about 12.6 units per character
    });
    STANCE.forEach(function (r, i) {
      var y = rowY[i], tot = r.v[0] + r.v[1] + r.v[2];
      var c1 = xa + r.v[0] / tot * 100 * s, c2 = xa + (r.v[0] + r.v[1]) / tot * 100 * s;
      var grp = g(svg, 'st-' + r.step);
      txt(grp, 0, y - 4, r.label, 'label', {});
      txt(grp, 0, y + 32, r.sub, 'label-2', {});
      var bars = g(grp, 'grow-x');
      bars.style.transformOrigin = xa + 'px 0px';
      var labs = g(grp, 'late');
      [
        { cls: 'for', name: 'for', v: r.v[0], a: xa, b: c1 - gap / 2 },
        { cls: 'nostance', name: 'neutral', v: r.v[1], a: c1 + gap / 2, b: c2 - gap / 2 },
        { cls: 'against', name: 'against', v: r.v[2], a: c2 + gap / 2, b: xb }
      ].forEach(function (sg) {
        var rect = mark(el('rect', { x: sg.a.toFixed(1), y: y - bh / 2, width: (sg.b - sg.a).toFixed(1), height: bh, rx: 6, 'class': 'bar ' + sg.cls }, bars), '§13.5');
        var tt = el('title', null, rect);
        tt.textContent = r.label + ' (' + r.group + '): ' + sg.name + ' ' + fmt(sg.v, 1) + '%';
        txt(labs, ((sg.a + sg.b) / 2).toFixed(1), y + 11, fmt(sg.v, 1) + '%', 'seglabel', { 'text-anchor': 'middle' });
      });
    });
  }

  /* ------------------------------------------------------------------------------------------
     8. Provenance: one open model's training data, stage by stage (EVIDENCE §16, work in progress).
        OLMo-2's published training data, counted 29 Sep 2026 (the ledger in wk-talk/olmo-ledger/).
        Colour is who wrote the text: people (grey), other models (blue). Linear bars (log until 30 Sep);
        every bar labelled. Per million spaCy tokens. The model's own writing is the next slide's (sampled);
        v0.2's step 4, the 7B's greedy science rates (§3.2), left on 30 Sep: greedy decoding
        under-reads a model's dashes several times over (§16.12), which invited a false contrast.
     ------------------------------------------------------------------------------------------ */
  var PROV = [
    { step: 1, stage: 'Pretraining', label: 'web text, 95% of the mix', v: 491.4, kind: 'neutral', ev: '§16.2' },
    { step: 2, stage: 'Instruction tuning', label: 'answers written by people', v: 184.6, kind: 'neutral', ev: '§16.4' },
    { step: 2, stage: '', label: 'answers from ChatGPT (WildChat)', v: 1032.0, kind: 'blue', ev: '§16.4' },
    { step: 3, stage: 'Preference tuning', label: 'preferred answers', v: 411.4, kind: 'blue', ev: '§16.5' },
    { step: 3, stage: '', label: 'rejected answers', v: 628.4, kind: 'blue', ev: '§16.5' }
  ];
  function provenanceChart(host) {
    // linear since 30 Sep (Tommie): with the greedy science step gone, every value sits between 185 and 1,032,
    // and bars from zero show the gap at its true size (ChatGPT's answers 5.6 times people's)
    var W = 1656, H = 510, m = { l: 560, r: 150, t: 78, b: 70 }, xmax = 1100, bh = 34;
    var pw = W - m.l - m.r;
    var x = function (v) { return m.l + v / xmax * pw; };
    var svg = svgFor(host, W, H, 'Em dashes per million tokens in OLMo-2\'s training data, stage by stage: web text 491; answers written by people 185, answers from ChatGPT 1,032; preferred answers 411, rejected answers 628');
    // legend: who wrote the text
    var lg = g(svg, 'legend st-0'), lx = m.l;
    [['neutral', 'written by people'], ['blue', 'written by other models']].forEach(function (k) {
      el('rect', { x: lx, y: 11, width: 22, height: 22, rx: 4, 'class': 'bar ' + k[0] }, lg);
      txt(lg, lx + 32, 32, k[1], '');
      lx += 32 + k[1].length * 12.6 + 56;
    });
    // rows, with a little extra space between stages
    var y = m.t + 30, ys = [];
    PROV.forEach(function (r, i) { if (i && r.stage) y += 22; ys.push(y); y += 64; });
    var plotBottom = y - 30;
    // grid and ticks
    var grid = g(svg, 'grid st-0'), ticks = g(svg, 'tick st-0');
    [0, 250, 500, 750, 1000].forEach(function (v) {
      el('line', { x1: x(v), x2: x(v), y1: m.t + 8, y2: plotBottom }, grid);
      txt(ticks, x(v), plotBottom + 40, fmt(v), '', { 'text-anchor': 'middle' });
    });
    txt(g(svg, 'st-0'), 0, plotBottom + 40, 'em dashes per million tokens', 'xlab-2', {});
    PROV.forEach(function (r, i) {
      var grp = g(svg, 'st-' + r.step), yy = ys[i];
      if (r.stage) txt(grp, 0, yy - 14, r.stage.toUpperCase(), 'xlab-2', { 'letter-spacing': '0.08em' });
      txt(grp, 0, yy + 20, r.label, 'label-2', {});
      var bars = g(grp, 'grow-x');
      bars.style.transformOrigin = m.l + 'px 0px';
      var b = mark(el('rect', { x: m.l, y: yy + 10 - bh / 2, width: (x(r.v) - m.l).toFixed(1), height: bh, rx: 6, 'class': 'bar ' + r.kind }, bars), r.ev);
      var t = el('title', null, b); t.textContent = (r.stage ? r.stage + ': ' : '') + r.label + ', ' + fmt(r.v, 1) + ' per million tokens';
      txt(g(grp, 'late'), x(r.v) + 20, yy + 21, fmt(r.v, 0), 'label', {});
    });
  }

  /* ------------------------------------------------------------------------------------------
     9. The same stages in one model's own writing, at two sizes: OLMo-2 1B (slide 15) and 7B (slide 16),
        four checkpoints each, continuing CC-News first halves from the uniform tier's frame (the 1B all
        10,000, the 7B the first 5,000, in 4-bit), sampling from their own probabilities (T 1, no top-k or
        top-p), first 40 words, next to the data of each stage and to the same articles' own writers
        (EVIDENCE §16.2, §16.4-16.5, §16.7, §16.10, §16.12, §16.14; work in progress). Uniform-tier prompts:
        never on a slide with deep-N numbers. One linear scale for both sizes, so the two slides compare at
        a glance; whiskers are 95% bootstrap intervals over items. v0.2 showed greedy output on 600 prompts
        (§16.8), a decoding artefact.
     ------------------------------------------------------------------------------------------ */
  var ONEB = [
    { stage: 'pretraining', ckpt: 'base', data: 491.4, dataLabel: 'web text', dataEv: '§16.2', v: 679.0, lo: 589, hi: 770 },
    { stage: 'instruction tuning', ckpt: 'SFT', data: 373.4, dataLabel: 'its answers', dataEv: '§16.7', v: 513.0, lo: 432, hi: 599 },
    { stage: 'preference tuning', ckpt: 'DPO', data: 412.1, dataLabel: 'preferred answers', dataEv: '§16.7', v: 1408.5, lo: 1282, hi: 1535 },
    { stage: 'maths reinforcement', ckpt: 'final', data: null, dataLabel: 'no text to count', v: 1159.7, lo: 1043, hi: 1273 }
  ];
  var SEVENB = [                                   // 4-bit NF4, the first 5,000 of the same prompts (§16.14)
    { stage: 'pretraining', ckpt: 'base', data: 491.4, dataLabel: 'web text', dataEv: '§16.2', v: 654.6, lo: 531, hi: 785 },
    { stage: 'instruction tuning', ckpt: 'SFT', data: 308.9, dataLabel: 'its answers', dataEv: '§16.4', v: 592.0, lo: 470, hi: 718 },
    { stage: 'preference tuning', ckpt: 'DPO', data: 411.4, dataLabel: 'preferred answers', dataEv: '§16.5', v: 885.2, lo: 748, hi: 1030 },
    { stage: 'maths reinforcement', ckpt: 'final', data: null, dataLabel: 'no text to count', v: 710.2, lo: 587, hi: 841 }
  ];
  var STAGE_SERIES = {
    '1b': { rows: ONEB, human: 965.8, humanEv: '§16.10', ev: '§16.12', steps: [1, 2, 3],   // the 10,000 articles' own words 41 to 80
            aria: 'OLMo-2 1B: em dashes per million tokens in the training data of each stage and in the model\'s own news continuations after that stage' },
    '7b': { rows: SEVENB, human: 944.9, humanEv: '§16.14', ev: '§16.14', steps: [1, 1, 2],  // the first 5,000 articles' own words 41 to 80
            aria: 'OLMo-2 7B: em dashes per million tokens in the training data of each stage and in the model\'s own news continuations after that stage' }
  };
  // steps: [the data of each stage, the base model and the writers' line, the post-trained models]
  function stageChart(host, key) {
    var S = STAGE_SERIES[key], ROWS = S.rows;
    var W = 1656, H = 650, m = { l: 150, r: 40, t: 80, b: 110 };
    var pw = W - m.l - m.r, ph = H - m.t - m.b, ymax = 1600;
    var y = function (v) { return m.t + ph - v / ymax * ph; };
    var col = function (i) { return m.l + (i + 0.5) * pw / ROWS.length; };
    var svg = svgFor(host, W, H, S.aria);
    var lg = g(svg, 'legend st-0'), lx = m.l;
    [['neutral', 'what it was trained on at this stage'], ['gold', 'what it writes after it (continuing news)']].forEach(function (k) {
      el('circle', { cx: lx + 11, cy: 22, r: 11, 'class': 'dot ' + k[0] }, lg);
      txt(lg, lx + 32, 32, k[1], '');
      lx += 32 + k[1].length * 12.6 + 64;
    });
    var grid = g(svg, 'grid st-0'), ticks = g(svg, 'tick st-0');
    for (var v = 0; v <= ymax; v += 400) {
      el('line', { x1: m.l, x2: m.l + pw, y1: y(v), y2: y(v) }, grid);
      txt(ticks, m.l - 22, y(v) + 10, fmt(v), '', { 'text-anchor': 'end' });
    }
    var xl = g(svg, 'st-0');
    ROWS.forEach(function (r, i) {
      txt(xl, col(i), m.t + ph + 48, r.stage, 'xlab', { 'text-anchor': 'middle' });
      txt(xl, col(i), m.t + ph + 84, r.ckpt === 'final' ? 'the final model' : 'then the ' + r.ckpt + ' model', 'xlab-2', { 'text-anchor': 'middle' });
    });
    txt(xl, 0, m.t - 24, 'em dashes per million tokens', 'xlab-2', {});
    // the data of each stage
    var s1 = g(svg, 'st-' + S.steps[0]);
    ROWS.forEach(function (r, i) {
      var cx = col(i) - 62;
      if (r.data === null) {
        txt(s1, cx, y(0) - 30, r.dataLabel, 'xlab-2', { 'text-anchor': 'middle' });
        return;
      }
      var c = mark(el('circle', { cx: cx, cy: y(r.data), r: 13, 'class': 'dot neutral' }, s1), r.dataEv);
      var t = el('title', null, c); t.textContent = r.stage + ', ' + r.dataLabel + ': ' + fmt(r.data, 1) + ' per million tokens';
      txt(s1, cx - 26, y(r.data) + 10, fmt(r.data, 0), 'label', { 'text-anchor': 'end' });
      txt(s1, cx, y(r.data) - 30, r.dataLabel, 'label-2', { 'text-anchor': 'middle' });
    });
    // the base model, and the same articles' own writers as a line; then the post-trained models
    var hr = g(svg, 'ref st-' + S.steps[1]);
    mark(el('line', { x1: m.l, x2: m.l + pw, y1: y(S.human), y2: y(S.human), 'stroke-dasharray': '14 10' }, hr), S.humanEv);
    txt(hr, m.l + 8, y(S.human) - 16, 'people writing the same articles: ' + fmt(S.human, 0), '', {});
    ROWS.forEach(function (r, i) {
      var grp = g(svg, 'st-' + (i === 0 ? S.steps[1] : S.steps[2])), cx = col(i) + 62;
      var wk = g(grp, 'whisker');
      mark(el('line', { x1: cx, x2: cx, y1: y(r.lo), y2: y(r.hi) }, wk), S.ev);
      el('line', { x1: cx - 16, x2: cx + 16, y1: y(r.hi), y2: y(r.hi) }, wk);
      el('line', { x1: cx - 16, x2: cx + 16, y1: y(r.lo), y2: y(r.lo) }, wk);
      var c = mark(el('circle', { cx: cx, cy: y(r.v), r: 13, 'class': 'dot gold' }, grp), S.ev);
      var t = el('title', null, c); t.textContent = 'after ' + r.stage + ': ' + fmt(r.v, 1) + ' per million tokens (95% range ' + fmt(r.lo) + ' to ' + fmt(r.hi) + ')';
      txt(grp, cx + 28, y(r.v) + 10, fmt(r.v, 0), 'label', {});
    });
  }

  /* ------------------------------------------------------------------------------------------
     10. The dash's form, stage by stage: em dashes spaced ("word \u2014 word") or closed up ("word\u2014word"),
         as one 100% bar per row (since 30 Sep), in the first 40 words, for the same 10,000 news articles'
         writers and OLMo-2 1B's sampled continuations of them (EVIDENCE §16.13; work in progress).
     ------------------------------------------------------------------------------------------ */
  var CLOSED = [
    { step: 1, label: 'People who wrote these articles', v: 12.56, kind: 'neutral' },   // 53 of 422
    { step: 2, label: 'OLMo-2 1B: the base model', v: 35.21, kind: 'gold' },           // 100 of 284
    { step: 2, label: 'the SFT model', v: 60.62, kind: 'gold' },                       // 117 of 193
    { step: 2, label: 'the DPO model', v: 78.33, kind: 'gold' },                       // 488 of 623
    { step: 2, label: 'the final model', v: 80.48, kind: 'gold' }                      // 400 of 497
  ];
  function closedUpChart(host) {
    // one full bar per row (Tommie, 30 Sep): spaced from the left in grey, the news convention; closed up from the
    // right in gold, the model's habit; the two add up to 100 (dashes spaced on one side only are left out)
    var W = 1656, H = 610, xa = 560, xb = 1540, bh = 50, top = 150, step = 82, gap = 3;
    var X = function (v) { return xa + v / 100 * (xb - xa); };
    var svg = svgFor(host, W, H, 'Em dashes spaced or closed up: people 87% spaced, 13% closed up; OLMo-2 1B base 65 and 35%, SFT 39 and 61%, DPO 22 and 78%, final 20 and 80%.');
    // the two forms, at the two ends of the bars; the swatches make them the legend
    var sp = g(svg, 'st-0');
    txt(sp, xa, 40, 'word \u2014 word', 'label', { 'text-anchor': 'start' });
    el('rect', { x: xa, y: 54, width: 22, height: 22, rx: 4, 'class': 'bar neutral' }, sp);
    txt(sp, xa + 32, 74, 'spaced', 'label-2', { 'text-anchor': 'start' });
    txt(sp, xb, 40, 'word\u2014word', 'label', { 'text-anchor': 'end' });
    el('rect', { x: xb - 22, y: 54, width: 22, height: 22, rx: 4, 'class': 'bar gold' }, sp);
    txt(sp, xb - 32, 74, 'closed up', 'label-2', { 'text-anchor': 'end' });
    var ticks = g(svg, 'tick st-0');
    [0, 50, 100].forEach(function (v) {
      txt(ticks, X(v), top + step * CLOSED.length + 18, v + '%', '', { 'text-anchor': 'middle' });
    });
    CLOSED.forEach(function (r, i) {
      var y = top + i * step, grp = g(svg, 'st-' + r.step), cut = X(100 - r.v);
      var closed = Math.round(r.v), spaced = 100 - closed;
      txt(grp, 0, y + 10, r.label, i === 0 ? 'label' : 'label-2', {});
      var bars = g(grp, 'grow-x');
      bars.style.transformOrigin = xa + 'px 0px';
      var a = mark(el('rect', { x: xa, y: y - bh / 2, width: (cut - gap / 2 - xa).toFixed(1), height: bh, rx: 6, 'class': 'bar neutral' }, bars), '§16.13');
      el('title', null, a).textContent = r.label + ': ' + spaced + '% of em dashes spaced (word \u2014 word)';
      var b = mark(el('rect', { x: (cut + gap / 2).toFixed(1), y: y - bh / 2, width: (xb - cut - gap / 2).toFixed(1), height: bh, rx: 6, 'class': 'bar gold' }, bars), '§16.13');
      el('title', null, b).textContent = r.label + ': ' + closed + '% of em dashes closed up (word\u2014word)';
      var labs = g(grp, 'late');
      txt(labs, ((xa + cut) / 2).toFixed(1), y + 11, spaced + '%', 'seglabel', { 'text-anchor': 'middle' });
      txt(labs, ((cut + xb) / 2).toFixed(1), y + 11, closed + '%', 'seglabel', { 'text-anchor': 'middle' });
    });
  }

  /* ------------------------------------------------------------------------------------------
     Human convention: em dashes in five Project Gutenberg works and in human news (EVIDENCE §19, §2.2).
     Quick and indicative: one public-domain transcription per work; per million spaCy tokens, as in 02's
     tables, so the news bar (CC-News) is on the same scale; a doubled dash counts once.
     Counted by gutenberg-dash/count.py on 30 Sep 2026 (twenty works there; Tommie picked these on 30 Sep).
     ------------------------------------------------------------------------------------------ */
  var BOOKS = [
    { who: 'Laurence Sterne', what: 'Tristram Shandy', yr: 1759, v: 40617, ev: '§19' },
    { who: 'Charlotte Bront\u00eb', what: 'Jane Eyre', yr: 1847, v: 8787, ev: '§19' },
    { who: 'Virginia Woolf', what: 'Mrs Dalloway', yr: 1925, v: 6945, ev: '§19' },
    { who: 'Charles Darwin', what: 'Origin of Species', yr: 1859, v: 1900, ev: '§19' },
    { who: 'human news', what: 'CC-News', v: 1078.3, ev: '§2.2', news: true },
    { who: 'Ernest Hemingway', what: 'The Sun Also Rises', yr: 1926, v: 389, ev: '§19' }
  ];
  function booksChart(host) {
    var W = 1656, top = 40, step = 92, bh = 50, bot = top + step * (BOOKS.length - 1) + 50, H = bot + 56;
    var xa = 690, xb = 1470, xmax = 10000;
    var X = function (v) { return xa + Math.min(v, xmax) / xmax * (xb - xa); };
    var svg = svgFor(host, W, H, 'Em dashes per million tokens: Sterne, Tristram Shandy, 40,617; Charlotte Bront\u00eb, Jane Eyre, 8,787; Virginia Woolf, Mrs Dalloway, 6,945; Charles Darwin, Origin of Species, 1,900; human news (CC-News), 1,078; Ernest Hemingway, The Sun Also Rises, 389.');
    var grid = g(svg, 'grid st-0'), ticks = g(svg, 'tick st-0');
    [0, 5000, 10000].forEach(function (v) {
      el('line', { x1: X(v), x2: X(v), y1: top - 36, y2: bot }, grid);
      txt(ticks, X(v), bot + 40, fmt(v), '', { 'text-anchor': 'middle' });
    });
    txt(g(svg, 'st-0'), 0, bot + 40, 'em dashes per million tokens', 'label-2', {});
    BOOKS.forEach(function (r, i) {
      // the news bar is the point of comparison, so it comes first (step 1); the works follow (step 2)
      var y = top + i * step, grp = g(svg, 'st-' + (r.news ? 1 : 2));
      var lab = txt(grp, 0, y + 11, r.news ? 'human news ' : r.who + ', ', r.news ? 'book news' : 'book', {});
      var ti = el('tspan', r.news ? {} : { 'font-style': 'italic' }, lab); ti.textContent = r.news ? '(CC-News)' : r.what;
      var bars = g(grp, 'grow-x');
      bars.style.transformOrigin = xa + 'px 0px';
      var b = mark(el('rect', { x: xa, y: y - bh / 2, width: (X(r.v) - xa).toFixed(1), height: bh, rx: 6,
        'class': r.news ? 'bar newsbar' : 'bar neutral' }, bars), r.ev);
      var t = el('title', null, b);
      t.textContent = (r.news ? 'Human news (CC-News)' : r.who + ', ' + r.what + ' (' + r.yr + ')') + ': ' + fmt(r.v) + ' em dashes per million tokens';
      if (r.v > xmax) {   // off the scale: a break in the bar, and its value
        var bx = X(xmax) - 44, y0 = y - bh / 2 - 6, y1 = y + bh / 2 + 6;
        el('path', { d: 'M' + bx + ' ' + y0 + 'h14l-14 ' + (y1 - y0) + 'h-14z', 'class': 'axis-break' }, bars);
      }
      txt(g(grp, 'late'), X(r.v) + 20, y + 12, fmt(r.v), 'label', {});
    });
  }

  /* ------------------------------------------------------------------------------------------
     The tell moves: "delve" and the em dash across OpenAI's flagships, news continuations (EVIDENCE §20).
     Deep-N tier (20,000 to 100,000 items per model), a different run from the uniform tier of slides 9
     and 10, so each word is drawn against its own peak and no rate on this slide can be read against
     theirs. Source: 02 emdashes-prior-work/followup-starter/tables/dash_and_lexical_by_model.tsv.
     ------------------------------------------------------------------------------------------ */
  var TELLS = [
    { label: 'GPT-4',       date: 'Jun 2023', delve: 215.1, em: 7.6 },
    { label: 'GPT-4 Turbo', date: 'Apr 2024', delve: 174.4, em: 53.2 },
    { label: 'GPT-4o',      date: 'Aug 2024', delve: 269.7, em: 12.7 },
    { label: 'GPT-4.1',     date: 'Apr 2025', delve: 46.5,  em: 412.8 }
  ];
  // after GPT-4.1 the news rows of the deep-N tier stop; the em dash's return is the uniform tier's own shape
  // (slide 9: GPT-5.4 two runs 924.4 and 837.3 against GPT-4.1's 3,406.9 and 4,161.2, EVIDENCE §1.2, §1.5)
  var TELL_RETURN = { label: 'GPT-5.4', date: 'Mar 2026', em: (924.4 + 837.3) / (3406.9 + 4161.2) * 100 };
  function tellsChart(host) {
    var W = 1656, H = 620, m = { l: 150, r: 90, t: 50, b: 120 };
    var pw = W - m.l - m.r, ph = H - m.t - m.b, n = TELLS.length + 2;   // two slots more: GPT-5.4, next
    var x = function (i) { return m.l + (i + 0.5) * pw / n; };
    var y = function (p) { return m.t + ph - p / 100 * ph; };
    var peak = { delve: 269.7, em: 412.8 };
    var svg = svgFor(host, W, H, 'Each word against its own peak, OpenAI flagship models continuing news: delve 80, 65, 100 and 17 per cent from GPT-4 to GPT-4.1; the em dash 2, 13, 3 and 100 per cent, then back to about a quarter of its peak by GPT-5.4.');
    var grid = g(svg, 'grid st-0'), ticks = g(svg, 'tick st-0');
    [0, 50, 100].forEach(function (p) {
      el('line', { x1: m.l, x2: m.l + pw, y1: y(p), y2: y(p) }, grid);
      txt(ticks, m.l - 22, y(p) + 10, p + '%', '', { 'text-anchor': 'end' });
    });
    txt(g(svg, 'st-0'), m.l, 20, 'each word against its own peak', 'label-2', {});
    var xl = g(svg, 'st-0');
    TELLS.forEach(function (r, i) {
      txt(xl, x(i), m.t + ph + 50, r.label, 'xlab', { 'text-anchor': 'middle' });
      txt(xl, x(i), m.t + ph + 84, r.date, 'xlab-2', { 'text-anchor': 'middle' });
    });
    function series(key, cls, step) {
      var grp = g(svg, 'st-' + step);
      polyline(grp, TELLS.map(function (r, i) { return [x(i), y(r[key] / peak[key] * 100)]; }), 'line draw ' + cls);
      TELLS.forEach(function (r, i) {
        var c = mark(el('circle', { cx: x(i), cy: y(r[key] / peak[key] * 100), r: 11, 'class': 'dot ' + cls }, grp), '§20');
        var t = el('title', null, c);
        t.textContent = r.label + ': ' + (key === 'em' ? 'em dash ' : 'delve ') + fmt(r[key], 1) + ' per million tokens (' + fmt(r[key] / peak[key] * 100) + '% of its peak)';
      });
      return grp;
    }
    var d = series('delve', 'blue', 1);
    var dl = txt(d, x(0), y(TELLS[0].delve / peak.delve * 100) - 30, '', 'label', { 'text-anchor': 'middle' });
    var di = el('tspan', { 'font-style': 'italic' }, dl); di.textContent = 'delve';
    var e = series('em', 'gold', 2);
    txt(e, x(3), y(100) - 30, 'the em dash', 'label', { 'text-anchor': 'middle' });
    // and go: dashed, because these come from elsewhere (the em dash) or not at all (delve)
    var go = g(svg, 'st-3'), yd = y(TELLS[3].delve / peak.delve * 100), ye = y(TELL_RETURN.em);
    txt(go, x(4), m.t + ph + 50, TELL_RETURN.label, 'xlab', { 'text-anchor': 'middle' });
    txt(go, x(4), m.t + ph + 84, TELL_RETURN.date, 'xlab-2', { 'text-anchor': 'middle' });
    mark(el('path', { d: 'M' + x(3) + ' ' + y(100) + 'L' + x(4) + ' ' + ye, 'class': 'line gold dashed' }, go), '§20');
    var hc = mark(el('circle', { cx: x(4), cy: ye, r: 11, 'class': 'dot hollow gold' }, go), '§20');
    el('title', null, hc).textContent = 'GPT-5.4: the em dash back to about ' + fmt(TELL_RETURN.em) + '% of its GPT-4.1 peak (the runs on slide 9: ' + fmt(TELL_RETURN.em) + '%)';
    txt(go, x(4) + 24, ye - 16, 'back to the', 'label-2', {});
    txt(go, x(4) + 24, ye + 18, 'human rate', 'label-2', {});
    el('path', { d: 'M' + x(3) + ' ' + yd + 'L' + (x(4) - 22) + ' ' + y(3), 'class': 'line blue dashed' }, go);
    txt(go, x(4), y(3) + 12, '?', 'label tell-q', { 'text-anchor': 'middle' });
    // next: an empty slot
    var nx = g(svg, 'st-4');
    el('line', { x1: x(5), x2: x(5), y1: y(100), y2: y(50) - 80, 'class': 'next-slot' }, nx);
    el('line', { x1: x(5), x2: x(5), y1: y(50) + 56, y2: y(0), 'class': 'next-slot' }, nx);
    txt(nx, x(5), y(50) + 34, '?', 'next-q', { 'text-anchor': 'middle' });
    txt(nx, x(5), m.t + ph + 50, 'next', 'xlab', { 'text-anchor': 'middle' });
  }

  /* ------------------------------------------------------------------------------------------
     House styles: em dashes in six 2026 models given the same prompts (EVIDENCE §21; unpublished, work in
     progress). AI idiolects project (Rudnicka and Juzek), phase 2: Improta et al.'s four prompts, 1,000 texts
     per model and topic, temperature 0.5; U+2014 as typed, per 1,000 whitespace words, the four topics pooled.
     Only the coarse split is stable across topics (OLMo top and NeMo bottom in all four; the middle three swap).
     No human bar: the project's human corpora are not prompt-matched, and its Reuters text cannot hold the glyph.
     ------------------------------------------------------------------------------------------ */
  var HOUSES = [
    { name: 'OLMo 3 7B', who: 'Ai2, open', v: 11.11 },
    { name: 'Claude Haiku 4.5', who: 'Anthropic', v: 8.56 },
    { name: 'Qwen3 14B', who: 'Alibaba, open', v: 8.20 },
    { name: 'Gemini 3 Flash', who: 'Google', v: 7.18 },
    { name: 'GPT-5.4 mini', who: 'OpenAI', v: 0.88 },
    { name: 'Mistral NeMo 12B', who: 'Mistral, open', v: 0.027 }
  ];
  function housesChart(host) {
    var W = 1656, top = 30, step = 62, bh = 38, bot = top + step * (HOUSES.length - 1) + 40, H = bot + 50;
    var xa = 590, xb = 1460, xmax = 12;
    var X = function (v) { return xa + v / xmax * (xb - xa); };
    var svg = svgFor(host, W, H, 'Em dashes per 1,000 words, six 2026 models, the same prompts: OLMo 3 7B 11.1, Claude Haiku 4.5 8.6, Qwen3 14B 8.2, Gemini 3 Flash 7.2, GPT-5.4 mini 0.9, Mistral NeMo 12B 0.03.');
    var grid = g(svg, 'grid st-0'), ticks = g(svg, 'tick st-0');
    [0, 4, 8, 12].forEach(function (v) {
      el('line', { x1: X(v), x2: X(v), y1: top - 26, y2: bot }, grid);
      txt(ticks, X(v), bot + 38, fmt(v), '', { 'text-anchor': 'middle' });
    });
    txt(g(svg, 'st-0'), 0, bot + 38, 'em dashes per 1,000 words', 'xlab-2', {});
    HOUSES.forEach(function (r, i) {
      var y = top + i * step, grp = g(svg, 'st-1');
      var lab = txt(grp, 0, y + 11, r.name + ' ', 'book', {});
      var wt = el('tspan', { 'class': 'who' }, lab); wt.textContent = r.who;
      var bars = g(grp, 'grow-x');
      bars.style.transformOrigin = xa + 'px 0px';
      var b = mark(el('rect', { x: xa, y: y - bh / 2, width: Math.max(3, X(r.v) - xa).toFixed(1), height: bh, rx: 6, 'class': 'bar gold' }, bars), '§21');
      el('title', null, b).textContent = r.name + ': ' + fmt(r.v, 2) + ' em dashes per 1,000 words';
      txt(g(grp, 'late'), Math.max(X(r.v), xa + 3) + 18, y + 12, fmt(r.v, r.v < 0.1 ? 2 : 1), 'label', {});
    });
  }

  var BUILDERS = {
    'houses': housesChart,
    'tells': tellsChart,
    'books': booksChart,
    'provenance': provenanceChart,
    'provenance-1b': function (h) { stageChart(h, '1b'); },
    'provenance-7b': function (h) { stageChart(h, '7b'); },
    'closed-up': closedUpChart,
    'rise-news': function (h) { riseChart(h, 'news'); },
    'rise-science': function (h) { riseChart(h, 'science'); },
    'reference': referenceChart,
    'slope': slopeChart,
    'dots': dotsChart,
    'loop': loopChart,
    'loop-turn': function (h) { loopChart(h, 'turn'); },
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
