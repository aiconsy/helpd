# HelpD — Factory Floor Support

A polished, real-time production-issue tracking web app for factory teams.
Workers report problems from the floor, First Line Support reacts, and administrators analyze the whole operation — all in one lightweight, multilingual Next.js app.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Faiconsy%2Fhelpd&project-name=helpd&repository-name=helpd)

## Highlights

- **3 role-focused dashboards**: Worker, First Line Support (FLS), Administrator — all sharing the same live data.
- **Real-time issue timers** that keep ticking across every view.
- **4 built-in languages**: English, German, Spanish, Italian (via `next-intl`).
- **Works offline** — PWA-ready with a generated service worker (`next-pwa`).
- **Admin analytics**: KPIs, issues by category, issues by station, JSON export, reseed/reset demo data.
- **Zero backend** required — data is persisted in `localStorage`, perfect for demos and stakeholder walkthroughs.

## Screens

- `/` → redirects to the user's default locale.
- `/{locale}` → landing page with live stats and role cards.
- `/{locale}/worker` → report issues, start/stop timers, add notes.
- `/{locale}/fls` → monitor, filter, resolve, and escalate issues.
- `/{locale}/admin` → KPIs, charts, per-station breakdown, data tools.

Supported locales: `en`, `de`, `es`, `it`.

## Tech stack

- **Next.js 14** (App Router, React 18, TypeScript)
- **Tailwind CSS** with custom design tokens and animations
- **next-intl** for i18n
- **next-pwa** for offline/installable support
- **lucide-react** for iconography
- **Inter** as the primary typeface

## Getting started

Requirements: **Node.js 18+** and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000 — the landing page auto-seeds realistic demo data on first visit.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server on port 3000 |
| `npm run build` | Production build (static/ISR-ready) |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint (`next/core-web-vitals`) |

### Project structure

```
app/
  layout.tsx              # Root layout + Inter font + metadata
  page.tsx                # Redirects to /en
  [locale]/
    layout.tsx            # Header with logo + language switcher + footer
    page.tsx              # Redesigned landing page
    worker/page.tsx       # Worker dashboard
    fls/page.tsx          # FLS dashboard
    admin/page.tsx        # Admin dashboard with analytics
components/
  LanguageSwitcher.tsx    # Accessible dropdown, 4 locales
lib/
  issues.ts               # Typed shared storage (load/save/update/subscribe) + demo seeding
messages/
  en.json de.json es.json it.json
public/
  manifest.json icon-*.png
```

## Demo data & presentation controls

The landing page and the Admin dashboard include:

- **Reseed demo data** — resets storage to a rich, realistic demo dataset (active, escalated, resolved issues).
- **Reset all data** — clears everything for a fresh walkthrough.
- **Export JSON** (Admin) — downloads the current issue history.

All three roles read/write through `lib/issues.ts`, so changes in one view instantly appear in the others — even in the same tab (via a custom `helpd:issues-updated` event) and across tabs (via the `storage` event).

## Deploy

This app is pure client-side — no environment variables, no database, no backend service.

### One-click on Vercel

Click the badge at the top of this README. Vercel will import the repo, detect Next.js automatically, and deploy on the default settings.

### Manual

```bash
npm run build
npm run start
```

Or deploy the output to any Node.js-compatible host.

## License

MIT.
