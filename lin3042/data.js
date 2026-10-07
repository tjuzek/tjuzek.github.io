/* LIN 3042 Applied Linguistics, Fall 2026: the dates behind tjuzek.com/lin3042/
 *
 * This is the only file a routine update touches. index.html works out "today" by itself,
 * hides what has passed and counts down to what is next, so nothing here needs editing week
 * by week. Edit it only when a date is set or moves, then bump `updated` (it is the page's
 * visible "Last updated" date).
 *
 * Canvas is the record. When a THA goes out late, a due date moves on Canvas, or a session
 * shifts, change it here the same day. Procedure and checklist:
 * ~/claudecode/lin3042/course/course-page/README.md (not served).
 *
 * Dates are YYYY-MM-DD. THAs go out by the Sunday of their week at the latest and are due
 * the Sunday two weeks later at 11:59 pm, unless something comes up. A THA counts as open
 * from `out` to the end of `due`. Session readings follow syllabus/LIN3042-F26_schedule-readings.tex.
 */
window.LIN3042 = {
  updated: '2026-10-07',
  lastSession: '2026-12-03',
  dueTime: '11:59 pm',

  thas: [
    { n: 4, title: 'Hypotheses and Evidence',      out: '2026-10-05', due: '2026-10-19' },
    { n: 5, title: 'Second Language Acquisition',  out: '2026-10-18', due: '2026-11-01' },
    { n: 6, title: 'Bilingualism & the brain',     out: '2026-11-01', due: '2026-11-15' },
    { n: 7, title: 'Psycho- and Neurolinguistics', out: '2026-11-08', due: '2026-11-22' },
    { n: 8, title: 'Animal communication (final take-home assignment)', out: '2026-11-15', due: '2026-11-29' }
  ],

  quizzes: [
    { n: 2, date: '2026-10-22' },
    { n: 3, date: '2026-11-19' }
  ],

  // No class on Thu 26 Nov (Thanksgiving). `read: null` means no reading for that session.
  sessions: [
    { date: '2026-10-08', topic: 'Bilingual Education', read: 'pp. 413–421' },
    { date: '2026-10-13', topic: 'Methods of psycholinguistic research', read: 'pp. 425–436' },
    { date: '2026-10-15', topic: 'Language processing and linguistics', read: 'pp. 436–446' },
    { date: '2026-10-20', topic: 'Linck, Kroll & Sunderman (2009), “Losing Access to the Native Language”', read: 'the article' },
    { date: '2026-10-22', topic: 'Psycholinguistic modelling', read: 'pp. 446–453', tag: 'Quiz 2' },
    { date: '2026-10-27', topic: 'The human brain', read: 'pp. 455–460' },
    { date: '2026-10-29', topic: 'Aphasia and Dyslexia', read: 'pp. 467–479' },
    { date: '2026-11-03', topic: 'Romeo et al. (2018), “Beyond the 30-Million-Word Gap”', read: 'the article' },
    { date: '2026-11-05', topic: 'Romeo et al. (cont.)', read: null },
    { date: '2026-11-10', topic: 'Animal Communication: Signs, Birds and Bees', read: 'on Canvas' },
    { date: '2026-11-12', topic: 'Monkeys and Apes and More', read: 'on Canvas' },
    { date: '2026-11-17', topic: 'Computational Linguistics I: But what is a neural network?', read: 'Grishman (1986); Sparck Jones (2007), on Canvas' },
    { date: '2026-11-19', topic: 'Computational Linguistics II', read: 'Manning (2015); gradient-descent video, on Canvas', tag: 'Quiz 3' },
    { date: '2026-11-24', topic: 'Writing workshop: Article Summary & Critique + catch-up/review', read: null },
    { date: '2026-12-01', topic: 'Article Summary & Critique presentations', read: null, tag: 'No unexcused absences' },
    { date: '2026-12-03', topic: 'Article Summary & Critique presentations', read: null, tag: 'No unexcused absences' }
  ]
};
