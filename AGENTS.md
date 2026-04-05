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

### Caveats

- The first time `npm run lint` is invoked without an `.eslintrc.json`, Next.js prompts interactively for ESLint config. The `.eslintrc.json` in the repo root prevents this.
- `next-pwa` generates `public/sw.js` and related service-worker files during build. These are gitignored.
- The `next-intl` deprecation warning about `./i18n.ts` during build is cosmetic and does not affect functionality.
