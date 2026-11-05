/* Controlling for a confound: LIN 3042, Fall 2026.
   Pure functions for the page: a seeded random number generator, the invented vitamins data,
   least squares with any number of predictors, leftovers (residuals), partial correlations with
   an approximate 95% interval, age bands, and the toy brain map. No page code here, so node can
   load this file for the checks (see course/modules/confounds/README.md). Nothing is stored or
   sent. */
(function (root) {
  'use strict';

  // ---- Random numbers (seeded, so a seed always gives the same sample) ----
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function normal(r) {
    var u = 0;
    while (u === 0) u = r();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
  }

  // ---- The invented vitamins study ----
  // ageToVit:  how strongly age drives vitamin taking (change in log-odds per 10 years of age)
  // ageToRisk: how strongly age drives heart risk (points per year of age)
  // effect:    what vitamins really do to heart risk (points; negative = protects)
  // hidden:    an unmeasured confounder, health-consciousness (0 = off, 1 = on): health-conscious
  //            people take vitamins more often and have lower heart risk
  var DEFAULTS = { n: 200, ageToVit: 1.2, ageToRisk: 0.6, effect: 0, hidden: 0, seed: 35 };

  function simulate(opts) {
    var o = {}, k;
    for (k in DEFAULTS) o[k] = DEFAULTS[k];
    for (k in opts || {}) if (opts[k] !== undefined) o[k] = opts[k];
    var r = rng(o.seed), people = [];
    for (var i = 0; i < o.n; i++) {
      var age = 30 + Math.floor(51 * r());               // 30 to 80
      var h = normal(r);                                  // health-consciousness (never shown)
      var logit = o.ageToVit * (age - 55) / 10 + o.hidden * 1.5 * h;
      var vit = r() < 1 / (1 + Math.exp(-logit)) ? 1 : 0;
      var risk = 20 + o.ageToRisk * (age - 30) + o.effect * vit - o.hidden * 6 * h + 7 * normal(r);
      people.push({ age: age, vit: vit, risk: risk });
    }
    return people;
  }

  // ---- Basic statistics ----
  function mean(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return a.length ? s / a.length : NaN; }
  function sd(a) {
    var m = mean(a), s = 0;
    for (var i = 0; i < a.length; i++) s += (a[i] - m) * (a[i] - m);
    return a.length > 1 ? Math.sqrt(s / (a.length - 1)) : NaN;
  }
  function corr(x, y) {
    var mx = mean(x), my = mean(y), sxy = 0, sxx = 0, syy = 0;
    for (var i = 0; i < x.length; i++) {
      var dx = x[i] - mx, dy = y[i] - my;
      sxy += dx * dy; sxx += dx * dx; syy += dy * dy;
    }
    return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : NaN;
  }

  // Solve A b = c (Gaussian elimination, partial pivoting). Returns null if A is singular.
  function solve(A, c) {
    var n = c.length, M = A.map(function (row, i) { return row.slice().concat([c[i]]); });
    for (var col = 0; col < n; col++) {
      var piv = col;
      for (var r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
      if (Math.abs(M[piv][col]) < 1e-10) return null;
      var tmp = M[col]; M[col] = M[piv]; M[piv] = tmp;
      for (r = 0; r < n; r++) {
        if (r === col) continue;
        var f = M[r][col] / M[col][col];
        for (var j = col; j <= n; j++) M[r][j] -= f * M[col][j];
      }
    }
    return M.map(function (row, i) { return row[n] / row[i]; });
  }

  // Least squares: y on the predictors in xs (an array of columns), with an intercept.
  // The columns are centred and scaled before solving (incomes run to 250,000), which changes
  // nothing in the fit. Returns { coef: [intercept, b1, b2, ...], fitted, resid } or null if a
  // predictor has no spread or is a copy of the others.
  function ols(y, xs) {
    var n = y.length, k = xs.length, i, j, l;
    var mx = xs.map(mean), sx = xs.map(sd), my = mean(y);
    for (j = 0; j < k; j++) if (!(sx[j] > 0)) return null;
    var Z = xs.map(function (x, j) { return x.map(function (v) { return (v - mx[j]) / sx[j]; }); });
    var A = [], c = [];
    for (j = 0; j < k; j++) {
      A.push([]);
      var cj = 0;
      for (i = 0; i < n; i++) cj += Z[j][i] * (y[i] - my);
      c.push(cj);
      for (l = 0; l < k; l++) {
        var s = 0;
        for (i = 0; i < n; i++) s += Z[j][i] * Z[l][i];
        A[j].push(s);
      }
    }
    var bz = k ? solve(A, c) : [];
    if (bz === null) return null;
    var coef = [my];
    for (j = 0; j < k; j++) { coef.push(bz[j] / sx[j]); coef[0] -= bz[j] / sx[j] * mx[j]; }
    var fitted = [], resid = [];
    for (i = 0; i < n; i++) {
      var f = coef[0];
      for (j = 0; j < k; j++) f += coef[j + 1] * xs[j][i];
      fitted.push(f); resid.push(y[i] - f);
    }
    return { coef: coef, fitted: fitted, resid: resid };
  }

  // The leftover of y once the columns in zs have had their say (y itself if zs is empty,
  // centred on zero).
  function leftover(y, zs) {
    var fit = ols(y, zs || []);
    return fit ? fit.resid : null;
  }

  // The slope of a straight line through (x, y).
  function slope(x, y) { var f = ols(y, [x]); return f ? f.coef[1] : NaN; }

  // Partial correlation of x and y with the columns in zs partialled out, and an approximate
  // 95% interval (Fisher z, n - 3 - k degrees of freedom).
  function partial(x, y, zs) {
    zs = zs || [];
    var ex = leftover(x, zs), ey = leftover(y, zs);
    if (!ex || !ey) return null;
    var r = corr(ex, ey), n = x.length, k = zs.length, df = n - 3 - k;
    if (!isFinite(r) || df < 1) return null;
    var z = 0.5 * Math.log((1 + r) / (1 - r)), se = 1 / Math.sqrt(df);
    return { r: r, lo: Math.tanh(z - 1.96 * se), hi: Math.tanh(z + 1.96 * se), n: n, k: k,
             ex: ex, ey: ey };
  }

  // ---- The three ways, for the vitamins data ----
  function columns(people) {
    return {
      age: people.map(function (p) { return p.age; }),
      vit: people.map(function (p) { return p.vit; }),
      risk: people.map(function (p) { return p.risk; })
    };
  }

  // The plain comparison, ignoring age.
  function raw(people) {
    var on = [], off = [], aOn = [], aOff = [];
    people.forEach(function (p) {
      if (p.vit) { on.push(p.risk); aOn.push(p.age); } else { off.push(p.risk); aOff.push(p.age); }
    });
    return { meanOn: mean(on), meanOff: mean(off), gap: mean(on) - mean(off),
             ageOn: mean(aOn), ageOff: mean(aOff), nOn: on.length, nOff: off.length };
  }

  // Way one: age bands. The overall estimate is the average of the gaps within bands,
  // each band weighted by its size (bands with nobody on one side are skipped).
  var BANDS = [[30, 39], [40, 49], [50, 59], [60, 69], [70, 80]];
  function bands(people) {
    var rows = BANDS.map(function (b) {
      var on = [], off = [];
      people.forEach(function (p) {
        if (p.age >= b[0] && p.age <= b[1]) (p.vit ? on : off).push(p.risk);
      });
      var gap = on.length && off.length ? mean(on) - mean(off) : null;
      return { lo: b[0], hi: b[1], n: on.length + off.length, nOn: on.length, nOff: off.length,
               meanOn: on.length ? mean(on) : null, meanOff: off.length ? mean(off) : null, gap: gap };
    });
    var w = 0, s = 0;
    rows.forEach(function (r) { if (r.gap !== null) { w += r.n; s += r.n * r.gap; } });
    return { rows: rows, average: w ? s / w : null };
  }

  // Way two: one regression, risk on vitamins and age. b1 is the gap between the two parallel
  // lines; b2 their common slope.
  function regression(people) {
    var c = columns(people), fit = ols(c.risk, [c.vit, c.age]);
    if (!fit) return null;
    return { b0: fit.coef[0], b1: fit.coef[1], b2: fit.coef[2] };
  }

  // Way three: partialling out, step by step. A: vitamins on age, keep the leftover.
  // B: risk on age, keep the leftover. C: the slope of leftover risk on leftover vitamins,
  // which equals b1 above (the Frisch-Waugh-Lovell theorem).
  function partialling(people) {
    var c = columns(people);
    var A = ols(c.vit, [c.age]), B = ols(c.risk, [c.age]);
    if (!A || !B) return null;
    var C = ols(B.resid, [A.resid]);
    return { A: A, B: B, slopeC: C ? C.coef[1] : null, rC: corr(A.resid, B.resid) };
  }

  // ---- The toy brain map (Figure 5, decoded) ----
  // A grid of points shaped roughly like a brain seen from the left side (front to the left).
  // At each point, activation = a * turns + c * SES + noise, with SES and turns correlated
  // (rho). a is high in a small spot at the front and lower part (the toy "Broca's area"); c is
  // spread more widely around it. The correlations are worked out exactly from a, c and rho
  // (no random noise), and coloured where they would pass p < .01 with 36 children.
  var BRAIN = { cols: 28, rows: 17, rho: 0.45, n: 36, spot: [7.5, 10.2], aPeak: 1.0, aRad: 1.9,
                cPeak: 1.6, cRad: 3.6 };
  function inBrain(x, y) {
    // a lateral view: a large ellipse for the cerebrum, a lobe hanging below for the temporal lobe
    var e1 = Math.pow((x - 14) / 13.2, 2) + Math.pow((y - 7.2) / 6.9, 2) < 1;
    var e2 = Math.pow((x - 13) / 8.5, 2) + Math.pow((y - 11.2) / 4.6, 2) < 1;
    return (e1 || e2) && y < 15.6;
  }
  function tCrit01(df) {
    // two-sided p < .01 critical t, interpolated for df 25 to 40 (t tables)
    var tab = { 25: 2.787, 28: 2.763, 30: 2.750, 33: 2.733, 34: 2.728, 35: 2.724, 40: 2.704 };
    var keys = Object.keys(tab).map(Number).sort(function (a, b) { return a - b; });
    if (df <= keys[0]) return tab[keys[0]];
    for (var i = 1; i < keys.length; i++) {
      if (df <= keys[i]) {
        var a = keys[i - 1], b = keys[i];
        return tab[a] + (tab[b] - tab[a]) * (df - a) / (b - a);
      }
    }
    return tab[40];
  }
  function brainMap() {
    var B = BRAIN, rho = B.rho, cells = [];
    for (var y = 0; y < B.rows; y++) {
      for (var x = 0; x < B.cols; x++) {
        if (!inBrain(x + 0.5, y + 0.5)) continue;
        var d2 = Math.pow(x + 0.5 - B.spot[0], 2) + Math.pow(y + 0.5 - B.spot[1], 2);
        var a = B.aPeak * Math.exp(-d2 / (2 * B.aRad * B.aRad));
        var c = B.cPeak * Math.exp(-d2 / (2 * B.cRad * B.cRad));
        var varA = a * a + c * c + 2 * a * c * rho + 1;
        var r0 = (a + c * rho) / Math.sqrt(varA);
        var covAS = a * rho + c;
        var r1 = a * (1 - rho * rho) / Math.sqrt((1 - rho * rho) * (varA - covAS * covAS));
        cells.push({ x: x, y: y, r0: r0, r1: r1 });
      }
    }
    var t0 = tCrit01(B.n - 2), t1 = tCrit01(B.n - 3);
    return { cells: cells, cols: B.cols, rows: B.rows,
             crit0: t0 / Math.sqrt(t0 * t0 + B.n - 2), crit1: t1 / Math.sqrt(t1 * t1 + B.n - 3) };
  }

  var api = { rng: rng, normal: normal, DEFAULTS: DEFAULTS, simulate: simulate, mean: mean, sd: sd,
              corr: corr, ols: ols, leftover: leftover, slope: slope, partial: partial,
              columns: columns, raw: raw, BANDS: BANDS, bands: bands, regression: regression,
              partialling: partialling, BRAIN: BRAIN, brainMap: brainMap };
  root.Confounds = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
