/* LIN 3042, Linck et al. (2009) tasks: the trial runners and the result screens.
 *
 * Each task page loads linck.js (items, trial lists, scoring) and then this file, and names its
 * task in <body data-task="translation|verbal|reading-span|simon">. Only that task is wired up.
 * Onsets are animation-frame times, as in ../priming/. Nothing is stored or sent.
 */
(function () {
  var L = window.Linck;
  if (!L || !window.requestAnimationFrame || !window.performance) return;
  var TASK = document.body.getAttribute('data-task');
  var FIX = 500, BAND = 600, ITI = 400, TR_SPANISH = 750, RS_LIMIT = 6000, RS_WORD = 1000, RS_GAP = 300;

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function signed(e) { return e > 0 ? '+' + e : e < 0 ? '−' + (-e) : '0'; }
  function copy(xs) { return xs.map(function (x) { return Object.assign({}, x); }); }

  var COND = {
    same:        { label: 'Same side',             colour: 'var(--c-same)' },
    opposite:    { label: 'Opposite side',         colour: 'var(--c-opp)' },
    yes:         { label: 'The translation',       colour: 'var(--c-yes)' },
    lexical:     { label: 'Lexical neighbour',     colour: 'var(--c-lex)' },
    translation: { label: 'Translation neighbour', colour: 'var(--c-trn)' },
    semantic:    { label: 'Semantic neighbour',    colour: 'var(--c-sem)' },
    unrelated:   { label: 'Unrelated',             colour: 'var(--c-unr)' },
    sense:       { label: 'Makes sense',           colour: 'var(--c-yes)' },
    nonsense:    { label: 'Doesn’t make sense',    colour: 'var(--c-trn)' },
    english:     { label: 'English',               colour: 'var(--garnet)' },
    other:       { label: 'Other language',        colour: 'var(--c-sem)' }
  };
  function chip(cond, text) {
    return '<span class="chip" style="background:' + COND[cond].colour + '">' + esc(text || COND[cond].label) + '</span>';
  }

  /* ------------------------------------------------------------ panels */
  var PANELS = ['intro', 'ready', 'task', 'result'];
  function showPanel(id) {
    PANELS.forEach(function (p) { $(p).hidden = p !== id; });
    $('role').hidden = id !== 'intro';   // the task's role in the study: shown with the instructions
    document.body.classList.toggle('running', id === 'task');
    window.scrollTo(0, 0);
  }
  function showTask() { clearBand(); showPanel('task'); }

  var readyFn = null;
  function setReady(html, label, fn) {
    $('ready-text').innerHTML = html;
    $('ready-go').textContent = label;
    readyFn = fn;
    showPanel('ready');
  }
  $('ready-go').addEventListener('click', function () { if (readyFn) readyFn(); });

  function showResult(html) {
    $('result-body').innerHTML = html;
    showPanel('result');
  }

  /* ------------------------------------------------------------ the band after each answer
     In a practice round it explains the trial and waits for Next; in a real round it shows the
     condition for 600 ms. */
  var bandWait = null;
  function band(cond, mark, explain, practice, cont) {
    var bad = mark !== '✓';
    $('band-chip').innerHTML = chip(cond) + ' <span class="mark' + (bad ? ' bad' : '') + '">' + esc(mark) + '</span>';
    if (practice) {
      $('band-explain').innerHTML = explain;
      $('band-explain').hidden = false;
      $('band-next').hidden = false;
      bandWait = function () { bandWait = null; clearBand(); cont(); };
    } else {
      setTimeout(function () { clearBand(); cont(); }, BAND);
    }
  }
  function clearBand() {
    if (!$('band')) return;
    $('band-chip').innerHTML = '';
    $('band-explain').innerHTML = '';
    $('band-explain').hidden = true;
    $('band-next').hidden = true;
  }
  if ($('band-next')) $('band-next').addEventListener('click', function () { if (bandWait) bandWait(); });

  /* ------------------------------------------------------------ responses */
  var onChoice = null, cur = null, onPlus = null;
  function choose(c) { if (onChoice) onChoice(c); }

  // Buttons answer on pointer-down (a click fires only on release); F and J on a keyboard.
  var downs = window.PointerEvent ? ['pointerdown'] : ['touchstart', 'mousedown'];
  Array.prototype.forEach.call(document.querySelectorAll('[data-choice]'), function (b) {
    downs.forEach(function (ev) {
      b.addEventListener(ev, function (e) { e.preventDefault(); choose(b.getAttribute('data-choice')); });
    });
  });

  document.addEventListener('keydown', function (e) {
    if ($('task').hidden || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'TEXTAREA' || tag === 'INPUT') return;
    var k = (e.key || '').toLowerCase();
    if (bandWait && (k === 'enter' || k === ' ')) { e.preventDefault(); bandWait(); return; }
    if (onPlus) {
      if (k === ' ' || k === 'j') { e.preventDefault(); onPlus(1); }
      return;
    }
    if (k === 'f' || k === 'j') { e.preventDefault(); choose(k === 'f' ? 'left' : 'right'); }
  });

  // A trial during which the page went into the background (a notification, another app)
  // is not counted: its timing means nothing.
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && cur && !$('task').hidden) cur.interrupted = true;
  });

  /* ------------------------------------------------------------ timed two-button trials
     Simon and translation recognition. spec.present shows the stimuli and calls back with the
     frame time of the one to answer; the response is timed from that frame. */
  var R = {};
  function runRT(spec, trials, practice, finish) {
    R = { spec: spec, list: trials, idx: 0, practice: practice, finish: finish, accepting: false };
    showTask();
    nextRT();
  }
  function nextRT() {
    if (R.idx >= R.list.length) { cur = null; onChoice = null; R.finish(R.list); return; }
    cur = R.list[R.idx];
    $('prog').textContent = (R.practice ? 'Practice ' : '') + (R.idx + 1) + ' of ' + R.list.length;
    onChoice = answerRT;
    R.spec.present(cur, function (t) {
      R.onset = t;
      R.accepting = true;
      R.timer = setTimeout(tooSlowRT, R.spec.limit);
    });
  }
  function answerRT(c) {
    if (!R.accepting) return;
    var rt = performance.now() - R.onset;
    R.accepting = false;
    clearTimeout(R.timer);
    cur.choice = c;
    cur.rt = Math.round(rt);
    cur.correct = c === R.spec.answerOf(cur);
    afterRT();
  }
  function tooSlowRT() {
    if (!R.accepting) return;
    R.accepting = false;
    cur.choice = null;
    cur.rt = null;
    cur.correct = false;
    afterRT();
  }
  function afterRT() {
    R.spec.clear();
    var mark = cur.rt === null ? 'too slow' : cur.correct ? '✓' : '✗ wrong';
    band(cur.cond, mark, R.spec.explain(cur), R.practice, function () {
      setTimeout(function () { R.idx++; nextRT(); }, ITI);
    });
  }

  /* ------------------------------------------------------------ Simon */
  function initSimon() {
    var SIMON = {
      limit: L.SIMON_MAX_RT,
      present: function (t, go) {
        $('sq').className = '';
        setTimeout(function () {
          requestAnimationFrame(function (t0) {
            $('sq').className = t.colour + ' ' + t.side;
            go(t0);
          });
        }, FIX);
      },
      clear: function () { $('sq').className = ''; },
      answerOf: function (t) { return t.answer; },
      explain: function (t) {
        var col = t.colour === 'blue' ? 'blue' : 'yellow';
        return t.cond === 'same'
          ? 'A ' + col + ' square on the ' + t.side + ', and the ' + col + ' button is on the ' + t.answer +
            ' too. Where the square is and what colour it is point the same way: the easy kind.'
          : 'A ' + col + ' square on the ' + t.side + ', but the ' + col + ' button is on the ' + t.answer +
            '. Where the square is pulls you towards the wrong button, and you have to hold that back. ' +
            'Holding back is <strong>inhibition</strong>; the extra time it costs is the <strong>Simon effect</strong>.';
      }
    };
    $('start').addEventListener('click', function () {
      runRT(SIMON, copy(L.SIMON_PRACTICE), true, function () {
        setReady('<p>That was the practice. Now 48 for real, about a minute and a half, without a break. ' +
          'No explanations now: just a coloured band after each answer, ' + chip('same') + ' or ' +
          chip('opposite') + '.</p><p>Blue: left. Yellow: right. Ignore where the square is.</p>', 'Start',
          function () { runRT(SIMON, L.buildSimon(), false, resultSimon); });
      });
    });
  }

  function resultSimon(trials) {
    var s = L.scoreSimon(trials), e = s.effect, html = '<h2>Your result: Simon task</h2>';
    html += '<p class="big">' + (e === null ? 'No number' : signed(e) + ' ms') + '</p>';
    html += '<p>' + (e === null ? 'Not enough correct answers to work out a Simon effect.' :
      e > 0 ? 'Your Simon effect: ' + chip('opposite') + ' squares took you ' + e + ' ms longer than ' + chip('same') + ' ones.' :
      e < 0 ? 'Your Simon effect: ' + chip('opposite') + ' squares took you ' + (-e) + ' ms less than ' + chip('same') + ' ones.' :
              'Your Simon effect: no difference between ' + chip('opposite') + ' and ' + chip('same') + ' squares.') + '</p>';
    if (e !== null) html += '<p class="hands">For the show of hands in class, your bracket is <strong>' + L.simonBracket(e) + '</strong>.</p>';
    if (e !== null && !s.reliable) html += '<p class="warn">Only ' + Math.min(s.nSame, s.nOpposite) +
      ' usable trials in one of the two kinds (usable means a correct answer within 1.5 seconds, with the page kept open), so this number means very little.</p>';
    function ms(x, n) { return x === null ? 'no usable trials' : x + ' ms (' + n + ' trials)'; }
    html += '<table class="sum">' +
      '<tr><th>' + chip('same') + ' your middle time</th><td>' + ms(s.same, s.nSame) + '</td></tr>' +
      '<tr><th>' + chip('opposite') + ' your middle time</th><td>' + ms(s.opposite, s.nOpposite) + '</td></tr>' +
      '<tr><th>Correct answers, same side</th><td>' + s.accSame.correct + ' of ' + s.accSame.total + '</td></tr>' +
      '<tr><th>Correct answers, opposite side</th><td>' + s.accOpposite.correct + ' of ' + s.accOpposite.total + '</td></tr></table>';
    html += '<h3>What was going on</h3>' +
      '<p>Only the colour decided the button; where the square appeared did not matter. Even so, a square on the right ' +
      'pulls you towards the right-hand button. On ' + chip('opposite') + ' trials you have to hold that pull back, and that ' +
      'costs time. The cost is the <strong>Simon effect</strong>. Linck et al. used it as their measure of ' +
      '<strong>inhibitory control</strong>: the smaller the effect, the better you are at holding back the wrong response.</p>' +
      '<p>In the paper (Table 1), the immersed group&rsquo;s Simon effect was <strong>38 ms</strong> and the classroom ' +
      'group&rsquo;s <strong>20 ms</strong>. The task was there to check that the two groups started out alike, so that ' +
      'differences in the language tasks could be put down to immersion. The text calls the groups similar on this measure, ' +
      'but Table 1 marks the difference as reliable. The authors say that any edge lay with the classroom group.</p>' +
      '<p>Your number is the difference between your middle (median) times for the two kinds, correct answers only. ' +
      'Twenty-four trials of each kind give a noisy number for one person: zero or negative results happen and do not ' +
      'mean anything went wrong. The class as a whole is the real test.</p>';
    showResult(html);
  }

  /* ------------------------------------------------------------ Translation recognition */
  function initTR() {
    var GLOSS = {};
    L.TR_PRACTICE_WORDS.concat(L.TR_WORDS).forEach(function (w) { GLOSS[w.es] = w.en; });
    var TR = {
      limit: L.TR_MAX_RT,
      present: function (t, go) {
        var w = $('tr-word'), cap = $('tr-cap');
        w.className = 'fix';
        w.textContent = '+';
        cap.textContent = '';
        setTimeout(function () {
          requestAnimationFrame(function (t0) {
            w.className = 'es';
            w.textContent = t.es;
            cap.textContent = 'Spanish';
            function tick(tt) {
              if (tt - t0 < TR_SPANISH - 8) { requestAnimationFrame(tick); return; }
              w.className = '';
              w.textContent = t.en.toUpperCase();
              cap.textContent = 'English: is it the translation?';
              if (tt - t0 > TR_SPANISH + 150) t.interrupted = true;
              go(tt);
            }
            requestAnimationFrame(tick);
          });
        }, FIX);
      },
      clear: function () { $('tr-word').textContent = ''; $('tr-word').className = ''; $('tr-cap').textContent = ''; },
      answerOf: function (t) { return t.yes ? 'right' : 'left'; },
      explain: function (t) {
        var es = '<em>' + esc(t.es) + '</em>', en = '<strong>' + esc(t.en.toUpperCase()) + '</strong>',
            gl = '<em>' + esc(GLOSS[t.es]) + '</em>';
        switch (t.cond) {
          case 'yes': return es + ' means ' + gl + ', so the answer is Yes.';
          case 'lexical': return en + ' <strong>looks like the Spanish word</strong> ' + es + ', but ' + es + ' means ' + gl +
            '. The paper&rsquo;s example: <em>cara</em> (face) with CARD.';
          case 'translation': return en + ' <strong>looks like the right translation</strong>, ' + gl +
            '. The paper&rsquo;s example: <em>cara</em> (face) with FACT.';
          case 'semantic': return en + ' is <strong>related in meaning</strong> to ' + gl + ', the right translation. ' +
            'The paper&rsquo;s example: <em>cara</em> (face) with HEAD.';
          case 'unrelated': return en + ' has <strong>nothing to do</strong> with ' + es + ' or ' + gl + '. This is the ' +
            'baseline: is a lexical, translation or semantic neighbour harder to turn down than this?';
        }
      }
    };

    // The study list, with a one-minute countdown (only a guide: they can start earlier).
    $('study').innerHTML = L.TR_PRACTICE_WORDS.concat(L.TR_WORDS).map(function (w) {
      return '<div><em>' + esc(w.es) + '</em> &nbsp;' + esc(w.en) + '</div>';
    }).join('');
    var end = performance.now() + 60000, trTick;
    function tick() {
      var left = Math.ceil((end - performance.now()) / 1000);
      $('tr-timer').textContent = left > 0 ? left + ' seconds left' : 'Time’s up: start when you’re ready.';
      if (left <= 0) clearInterval(trTick);
    }
    tick();
    trTick = setInterval(tick, 250);

    $('start').addEventListener('click', function () {
      clearInterval(trTick);
      runRT(TR, copy(L.TR_PRACTICE), true, function () {
        setReady('<p>That was the practice. Now 24 for real, about a minute and a half. No explanations now: just a ' +
          'coloured band after each answer that tells you what kind of pair it was:</p><p>' +
          ['yes', 'lexical', 'translation', 'semantic', 'unrelated'].map(function (k) { return chip(k); }).join(' ') + '</p>',
          'Start', function () { runRT(TR, L.buildTR(), false, resultTR); });
      });
    });
  }

  function resultTR(trials) {
    var s = L.scoreTR(trials), html = '<h2>Your result: translation recognition</h2>';
    var EX = { yes: 'face', lexical: 'card', translation: 'fact', semantic: 'head', unrelated: 'lamp' };
    html += s.slowest ? '<p>Your slowest kind of No:</p><p class="big">' + chip(s.slowest) + '</p>' +
      '<p class="hands">For the show of hands in class: which colour was your slowest No? Yours was ' + chip(s.slowest) + '.</p>'
      : '<p class="big">No answer</p><p>Not enough correct No answers to say which kind was slowest.</p>';
    html += '<table class="sum"><thead><tr><th>Kind of pair</th><th>Correct</th><th>Your middle time</th></tr></thead>';
    ['yes', 'lexical', 'translation', 'semantic', 'unrelated'].forEach(function (k) {
      var r = s[k];
      html += '<tr><th>' + chip(k) + '<br><span class="small"><em>cara</em> &ndash; ' + EX[k].toUpperCase() + '</span></th>' +
        '<td>' + r.correct + ' of ' + r.total + '</td><td>' + (r.time === null ? '&ndash;' : r.time + ' ms') + '</td></tr>';
    });
    html += '</table>';
    html += '<h3>What was going on</h3>' +
      '<p>Every No pair except the ' + chip('unrelated') + ' ones shared something with the right answer: a ' +
      chip('lexical') + ' looks like the Spanish word, a ' + chip('translation') + ' looks like the right English word, ' +
      'and a ' + chip('semantic') + ' means something close to it. If one kind is harder to turn down than an unrelated ' +
      'word, that kind of similarity is getting in the way.</p>' +
      '<p>In the paper (Figures 1 and 2), the classroom learners were slowed down by all three kinds, by about 45 to 65 ms. ' +
      'The immersed learners were slowed down a lot by semantic neighbours (about 120 ms), but hardly at all by lexical ' +
      'neighbours (about 5 ms). Lexical neighbours like CARD are <strong>English</strong> words that look like the Spanish ' +
      'word. The authors read the immersed learners&rsquo; immunity to them as a sign that their English was being held ' +
      'down: <strong>inhibited</strong>. (The figures are read off the bar charts; only the translation-neighbour numbers, ' +
      '25 against 65 ms, are given in the text, and that group difference was only a trend.)</p>' +
      '<p>Worth testing with the hands: the paper&rsquo;s background (p. 1508) says that beginners are caught by the ' +
      '<em>form</em> of the translation (' + chip('translation') + '), and that as learners improve, <em>meaning</em> ' +
      'matters more (' + chip('semantic') + '). Do the people with little Spanish and the people with a lot of it differ?</p>' +
      '<p class="warn">Three trials per kind is far too few for a personal number: one slow trial decides it. The paper had ' +
      '45 learners, many more trials each, and a matched control word for every distractor; here one shared unrelated ' +
      'baseline stands in for those. Only correct answers count towards the times.</p>';
    showResult(html);
  }

  /* ------------------------------------------------------------ Verbal fluency */
  var F = { live: false };
  function plusOne(d) {
    if (!F.live) return;
    F.count = Math.max(0, F.count + d);
    $('flu-count').textContent = F.count;
  }

  function initVerbal() {
    function choice() {
      var lang = document.querySelector('input[name="flu-lang"]:checked'),
          half = document.querySelector('input[name="flu-half"]:checked');
      lang = lang && lang.value;
      half = half && half.value;
      $('flu-half-set').hidden = lang === 'none';
      var ok = lang === 'none' || (lang && half);
      $('start').disabled = !ok;
      if (!ok) { $('flu-plan').textContent = ''; return null; }
      var order = L.fluencyOrder(half === 'first' ? 1 : 7, lang !== 'none');
      var name = { english: 'English', other: lang === 'spanish' ? 'Spanish' : 'your other language' };
      $('flu-plan').textContent = 'Your order: ' + order.map(function (b) { return name[b]; }).join(', then ') +
        '. Two categories each, 30 seconds per category.';
      return { lang: lang, order: order, name: name };
    }
    Array.prototype.forEach.call(document.querySelectorAll('#intro input'), function (i) {
      i.addEventListener('change', choice);
    });
    choice();

    downs.forEach(function (ev) {
      $('flu-plus').addEventListener(ev, function (e) { e.preventDefault(); plusOne(1); });
    });
    $('flu-undo').addEventListener('click', function () { plusOne(-1); });
    onPlus = plusOne;

    $('start').addEventListener('click', function () {
      var c = choice();
      if (!c) return;
      F = { c: c, steps: [], i: 0, counts: [], live: false };
      c.order.forEach(function (b) {
        L.FLUENCY_BLOCKS[b].cats.forEach(function (cat) { F.steps.push({ block: b, cat: cat }); });
      });
      readyFluency();
    });
  }
  function readyFluency() {
    if (F.i >= F.steps.length) { resultFluency(); return; }
    var s = F.steps[F.i], lang = F.c.name[s.block];
    setReady('<p>' + chip(s.block, lang) + ' &nbsp;Category ' + (F.i + 1) + ' of ' + F.steps.length + '</p>' +
      '<p>Think of as many <strong>' + esc(s.cat) + '</strong> as you can, <strong>in ' + esc(lang) + '</strong>, ' +
      'and tap <strong>+1</strong> for each one. 30 seconds.</p>', 'Start the 30 seconds', runFluencyStep);
  }
  function runFluencyStep() {
    var s = F.steps[F.i];
    showTask();
    $('prog').textContent = 'Category ' + (F.i + 1) + ' of ' + F.steps.length;
    $('flu-chip').innerHTML = chip(s.block, F.c.name[s.block]);
    $('flu-cat').textContent = s.cat;
    $('flu-stop').textContent = '';
    F.count = 0;
    $('flu-count').textContent = '0';
    $('flu-plus').disabled = false;
    $('flu-undo').disabled = false;
    F.live = true;
    var end = performance.now() + L.FLUENCY_SECONDS * 1000;
    $('flu-time').textContent = L.FLUENCY_SECONDS;
    F.timer = setInterval(function () {
      var left = Math.ceil((end - performance.now()) / 1000);
      if (left > 0) { $('flu-time').textContent = left; return; }
      clearInterval(F.timer);
      F.live = false;
      $('flu-time').textContent = '0';
      $('flu-plus').disabled = true;
      $('flu-undo').disabled = true;
      F.counts.push({ block: s.block, cat: s.cat, n: F.count });
      $('flu-stop').textContent = 'Time! You counted ' + F.count + '.';
      setTimeout(function () { F.i++; readyFluency(); }, 1500);
    }, 100);
  }

  function resultFluency() {
    var html = '<h2>Your result: verbal fluency</h2>', animals = null, both = F.c.order.length > 1;
    F.counts.forEach(function (r) { if (r.cat === 'animals') animals = r.n; });
    html += '<p class="big">' + animals + ' animals</p>';
    html += '<p class="hands">For the show of hands in class: animals in 30 seconds, your bracket is <strong>' +
      L.fluencyBracket(animals) + '</strong>' + (both ? ', and you did ' + esc(F.c.name[F.c.order[0]]) + ' first' : '') + '.</p>';
    html += '<table class="sum"><thead><tr><th>In the order you did them</th><th>Counted</th></tr></thead>';
    F.counts.forEach(function (r) {
      html += '<tr><th>' + chip(r.block, F.c.name[r.block]) + ' ' + esc(r.cat) + '</th><td>' + r.n + '</td></tr>';
    });
    html += '</table>';
    html += '<h3>What was going on</h3>' +
      '<p>Verbal fluency is a production task: how easily do words come? Linck et al. gave their learners 30 seconds per ' +
      'category, in English and in Spanish. The immersed learners came up with more Spanish words than the classroom ' +
      'learners, but <strong>fewer English ones</strong> (Figure 3: in English about 47 against 59, in Spanish about 32 ' +
      'against 24; totals over all their categories, so not comparable with your counts). Six months after coming home, ' +
      'the immersed learners&rsquo; English had bounced back (Figure 5). The authors read this as English being ' +
      '<strong>inhibited</strong> during immersion.</p>' +
      '<p><strong>The order of the blocks.</strong> In the paper, the immersed learners did Spanish first and English ' +
      'second; the classroom learners did English first (p. 1509). So group and order went together. In class we split ' +
      'the order by birthday. Does a block in another language first make the English words come more slowly? ' +
      'Compare the hands for animals: January to June against July to December, among those who did both blocks.</p>';
    showResult(html);
  }

  /* ------------------------------------------------------------ Reading span */
  var S = {};
  function initRspan() {
    $('recall-done').addEventListener('click', recallDone);
    $('recall-in').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); recallDone(); }
    });
    $('recall-next').addEventListener('click', function () {
      $('recall').hidden = true;
      S.si++;
      S.ii = 0;
      if (S.si >= S.sets.length) { S.finish(S); return; }
      $('resp-rs').hidden = false;
      nextRS();
    });
    $('start').addEventListener('click', function () {
      runRspan([L.RSPAN_PRACTICE], true, function () {
        setReady('<p>That was the practice. Now four sets of 2, 3, 4 and 5 sentences, about three minutes. After each ' +
          'sentence a band shows whether it made sense, ' + chip('sense') + ' or ' + chip('nonsense') +
          ', and after each set your words in green (had it) or grey (missed).</p>', 'Start',
          function () { runRspan(L.RSPAN_SETS, false, resultRspan); });
      });
    });
  }
  function runRspan(sets, practice, finish) {
    S = { sets: sets.map(copy), si: 0, ii: 0, practice: practice, finish: finish, recalled: [], accepting: false };
    showTask();
    $('recall').hidden = true;
    $('resp-rs').hidden = false;
    nextRS();
  }
  function nextRS() {
    var set = S.sets[S.si];
    if (S.ii >= set.length) { recallRS(); return; }
    cur = set[S.ii];
    $('prog').textContent = (S.practice ? 'Practice · ' : '') + 'Set ' + (S.si + 1) + ' of ' + S.sets.length +
      ' · sentence ' + (S.ii + 1) + ' of ' + set.length;
    $('rs-text').className = 'sentence';
    $('rs-text').textContent = cur.s;
    S.accepting = true;
    onChoice = answerRS;
    S.timer = setTimeout(function () {
      if (!S.accepting) return;
      S.accepting = false;
      cur.choice = null;
      cur.correct = false;
      afterRS('too slow');
    }, RS_LIMIT);
  }
  function answerRS(c) {
    if (!S.accepting) return;
    S.accepting = false;
    clearTimeout(S.timer);
    cur.choice = c;
    cur.correct = (c === 'right') === cur.ok;
    afterRS(cur.correct ? '✓' : '✗');
  }
  function afterRS(mark) {
    $('rs-text').textContent = '';
    var explain = (cur.ok ? 'This one makes sense.' : 'This one doesn&rsquo;t make sense.') +
      ' Judging the sentence keeps your mind busy while you hold on to the words: <strong>working memory</strong> has ' +
      'to store and process at the same time. Now remember the word that comes next.';
    band(cur.ok ? 'sense' : 'nonsense', mark, explain, S.practice, function () {
      $('rs-text').className = 'word';
      $('rs-text').textContent = cur.w.toUpperCase();
      setTimeout(function () {
        $('rs-text').textContent = '';
        setTimeout(function () { S.ii++; nextRS(); }, RS_GAP);
      }, RS_WORD);
    });
  }
  function recallRS() {
    onChoice = null;
    cur = null;
    var set = S.sets[S.si];
    $('prog').textContent = (S.practice ? 'Practice · ' : '') + 'Set ' + (S.si + 1) + ' of ' + S.sets.length + ' · recall';
    $('resp-rs').hidden = true;
    $('rs-text').className = 'sentence';
    $('rs-text').textContent = 'Type the ' + set.length + ' words from this set, in any order.';
    $('recall').hidden = false;
    $('recall-in').value = '';
    $('recall-in').disabled = false;
    $('recall-fb').innerHTML = '';
    $('recall-done').hidden = false;
    $('recall-next').hidden = true;
    $('recall-in').focus();
  }
  function recallDone() {
    if ($('recall-done').hidden) return;
    var words = S.sets[S.si].map(function (x) { return x.w; }), r = L.scoreRecall($('recall-in').value, words);
    S.recalled.push(r.n);
    $('recall-in').disabled = true;
    $('recall-done').hidden = true;
    $('recall-fb').innerHTML = words.map(function (w, i) {
      return '<span class="rw ' + (r.hits[i] ? 'hit' : 'miss') + '">' + esc(w) + '</span>';
    }).join(' ') + '<br>' + r.n + ' of ' + words.length + ' (green: you had it; grey: missed)';
    $('recall-next').textContent = S.si + 1 < S.sets.length ? 'Next set' : S.practice ? 'Continue' : 'See your result';
    $('recall-next').hidden = false;
  }

  function resultRspan(st) {
    var n = st.recalled.reduce(function (a, b) { return a + b; }, 0),
        total = st.sets.reduce(function (a, s) { return a + s.length; }, 0),
        judged = st.sets.reduce(function (a, s) { return a + s.filter(function (x) { return x.correct; }).length; }, 0),
        pct = Math.round(100 * n / total), html = '<h2>Your result: reading span</h2>';
    html += '<p class="big">' + n + ' of ' + total + '</p>';
    html += '<p>words recalled (' + pct + '%).</p>';
    html += '<p class="hands">For the show of hands in class, your bracket is <strong>' + L.rspanBracket(n) + '</strong>.</p>';
    html += '<table class="sum">';
    st.sets.forEach(function (s, i) {
      html += '<tr><th>Set of ' + s.length + '</th><td>' + st.recalled[i] + ' of ' + s.length + '</td></tr>';
    });
    html += '<tr><th>Sentences judged right</th><td>' + judged + ' of ' + total + '</td></tr></table>';
    html += '<h3>What was going on</h3>' +
      '<p>Reading span measures <strong>working memory</strong>: holding on to words while you process sentences. ' +
      'Linck et al. used it, like the Simon task, to check that the two groups started out alike, and on this one they ' +
      'did: <strong>51.5 and 51.8 words out of 80</strong> (Table 1), about 65%. Yours: ' + pct + '%.</p>' +
      '<p>Ours had 14 words in sets of 2 to 5; theirs had 80, in sets of 2 to 6, so the percentages are only a rough ' +
      'comparison. The sentence judgements matter too: without them, you could just rehearse the words.</p>';
    showResult(html);
  }

  var INIT = { simon: initSimon, translation: initTR, verbal: initVerbal, 'reading-span': initRspan };
  if (INIT[TASK]) { INIT[TASK](); showPanel('intro'); }
})();
