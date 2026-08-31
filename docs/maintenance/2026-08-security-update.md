# August 2026 documentation security maintenance

Owner: X-Agent Docs maintainers. Implementation and verification: Codex, approved by the user on 2026-08-31.

## Scope and acceptance

- Preserve approved multilingual documentation, token terms, audit PDF bytes, and existing untranslated-route fallbacks.
- Upgrade to current stable compatible releases, including major versions when supported; refresh vulnerable transitive dependencies. Keep Nextra and its theme on matching versions. Use Node 24 LTS and matching Node types for deployment.
- Require zero reported npm advisories, a reproducible clean install/build, type checks, route checks, and browser regression checks before publishing.
- Test every document route, locale switching, missing assets, search, timestamps, and the audit download. No changes to contracts, allocations, login, databases, or infrastructure ownership.

## Findings and decisions

The previous lockfile has 5 high and 2 moderate dependency advisories. Next.js 16.3.3 is the stable security release; Nextra 4.6.1 supports Next.js >=14 and React >=18. This does not change the application architecture.

TypeScript 7.0.2 was tested and rejected: Nextra's Twoslash dependency supports TypeScript 5.5 or 6, and all MDX compilation failed because TypeScript 7 no longer provides the expected compiler API. Use the latest supported TypeScript 6.0.3, removing the unused deprecated `baseUrl` option. Re-evaluate TypeScript 7 when Nextra/Twoslash officially support it; do not patch dependencies or bypass the build gate.

Zod 4.5.4 was also tested and rejected: Nextra's Layout removes `children` before validating its configuration, but the new Zod custom-schema behavior then rejects it as nonoptional during prerendering. Preserve the existing Zod 4.3.6 compatibility override (no reported npm advisories) until the upstream theme supports newer Zod behavior.

The aggregate Next.js lint configuration still depends on plugins whose peer ranges exclude ESLint 10. The new lint setup instead uses compatible, current official ESLint JS, TypeScript, Next.js and React Hooks rules directly, with warnings fatal and no compatibility shims or peer-dependency bypass. Pagefind is the official Nextra search integration (MIT, maintained by Pagefind), build-time only; its output is excluded from Git and rebuilt per deployment.

A clean install revealed an additional upstream deprecation: `speech-rule-engine` pins `@xmldom/xmldom` 0.9.10, marked by its publisher as having critical issues despite the audit database reporting zero advisories. Override only that dependency to the current 0.9.12 patch. Nextra still requires the renamed/deprecated MathJax 3 package; do not force an incompatible MathJax 4 replacement under it.

Runtime checks also reproduced missing asset requests returning 500, and a missing Pagefind search bundle. Nextra resolves the locale before its missing-page handler, so unknown locale segments must be rejected before calling it. Locale preference cookies are untrusted and must be checked against the locale allowlist. The existing timestamp wrapper also depends on Nextra metadata to mount; pass the per-document timestamp into page metadata so new files do not lose their footer.

Public inputs are document paths, locale preferences and search terms. The site is public/read-only: no application credentials, wallets, transactions or private data are involved. Keep error pages free of exception details; keep downloads same-origin and byte-identical. No vulnerability suppression or force-upgrade fallback is approved.

## Verification and rollout

Use `npm ci`, `npm run test:last-updated`, `npm run build`, `npm run types:check`, `npm audit`, and the HTTP smoke suite against a running production build. Verify keyboard navigation, English/Japanese/Korean search and switching, download, and responsive layout using the in-app browser.

Publish through the repository's existing GitHub-to-Netlify pipeline only after gates pass. Verify the production commit, live HTML and PDF checksum. No database migration is required. Previous production baseline: `5e2b38a941c281247751f2bd94d4f0b4538de96f`. If a deployment fails, keep the last successful deploy serving; if post-release regression requires rollback, use the prior Netlify deploy or revert the release merge with owner approval. That baseline has the recorded dependency advisories, so a forward fix is preferred.

## Pre-release evidence (2026-08-31)

- Clean `npm ci` on Node 24.20.0, format check, ESLint (zero warnings), TypeScript, locale manifest, and production build passed. Two timestamp unit tests and all 51 HTTP regression tests passed.
- Full npm audit: zero advisories (production and development dependencies). No forced installs or audit suppression. The remaining MathJax package rename notice is not an audit finding.
- In-app browser: Korean/Japanese/English search returned localized results; selecting a result and switching language retained the intended document; keyboard search selection navigated to its section. No console errors were observed.
- Japanese contract page at 390×844: no horizontal overflow, accessible main-link text/image alternatives, and visible localized update date. Browser PDF download event was received on the final Korean contract page; downloaded HTTP bytes match the original SHA-256 in the smoke test.
- All three Litepaper source files are unchanged from the approved production baseline. Token terms, allocation visibility, and whitepaper download policy are preserved.
- Production deployment and live smoke results must be verified separately after merging; this evidence describes the release candidate, not the live site.

The first Netlify preview passed 50/51 smoke tests: the audit PDF was byte-accessible, but its attachment header was absent because static CDN delivery bypasses Next.js headers. Add an exact-path CDN header rule in `netlify.toml`, retaining the Next.js rule for local/other hosts, then rerun the same unchanged suite against the replacement preview before production.

## Sources

- [Next.js 16.3.3 security release](https://github.com/vercel/next.js/releases/tag/v16.3.3)
- [Nextra search setup](https://nextra.site/docs/guide/search)
- [Nextra internationalized routing](https://nextra.site/docs/guide/i18n)
