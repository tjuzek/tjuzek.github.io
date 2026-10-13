/* LIN 3042 priming demo: the items, the trial list and the scoring.
 *
 * index.html runs the trials; everything here works without a browser, so it can be
 * tested with node (it exports itself when `module` exists). The design follows Figure 11.2
 * of O'Grady et al., Contemporary Linguistics, 7th ed., p. 431: a prime for 100 ms, then a
 * target for up to 2000 ms, lexical decision on the target. Design notes and the class run
 * sheet: ~/claudecode/lin3042/course/modules/priming-demo/README.md (not served).
 */
(function (root) {
  // [related prime, unrelated prime, target]. Each student gets 12 of these with the
  // related prime and 12 with the unrelated one, picked at random.
  var WORDS = [
    ['cat', 'bat', 'dog'],            // the textbook's own pair
    ['bread', 'glass', 'butter'],
    ['doctor', 'carpet', 'nurse'],
    ['salt', 'wire', 'pepper'],
    ['table', 'river', 'chair'],
    ['king', 'lamp', 'queen'],
    ['black', 'plant', 'white'],
    ['hot', 'pen', 'cold'],
    ['boy', 'map', 'girl'],
    ['day', 'ice', 'night'],
    ['sun', 'fox', 'moon'],
    ['knife', 'cloud', 'fork'],
    ['lion', 'desk', 'tiger'],
    ['shoe', 'bank', 'sock'],
    ['lock', 'rope', 'key'],
    ['bee', 'car', 'honey'],
    ['hammer', 'pencil', 'nail'],
    ['cow', 'job', 'milk'],
    ['mother', 'garden', 'father'],
    ['needle', 'island', 'thread'],
    ['mouse', 'shirt', 'cheese'],
    ['chicken', 'blanket', 'egg'],
    ['left', 'soft', 'right'],
    ['spider', 'bottle', 'web']
  ];

  // [prime, nonword target]. Pronounceable, length-matched to the word targets, and in
  // none of the system word lists; plib and blove are the textbook's (p. 430).
  var NONWORDS = [
    ['apple', 'jop'], ['train', 'biv'], ['horse', 'kem'], ['stone', 'vun'],
    ['clock', 'plib'], ['paper', 'glup'], ['green', 'maft'], ['music', 'snid'],
    ['money', 'clun'], ['phone', 'drep'], ['cup', 'wusk'],
    ['tea', 'blove'], ['sand', 'plont'], ['ball', 'brisp'], ['door', 'glant'],
    ['coat', 'flemp'], ['bird', 'skarl'], ['farm', 'twirb'], ['hill', 'trune'],
    ['box', 'pilvet'], ['bus', 'narpel'], ['baby', 'malset'], ['ship', 'temble'],
    ['wall', 'dorpen']
  ];

  // Practice: not scored, and none of these items comes back later.
  var PRACTICE = [
    { prime: 'grass', target: 'book', word: true, cond: 'practice' },
    { prime: 'frog', target: 'vosk', word: false, cond: 'practice' },
    { prime: 'metal', target: 'slune', word: false, cond: 'practice' },
    { prime: 'smile', target: 'hat', word: true, cond: 'practice' }
  ];

  var N_RELATED = 12;
  var MIN_RT = 200, MAX_RT = 2000, MIN_N = 6;

  function shuffle(a, rnd) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1)), t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  // The 48 trials for one student, in a fresh random order.
  function buildTrials(rnd) {
    rnd = rnd || Math.random;
    var words = shuffle(WORDS.slice(), rnd).map(function (it, i) {
      var rel = i < N_RELATED;
      return { prime: rel ? it[0] : it[1], target: it[2], word: true, cond: rel ? 'related' : 'unrelated' };
    });
    var non = NONWORDS.map(function (it) {
      return { prime: it[0], target: it[1], word: false, cond: 'nonword' };
    });
    return shuffle(words.concat(non), rnd);
  }

  function median(xs) {
    if (!xs.length) return null;
    var s = xs.slice().sort(function (a, b) { return a - b; }), m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }

  // Trials come back from the page with `correct` (true/false), `rt` (ms; null if too slow)
  // and `interrupted` (the page went into the background, or the prime overran). Usable = a
  // correct "word" answer within 200 to 2000 ms, not interrupted. The middle time (median) per
  // condition keeps one slow trial from swamping a dozen.
  function score(trials) {
    function usable(cond) {
      return trials.filter(function (t) {
        return t.cond === cond && t.correct && !t.interrupted && t.rt !== null && t.rt >= MIN_RT && t.rt <= MAX_RT;
      }).map(function (t) { return t.rt; });
    }
    var r = usable('related'), u = usable('unrelated');
    var mr = median(r), mu = median(u);
    return {
      related: mr === null ? null : Math.round(mr),
      unrelated: mu === null ? null : Math.round(mu),
      nRelated: r.length,
      nUnrelated: u.length,
      effect: mr === null || mu === null ? null : Math.round(mu - mr) || 0,
      correct: trials.filter(function (t) { return t.correct; }).length,
      total: trials.length,
      reliable: r.length >= MIN_N && u.length >= MIN_N
    };
  }

  // 25 ms brackets for the show of hands in class.
  function bracket(e) {
    if (e < -50) return 'below −50 ms';
    if (e < -25) return '−50 to −26 ms';
    if (e < 0) return '−25 to −1 ms';
    if (e >= 100) return '100 ms or more';
    var lo = Math.floor(e / 25) * 25;
    return lo + ' to ' + (lo + 24) + ' ms';
  }

  var api = {
    WORDS: WORDS, NONWORDS: NONWORDS, PRACTICE: PRACTICE, N_RELATED: N_RELATED,
    MIN_RT: MIN_RT, MAX_RT: MAX_RT, MIN_N: MIN_N,
    shuffle: shuffle, buildTrials: buildTrials, median: median, score: score, bracket: bracket
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Priming = api;
})(this);
