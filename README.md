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
- Press record: the JSON-LD `ItemList` in `talks-press.html` is the record; the visible
  chips are a curated subset of it ("Selected coverage" plus a collapsed full list).
  Syndicated reprints: one story, one entry.
- House style: UK English (`en-GB`); no em-dashes in served files; hedged register on
  AI-and-language claims (association, not causation).
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
`index.html` · `research.html` · `teaching.html` · `talks-press.html` · `now/index.html`
· `404.html` · `style.css` · `robots.txt` · `sitemap.xml` · `llms.txt` · `CNAME` ·
`.nojekyll` · images (`share-card.jpg`, `sunset-banner.jpg`, `thomas-stephan-juzek.jpg`,
`tommie-juzek.jpg` and its `-384`/`-768` derivatives, `thomas-juzek-avatar.jpg`,
`favicon.ico`, `apple-touch-icon.png`)

## Licence

- **Code** (HTML, CSS, JS): MIT No Attribution (MIT-0). See [`LICENSE`](LICENSE). Use it freely, no attribution required.
- **Site content / text**: CC0 1.0 Universal (public domain dedication). See [`LICENSE-DATA`](LICENSE-DATA).

If you reuse anything here, a credit or a link back to [tjuzek.com](https://tjuzek.com) is appreciated, though not required.

## AI Assistance

Repository polished with Claude Code.
