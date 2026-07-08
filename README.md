# X-Agent Litepaper

Multi-language documentation / litepaper site for **X-Agent**, built with
[Nextra 4](https://nextra.site) + Next.js App Router.

- **Stack:** Next.js 16 (App Router) · Nextra 4 · React 19
- **Locales:** `en` (default) · `ko` (한국어) · `zh` (中文)
- **Theme:** forced light / pure white (`darkMode={false}`, dark toggle hidden)
- **Deploy target:** Vercel

## Local development

Requires Node.js v24+ and npm (this project uses **npm**, not pnpm).

```bash
npm install
npm run dev      # http://localhost:3000  (redirects to /en)
```

Other scripts:

```bash
npm run build    # production build
npm run start    # serve the production build locally
```

## Project layout

```
app/[lang]/                     App Router shell (layout, catch-all page, 404)
  layout.tsx                    Navbar + Layout config (logo, GitHub link, locales)
  [[...mdxPath]]/page.tsx       Renders MDX from content/
content/
  en/                           English — full litepaper (source of truth)
    index.mdx                   Homepage / intro
    whitepaper/                 Chapters 1–7 (order set in _meta.js)
  ko/                           Korean  — placeholder only
  zh/                           Chinese — placeholder only
mdx-components.js               MDX component mapping (required by Nextra)
next.config.mjs                 Nextra + i18n config
proxy.ts                        Locale routing (Next 16 middleware/proxy)
```

## Adding Korean / Chinese content

The Korean and Chinese trees are stubbed on purpose — only `index.mdx` +
`_meta.js` exist so far.

To fill them in, mirror the English structure:

1. **Korean** → put translated files under `content/ko/`.
2. **Chinese** → put translated files under `content/zh/`.

For each locale:

- Replace `content/<locale>/index.mdx` with the translated homepage.
- Create `content/<locale>/whitepaper/` with the seven chapter `.mdx` files
  (same filenames as `content/en/whitepaper/`).
- Uncomment / add the `whitepaper: 'Litepaper'` line in
  `content/<locale>/_meta.js` and create `content/<locale>/whitepaper/_meta.js`
  to order the chapters (copy from `content/en/whitepaper/_meta.js` and
  translate the titles).

Missing pages in a locale simply won't appear in that language's sidebar — the
site still builds. The navbar language switcher (English / 한국어 / 中文) is
already wired up in `app/[lang]/layout.tsx`.

## Deploy to Vercel

1. Push this repo to `https://github.com/xagentAI/xagent-litepaper`.
2. In Vercel, **New Project → Import** the repo.
3. Framework preset: **Next.js** (auto-detected). Build command `next build`,
   install command `npm install`. No env vars required.
4. Deploy.

> Note: this site uses Nextra's i18n middleware (`proxy.ts`), so **do not** add
> `output: 'export'` — static export is incompatible with the locale
> middleware. Vercel's default Next.js runtime handles it out of the box.
