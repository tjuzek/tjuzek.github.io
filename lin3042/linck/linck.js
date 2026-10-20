/* LIN 3042, Linck, Kroll & Sunderman (2009): toy versions of the paper's four tasks.
 * The items, the trial lists and the scoring.
 *
 * index.html runs the trials; everything here works without a browser, so it can be
 * tested with node (it exports itself when `module` exists). These are toy versions for
 * class, not the paper's materials: the paper took its translation-recognition items from
 * Sunderman & Kroll (2006) and does not give its timings. Design notes and the class run
 * sheet: ~/claudecode/lin3042/course/modules/linck-demo/README.md (not served).
 */
(function (root) {
  function shuffle(a, rnd) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1)), t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function median(xs) {
    if (!xs.length) return null;
    var s = xs.slice().sort(function (a, b) { return a - b; }), m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }

  function usableRts(trials, cond, lo, hi) {
    return trials.filter(function (t) {
      return t.cond === cond && t.correct && !t.interrupted && t.rt !== null && t.rt >= lo && t.rt <= hi;
    }).map(function (t) { return t.rt; });
  }

  function roundOrNull(x) { return x === null ? null : Math.round(x); }

  /* ---------------------------------------------------------------- Simon task
   * A blue or yellow square left or right of the +. Answer by colour: blue = left button,
   * yellow = right button. Same side = the square is on the side of its button (congruent);
   * opposite side = it is not (incongruent). 12 trials per colour x side cell. */
  var SIMON_MIN_RT = 150, SIMON_MAX_RT = 1500, SIMON_MIN_N = 12;

  function simonTrial(colour, side) {
    var answer = colour === 'blue' ? 'left' : 'right';
    return { colour: colour, side: side, answer: answer, cond: side === answer ? 'same' : 'opposite' };
  }

  function buildSimon(rnd, perCell) {
    rnd = rnd || Math.random;
    perCell = perCell || 12;
    var out = [];
    ['blue', 'yellow'].forEach(function (c) {
      ['left', 'right'].forEach(function (s) {
        for (var i = 0; i < perCell; i++) out.push(simonTrial(c, s));
      });
    });
    return shuffle(out, rnd);
  }

  // Practice: every cell at least once, two opposite-side trials to make the point.
  var SIMON_PRACTICE = [
    simonTrial('blue', 'left'), simonTrial('yellow', 'left'), simonTrial('yellow', 'right'),
    simonTrial('blue', 'right'), simonTrial('blue', 'left'), simonTrial('yellow', 'left')
  ];

  // Simon effect = median correct time on opposite-side trials minus same-side trials.
  function scoreSimon(trials) {
    var s = usableRts(trials, 'same', SIMON_MIN_RT, SIMON_MAX_RT),
        o = usableRts(trials, 'opposite', SIMON_MIN_RT, SIMON_MAX_RT);
    var ms = median(s), mo = median(o);
    function acc(cond) {
      var ts = trials.filter(function (t) { return t.cond === cond; });
      return { correct: ts.filter(function (t) { return t.correct; }).length, total: ts.length };
    }
    return {
      same: roundOrNull(ms), opposite: roundOrNull(mo), nSame: s.length, nOpposite: o.length,
      effect: ms === null || mo === null ? null : Math.round(mo - ms) || 0,
      accSame: acc('same'), accOpposite: acc('opposite'),
      reliable: s.length >= SIMON_MIN_N && o.length >= SIMON_MIN_N
    };
  }

  // 20 ms brackets for the show of hands.
  function simonBracket(e) {
    if (e < -20) return 'below −20 ms';
    if (e < 0) return '−20 to −1 ms';
    if (e >= 80) return '80 ms or more';
    var lo = Math.floor(e / 20) * 20;
    return lo + ' to ' + (lo + 19) + ' ms';
  }

  /* ------------------------------------------------------ Translation recognition
   * A Spanish word, then an English word: is the English word its translation?
   * The four kinds of "no" follow the paper's Table 2 (cara–face): a lexical neighbour looks
   * like the Spanish word (card), a translation neighbour looks like the English translation
   * (fact), a semantic neighbour is related in meaning (head). The unrelated word is one
   * shared baseline; the paper matched a control to every distractor instead. */
  var TR_KINDS = ['lexical', 'translation', 'semantic', 'unrelated'];

  var TR_WORDS = [
    // Spanish, translation, lexical nb., translation nb., semantic nb., unrelated
    { es: 'cara',  en: 'face',    lexical: 'card',  translation: 'fact',   semantic: 'head',  unrelated: 'lamp' },
    { es: 'sopa',  en: 'soup',    lexical: 'soap',  translation: 'soul',   semantic: 'bowl',  unrelated: 'tree' },
    { es: 'ropa',  en: 'clothes', lexical: 'rope',  translation: 'cloves', semantic: 'shirt', unrelated: 'bird' },
    { es: 'casa',  en: 'house',   lexical: 'case',  translation: 'horse',  semantic: 'roof',  unrelated: 'song' },
    { es: 'gato',  en: 'cat',     lexical: 'gate',  translation: 'cap',    semantic: 'dog',   unrelated: 'rain' },
    { es: 'mesa',  en: 'table',   lexical: 'mess',  translation: 'cable',  semantic: 'chair', unrelated: 'fish' },
    { es: 'carta', en: 'letter',  lexical: 'cart',  translation: 'litter', semantic: 'stamp', unrelated: 'cloud' },
    { es: 'mano',  en: 'hand',    lexical: 'man',   translation: 'band',   semantic: 'arm',   unrelated: 'salt' },
    { es: 'lago',  en: 'lake',    lexical: 'logo',  translation: 'cake',   semantic: 'river', unrelated: 'coin' },
    { es: 'toro',  en: 'bull',    lexical: 'torso', translation: 'bell',   semantic: 'cow',   unrelated: 'spoon' },
    { es: 'playa', en: 'beach',   lexical: 'play',  translation: 'peach',  semantic: 'sand',  unrelated: 'clock' },
    { es: 'luna',  en: 'moon',    lexical: 'lung',  translation: 'mood',   semantic: 'star',  unrelated: 'drum' }
  ];

  // Two practice words, on the study list too: one trial of every kind.
  var TR_PRACTICE_WORDS = [{ es: 'libro', en: 'book' }, { es: 'barco', en: 'boat' }];
  var TR_PRACTICE = [
    { es: 'libro', en: 'book', yes: true,  cond: 'yes' },
    { es: 'barco', en: 'bark', yes: false, cond: 'lexical' },
    { es: 'libro', en: 'look', yes: false, cond: 'translation' },
    { es: 'barco', en: 'sail', yes: false, cond: 'semantic' },
    { es: 'barco', en: 'boat', yes: true,  cond: 'yes' },
    { es: 'libro', en: 'milk', yes: false, cond: 'unrelated' }
  ];

  var TR_MIN_RT = 200, TR_MAX_RT = 2500;

  // The 24 trials for one student: every word once with its translation and once with one
  // "no" partner. The words are split at random 3/3/3/3 over the four kinds, so across the
  // room every word appears in every kind.
  function buildTR(rnd) {
    rnd = rnd || Math.random;
    var words = shuffle(TR_WORDS.slice(), rnd), per = words.length / TR_KINDS.length, out = [];
    words.forEach(function (w, i) {
      var kind = TR_KINDS[Math.floor(i / per)];
      out.push({ es: w.es, en: w.en, yes: true, cond: 'yes' });
      out.push({ es: w.es, en: w[kind], yes: false, cond: kind });
    });
    return shuffle(out, rnd);
  }

  // Per kind: correct answers, and the middle time of the correct ones.
  function scoreTR(trials) {
    var out = {};
    ['yes'].concat(TR_KINDS).forEach(function (k) {
      var ts = trials.filter(function (t) { return t.cond === k; });
      var rts = usableRts(trials, k, TR_MIN_RT, TR_MAX_RT);
      out[k] = { correct: ts.filter(function (t) { return t.correct; }).length, total: ts.length,
                 time: roundOrNull(median(rts)), n: rts.length };
    });
    // The slowest kind of "no", among those with at least one usable answer.
    var slowest = null;
    TR_KINDS.forEach(function (k) {
      if (out[k].time !== null && (slowest === null || out[k].time > out[slowest].time)) slowest = k;
    });
    out.slowest = slowest;
    out.correct = trials.filter(function (t) { return t.correct; }).length;
    out.total = trials.length;
    return out;
  }

  /* ------------------------------------------------------------- Verbal fluency
   * 30 seconds per category; the student taps +1 for each one they think of. Block order
   * follows birth month, which puts the paper's order difference into the room: the
   * immersed group did Spanish first, the classroom group English first (p. 1509). */
  var FLUENCY_SECONDS = 30;
  var FLUENCY_BLOCKS = {
    english: { label: 'English', cats: ['animals', 'clothing'] },
    other: { label: 'Spanish or another language', cats: ['fruits', 'things in a kitchen'] }
  };

  // month: 1-12. Jan–Jun do the other language first; Jul–Dec English first.
  function fluencyOrder(month, withOther) {
    if (!withOther) return ['english'];
    return month <= 6 ? ['other', 'english'] : ['english', 'other'];
  }

  function fluencyBracket(n) {
    if (n <= 5) return '0 to 5';
    if (n <= 8) return '6 to 8';
    if (n <= 11) return '9 to 11';
    if (n <= 14) return '12 to 14';
    return '15 or more';
  }

  /* ---------------------------------------------------------------- Reading span
   * Judge each sentence (makes sense or not), then hold on to the word that follows it.
   * After a set, type the words back, in any order. Set sizes 2, 3, 4, 5 = 14 words; the
   * paper used sets of 2 to 6 and 80 words in all (Waters & Caplan 1996). */
  var RSPAN_PRACTICE = [
    { s: 'The baby drank warm milk before bed.', ok: true, w: 'kite' },
    { s: 'The teacher folded the river into a small box.', ok: false, w: 'nest' }
  ];
  var RSPAN_SETS = [
    [ { s: 'The farmer fed the hungry pigs.', ok: true, w: 'fork' },
      { s: 'The sandwich wrote a long letter to its aunt.', ok: false, w: 'coat' } ],
    [ { s: 'She locked the door before leaving the house.', ok: true, w: 'frog' },
      { s: 'The mountain swam across the narrow lake.', ok: false, w: 'ring' },
      { s: 'The boy kicked the ball over the fence.', ok: true, w: 'tent' } ],
    [ { s: 'The cup of coffee sang a song in the kitchen.', ok: false, w: 'wheel' },
      { s: 'The old man waters his garden every morning.', ok: true, w: 'pearl' },
      { s: 'The pilot landed the plane on the runway.', ok: true, w: 'broom' },
      { s: 'The clock ate three apples for lunch.', ok: false, w: 'bean' } ],
    [ { s: 'The pencil drove its car to the beach.', ok: false, w: 'mask' },
      { s: 'The bicycle laughed at the joke and fell asleep.', ok: false, w: 'harp' },
      { s: 'The chef cut the onions with a sharp knife.', ok: true, w: 'sled' },
      { s: 'The rain baked a cake for the cloud.', ok: false, w: 'vest' },
      { s: 'The dog barked at the stranger at the gate.', ok: true, w: 'jar' } ]
  ];

  // Lower case, letters only; a trailing s is dropped on both sides, so "Forks" = "fork".
  function normWord(x) {
    var w = String(x).toLowerCase().replace(/[^a-z]/g, '');
    return w.length > 3 && /s$/.test(w) ? w.slice(0, -1) : w;
  }

  // typed: whatever the student typed (spaces, commas, new lines). Each target counts once;
  // extra words do not cost anything.
  function scoreRecall(typed, words) {
    var said = {};
    String(typed || '').split(/[\s,;.\/]+/).forEach(function (t) {
      var n = normWord(t);
      if (n) said[n] = true;
    });
    var hits = words.map(function (w) { return !!said[normWord(w)]; });
    return { hits: hits, n: hits.filter(Boolean).length, total: words.length };
  }

  function rspanBracket(n) {
    if (n <= 5) return '0 to 5';
    if (n <= 8) return '6 to 8';
    if (n <= 11) return '9 to 11';
    return '12 to 14';
  }

  var api = {
    shuffle: shuffle, median: median,
    SIMON_MIN_RT: SIMON_MIN_RT, SIMON_MAX_RT: SIMON_MAX_RT, SIMON_MIN_N: SIMON_MIN_N,
    SIMON_PRACTICE: SIMON_PRACTICE, buildSimon: buildSimon, scoreSimon: scoreSimon, simonBracket: simonBracket,
    TR_KINDS: TR_KINDS, TR_WORDS: TR_WORDS, TR_PRACTICE_WORDS: TR_PRACTICE_WORDS, TR_PRACTICE: TR_PRACTICE,
    TR_MIN_RT: TR_MIN_RT, TR_MAX_RT: TR_MAX_RT, buildTR: buildTR, scoreTR: scoreTR,
    FLUENCY_SECONDS: FLUENCY_SECONDS, FLUENCY_BLOCKS: FLUENCY_BLOCKS, fluencyOrder: fluencyOrder,
    fluencyBracket: fluencyBracket,
    RSPAN_PRACTICE: RSPAN_PRACTICE, RSPAN_SETS: RSPAN_SETS, normWord: normWord, scoreRecall: scoreRecall,
    rspanBracket: rspanBracket
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Linck = api;
})(this);
