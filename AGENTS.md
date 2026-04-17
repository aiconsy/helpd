# AGENTS.md

## Cursor Cloud specific instructions

### Overview

HelpD is a self-contained Next.js 14 multilingual logistics support app (TypeScript + Tailwind CSS). All data is persisted in the browser's `localStorage` — there is no backend, database, or external API. The single service is the Next.js dev server.

### Running the app

- `npm run dev` starts the dev server on `http://localhost:3000`
- Routes: `/en/worker`, `/en/fls`, `/en/admin` (also `/de`, `/es`, `/it` locales)
- No environment variables are required.

### Lint / Build / Test

- `npm run lint` — ESLint (requires `.eslintrc.json` with `"extends": "next/core-web-vitals"`)
- `npm run build` — production build
- No automated test suite exists; manual testing via the browser is the primary method. See the README `Testing` section for guidance.

### Shared data model

- All pages read/write issues via `lib/issues.ts` (`loadIssues`, `saveIssues`, `updateIssue`, `subscribeIssues`).
- `subscribeIssues` listens to both cross-tab `storage` events AND a same-tab `helpd:issues-updated` custom event, so Worker/FLS/Admin stay in sync even in the same tab.
- `seedDemoIssues()` is called once from the landing page; pass `force: true` to reseed (used by the "Reseed demo" buttons). `resetIssues()` clears all stored issues.

### Tailwind safelist

- `tailwind.config.js` safelists dynamic `from-*`/`to-*` color utilities for issue-type gradients, because those classes are composed at runtime in `DEFAULT_ISSUE_TYPES` (in `lib/issues.ts`). If you add a new gradient color family, extend the safelist regex.

### Caveats

- The first time `npm run lint` is invoked without an `.eslintrc.json`, Next.js prompts interactively for ESLint config. The `.eslintrc.json` in the repo root prevents this.
- `next-pwa` generates `public/sw.js` and related service-worker files during build. These are gitignored.
- The `next-intl` deprecation warning about `./i18n.ts` during build is cosmetic and does not affect functionality.
- Vercel deploys work with zero config — no env vars, no external services. The app is 100% client-side.
