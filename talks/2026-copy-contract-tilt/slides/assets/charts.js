/* charts.js: the figures for "Copy, Contract, Tilt" (maths seminar, 13 November 2026). Built on the WK deck's
   charts.js (helpers, step mechanism, the stance and OLMo stage charts reused).
   Inline SVG only (canvas prints blank). Every plotted value carries the evidence/EVIDENCE.md row it comes
   from (data-ev). State is CSS-driven: hidden step markers (reveal fragments) are read with :has() in
   deck.css, so back-navigation, URL jumps and print all land right.
   Colour carries the stage: copy (pretraining) neutral, contract (SFT) blue, tilt (DPO) gold.
   12 November: RATIO swapped to the full ratio axis (9 dosed bases); WHOLE (the pipeline in one picture) and
   DECODE (T 1.0 against T 0.8) added, both from the instance's readings (dg-pp124h-ratio-readings.tsv). */
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
  function whisker(parent, x, y1, y2, colourVar, horizontal) {
    var w = g(parent, 'whisker');
    if (horizontal) {
      el('line', { x1: y1, x2: y2, y1: x, y2: x }, w);
      el('line', { x1: y1, x2: y1, y1: x - 12, y2: x + 12 }, w);
      el('line', { x1: y2, x2: y2, y1: x - 12, y2: x + 12 }, w);
    } else {
      el('line', { x1: x, x2: x, y1: y1, y2: y2 }, w);
      el('line', { x1: x - 12, x2: x + 12, y1: y1, y2: y1 }, w);
      el('line', { x1: x - 12, x2: x + 12, y1: y2, y2: y2 }, w);
    }
    if (colourVar) Array.prototype.forEach.call(w.querySelectorAll('line'), function (l) { l.style.stroke = 'var(--' + colourVar + ')'; });
    return w;
  }
  function drop(parent, cx, cy, s) {          // a drop of dye
    var d = 'M' + cx + ' ' + (cy - s) + ' C' + (cx + 0.62 * s) + ' ' + (cy - 0.15 * s) + ' ' + (cx + 0.72 * s) + ' ' + (cy + 0.5 * s) + ' ' + cx + ' ' + (cy + 0.72 * s) +
            ' C' + (cx - 0.72 * s) + ' ' + (cy + 0.5 * s) + ' ' + (cx - 0.62 * s) + ' ' + (cy - 0.15 * s) + ' ' + cx + ' ' + (cy - s) + ' Z';
    return el('path', { d: d, 'class': 'drop' }, parent);
  }
  function arrow(parent, x1, y1, x2, y2, dashed) {
    var a = g(parent, '');
    el('line', { x1: x1, y1: y1, x2: x2 - (x2 > x1 ? 16 : 0), y2: y2 - (y2 > y1 && x1 === x2 ? 16 : 0), 'class': 'arrow', 'stroke-dasharray': dashed ? '10 9' : null }, a);
    if (x1 === x2) el('path', { d: 'M' + (x2 - 11) + ' ' + (y2 - 18) + ' L' + (x2 + 11) + ' ' + (y2 - 18) + ' L' + x2 + ' ' + y2 + ' Z', 'class': 'arrowhead' }, a);
    else el('path', { d: 'M' + (x2 - 18) + ' ' + (y2 - 11) + ' L' + (x2 - 18) + ' ' + (y2 + 11) + ' L' + x2 + ' ' + y2 + ' Z', 'class': 'arrowhead' }, a);
    return a;
  }

  /* ------------------------------------------------------------------------------------------
     1. The pipeline (slides "pipeline" and "design"). Step 0: the three stages and what each learns from.
        Step 1: the dye goes in at every stage, at set doses. Step 2: every stage is read.
        Design: 07b DESIGN.md §11; the pre-pilot report's design figure (prepilot-report.tex 146-164).
     ------------------------------------------------------------------------------------------ */
  var STAGES = [
    { name: 'Pretraining', verb: 'copy', from: 'web text, 2.5 billion tokens', from2: 'learns to continue it', dose: '0, ¼×, 1×, 4× the natural rate', ev: 'E3.1' },
    { name: 'SFT', verb: 'contract', from: '20,000 chat answers', from2: 'learns to answer like them', dose: '0, 1×, 4×', ev: 'E3.1' },
    { name: 'DPO', verb: 'tilt', from: '8,000 pairs of answers', from2: 'learns which was preferred', dose: 'which side carries it', ev: 'E3.1' }
  ];
  function pipelineChart(host, mode) {
    var W = 1656, H = mode === 'design' ? 590 : 420, bw = 480, bh = 220, gap = (W - 3 * bw) / 2, by = mode === 'design' ? 150 : 90;
    var svg = svgFor(host, W, H, 'Three training stages: pretraining on web text, SFT on chat answers, DPO on pairs of answers. In the experiment, em dashes are dosed at every stage and the model is read after every stage.');
    STAGES.forEach(function (S, i) {
      var x = i * (bw + gap), s0 = g(svg, 'st-0');
      el('rect', { x: x, y: by, width: bw, height: bh, rx: 18, 'class': 'box' }, s0);
      txt(s0, x + 34, by + 62, S.name, 'box-t', {});
      txt(s0, x + 34, by + 124, S.from, 'box-s', {});
      txt(s0, x + 34, by + 166, S.from2, 'box-s', {});
      if (mode === 'design') txt(g(svg, 'st-3'), x + bw - 30, by + 62, S.verb, 'box-t ' + S.verb, { 'text-anchor': 'end', style: 'fill: var(--' + (S.verb === 'copy' ? 'ink-2' : S.verb === 'contract' ? 's-blue' : 's-gold') + ')' });
      if (i < 2) arrow(s0, x + bw + 14, by + bh / 2, x + bw + gap - 14, by + bh / 2);
      if (mode !== 'design') return;
      var s1 = g(svg, 'st-1');
      drop(s1, x + 40, 66, 32);
      txt(s1, x + 90, 52, 'dye in', 'box-t', { style: 'font-size:30px' });
      txt(s1, x + 90, 92, S.dose, 'box-s', { style: 'fill: var(--ink)' });
      mark(s1, S.ev);
      var s2 = g(svg, 'st-2');
      arrow(s2, x + bw / 2, by + bh + 12, x + bw / 2, by + bh + 92, true);
      txt(s2, x + bw / 2, by + bh + 130, 'read: news and chat', 'box-s', { 'text-anchor': 'middle', style: 'fill: var(--ink)' });
    });
    if (mode === 'design') {
      txt(g(svg, 'st-1'), 0, by + bh + 196, '1× = 415 em dashes per million tokens, the web text’s natural rate. 124M models from scratch, 3 seeds per dose.', 'box-s', {});
    }
  }

  /* ------------------------------------------------------------------------------------------
     2. Copy: what each base model writes against what it read (pre-pilot, 124M, 3 seeds; news, T 1.0,
        expected em per million tokens). x: dg-corpus-v4-manifest.json; y: dg-pp124-readings.tsv (base, news, t10).
     ------------------------------------------------------------------------------------------ */
  var DOSES = { d0: 0, dq: 103.8, d1: 415.1, d4: 1666.6 };               // E3.2
  var BASE_NEWS = {                                                    // E3.3, per seed 1, 2, 3
    d0: [0.0024, 0.0024, 0.0025], dq: [109.2, 89.6, 112.1], d1: [427.1, 503.5, 520.3], d4: [1777.4, 1950.7, 1879.4]
  };
  function copyChart(host) {
    var W = 1000, H = 760, m = { l: 150, r: 40, t: 40, b: 120 }, max = 2100;
    var pw = W - m.l - m.r, ph = H - m.t - m.b;
    var x = function (v) { return m.l + v / max * pw; }, y = function (v) { return m.t + ph - v / max * ph; };
    var svg = svgFor(host, W, H, 'Base models write the em dash in proportion to the dose in their pretraining text: 0, 104, 415 and 1,667 per million in the text; about 0, 103, 482 and 1,868 per million written (three seeds each).');
    var grid = g(svg, 'grid st-0'), ticks = g(svg, 'tick st-0');
    [0, 500, 1000, 1500, 2000].forEach(function (v) {
      el('line', { x1: m.l, x2: m.l + pw, y1: y(v), y2: y(v) }, grid);
      txt(ticks, m.l - 20, y(v) + 10, fmt(v), '', { 'text-anchor': 'end' });
      txt(ticks, x(v), m.t + ph + 44, fmt(v), '', { 'text-anchor': 'middle' });
    });
    var lab = g(svg, 'st-0');
    txt(lab, m.l + pw / 2, H - 18, 'em dashes per million tokens in its pretraining text', 'xlab', { 'text-anchor': 'middle' });
    txt(lab, 0, m.t - 6, 'per million it writes', 'xlab-2', {});
    var id = g(svg, 'st-0');
    el('line', { x1: x(0), y1: y(0), x2: x(2000), y2: y(2000), 'class': 'idline' }, id);
    var ang = -Math.atan2(ph, pw) * 180 / Math.PI;
    txt(id, x(1150), y(1150) - 22, 'writes what it read', 'label-2', { transform: 'rotate(' + ang.toFixed(1) + ' ' + x(1150) + ' ' + (y(1150) - 22) + ')' });
    var dots = g(svg, 'st-1');
    Object.keys(BASE_NEWS).forEach(function (k) {
      BASE_NEWS[k].forEach(function (v, s) {
        var c = mark(el('circle', { cx: x(DOSES[k]) + (s - 1) * 16, cy: y(v), r: 12, 'class': 'dot copy' }, dots), 'E3.3');
        tip(c, 'pretraining dose ' + fmt(DOSES[k], 1) + ' per million; seed ' + (s + 1) + ': writes ' + fmt(v, 1) + ' per million');
      });
    });
  }

  /* ------------------------------------------------------------------------------------------
     3. Contract: the four pretraining doses through SFT (geometric means over 3 seeds, whiskers the seed range;
        T 1.0; expected em per million). Source: dg-pp124-three-seed.tsv. SFT data rates 415 (1x) and 1,668 (4x):
        dg-postdata-v4-manifest.json. Two panels: news (base, SFT 1x, SFT 4x) and chat (SFT 1x, SFT 4x; bases cannot chat).
     ------------------------------------------------------------------------------------------ */
  var STAGE3 = {                                 // E3.4: geomean, min, max per dose d0, dq, d1, d4
    news: {
      base: [[0.0024, 0.0024, 0.0025], [103.1, 89.6, 112.1], [481.9, 427.1, 520.3], [1868, 1777, 1951]],
      sft1: [[0.157, 0.081, 0.276], [376.6, 361.1, 405], [569.8, 484.1, 710], [810.8, 700.1, 915.6]],
      sft4: [[140.6, 114, 183.2], [1648, 1530, 1831], [2149, 1753, 2397], [2398, 1983, 2971]]
    },
    chat: {
      sft1: [[2.381, 1.094, 6.484], [374.4, 351.5, 417.4], [436.1, 420.3, 444.4], [546, 541.9, 548.6]],
      sft4: [[736.9, 667.1, 792.8], [1529, 1405, 1607], [1615, 1471, 1754], [1791, 1680, 1869]]
    }
  };
  function contractChart(host) {
    var W = 1656, H = 680, pwid = 660, gapp = 186, m = { l: 110, t: 120, b: 110 }, ph = H - m.t - m.b, max = 3000;
    var svg = svgFor(host, W, H, 'Pretraining dose against what the model writes, before and after SFT. News: base models 0, 103, 482, 1,868 per million; after SFT at the natural rate 0.2, 377, 570, 811; after SFT at four times 141, 1,648, 2,149, 2,398. Chat after SFT at the natural rate: 2, 374, 436, 546.');
    var y = function (v) { return m.t + ph - v / max * ph; };
    var lg = g(svg, 'legend'), lx = m.l;
    [['copy', 'base model', 1, false], ['contract', 'after SFT 1×', 2, false], ['contract', 'after SFT 4×', 3, true]].forEach(function (k) {
      var it = g(lg, 'st-' + k[2]);
      el('line', { x1: lx, x2: lx + 44, y1: 22, y2: 22, 'class': 'line ' + k[0] + (k[3] ? ' dashed' : ''), style: 'stroke-width:5' }, it);
      el('circle', { cx: lx + 22, cy: 22, r: 10, 'class': 'dot ' + k[0] }, it);
      txt(it, lx + 58, 32, k[1], '');
      lx += 58 + k[1].length * 12.6 + 60;
    });
    ['news', 'chat'].forEach(function (setting, pi) {
      var x0 = m.l + pi * (pwid + gapp), col = function (i) { return x0 + (i + 0.5) * pwid / 4; };
      var grid = g(svg, 'grid st-0'), ticks = g(svg, 'tick st-0');
      [0, 1000, 2000, 3000].forEach(function (v) {
        el('line', { x1: x0, x2: x0 + pwid, y1: y(v), y2: y(v) }, grid);
        txt(ticks, x0 - 18, y(v) + 10, fmt(v), '', { 'text-anchor': 'end' });
      });
      var lab = g(svg, 'st-0');
      txt(lab, x0, m.t - 26, setting === 'news' ? 'News continuations' : 'Chat answers', 'label', {});
      ['0', '¼×', '1×', '4×'].forEach(function (s, i) { txt(lab, col(i), m.t + ph + 46, s, 'xlab', { 'text-anchor': 'middle' }); });
      txt(lab, x0 + pwid / 2, m.t + ph + 92, 'pretraining dose', 'xlab-2', { 'text-anchor': 'middle' });
      // the SFT data's own rates
      var r1 = g(svg, 'ref st-2'), r4 = g(svg, 'ref st-3');
      mark(el('line', { x1: x0, x2: x0 + pwid, y1: y(415), y2: y(415), 'stroke-dasharray': '12 10', style: 'stroke: var(--s-blue); opacity: 0.7' }, r1), 'E3.5');
      txt(r1, x0 + 6, y(415) - 14, 'SFT data, 1×', 'band-label', {});
      mark(el('line', { x1: x0, x2: x0 + pwid, y1: y(1668), y2: y(1668), 'stroke-dasharray': '3 9', style: 'stroke: var(--s-blue); opacity: 0.7; stroke-linecap: round' }, r4), 'E3.5');
      txt(r4, x0 + 6, y(1668) - 14, 'SFT data, 4×', 'band-label', {});
      var S = STAGE3[setting];
      [['base', 'copy', 1, 'base model'], ['sft1', 'contract', 2, 'after SFT 1×'], ['sft4', 'contract', 3, 'after SFT 4×']].forEach(function (spec) {
        var rows = S[spec[0]];
        if (!rows) { if (spec[0] === 'base') txt(g(svg, 'st-1'), x0 + pwid / 2, y(2700), 'base models cannot chat', 'label-2', { 'text-anchor': 'middle' }); return; }
        var grp = g(svg, 'st-' + spec[2]);
        var pts = rows.map(function (r, i) { return [col(i), y(r[0])]; });
        polyline(grp, pts, 'line ' + spec[1] + (spec[0] === 'sft4' ? ' dashed' : ''));
        rows.forEach(function (r, i) {
          whisker(grp, col(i), y(r[1]), y(r[2]), spec[1] === 'copy' ? 'ink-2' : 's-blue', false);
          tip(mark(el('circle', { cx: col(i), cy: y(r[0]), r: 12, 'class': 'dot ' + spec[1] }, grp), 'E3.4'), spec[3] + ', ' + setting + ', dose ' + ['0', '1/4', '1', '4'][i] + ': ' + fmt(r[0], r[0] < 10 ? 2 : 0) + ' per million (seeds ' + fmt(r[1], r[1] < 10 ? 2 : 0) + ' to ' + fmt(r[2], r[2] < 10 ? 2 : 0) + ')');
        });
      });
    });
  }

  /* ------------------------------------------------------------------------------------------
     4. Slopes: the dose response at each stage (log2 output per doubling of the pretraining dose, quarter to
        four-fold doses; mean of 3 seeds with a 90% t interval). Source: dg-pp124-elasticities.tsv.
     ------------------------------------------------------------------------------------------ */
  var SLOPES = [                                   // E3.6
    { step: 1, cls: 'copy', label: 'base model', sub: 'news', v: 1.045, lo: 0.947, hi: 1.142 },
    { step: 2, cls: 'contract', label: 'after SFT 1×', sub: 'news', v: 0.277, lo: 0.188, hi: 0.365 },
    { step: 2, cls: 'contract', label: '', sub: 'chat', v: 0.136, lo: 0.080, hi: 0.192 },
    { step: 2, cls: 'contract', label: 'after SFT 4×', sub: 'news', v: 0.135, lo: 0.006, hi: 0.264 },
    { step: 2, cls: 'contract', label: '', sub: 'chat', v: 0.057, lo: 0.042, hi: 0.072 },
    { step: 3, cls: 'tilt', label: 'SFT 1×, then DPO', sub: 'news', v: 0.212, lo: 0.113, hi: 0.311 },
    { step: 3, cls: 'tilt', label: '(dash-free pairs)', sub: 'chat', v: 0.086, lo: 0.032, hi: 0.141 }
  ];
  function slopesChart(host) {
    var W = 1656, H = 660, m = { l: 470, r: 60, t: 76, b: 90 }, lo = -0.1, hi = 1.25;
    var pw = W - m.l - m.r, rh = (H - m.t - m.b) / SLOPES.length;
    var x = function (v) { return m.l + (v - lo) / (hi - lo) * pw; };
    var svg = svgFor(host, W, H, 'Dose response by stage: base model 1.05; after SFT at the natural rate 0.28 on news and 0.14 on chat; after SFT at four times 0.14 and 0.06; after SFT and DPO on dash-free pairs 0.21 and 0.09.');
    var grid = g(svg, 'grid st-0'), ticks = g(svg, 'tick st-0');
    [0, 0.25, 0.5, 0.75, 1].forEach(function (v) {
      el('line', { x1: x(v), x2: x(v), y1: m.t - 10, y2: H - m.b + 10 }, grid);
      txt(ticks, x(v), H - m.b + 50, fmt(v, 2), '', { 'text-anchor': 'middle' });
    });
    var refs = g(svg, 'ref st-0');
    el('line', { x1: x(0), x2: x(0), y1: m.t - 30, y2: H - m.b + 10 }, refs);
    el('line', { x1: x(1), x2: x(1), y1: m.t - 30, y2: H - m.b + 10 }, refs);
    txt(refs, x(0) + 12, m.t - 42, 'the dose leaves no mark', '', { style: 'font-size:26px' });
    txt(refs, x(1) - 12, m.t - 42, 'twice the dose, twice the output', '', { 'text-anchor': 'end', style: 'font-size:26px' });
    txt(g(svg, 'st-0'), m.l + pw / 2, H - 6, 'dose response: change in log₂ output per doubling of the pretraining dose', 'xlab-2', { 'text-anchor': 'middle' });
    SLOPES.forEach(function (r, i) {
      var yy = m.t + (i + 0.5) * rh, grp = g(svg, 'st-' + r.step);
      if (r.label) txt(grp, 0, yy + 10, r.label, 'label', {});
      txt(grp, m.l - 30, yy + 10, r.sub, 'label-2', { 'text-anchor': 'end' });
      whisker(grp, yy, x(r.lo), x(r.hi), (r.cls === 'copy' ? 'ink-2' : r.cls === 'contract' ? 's-blue' : 's-gold'), true);
      tip(mark(el('circle', { cx: x(r.v), cy: yy, r: 13, 'class': 'dot ' + r.cls }, grp), 'E3.6'), (r.label || '') + ' ' + r.sub + ': ' + fmt(r.v, 3) + ' (90% interval ' + fmt(r.lo, 3) + ' to ' + fmt(r.hi, 3) + ')');
      txt(grp, x(r.hi) + 22, yy + 10, fmt(r.v, 2), 'label', {});
    });
  }

  /* ------------------------------------------------------------------------------------------
     5. The tilt by hand: three continuations at a clause junction (CAREER toy example, epsilon-beta-toy-example.tex).
        pi_ref = (0.6, 0.1, 0.3) for comma, em dash, "and"; rewards 0, log 4, log 2. pi* = pi_ref e^{r/beta} / Z.
        Step 0: pi_ref. Steps 1 to 3: beta = 2, 1, 1/2 (the gold bars morph; CSS rules in deck.css).
     ------------------------------------------------------------------------------------------ */
  var TOY = [                                      // E4.1 (beta = 2, 1, 1/2)
    { tok: ',', name: 'comma', ref: 0.6, r: '0', p: [0.490, 0.375, 0.176] },
    { tok: '—', name: 'em dash', ref: 0.1, r: 'log 4', p: [0.163, 0.250, 0.471] },
    { tok: 'and', name: '"and"', ref: 0.3, r: 'log 2', p: [0.347, 0.375, 0.353] }
  ];
  function toyChart(host) {
    var W = 1000, H = 640, m = { l: 110, r: 30, t: 70, b: 150 }, max = 0.7;
    var pw = W - m.l - m.r, ph = H - m.t - m.b, cw = pw / 3, bw = 96;
    var y = function (v) { return m.t + ph - v / max * ph; };
    var svg = svgFor(host, W, H, 'A toy model: comma, em dash and "and" with base probabilities 0.6, 0.1 and 0.3. Tilted by rewards 0, log 4 and log 2: at beta 2 the em dash rises to 0.16, at beta 1 to 0.25, at beta one half to 0.47.');
    svg.setAttribute('class', 'toy');
    var grid = g(svg, 'grid st-0'), ticks = g(svg, 'tick st-0');
    [0, 0.2, 0.4, 0.6].forEach(function (v) {
      el('line', { x1: m.l, x2: m.l + pw, y1: y(v), y2: y(v) }, grid);
      txt(ticks, m.l - 18, y(v) + 10, fmt(v, 1), '', { 'text-anchor': 'end' });
    });
    var lg = g(svg, 'legend st-0');
    el('rect', { x: m.l, y: 8, width: 26, height: 26, rx: 5, 'class': 'ref-bar' }, lg); txt(lg, m.l + 38, 31, 'before (π₀)', '');
    var lg2 = g(svg, 'legend st-1');
    el('rect', { x: m.l + 300, y: 8, width: 26, height: 26, rx: 5, 'class': 'tilt-bar' }, lg2); txt(lg2, m.l + 338, 31, 'after the tilt (π*)', '');
    TOY.forEach(function (t, i) {
      var cx = m.l + (i + 0.5) * cw, s0 = g(svg, 'st-0');
      tip(mark(el('rect', { x: cx - bw - 6, y: y(t.ref), width: bw, height: y(0) - y(t.ref), rx: 6, 'class': 'ref-bar' }, s0), 'E4.1'), t.name + ' before: ' + t.ref);
      txt(s0, cx - bw / 2 - 6, y(t.ref) - 14, fmt(t.ref, 1), 'label-2', { 'text-anchor': 'middle' });
      txt(s0, cx, m.t + ph + 64, t.tok, t.tok === '—' ? 'label' : 'label', { 'text-anchor': 'middle', style: 'font-size:' + (t.tok === 'and' ? 40 : 56) + 'px' + (t.tok === '—' ? '; fill: var(--accent); font-weight: 300' : '') });
      txt(s0, cx, m.t + ph + 112, 'reward ' + t.r, 'xlab-2', { 'text-anchor': 'middle' });
      var s1 = g(svg, 'st-1');
      var bar = mark(el('rect', { x: cx + 6, y: y(max), width: bw, height: y(0) - y(max), rx: 6, 'class': 'tilt-bar toybar' }, s1), 'E4.1');
      bar.style.setProperty('--b1', (t.p[0] / max).toFixed(4));
      bar.style.setProperty('--b2', (t.p[1] / max).toFixed(4));
      bar.style.setProperty('--b3', (t.p[2] / max).toFixed(4));
      tip(bar, t.name + ' after: ' + t.p.map(function (v) { return fmt(v, 3); }).join(', ') + ' at beta 2, 1, 1/2');
      t.p.forEach(function (v, k) { txt(s1, cx + 6 + bw / 2, y(v) - 14, fmt(v, 2), 'label toylab b' + (k + 1), { 'text-anchor': 'middle' }); });
    });
  }

  /* ------------------------------------------------------------------------------------------
     6. The law where the dye is isolated (NSF CAREER proof of concept, C1; unpublished pilot): predicted shift
        epsilon/beta against the shift measured, 36 cells (6 p x 6 beta, 6 seeds each), GPT-2 124M, the unspaced
        em-dash token against the comma. Source: _archive/nsf-career-2026/poc/c1/out/study1/summary/summary.tsv (core).
     ------------------------------------------------------------------------------------------ */
  var EPSB = [[0.401,0.318],[0.201,0.301],[0.100,0.280],[0.067,0.127],[0.050,-0.007],[0.033,0.086],[0.979,1.132],[0.489,0.647],[0.245,0.256],[0.163,0.244],[0.122,0.242],[0.082,0.062],[1.695,1.706],[0.847,0.969],[0.424,0.359],[0.282,0.405],[0.212,0.383],[0.141,0.055],[2.531,2.557],[1.266,1.397],[0.633,0.803],[0.422,0.570],[0.316,0.461],[0.211,0.313],[3.469,3.539],[1.735,1.961],[0.867,1.127],[0.578,0.818],[0.434,0.677],[0.289,0.488],[4.885,5.014],[2.442,2.671],[1.221,1.633],[0.814,1.172],[0.611,0.843],[0.407,0.730]];
  function epsBetaChart(host) {
    var W = 900, H = 720, m = { l: 120, r: 40, t: 40, b: 120 }, max = 5.4;
    var pw = W - m.l - m.r, ph = H - m.t - m.b;
    var x = function (v) { return m.l + v / max * pw; }, y = function (v) { return m.t + ph - v / max * ph; };
    var svg = svgFor(host, W, H, 'Predicted shift epsilon over beta against the measured shift in log-odds, 36 cells: the points lie on the line of equality (slope 1.01, r 0.994).');
    var grid = g(svg, 'grid st-0'), ticks = g(svg, 'tick st-0');
    [0, 1, 2, 3, 4, 5].forEach(function (v) {
      el('line', { x1: m.l, x2: m.l + pw, y1: y(v), y2: y(v) }, grid);
      txt(ticks, m.l - 18, y(v) + 10, fmt(v), '', { 'text-anchor': 'end' });
      txt(ticks, x(v), m.t + ph + 44, fmt(v), '', { 'text-anchor': 'middle' });
    });
    var lab = g(svg, 'st-0');
    txt(lab, m.l + pw / 2, H - 16, 'predicted shift, ε / β', 'xlab', { 'text-anchor': 'middle' });
    txt(lab, 0, m.t - 8, 'measured shift (log-odds)', 'xlab-2', {});
    var id = g(svg, 'st-1');
    el('line', { x1: x(0), y1: y(0), x2: x(5.2), y2: y(5.2), 'class': 'idline' }, id);
    txt(id, x(3.9), y(3.35), 'Δ = ε / β', 'label-2', {});
    var dots = g(svg, 'st-2');
    EPSB.forEach(function (p) { tip(mark(el('circle', { cx: x(p[0]), cy: y(p[1]), r: 10, 'class': 'dot tilt' }, dots), 'E4.2'), 'predicted ' + fmt(p[0], 2) + ', measured ' + fmt(p[1], 2)); });
  }

  /* ------------------------------------------------------------------------------------------
     7. The side carries the sign: DPO factor (after DPO / before, same SFT 1x model), natural-dose bases, news,
        T 1.0; geometric mean of 3 seeds, whiskers the seed range (desktop). Source: dg-pp124-dpo-summary.tsv.
     ------------------------------------------------------------------------------------------ */
  var SETS = [                                     // E3.7
    { step: 1, key: 'plus5', label: 'dash on the preferred side', pref: true, rej: false, v: 1.615, lo: 1.555, hi: 1.712, cls: 'tilt' },
    { step: 1, key: 'minus5', label: 'dash on the rejected side', pref: false, rej: true, v: 0.895, lo: 0.790, hi: 1.114, cls: 'contract' },
    { step: 2, key: 'none', label: 'no dashes at all', pref: false, rej: false, v: 1.102, lo: 1.076, hi: 1.141, cls: 'copy' },
    { step: 2, key: 'swapped', label: 'no dashes, labels swapped', pref: false, rej: false, swap: true, v: 0.834, lo: 0.719, hi: 0.953, cls: 'copy' },
    { step: 3, key: 'sym', label: 'dashes on both sides, natural rate', pref: true, rej: true, v: 1.265, lo: 1.256, hi: 1.278, cls: 'copy' }
  ];
  function setsChart(host) {
    var W = 1656, H = 620, m = { l: 840, r: 80, t: 70, b: 90 }, lo = 0.6, hi = 1.85, PX = 560, RX = 700;
    var pw = W - m.l - m.r, rh = (H - m.t - m.b) / SETS.length;
    var x = function (v) { return m.l + (v - lo) / (hi - lo) * pw; };
    var svg = svgFor(host, W, H, 'DPO factor by pair set, natural-dose models, news: dash on the preferred side times 1.62; on the rejected side 0.90; no dashes 1.10; no dashes with labels swapped 0.83; dashes on both sides 1.27.');
    var grid = g(svg, 'grid st-0'), ticks = g(svg, 'tick st-0');
    [0.75, 1, 1.25, 1.5, 1.75].forEach(function (v) {
      el('line', { x1: x(v), x2: x(v), y1: m.t - 10, y2: H - m.b + 10 }, grid);
      txt(ticks, x(v), H - m.b + 50, '×' + fmt(v, 2), '', { 'text-anchor': 'middle' });
    });
    var refs = g(svg, 'ref st-0');
    el('line', { x1: x(1), x2: x(1), y1: m.t - 30, y2: H - m.b + 10 }, refs);
    txt(refs, x(1) + 12, m.t - 36, 'no change', '', { style: 'font-size:26px' });
    txt(g(svg, 'st-0'), m.l + pw / 2, H - 6, 'what it writes after DPO ÷ before', 'xlab-2', { 'text-anchor': 'middle' });
    var hd = g(svg, 'st-0');
    txt(hd, PX, m.t - 36, 'preferred', 'pairtxt', { 'text-anchor': 'middle' });
    txt(hd, RX, m.t - 36, 'rejected', 'pairtxt', { 'text-anchor': 'middle' });
    SETS.forEach(function (r, i) {
      var yy = m.t + (i + 0.5) * rh, grp = g(svg, 'st-' + r.step);
      // the pair, drawn: two answers; a gold dash where the set puts one
      [[PX, r.pref], [RX, r.rej]].forEach(function (b) {
        el('rect', { x: b[0] - 58, y: yy - 30, width: 116, height: 60, rx: 10, 'class': 'pairbox' }, grp);
        if (b[1]) txt(grp, b[0], yy + 11, '—', 'pairdash', { 'text-anchor': 'middle' });
        else txt(grp, b[0], yy + 9, '· · ·', 'pairtxt', { 'text-anchor': 'middle' });
      });
      if (r.swap) txt(grp, (PX + RX) / 2, yy + 11, '⇄', 'pairtxt', { 'text-anchor': 'middle', style: 'font-size:32px; fill: var(--ink)' });
      txt(grp, 0, yy + 10, r.label, 'label-2', {});
      whisker(grp, yy, x(r.lo), x(r.hi), (r.cls === 'copy' ? 'ink-2' : r.cls === 'contract' ? 's-blue' : 's-gold'), true);
      tip(mark(el('circle', { cx: x(r.v), cy: yy, r: 13, 'class': 'dot ' + r.cls }, grp), 'E3.7'), r.label + ': ×' + fmt(r.v, 3) + ' (seeds ×' + fmt(r.lo, 3) + ' to ×' + fmt(r.hi, 3) + ')');
      txt(grp, x(r.hi) + 20, yy + 10, '×' + fmt(r.v, 2), 'label', {});
    });
  }

  /* ------------------------------------------------------------------------------------------
     8. The contrast as a dose (07b ratio axis, D65; read in full 12 November). After SFT 1x; T 1.0; instance readings.
        Every set: the dash-free pairs with exactly one em dash added to each carrying answer, so the ratio of carrying
        answers (preferred : rejected) is the ratio of dashes. Geometric mean over the nine dosed bases (quarter,
        natural and four-fold dose, 3 seeds each) of DPO's factor against the same SFT model.
        Source: dg-pp124h-ratio-factors.tsv (sft1, t10, arms dq d1 d4); the report's Table 8.
     ------------------------------------------------------------------------------------------ */
  var RATIO = {                                    // E3.8
    status: 'pre-pilot: 9 bases (¼×, 1×, 4× doses; 3 seeds each)',
    ratio: [
      { lab: '0 : 400', news: 0.971, chat: 0.928, n: 9 },
      { lab: '100 : 400', news: 1.022, chat: 0.937, n: 9 },
      { lab: '200 : 400', news: 1.047, chat: 0.998, n: 9 },
      { lab: '400 : 400', news: 1.147, chat: 1.076, n: 9 },
      { lab: '400 : 200', news: 1.276, chat: 1.240, n: 9 },
      { lab: '400 : 100', news: 1.320, chat: 1.316, n: 9 },
      { lab: '400 : 0', news: 1.368, chat: 1.420, n: 9 }
    ],
    share: [
      { lab: '800 : 0', news: 1.615, chat: 1.695, n: 9 },
      { lab: '1,198 : 0', news: 1.900, chat: 2.101, n: 9 }
    ],
    none: { news: 1.134, chat: 1.105, n: 9 },
    controls: [
      { lab: '1×', news: 1.199, chat: 1.178, n: 9 },
      { lab: '4×', news: 1.233, chat: 1.195, n: 9 }
    ]
  };
  function ratioChart(host) {
    var W = 1656, H = 660, m = { l: 110, r: 30, t: 80, b: 140 }, lo = 0.72, hi = 2.25;
    var pw = W - m.l - m.r, ph = H - m.t - m.b;
    var cols = RATIO.ratio.length + 1 + RATIO.share.length + 1 + RATIO.controls.length;
    var cx = function (i) { return m.l + (i + 0.5) * pw / cols; };
    var y = function (v) { return m.t + ph - (v - lo) / (hi - lo) * ph; };
    var svg = svgFor(host, W, H, 'DPO factor against the ratio of preferred to rejected answers carrying a dash, nine dosed bases, after SFT at the natural rate. Chat: 0 to 400 times 0.93; 400 to 400 times 1.08; 400 to 0 times 1.42; 800 to 0 times 1.70; 1,198 to 0 times 2.10. News: 0.97, 1.15, 1.37, 1.62, 1.90. Pairs with no dashes: 1.11 and 1.13. Dashes on both sides: 1.18 to 1.23.');
    var grid = g(svg, 'grid st-0'), ticks = g(svg, 'tick st-0');
    [1, 1.5, 2].forEach(function (v) {
      el('line', { x1: m.l, x2: m.l + pw, y1: y(v), y2: y(v) }, grid);
      txt(ticks, m.l - 16, y(v) + 10, '×' + fmt(v, 1), '', { 'text-anchor': 'end' });
    });
    var refs = g(svg, 'ref st-0');
    el('line', { x1: m.l, x2: m.l + pw, y1: y(1), y2: y(1) }, refs);
    var nb = g(svg, 'st-0');
    el('rect', { x: m.l, y: y(Math.max(RATIO.none.news, RATIO.none.chat)), width: pw, height: y(Math.min(RATIO.none.news, RATIO.none.chat)) - y(Math.max(RATIO.none.news, RATIO.none.chat)), 'class': 'band' }, nb);
    txt(nb, m.l + 8, y(Math.max(RATIO.none.news, RATIO.none.chat)) - 12, 'pairs with no dashes', 'band-label', {});
    var lab = g(svg, 'st-0');
    var groups = [[0, RATIO.ratio.length, 'preferred : rejected answers carrying one dash (of 8,000 pairs)'], [RATIO.ratio.length + 1, RATIO.share.length, 'more carriers'], [RATIO.ratio.length + RATIO.share.length + 2, RATIO.controls.length, 'both sides']];
    groups.forEach(function (gr) {
      var a = cx(gr[0]) - pw / cols * 0.45, b = cx(gr[0] + gr[1] - 1) + pw / cols * 0.45;
      el('line', { x1: a, x2: b, y1: m.t + ph + 84, y2: m.t + ph + 84, style: 'stroke: var(--axis); stroke-width: 2' }, lab);
      txt(lab, (a + b) / 2, m.t + ph + 120, gr[2], 'xlab-2', { 'text-anchor': 'middle' });
    });
    var lg = g(svg, 'legend st-0');
    el('circle', { cx: m.l + 12, cy: 22, r: 11, 'class': 'dot tilt' }, lg); txt(lg, m.l + 32, 32, 'chat answers', '');
    el('circle', { cx: m.l + 262, cy: 22, r: 9, 'class': 'dot hollow gold' }, lg); txt(lg, m.l + 282, 32, 'news continuations', '');
    txt(lg, m.l + pw, 32, RATIO.status, 'wipmark', { 'text-anchor': 'end', style: 'font-size:22px' });
    function plot(list, offset, step, cls) {
      var grp = g(svg, 'st-' + step), ptsC = [], ptsN = [];
      list.forEach(function (r, i) {
        var X = cx(offset + i);
        txt(g(svg, 'st-0'), X, m.t + ph + 44, r.lab, 'xlab', { 'text-anchor': 'middle', style: 'font-size:24px' });
        if (r.n === 1) txt(g(svg, 'st-0'), X, m.t + ph + 70, 'n = 1', 'xlab-2', { 'text-anchor': 'middle', style: 'font-size:19px' });
        ptsC.push([X, y(r.chat)]); ptsN.push([X, y(r.news)]);
        tip(mark(el('circle', { cx: X, cy: y(r.news), r: 9, 'class': 'dot hollow gold' }, grp), 'E3.8'), r.lab + ', news: ×' + fmt(r.news, 2) + ' (n = ' + r.n + ')');
        tip(mark(el('circle', { cx: X, cy: y(r.chat), r: 12, 'class': 'dot ' + cls }, grp), 'E3.8'), r.lab + ', chat: ×' + fmt(r.chat, 2) + ' (n = ' + r.n + ')');
      });
      return { grp: grp, c: ptsC, n: ptsN };
    }
    var a = plot(RATIO.ratio, 0, 1, 'tilt');
    polyline(a.grp, a.c, 'line tilt draw').setAttribute('style', 'stroke-width:4; --len:' + lineLength(a.c));
    var b = plot(RATIO.share, RATIO.ratio.length + 1, 2, 'tilt');
    var c = plot(RATIO.controls, RATIO.ratio.length + RATIO.share.length + 2, 3, 'copy');
    txt(b.grp, b.c[1][0], b.c[1][1] - 26, '×' + fmt(RATIO.share[1].chat, 2), 'label', { 'text-anchor': 'middle' });
    txt(a.grp, a.c[0][0], a.c[0][1] + 52, '×' + fmt(RATIO.ratio[0].chat, 2), 'label', { 'text-anchor': 'middle' });
  }

  /* ------------------------------------------------------------------------------------------
     8b. The whole pipeline in one picture (the report's Figure 9b, redrawn): what the models write on news after
        SFT 1x and then DPO along the ratio axis, one line per pretraining dose. Geometric mean over 3 seeds of the
        expected em per million (T 1.0, instance readings). Source: dg-pp124h-ratio-readings.tsv (cells sft1 and
        sft1__<set>, setting news, decoding t10). Columns: before DPO, dash-free pairs, the ratio axis, the share axis.
     ------------------------------------------------------------------------------------------ */
  var WHOLE = {                                    // E3.15
    cols: ['before DPO', 'no dashes', '0 : 400', '100 : 400', '200 : 400', '400 : 400', '400 : 200', '400 : 100', '400 : 0', '800 : 0', '1,198 : 0'],
    doses: [
      { key: 'd0', lab: '0', v: [0.182, 0.228, 0.170, 0.177, 0.182, 0.202, 0.358, 0.373, 0.309, 0.466, 0.925] },
      { key: 'dq', lab: '¼×', v: [372.2, 444.2, 369.7, 400.4, 422.1, 457.8, 524.3, 547.2, 551.7, 720.9, 861.8] },
      { key: 'd1', lab: '1×', v: [575.0, 660.3, 551.4, 546.8, 591.8, 663.1, 750.2, 750.1, 792.1, 900.7, 1105.3] },
      { key: 'd4', lab: '4×', v: [780.8, 831.6, 750.5, 815.5, 767.8, 830.9, 883.2, 936.3, 979.5, 1085.1, 1202.5] }
    ]
  };
  function wholeChart(host) {
    var W = 1656, H = 640, m = { l: 120, r: 250, t: 70, b: 120 }, max = 1300;
    var pw = W - m.l - m.r, ph = H - m.t - m.b, n = WHOLE.cols.length;
    // two lead columns, a gap, seven ratio columns, a gap, two share columns
    var slot = pw / (n + 1.7);
    var cx = function (i) { return m.l + slot * (i + 0.5 + (i >= 1 ? 0.5 : 0) + (i >= 2 ? 0.6 : 0) + (i >= 9 ? 0.6 : 0)); };
    var y = function (v) { return m.t + ph - v / max * ph; };
    var svg = svgFor(host, W, H, 'News, after SFT at the natural rate and then DPO along the ratio axis, one line per pretraining dose. Before DPO: 0.2, 372, 575, 781 per million for the doses 0, a quarter, natural and four-fold. At 1,198 preferred-side carriers: 0.9, 862, 1,105, 1,203. The order never changes; the lines draw together; the dose-zero line stays on the floor.');
    var grid = g(svg, 'grid st-0'), ticks = g(svg, 'tick st-0');
    [0, 400, 800, 1200].forEach(function (v) {
      el('line', { x1: m.l, x2: m.l + pw, y1: y(v), y2: y(v) }, grid);
      txt(ticks, m.l - 18, y(v) + 10, fmt(v), '', { 'text-anchor': 'end' });
    });
    var lab = g(svg, 'st-0');
    txt(lab, 0, m.t - 34, 'em dashes per million it writes (news)', 'xlab-2', {});
    WHOLE.cols.forEach(function (c, i) {
      if (i < 2) {                                   // the two lead columns: two short lines each
        var w = c.split(' ');
        txt(lab, cx(i), m.t + ph + 40, w[0], 'xlab', { 'text-anchor': 'middle', style: 'font-size:23px' });
        txt(lab, cx(i), m.t + ph + 68, w.slice(1).join(' '), 'xlab', { 'text-anchor': 'middle', style: 'font-size:23px' });
      } else txt(lab, cx(i), m.t + ph + 40, c, 'xlab', { 'text-anchor': 'middle', style: 'font-size:21px' });
    });
    [[2, 8, 'DPO: preferred : rejected answers carrying one dash'], [9, 10, 'more carriers']].forEach(function (gr) {
      var a = cx(gr[0]) - slot * 0.45, b = cx(gr[1]) + slot * 0.45;
      el('line', { x1: a, x2: b, y1: m.t + ph + 66, y2: m.t + ph + 66, style: 'stroke: var(--axis); stroke-width: 2' }, lab);
      txt(lab, (a + b) / 2, m.t + ph + 100, gr[2], 'xlab-2', { 'text-anchor': 'middle' });
    });
    // the zero floor: below it a reading shows no dash (floors 13 to 21 per million)
    var fl = g(svg, 'floor st-4');
    el('rect', { x: m.l, y: y(21), width: pw, height: y(0) - y(21) }, fl);
    // header for the direct labels beside the diamonds
    var hd = g(svg, 'st-1');
    txt(hd, cx(0) - 30, y(781) - 50, 'pretraining dose', 'xlab-2', {});
    txt(g(svg, 'st-3'), m.l + pw + 30, m.t - 34, 'DPO’s factor', 'xlab-2', {});
    WHOLE.doses.forEach(function (d, k) {
      var cls = 'dose' + k, pts = d.v.map(function (v, i) { return [cx(i), y(v)]; });
      // step 1: the SFT models before DPO (diamonds); step 2: DPO along the ratio axis; step 3: the share axis
      var s1 = g(svg, 'st-1'), s2 = g(svg, 'st-2'), s3 = g(svg, 'st-3');
      var X0 = pts[0][0], Y0 = pts[0][1];
      tip(mark(el('path', { d: 'M' + X0 + ' ' + (Y0 - 17) + ' L' + (X0 + 17) + ' ' + Y0 + ' L' + X0 + ' ' + (Y0 + 17) + ' L' + (X0 - 17) + ' ' + Y0 + ' Z', 'class': 'dot ' + cls }, s1), 'E3.15'), 'pretraining ' + d.lab + ', after SFT 1×, before DPO: ' + fmt(d.v[0], d.v[0] < 10 ? 2 : 0) + ' per million');
      polyline(s2, pts.slice(1, 9), 'line draw ' + cls).style.strokeWidth = 4;
      pts.slice(1, 9).forEach(function (p, j) {
        tip(mark(el('circle', { cx: p[0], cy: p[1], r: 8, 'class': 'dot ' + cls }, s2), 'E3.15'), 'pretraining ' + d.lab + ', ' + WHOLE.cols[j + 1] + ': ' + fmt(d.v[j + 1], d.v[j + 1] < 10 ? 2 : 0) + ' per million');
      });
      polyline(s3, pts.slice(8), 'line draw ' + cls).style.strokeWidth = 4;
      pts.slice(9).forEach(function (p, j) {
        tip(mark(el('circle', { cx: p[0], cy: p[1], r: 8, 'class': 'dot ' + cls }, s3), 'E3.15'), 'pretraining ' + d.lab + ', ' + WHOLE.cols[j + 9] + ': ' + fmt(d.v[j + 9], d.v[j + 9] < 10 ? 2 : 0) + ' per million');
      });
      // direct labels (identity never by colour alone): beside the diamonds, then at the right end with the
      // factor DPO gave each dose at 1,198 : 0 (geometric means, so the ratio of means is the mean of ratios)
      txt(s1, X0 + 28, Y0 + (k === 0 ? -4 : 10), d.lab, 'label', { style: 'font-size:28px' });
      var last = pts[pts.length - 1], dy = k === 2 ? 14 : (k === 3 ? -6 : 10);
      if (k > 0) {
        txt(s3, m.l + pw + 30, last[1] + dy, d.lab, 'label', { style: 'font-size:28px' });
        txt(s3, m.l + pw + 96, last[1] + dy, '×' + fmt(d.v[10] / d.v[0], 1), 'label-2', {});
      }
    });
    // step 4: the dose-zero line
    var s4 = g(svg, 'st-4');
    txt(s4, cx(1) - 20, y(0) - 34, 'dose 0: 0.2 → 0.9 per million, all along the floor (one dash would show from 13 to 21)', 'label-2', { style: 'font-size:26px' });
  }

  /* ------------------------------------------------------------------------------------------
     8c. The read-out: the same SFT models read at T 1.0 and at T 0.8 with top-p 0.95 (natural-dose bases, geometric
        mean over 3 seeds, expected em per million, instance readings). Source: dg-pp124h-ratio-readings.tsv
        (cells sft1, sft4; arm d1). Log axis: the arrow's length is the factor.
     ------------------------------------------------------------------------------------------ */
  var DECODE = [                                   // E3.16
    { lab: 'after SFT 1×', sub: 'news', t10: 575.0, t08: 43.0 },
    { lab: '', sub: 'chat', t10: 446.8, t08: 17.8 },
    { lab: 'after SFT 4×', sub: 'news', t10: 2060.6, t08: 547.3 },
    { lab: '', sub: 'chat', t10: 1593.8, t08: 341.4 }
  ];
  function decodeChart(host) {
    var W = 980, H = 560, m = { l: 290, r: 40, t: 90, b: 100 }, lo = Math.log10(10), hi = Math.log10(4000);
    var pw = W - m.l - m.r, rh = (H - m.t - m.b) / DECODE.length;
    var x = function (v) { return m.l + (Math.log10(v) - lo) / (hi - lo) * pw; };
    var svg = svgFor(host, W, H, 'The natural-dose models read at temperature 1 and at temperature 0.8 with top-p 0.95. After SFT at the natural rate: news 575 to 43 per million, chat 447 to 18. After SFT at four times: news 2,061 to 547, chat 1,594 to 341.');
    var grid = g(svg, 'grid st-0'), ticks = g(svg, 'tick st-0');
    [10, 30, 100, 300, 1000, 3000].forEach(function (v) {
      el('line', { x1: x(v), x2: x(v), y1: m.t - 10, y2: H - m.b + 10 }, grid);
      txt(ticks, x(v), H - m.b + 48, fmt(v), '', { 'text-anchor': 'middle', style: 'font-size:24px' });
    });
    txt(g(svg, 'st-0'), m.l + pw / 2, H - 8, 'em dashes per million written (log scale)', 'xlab-2', { 'text-anchor': 'middle' });
    var lg = g(svg, 'legend st-0');
    el('circle', { cx: m.l + 12, cy: 26, r: 11, 'class': 'dot hollow blue' }, lg); txt(lg, m.l + 32, 35, 'T = 1', '');
    el('circle', { cx: m.l + 172, cy: 26, r: 11, 'class': 'dot contract' }, lg); txt(lg, m.l + 192, 35, 'T = 0.8, top-p 0.95', '');
    DECODE.forEach(function (r, i) {
      var yy = m.t + (i + 0.5) * rh, s0 = g(svg, 'st-0'), s1 = g(svg, 'st-1');
      if (r.lab) txt(s0, 0, yy + 10, r.lab, 'label', { style: 'font-size:28px' });
      txt(s0, m.l - 24, yy + 10, r.sub, 'label-2', { 'text-anchor': 'end' });
      tip(mark(el('circle', { cx: x(r.t10), cy: yy, r: 12, 'class': 'dot hollow blue' }, s0), 'E3.16'), r.lab + ' ' + r.sub + ', T 1: ' + fmt(r.t10) + ' per million');
      var x1 = x(r.t10) - 18, x2 = x(r.t08) + 16;          // a leftward arrow (the shared helper points right)
      el('line', { x1: x1, y1: yy, x2: x2 + 16, y2: yy, 'class': 'arrow' }, s1);
      el('path', { d: 'M' + (x2 + 18) + ' ' + (yy - 11) + ' L' + (x2 + 18) + ' ' + (yy + 11) + ' L' + x2 + ' ' + yy + ' Z', 'class': 'arrowhead' }, s1);
      tip(mark(el('circle', { cx: x(r.t08), cy: yy, r: 12, 'class': 'dot contract' }, s1), 'E3.16'), r.lab + ' ' + r.sub + ', T 0.8: ' + fmt(r.t08) + ' per million');
      txt(s1, (x(r.t10) + x(r.t08)) / 2, yy - 22, '÷' + fmt(r.t10 / r.t08, r.t10 / r.t08 < 10 ? 1 : 0), 'label', { 'text-anchor': 'middle', style: 'font-size:28px' });
    });
  }

  /* ------------------------------------------------------------------------------------------
     9. Reused from the WK deck: the stance chart (Abdulhai et al. 2026, Figure 6, redrawn) and the OLMo-2 1B stage
        chart (sampled, first 40 words; WK EVIDENCE §16; work in progress). Evidence rows E1.2 and E2.2.
     ------------------------------------------------------------------------------------------ */
  var STANCE = [
    { step: 1, label: 'Wrote alone', sub: 'no AI', group: 'Human', v: [32.6, 39.5, 27.9] },
    { step: 2, label: 'Used AI lightly', sub: 'advice, look-ups', group: 'LLM-Influenced', v: [31.0, 44.8, 24.1] },
    { step: 3, label: 'Let AI write', sub: 'much of the essay', group: 'LLM', v: [22.2, 66.7, 11.1] }
  ];
  function stanceChart(host) {
    var W = 1656, H = 420, xa = 430, xb = 1640, bh = 84, gap = 4, rowY = [118, 236, 354];
    var s = (xb - xa) / 100;
    var svg = svgFor(host, W, H, 'Stance of essays on whether money leads to happiness. Wrote alone: 32.6% for, 39.5% neutral, 27.9% against. Used AI lightly: 31.0, 44.8, 24.1. Let AI write much of the essay: 22.2, 66.7, 11.1.');
    var lg = g(svg, 'legend st-0'), lx = xa;
    [['for', 'for'], ['nostance', 'neutral: takes no side'], ['against', 'against']].forEach(function (k) {
      el('rect', { x: lx, y: 8, width: 26, height: 26, rx: 5, 'class': k[0] }, lg);
      txt(lg, lx + 38, 31, k[1], '');
      lx += 38 + k[1].length * 12.6 + 64;
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
        var rect = mark(el('rect', { x: sg.a.toFixed(1), y: y - bh / 2, width: (sg.b - sg.a).toFixed(1), height: bh, rx: 6, 'class': 'bar ' + sg.cls }, bars), 'E1.2');
        tip(rect, r.label + ' (' + r.group + '): ' + sg.name + ' ' + fmt(sg.v, 1) + '%');
        txt(labs, ((sg.a + sg.b) / 2).toFixed(1), y + 11, fmt(sg.v, 1) + '%', 'seglabel', { 'text-anchor': 'middle' });
      });
    });
  }

  var ONEB = [
    { stage: 'pretraining', ckpt: 'base', data: 491.4, dataLabel: 'web text', v: 679.0, lo: 589, hi: 770 },
    { stage: 'SFT', ckpt: 'SFT', data: 373.4, dataLabel: 'its answers', v: 513.0, lo: 432, hi: 599 },
    { stage: 'DPO', ckpt: 'DPO', data: 412.1, dataLabel: 'preferred answers', v: 1408.5, lo: 1282, hi: 1535 },
    { stage: 'maths reinforcement', ckpt: 'final', data: null, dataLabel: 'no text to count', v: 1159.7, lo: 1043, hi: 1273 }
  ];
  function olmoChart(host) {
    var ROWS = ONEB, human = 965.8;
    var W = 1656, H = 600, m = { l: 150, r: 40, t: 80, b: 110 };
    var pw = W - m.l - m.r, ph = H - m.t - m.b, ymax = 1600;
    var y = function (v) { return m.t + ph - v / ymax * ph; };
    var col = function (i) { return m.l + (i + 0.5) * pw / ROWS.length; };
    var svg = svgFor(host, W, H, 'OLMo-2 1B: em dashes per million tokens in the training data of each stage, and in the model\'s own news continuations after that stage: base 679, SFT 513, DPO 1,409, final 1,160; people writing the same articles 966.');
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
    var s1 = g(svg, 'st-1');
    ROWS.forEach(function (r, i) {
      var cx = col(i) - 62;
      if (r.data === null) { txt(s1, cx, y(0) - 30, r.dataLabel, 'xlab-2', { 'text-anchor': 'middle' }); return; }
      tip(mark(el('circle', { cx: cx, cy: y(r.data), r: 13, 'class': 'dot neutral' }, s1), 'E2.1'), r.stage + ', ' + r.dataLabel + ': ' + fmt(r.data, 1) + ' per million tokens');
      txt(s1, cx - 26, y(r.data) + 10, fmt(r.data, 0), 'label', { 'text-anchor': 'end' });
      txt(s1, cx, y(r.data) - 30, r.dataLabel, 'label-2', { 'text-anchor': 'middle' });
    });
    var hr = g(svg, 'ref st-2');
    mark(el('line', { x1: m.l, x2: m.l + pw, y1: y(human), y2: y(human), 'stroke-dasharray': '14 10' }, hr), 'E2.2');
    txt(hr, m.l + 8, y(human) - 16, 'people writing the same articles: ' + fmt(human, 0), '', {});
    ROWS.forEach(function (r, i) {
      var grp = g(svg, 'st-' + (i === 0 ? 2 : 3)), cx = col(i) + 62;
      var wk = g(grp, 'whisker');
      mark(el('line', { x1: cx, x2: cx, y1: y(r.lo), y2: y(r.hi) }, wk), 'E2.2');
      el('line', { x1: cx - 16, x2: cx + 16, y1: y(r.hi), y2: y(r.hi) }, wk);
      el('line', { x1: cx - 16, x2: cx + 16, y1: y(r.lo), y2: y(r.lo) }, wk);
      tip(mark(el('circle', { cx: cx, cy: y(r.v), r: 13, 'class': 'dot gold' }, grp), 'E2.2'), 'after ' + r.stage + ': ' + fmt(r.v, 1) + ' per million tokens (95% range ' + fmt(r.lo) + ' to ' + fmt(r.hi) + ')');
      txt(grp, cx + 28, y(r.v) + 10, fmt(r.v, 0), 'label', {});
    });
  }

  var BUILDERS = {
    'pipeline': function (h) { pipelineChart(h, 'plain'); },
    'design': function (h) { pipelineChart(h, 'design'); },
    'copy': copyChart,
    'contract': contractChart,
    'slopes': slopesChart,
    'toy': toyChart,
    'epsbeta': epsBetaChart,
    'sets': setsChart,
    'ratio': ratioChart,
    'whole': wholeChart,
    'decode': decodeChart,
    'stance': stanceChart,
    'olmo': olmoChart
  };
  function buildAll() {
    Array.prototype.forEach.call(document.querySelectorAll('.chart[data-chart]'), function (host) {
      var b = BUILDERS[host.getAttribute('data-chart')];
      if (b && !host.firstChild) b(host);
    });
  }
  window.DeckCharts = { buildAll: buildAll, data: { RATIO: RATIO, WHOLE: WHOLE, DECODE: DECODE } };
})();
