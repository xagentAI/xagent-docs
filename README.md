# X-Agent Docs

Official docs site for **X-Agent** — Litepaper + documentation.
Trilingual: **English · 한국어 · 日本語**. Built with [Nextra 4](https://nextra.site) (Next.js App Router).

## Dev

```bash
npm ci          # Node 24 LTS (.nvmrc)
npm run dev      # http://localhost:3000
```

## Content

All content is MDX under `content/`:

```
content/en   English (source of truth)
content/ko   한국어
content/ja   日本語
```

Each language's Litepaper is a single page: `content/<lang>/litepaper.mdx`.

## Verification

```bash
npm run format:check
npm run lint
npm run test:last-updated
npm audit
npm run build          # also builds the Pagefind search index
npm run types:check
npm run start -- --hostname 127.0.0.1 --port 3100
# In a second terminal:
npm run test:smoke
```

CI runs these checks for pull requests and `main`. The smoke suite covers all
registered language routes, error responses, update dates, locale redirects,
search assets, and the original audit PDF. Search requires a production build;
run `npm run build` before testing it locally. Generated `public/_pagefind` files
are build artifacts, not source files.

## Deploy

Netlify (auto-deploys on push to `main`) → https://docs.xagt.ai
