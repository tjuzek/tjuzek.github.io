# tjuzek.com - personal site

Static, dependency-free site (plain HTML/CSS). No build step. Optimised as the canonical
hub for this work and for search/LLM discoverability.

## Preview locally
```bash
cd tjuzek-website
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy
**Option A: GitHub Pages (current setup; free, durable):**
1. Create a repo (e.g. `tjuzek/tjuzek.github.io`, or any repo with Pages enabled).
2. Commit and push the contents of this folder (the `CNAME` file is included).
3. Repo → Settings → Pages → set the source branch.
4. Point DNS for `tjuzek.com` at GitHub Pages at your registrar:
   - Apex `A` records → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - (and `AAAA` → `2606:50c0:8000::153` … `8003::153`); or `www` `CNAME` → `tjuzek.github.io`.
   - Confirm current values in GitHub Pages docs.

**Option B: any static host:** upload these files to the web root.

## Maintenance notes
- `/now/` is a snapshot page: on update, REPLACE section content (git history is the
  archive), never append dated entries; then bump the visible date, the footer date, the
  JSON-LD `dateModified`, and the sitemap `lastmod` together. See the comment in
  `now/index.html`.
- `/phd/` is also a snapshot for its status: each admissions cycle (September), or whenever
  funding changes, REPLACE the "In short" box (status, funding, deadline) and the "as of"
  dates, re-check every link under "How to apply" and "Eligibility" (US and Florida rules
  change often), then bump the footer date, the JSON-LD `dateModified`, and the sitemap
  `lastmod`. FSU students are routed to `teaching.html#students`, not to `/phd/`. See the
  comment in `phd/index.html`.
- `/lin3042/` (from 2026-10-07) is a data-driven course page: what is coming up in LIN 3042,
  Fall 2026 (open take-home assignments, the next quiz, the next two sessions). Every date
  lives in `lin3042/data.js`; a routine update edits that file only, and its `updated` field
  sets the visible "Last updated" date (the exception to the policy below). The page works
  out today's date itself; `?today=YYYY-MM-DD` previews another day. Procedure and drift
  checklist: `~/claudecode/lin3042/course/course-page/README.md`.
- `/lin3042/priming/` (from 2026-10-12) is a self-contained class demo: a two-minute lexical
  decision task with semantic priming (textbook Figure 11.2). Items and scoring live in
  `priming.js`, the runner in `index.html`; nothing is stored or sent. Design notes, item list
  and class run sheet: `~/claudecode/lin3042/course/modules/priming-demo/README.md`.
  `priming/items/` (from 2026-10-20) lists every item for review in class; it renders from
  `../priming.js`, so it needs no edit when an item changes.
- `/lin3042/linck/` (from 2026-10-20) is the same kind of demo: toy versions of the four tasks in
  Linck, Kroll & Sunderman (2009), namely translation recognition, verbal fluency, reading span
  and the Simon task, with colour-coded conditions. A hub (`linck/`, what each task is for) and one
  page per task (`translation/`, `verbal/`, `reading-span/`, `simon/`, each naming its task in
  `<body data-task>`). Shared: `linck.js` (items, scoring), `tasks.js` (runners), `linck.css`.
  Nothing is stored or sent. Notes: `~/claudecode/lin3042/course/modules/linck-demo/README.md`.
- `/lin3042/confounds/` (from 2026-11-05) is an explainer, not an experiment: what "controlling for a
  confound" means, three ways (age bands, parallel regression lines, partialling out) on invented
  vitamins data, a sandbox, then the open data of Romeo et al. (2018) redone in the browser. Statistics
  in `confounds.js` (node-loadable), the Romeo data (CC0, 10 of 16 columns) in `romeo2018-data.js`,
  drawing in `index.html`. Nothing is stored or sent. Notes, checks (`check-confounds.js`) and the
  citation audit: `~/claudecode/lin3042/course/modules/confounds/`.
- `/lin3042/sleep/` (from 2026-11-04) is a listening demo: sleep EEG played 100, 200 or 400 times faster
  (audification), after a student question. Five stage clips, a whole night with its hypnogram, and three
  clips to guess; each clip downloads as a WAV made in the browser at the selected speed, the night as its MP3. The runner is `sleep.js`; the data in `sleep/data/` (16-bit clips at 100 Hz, `night.mp3`,
  `meta.json`) are BUILT, never hand-edited: `~/claudecode/lin3042/course/modules/sleep-sound/code/build_sleep.py`.
  The recordings are Sleep-EDF Expanded (PhysioNet), licensed ODC-By 1.0, not CC0; the page and its footer
  say so. Nothing is stored or sent. Notes: `~/claudecode/lin3042/course/modules/sleep-sound/README.md`.
- `/bruce/` (from 2026-11-12) is an unlisted personal tool, not part of the academic site: a phone
  calorie tally for Tommie's dog (a day planner, corned beef or chicken day, that tops up with kibble
  to the 700 to 750 kcal band; tiles for what she ate; grams to kcal and back; what is left, in grams;
  a walk credit; weigh-ins). `noindex, nofollow`, not in the sitemap, `llms.txt` or the nav,
  linked from no page, no analytics, and deliberately no `robots.txt` line (a Disallow would advertise
  the path and hide the noindex from crawlers). Food values and day types live in `bruce/foods.js`, the
  only file a routine change touches. The log stays in the phone's browser (`localStorage`); nothing is sent.
  `?today=YYYY-MM-DD` previews another day on a separate test store. The page is in Dutch (`nl-BE`,
  Flemish word choices, decimal commas) at Tommie's request (2026-11-12), the one exception to the en-GB
  house style; code comments stay English. Notes and derivations:
  `~/claudecode/bruce-diet/README.md` (not served).
- Press record: the JSON-LD `ItemList` in `talks-press.html` is the record; the visible
  chips are a curated subset of it ("Selected coverage" plus a collapsed full list).
  Syndicated reprints: one story, one entry.
- House style: UK English (`en-GB`); no em-dashes in served files; hedged register on
  AI-and-language claims (association, not causation). Two documented exceptions to the
  em-dash rule: the talk *What Is Left to Write?* (`talks/2026-left-to-write/` and its slides), a
  talk about the mark itself, where it appears only as the object of study and in the talk's title;
  the talk *Copy, Contract, Tilt* (`talks/2026-copy-contract-tilt/` and its slides, from 2026-11-12), likewise
  about the mark, where the glyph appears only as the object of study (the title slide's gold dash, a quoted
  example, the toy model's tokens); and `/human-baseline-collective/` (from 2026-10-25, at Tommie's request; at `/human-baseline/`
  until 2026-10-30), an openly AI-drafted page with the
  AI disclaimer first, whose em dashes and "X, not Y" contrasts are deliberate. Do not "fix" them.
  (The temporary home-page banner pointed there until 2026-10-19, then to the Carothers lecture PDF
  `talks/2026-carothers/2026-Carothers-Lecture.pdf` until 2026-11-12; since 2026-11-13 it points to
  `talks/2026-copy-contract-tilt/`, at Tommie's word. It has no em dash.)
- Talk pages (from 2026-09-30): `talks/<year>-<slug>/` is the talk's landing page (phone first:
  slides, reading, anything the audience needs); `talks/<year>-<slug>/slides/` is the deck. Flat,
  one folder per talk, the year as prefix so a rerun in a later year gets its own record. Each is
  published by rsync from its source folder, never with `--delete`, so the two do not touch.
  `talks/left-to-write/` is a redirect stub (`noindex`) to the 2026 slides, keeping the slide hash.
- `talks/2026-copy-contract-tilt/` (from 2026-11-12) is the maths seminar talk of 13 November 2026, **unlisted for
  now at Tommie's request**: landing page and slides both `noindex`, not in the sitemap, `llms.txt`, talks-press or
  the banner, linked from no page. Since 2026-11-13 the home banner links the landing page (Tommie's word); the rest
  waits for him: landing to `index, follow`, a talks-press item, a sitemap entry. Source: `~/claudecode/maths-data-science-talk/talk/` (`landing/`, `deck/`;
  its README has the rsync commands). Deck assets carry a `?v=` version: bump it in the source on every republish.
- `/human-baseline-collective/` (from 2026-10-25) is an unlisted pitch page for a planned
  research podcast run by the Human Baseline Collective (so far Tommie, Matt Patience of FSU,
  and Yuri Bizzoni of Aarhus), written for anyone joining: `noindex`, not in the sitemap,
  `llms.txt` or the nav, and linked from no page. It began as a proposal for Yuri Bizzoni at
  `/human-baseline/`; it moved on 2026-10-30, and that path is now a redirect stub (`noindex`).
  Its print stylesheet was tuned towards two pages at 13 pt, but length is no longer a hard limit
  (Tommie, 2026-10-25). Planning notes behind it live in `~/claudecode/podcast/`. Replace it with
  a proper show page, or remove it, if the podcast launches.
- "Last updated" policy (decided 2026-08-14): the visible footer date and the JSON-LD
  `dateModified` track the last CONTENT change (what a reader means by "updated"); the
  sitemap `lastmod` tracks the last file change (what a crawler needs for recrawl).
  Plumbing-only edits (JSON-LD, meta tags, scripts) bump only the sitemap.
- The talks-press `ItemList` records coverage of the research; visible chips are a curated
  subset of it. Expert-commentary appearances stay out of the ItemList unless the piece
  credits the research itself (the two Economist reprints qualify; NBC News deliberately
  does not). Syndicated reprints: one story, one entry.
- Affiliation wording reflects the Scientific Computing move (Aug 2026).

## Built-in discoverability (GEO/SEO)
- `JSON-LD` Person entity (in `index.html`) with `sameAs` → unifies the identity for Google & LLMs.
- `robots.txt` explicitly **allows** AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot).
- `sitemap.xml`, `llms.txt`, keyword-tuned titles/descriptions, and extractable name↔term↔claim prose.
- The site is registered in Google Search Console; resubmit `sitemap.xml` after structural changes.

## Files
`index.html` · `research.html` · `teaching.html` · `talks-press.html` · `now/index.html` · `phd/index.html`
· `lin3042/` (course page: `index.html`, `data.js`, the schedule PDF; `papers/`, the article guide; `priming/`, the priming demo; `linck/`, the Linck et al. tasks; `confounds/`, the confounds explainer) · `404.html` · `style.css` · `robots.txt` · `sitemap.xml` · `llms.txt` · `CNAME` ·
`.nojekyll` · `talks/2026-left-to-write/` (landing page for the MLL colloquium talk of 1 October 2026,
in the sitemap; source in `~/claudecode/wk-talk/talk/landing/`) and its `slides/` (the deck; `noindex`,
not in the sitemap; source in `~/claudecode/wk-talk/talk/deck/`) · `talks/left-to-write/` (redirect stub
to the slides' old address) · `talks/2026-copy-contract-tilt/` (the maths seminar talk of 13 November 2026:
landing page and `slides/`, both `noindex` and unlisted for now; source in `~/claudecode/maths-data-science-talk/talk/`) · `talks/2026-carothers/` (the Carothers lecture slides as a PDF, 20 October 2026; linked from the home banner, not in the sitemap) · `human-baseline-collective/` (unlisted podcast pitch
for the Human Baseline Collective, from 25 October 2026; `noindex`, not in the sitemap; notes in
`~/claudecode/podcast/`) · `human-baseline/` (redirect stub to it, from 30 October 2026) · `bruce/` (unlisted
dog-calorie tally, from 12 November 2026: `index.html`, `foods.js`, `manifest.webmanifest`; `noindex`, not in the sitemap) · images (`share-card.jpg`, `sunset-banner.jpg`, `thomas-stephan-juzek.jpg`,
`tommie-juzek.jpg` and its `-384`/`-768` derivatives, `thomas-juzek-avatar.jpg`,
`favicon.ico`, `apple-touch-icon.png`)

## Licence

- **Code** (HTML, CSS, JS): MIT No Attribution (MIT-0). See [`LICENSE`](LICENSE). Use it freely, no attribution required.
- **Site content / text**: CC0 1.0 Universal (public domain dedication). See [`LICENSE-DATA`](LICENSE-DATA).
- **Exceptions (third-party files keep their own licences)**: in `talks/2026-left-to-write/slides/` (also used by the landing page one level up), reveal.js is MIT
  (notice in `assets/reveal/LICENSE`), the Newsreader and Inter fonts are SIL OFL 1.1 (texts in `assets/fonts/`),
  and the image of Gerhard Richter's *Spiegel, Grau* (1991) is © Gerhard Richter, used under the National Galleries
  of Scotland personal-use licence with credit and a link to the artwork page. In `talks/2026-copy-contract-tilt/slides/`
  (also used by its landing page), reveal.js is MIT (notice in `assets/reveal/LICENSE`) and the Newsreader and
  Inter fonts are SIL OFL 1.1 (texts in `assets/fonts/`). None of these is MIT-0 or CC0.

If you reuse anything here, a credit or a link back to [tjuzek.com](https://tjuzek.com) is appreciated, though not required.

## AI Assistance

Repository polished with Claude Code.
