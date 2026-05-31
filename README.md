# tjuzek.com — personal site

Static, dependency-free site (plain HTML/CSS). No build step. Optimized as the canonical
hub for your work and for search/LLM discoverability.

## Preview locally
```bash
cd tjuzek-website
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy
**Option A — GitHub Pages (recommended; free, durable):**
1. Create a repo (e.g. `tjuzek/tjuzek.github.io`, or any repo with Pages enabled).
2. Commit and push the contents of this folder (the `CNAME` file is included).
3. Repo → Settings → Pages → set the source branch.
4. Point DNS for `tjuzek.com` at GitHub Pages at your registrar:
   - Apex `A` records → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - (and `AAAA` → `2606:50c0:8000::153` … `8003::153`); or `www` `CNAME` → `tjuzek.github.io`.
   - Confirm current values in GitHub Pages docs.

**Option B — your existing tjuzek.com host:** just upload these files to the web root.

## Fill-ins (search for `TODO` in the files)
- **ORCID:** once created, add it to the links row + JSON-LD `sameAs` in `index.html`.
- **Press URLs:** add article links for Newsweek / Reuters Institute / Minnesota Star Tribune
  in `index.html` and `talks-press.html`.
- **Headshot:** `tom-juzek-3.jpg` is wired into the hero (swap if you want a different crop).
- **Affiliation:** wording reflects the Scientific Computing move (Aug 2026); adjust as needed.

## Built-in discoverability (GEO/SEO)
- `JSON-LD` Person entity (in `index.html`) with `sameAs` → unifies your identity for Google &amp; LLMs.
- `robots.txt` explicitly **allows** AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot).
- `sitemap.xml`, `llms.txt`, keyword-tuned titles/descriptions, and extractable name↔term↔claim prose.
- After deploy: add the site to **Google Search Console** and submit `sitemap.xml`.

## Files
`index.html` · `research.html` · `publications.html` · `teaching.html` · `talks-press.html`
· `style.css` · `robots.txt` · `sitemap.xml` · `llms.txt` · `CNAME` · `tom-juzek-3.jpg`

## Licence

- **Code** (HTML, CSS, JS): MIT No Attribution (MIT-0). See [`LICENSE`](LICENSE). Use it freely, no attribution required.
- **Site content / text**: CC0 1.0 Universal (public domain dedication). See [`LICENSE-DATA`](LICENSE-DATA).

If you reuse anything here, a credit or a link back to [tjuzek.com](https://tjuzek.com) is appreciated, though not required.

## AI Assistance

Repository polished with Claude Code.
