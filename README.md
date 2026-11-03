# Picho-RPG · Front-end

> Tabletop RPG companion for players and Game Masters: world, NPCs, bestiary, quests, sessions, library and maps for the table, plus a combat tracker, procedural generators and AI helpers for the GM.

<p>
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue.svg" /></a>
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white" />
  <img alt="Ant Design" src="https://img.shields.io/badge/Ant_Design-6-0170FE?logo=antdesign&logoColor=white" />
  <img alt="PWA" src="https://img.shields.io/badge/PWA-installable-5A0FC8?logo=pwa&logoColor=white" />
  <img alt="Status" src="https://img.shields.io/badge/status-active-success" />
</p>

This repository hosts the **web client** of [Picho-RPG](https://picho.org). It pairs with the API [`phantasy-star-rpg`](https://github.com/pichosof/phantasy-star-rpg) (Fastify + Drizzle + SQLite), which also runs the campaign's Discord bot. The web app is a **PWA** that works on desktop, tablet and mobile, with a dedicated mobile-first shell built on `antd-mobile`.

**Try it:** a read-only [public demo](https://pichosof.github.io/phantasy-star-rpg.front/) runs entirely in the browser with mocked data. No backend needed.

---

## Why Picho-RPG?

Running a tabletop campaign means juggling spreadsheets, PDF rulebooks, NPC notes, hand-drawn maps and Discord screenshots. Picho-RPG puts it in one place:

- **For players**: the world as their characters know it (cities, NPCs, creatures they've met), the quest log, the session diary, the timeline, the world map, their character sheet and progress, and a shared library of rulebooks.
- **For the GM**: every player view plus a private layer: hidden and undiscovered entities, GM secrets on NPCs, notes, an image gallery, sheet management, a combat tracker, procedural generators, an item catalogue with prices and loot, AI portraits and AI session summaries.

Themes are based on the **Phantasy Star** universe (_Motavia_ for light, _Dezolis_ for dark), but the core platform works for any TTRPG.

---

## Features

### For the whole table

- 🌍 **World, cities, dungeons, NPCs, bestiary**: entity pages with images, tags, visibility and "discovered" flags. Entities the party hasn't found yet stay hidden or redacted.
- 🔗 **Wiki-style links**: write `[[Piata]]` or `[[Rook|the soldier]]` in any Markdown field. Links open a quick peek, and each entity gets **Appears in** and **History** tabs built from the mentions.
- 🔎 **Global search** across every entity, names first, then text.
- 📜 **Quests, sessions, timeline**: campaign progression, with a session diary and per-player rewards (XP and credits).
- 🗺️ **Map**: pannable world map with markers for cities and dungeons, GM placement controls, presentation mode and a ruler.
- 🧾 **Players and sheets**: rule-system-aware character sheets (Starfinder, GURPS with GCA import, Hephaistos import) and a progress history per player.
- 📦 **Items**: the player-facing item catalogue (the GM's pricing and loot data never reaches players).
- 📚 **Library**: read rulebooks and handouts in the browser: PDF, DOCX, EPUB, MOBI (converted to EPUB by the API), TXT/MD, XLS/XLSX, CSV, PPT/PPTX. Each viewer has its own toolbar (search, zoom, theme, table of contents).
- 🎲 **Dice roller**: visual dice picker with formula preview, roll history and replay.
- 📱 **PWA**: installable, offline-aware (Workbox 7 service worker), background updates.
- 🌗 **Themes**: Motavia / Dezolis with persistent preference and optional automatic night mode.

### GM tools

- 🛡️ **GM mode**: gated panels and admin tabs, unlocked with the GM key against the API.
- 🗡️ **Combat tracker** (`/gm/combat`): initiative, Starfinder damage (Stamina, then Hit Points), conditions with round counters and a log. Every change is saved locally at once and synced to the API, so a dead battery or flaky Wi-Fi loses nothing. When another device (or a Discord `/encounter` command) saved first, the GM chooses which version to keep.
- 🎰 **Procedural generators** (`/gm/generators`): NPCs, shops, loot, encounters and contracts, tuned to the setting (world, city, culture). Each result comes from a seeded RNG over weighted tables and templates, and avoids repeating recent results. NPCs can be saved straight into the campaign, with their secret kept in the GM-only field.
- 🎨 **AI NPC portraits**: draft a prompt from style and race profiles, edit it, generate, and switch between earlier portraits. Optional; the buttons appear only when the API has the Fotor integration on.
- 📝 **AI session summary**: turn raw session notes into a linked Markdown summary for review. Optional, behind the API's Anthropic integration.
- 🔒 **GM secrets**: a separate field on NPCs that the API never sends to players (site, search or Discord).
- 🖼️ **Image focus**: set the focal point of an image so cropped cards keep the subject in frame. Cards load server-side WebP thumbnails; the full image opens in the lightbox.
- 💾 **Database backups** from the GM panel: download, back up now, and restore from a stored or uploaded backup.
- 📒 **GM notes, GM images, item catalogue admin, sheet manager.**

---

## Stack

| Layer           | Tech                                                                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Build & dev     | Vite 8 + `vite-plugin-pwa` + `vite-tsconfig-paths`                                                                                |
| Language        | TypeScript 6 (`moduleResolution: bundler`)                                                                                        |
| UI library      | React 19 + `react-dom` 19                                                                                                         |
| Component kits  | Ant Design 6 (desktop/tablet) + `antd-mobile` 5 (mobile)                                                                          |
| Styling         | `styled-components` 6 + Less themes                                                                                               |
| State           | Redux Toolkit 2 + `react-redux` 9                                                                                                 |
| Routing         | React Router 7                                                                                                                    |
| Data fetching   | Axios 1 (`axios-mock-adapter` for the demo)                                                                                       |
| File rendering  | `pdfjs-dist` + `@react-pdf-viewer`, `mammoth` (DOCX), `xlsx` (SheetJS), `react-reader` (EPUB), `@kandiforge/pptx-renderer` (PPTX) |
| Charts          | ECharts 6 + `echarts-for-react`                                                                                                   |
| Maps            | Leaflet + `react-leaflet`                                                                                                         |
| Lint / format   | ESLint 9 (flat config) + Prettier 3 + Stylelint, theme isolation and contrast checks                                              |
| Package manager | Yarn 3 (`packageManager` field, `nodeLinker: node-modules`)                                                                       |

---

## Quick start

### Requirements

- Node.js **22**
- Yarn 3 (handled automatically by `corepack`)
- The API running locally on `http://localhost:3010` (see [`phantasy-star-rpg`](https://github.com/pichosof/phantasy-star-rpg)). Not needed for the demo build.

### Install & run

```bash
corepack enable
yarn install
cp .env.example .env       # then edit values
yarn start                 # http://localhost:3000
```

The dev server binds to `0.0.0.0`, so you can also reach it from another device on the same Wi-Fi (e.g. `http://192.168.1.10:3000`) for mobile QA.

To run the mocked demo instead (no API): `yarn start:demo`.

### Available scripts

| Script                       | Description                                                        |
| ---------------------------- | ------------------------------------------------------------------ |
| `yarn start`                 | Build the Less themes and start the Vite dev server (port 3000).   |
| `yarn start:demo`            | Same, in demo mode (mocked API, read-only, no GM mode).            |
| `yarn build`                 | Production build into `build/`.                                    |
| `yarn build:demo`            | Demo build (what GitHub Pages serves).                             |
| `yarn preview`               | Serve the production build locally.                                |
| `yarn type-check`            | Run `tsc --noEmit` against the project.                            |
| `yarn lint`                  | ESLint with auto-fix.                                              |
| `yarn lint:styles`           | Stylelint over JS/TS files (styled-components).                    |
| `yarn format`                | Prettier on the whole repo.                                        |
| `yarn buildThemes`           | Compile `src/styles/themes/main.less` → `public/themes/main.css`.  |
| `yarn theme:check:strict`    | Fail on hard-coded colours outside the theme (runs in CI).         |
| `yarn theme:contrast:strict` | Fail on theme colour pairs below the contrast target (runs in CI). |

### Environment variables

Everything exposed to the client must be prefixed with `VITE_`. Defined in [`.env.example`](.env.example):

| Variable             | Purpose                                                       |
| -------------------- | ------------------------------------------------------------- |
| `VITE_API_BASE_URL`  | API URL. In dev, usually `http://localhost:3010`.             |
| `VITE_BASE_URL`      | Public base path of the SPA (empty for root).                 |
| `VITE_ASSETS_BUCKET` | Optional CDN/bucket for remote assets.                        |
| `VITE_UPLOAD_MAX_MB` | Max upload size; must match `MAX_UPLOAD_MB` on the API.       |
| `VITE_CLIENT_SECRET` | Shared secret with the API; must match `CLIENT_SECRET`.       |
| `VITE_SIMULATE_PROD` | When `true`, dev behaves like prod (e.g. auto-logout on 401). |

> ⚠️ Anything in `.env` is shipped to the browser. Never put server-only secrets here.

---

## Project layout

```
phantasy-star-rpg.front
├── public/                Static assets (favicons, themes, robots.txt, SWA config)
├── scripts/               Theme isolation/contrast checks, demo file generator
├── src/
│   ├── api/               Axios clients per domain (library, players, world…)
│   ├── assets/            Images and SVGs bundled with the app
│   ├── components/
│   │   ├── common/        Reusable UI (mobile/, EntityDrawer, EntityLinks, pdf/, pickers…)
│   │   ├── header/        Top navigation, search, settings, GM panel (backups)
│   │   ├── layouts/       Main / Profile / Auth layouts
│   │   └── rpg/           Domain widgets (PlayerCard, NpcPortrait, City, Session…)
│   ├── config/            Runtime config + env mapping
│   ├── constants/         Static maps, enums and route paths
│   ├── demo/              Demo mode: mocked API, fixtures, banner
│   ├── generators/        Seeded RNG engine, generators and their data tables
│   ├── hooks/             Custom hooks (useGMMode, useResponsive, …)
│   ├── pages/             Route-level components (one file per route)
│   │   └── gm/            GM-only routes (combat, generators, items, notes, images, sheets)
│   ├── store/             Redux Toolkit slices, store, middlewares
│   ├── styles/            GlobalStyle, theme constants, Less variables
│   └── utils/             Pure helpers (no React)
├── eslint.config.cjs      Flat ESLint config
├── tsconfig.json          + tsconfig.paths.json (alias `@app/*` → `src/*`)
├── vite.config.mts        Vite + PWA + tsconfig-paths
└── index.html             SPA entry point
```

Path alias: `@app/*` resolves to `src/*`. Prefer `@app/...` over relative `../../...` for cross-folder imports.

---

## 🔑 GM key

Picho-RPG has no user accounts. Players see the public view by default; the **Game Master** unlocks an extra layer with a single shared **GM key** managed by the API.

### How a GM unlocks the panel

1. Open the **settings dropdown** (gear icon in the header).
2. Click **GM mode** and paste the key handed to you by whoever set up the deployment.
3. The client calls `POST /api/auth/login` with the key, receives a short-lived JWT (default 8h), and stores it.
4. From then on the GM navigation appears (Lores admin, GM Notes, GM Images, GM Sheets, Combat, Generators, Items admin) and every entity drawer exposes its admin tab.
5. To "log out", turn GM mode off in the same dropdown: the JWT is dropped and the UI reverts to the player view.

### What's gated by the GM key

- All admin UIs (uploads, edits, visibility and discovered flags, deletions, portraits, backups).
- The `/lores` and `/gm/*` routes (they redirect to `/403` without it).
- The GM tabs inside entity drawers (Cities, Quests, Sessions, NPCs, Bestiary, Dungeons, Library settings, etc.).

The gate in the browser is for convenience. The real boundary is the API: GM endpoints require the JWT, and hidden data is filtered out of every player response before it leaves the server.

### Where the key actually lives

- The raw key is **only in the API env** (`GM_API_KEY`).
- The browser only ever holds a JWT signed by the API (`JWT_SECRET`), never the raw key.
- See the [API's GM key section](https://github.com/pichosof/phantasy-star-rpg#-gm-key) for how to generate, set and rotate it. The API enforces minimum strength (≥ 24 chars, 3 character classes) and throttles failed attempts per IP.

> ⚠️ Do not put the GM key in the front-end `.env`. The front-end only needs `VITE_API_BASE_URL` and `VITE_CLIENT_SECRET` (a soft sanity check, not the GM key).

---

## Architecture highlights

- **Mobile-first shell** for screens `< 768px`. Components in `src/components/common/mobile/` wrap `antd-mobile` primitives (`MobilePageScaffold`, `MobileEntitySheet`, `MobileFilterSheet`, `MobileActionBar`, `MobileForm`, `MobileList`, …). Pages keep one tree for desktop/tablet and one for mobile, picked via `useResponsive()`.
- **GM mode** is a client-side gate (`useGMMode()`) plus a route guard; the API enforces the same rules server-side.
- **Generators** are pure and reproducible: a seeded `mulberry32` RNG drives `pick`/`weighted`/`sample` over data tables in `src/generators/data/`, and templates with `[key]` slots and `{a|b}` variations multiply the combinations. A small history avoids showing the same result twice in a row.
- **Shared rules with the API.** The combat engine (`src/pages/gm/combat/combat-engine.ts`) and the Starfinder sheet math mirror files in the API, so the site and the Discord bot agree on every number. Change both together.
- **Offline-safe combat**: `useEncounterSync` writes to `localStorage` first, then saves to the API with the version it started from; a `409` means another device saved first.
- **PWA** via `vite-plugin-pwa` with `registerType: 'autoUpdate'`, manifest generated at build time, runtime caching for fonts, `/api/*` (network-first) and remote assets (stale-while-revalidate).
- **Theming** uses styled-components plus a precompiled Less theme in `public/themes/main.css` (Motavia/Dezolis variables). CI rejects hard-coded colours and low-contrast pairs.
- **Data layer** is per-domain Axios modules under `src/api/`. They throw a typed `ApiError` consumed by `apiErrorMessage()` for user-facing messages.
- **Demo mode** (`VITE_DEMO_MODE=true`) intercepts every API call with `axios-mock-adapter` and fixtures, shows a banner and disables GM mode.

For deeper guidance (folder conventions, adding a page, how the library viewers are wired, where styles belong), see [`AGENTS.md`](AGENTS.md).

---

## Deployment

The frontend builds to a static SPA, so any static host works (Azure Static Web Apps, Netlify, Vercel, S3/CloudFront, Caddy, Nginx).

```bash
yarn build         # outputs ./build
```

This repo has two CD tracks, both on every push to `main`:

- **Production:** [`deploy-production.yml`](.github/workflows/deploy-production.yml) runs type-check, lint and the theme checks, builds, and deploys `build/` to Azure Static Web Apps.
- **Public demo:** [`deploy-demo.yml`](.github/workflows/deploy-demo.yml) builds the read-only mocked demo and publishes it to [GitHub Pages](https://pichosof.github.io/phantasy-star-rpg.front/).

The production workflow logs in to Azure through GitHub OIDC, reads the Static Web Apps deployment token at runtime, and reads the API client secret from the Azure Container App. No production value is stored in the repository; all deployment-specific values come from GitHub Actions secrets and Azure resource secrets.

Required GitHub Actions secrets:

| Secret name              | Purpose                                                   |
| ------------------------ | --------------------------------------------------------- |
| `AZURE_CLIENT_ID`        | OIDC-enabled Azure identity client ID.                    |
| `AZURE_TENANT_ID`        | Azure tenant ID.                                          |
| `AZURE_SUBSCRIPTION_ID`  | Azure subscription ID.                                    |
| `AZURE_RESOURCE_GROUP`   | Resource group that owns the Static Web App and API.      |
| `STATIC_WEB_APP_NAME`    | Azure Static Web Apps resource name.                      |
| `API_CONTAINER_APP_NAME` | Azure Container Apps API resource name.                   |
| `CLIENT_SECRET_NAME`     | Container App secret name that stores the client secret.  |
| `VITE_API_BASE_URL`      | Production API base URL used at build time.               |
| `VITE_BASE_URL`          | SPA public base path used at build time.                  |
| `VITE_SIMULATE_PROD`     | Production-like frontend behavior flag.                   |
| `VITE_UPLOAD_MAX_MB`     | Browser upload cap; must match the API's `MAX_UPLOAD_MB`. |

Azure Static Web Apps routing config lives in [`public/staticwebapp.config.json`](public/staticwebapp.config.json). The PWA service worker is generated at build time, so deploying `build/` is enough.

---

## Contributing

PRs are welcome. Read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening one. By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

To report a security issue, **don't open a GitHub issue**: see [`SECURITY.md`](SECURITY.md).

---

## License

[MIT](LICENSE) © Jonathan Mendonça — picho.org
