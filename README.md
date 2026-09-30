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
- Press record: the JSON-LD `ItemList` in `talks-press.html` is the record; the visible
  chips are a curated subset of it ("Selected coverage" plus a collapsed full list).
  Syndicated reprints: one story, one entry.
- House style: UK English (`en-GB`); no em-dashes in served files; hedged register on
  AI-and-language claims (association, not causation). One documented exception to the
  em-dash rule: the talk *What Is Left to Write?* (`talks/2026-left-to-write/`, its slides, and
  the temporary home-page banner that points to it), a talk about the mark itself, where it
  appears only as the object of study and in the talk's title.
- Talk pages (from 2026-09-30): `talks/<year>-<slug>/` is the talk's landing page (phone first:
  slides, reading, anything the audience needs); `talks/<year>-<slug>/slides/` is the deck. Flat,
  one folder per talk, the year as prefix so a rerun in a later year gets its own record. Each is
  published by rsync from its source folder, never with `--delete`, so the two do not touch.
  `talks/left-to-write/` is a redirect stub (`noindex`) to the 2026 slides, keeping the slide hash.
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
· `404.html` · `style.css` · `robots.txt` · `sitemap.xml` · `llms.txt` · `CNAME` ·
`.nojekyll` · `talks/2026-left-to-write/` (landing page for the MLL colloquium talk of 1 October 2026,
in the sitemap; source in `~/claudecode/wk-talk/talk/landing/`) and its `slides/` (the deck; `noindex`,
not in the sitemap; source in `~/claudecode/wk-talk/talk/deck/`) · `talks/left-to-write/` (redirect stub
to the slides' old address) · images (`share-card.jpg`, `sunset-banner.jpg`, `thomas-stephan-juzek.jpg`,
`tommie-juzek.jpg` and its `-384`/`-768` derivatives, `thomas-juzek-avatar.jpg`,
`favicon.ico`, `apple-touch-icon.png`)

## Licence

- **Code** (HTML, CSS, JS): MIT No Attribution (MIT-0). See [`LICENSE`](LICENSE). Use it freely, no attribution required.
- **Site content / text**: CC0 1.0 Universal (public domain dedication). See [`LICENSE-DATA`](LICENSE-DATA).
- **Exceptions (third-party files keep their own licences)**: in `talks/2026-left-to-write/slides/` (also used by the landing page one level up), reveal.js is MIT
  (notice in `assets/reveal/LICENSE`), the Newsreader and Inter fonts are SIL OFL 1.1 (texts in `assets/fonts/`),
  and the image of Gerhard Richter's *Spiegel, Grau* (1991) is © Gerhard Richter, used under the National Galleries
  of Scotland personal-use licence with credit and a link to the artwork page. None of these is MIT-0 or CC0.

If you reuse anything here, a credit or a link back to [tjuzek.com](https://tjuzek.com) is appreciated, though not required.

## AI Assistance

Repository polished with Claude Code.
