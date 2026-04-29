# Picho-RPG · Front-end

> Tabletop RPG companion for managing players, sessions, maps, lore, bestiary, timelines, quests, and GM tools — all in one place.

<p>
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue.svg" /></a>
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white" />
  <img alt="Ant Design" src="https://img.shields.io/badge/Ant_Design-6-0170FE?logo=antdesign&logoColor=white" />
  <img alt="Status" src="https://img.shields.io/badge/status-active-success" />
</p>

This repository hosts the **web client** of [Picho-RPG](https://picho.org). It pairs with [`picho-rpg-backend`](../phantasy-star-rpg) (Fastify + Drizzle + SQLite). The web app is a **PWA** that works on desktop, tablet and mobile, with a dedicated mobile-first shell built on top of `antd-mobile`.

---

## Why Picho-RPG?

Running a tabletop campaign means juggling spreadsheets, PDF rulebooks, NPC notes, hand-drawn maps and Discord screenshots. Picho-RPG centralizes everything:

- **For players**: campaign timeline, quests, NPC roster, world map, character sheets, session log and a shared library of rulebooks.
- **For the GM**: every player view plus a private layer with notes, hidden NPCs, dungeons, image gallery, character sheet manager (GURPS, Starfinder), and gated lore.

Themes are based on the **Phantasy Star** universe — _Motavia_ (light) and _Dezolis_ (dark) — but the platform is system-agnostic and works for any TTRPG.

---

## Features

- **GM Mode** — gated panels for the Game Master, unlocked with a GM key against the backend.
- **Library** — upload and read rulebooks/handouts in PDF, DOCX, EPUB, MOBI (auto-converted to EPUB on the backend), TXT/MD, XLS/XLSX, CSV, PPT/PPTX. Each viewer has its own toolbar (search, zoom, theme, table of contents).
- **Players & Sheets** — manage players and their character sheets with rule-system-aware forms (GURPS GCA import, Starfinder).
- **World, Cities, Dungeons, NPCs, Bestiary** — entity management with images, tags, visibility flags and cross-links.
- **Quests, Sessions, Timeline** — campaign progression tracking.
- **Wiki & Lore** — markdown-driven wiki and per-city lore archive.
- **Map** — pannable world map with markers for cities and dungeons, GM placement controls, presentation mode and ruler.
- **Dice Roller** — visual dice picker with formula preview, roll history and replay.
- **PWA** — installable, offline-aware (Workbox 7 service worker), background updates.
- **Themes** — Motavia / Dezolis with persistent preference and optional auto night-mode.

---

## Stack

| Layer           | Tech                                                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Build & dev     | Vite 8 + `vite-plugin-pwa` + `vite-tsconfig-paths`                                                                      |
| Language        | TypeScript 6 (`moduleResolution: bundler`)                                                                              |
| UI library      | React 19 + `react-dom` 19                                                                                               |
| Component kits  | Ant Design 6 (desktop/tablet) + `antd-mobile` 5 (mobile)                                                                |
| Styling         | `styled-components` 6 + Less themes                                                                                     |
| State           | Redux Toolkit 2 + `react-redux` 9                                                                                       |
| Routing         | React Router 7                                                                                                          |
| Data fetching   | Axios 1                                                                                                                 |
| File rendering  | `pdfjs-dist` + `@react-pdf-viewer`, `mammoth` (DOCX), `xlsx`, `react-reader` (EPUB), `@kandiforge/pptx-renderer` (PPTX) |
| Charts          | ECharts 6 + `echarts-for-react`                                                                                         |
| Maps            | Leaflet + `react-leaflet`                                                                                               |
| Lint / format   | ESLint 9 (flat config) + Prettier 3 + Stylelint                                                                         |
| Package manager | Yarn 3 (`packageManager` field, `nodeLinker: node-modules`)                                                             |

---

## Quick start

### Requirements

- Node.js **>= 20**
- Yarn 3 (handled automatically by `corepack`)
- The backend running locally on `http://localhost:3010` (see [`picho-rpg-backend`](../phantasy-star-rpg))

### Install & run

```bash
corepack enable
yarn install
cp .env.example .env       # then edit values
yarn start                 # http://localhost:3000
```

The dev server binds to `0.0.0.0`, so you can also reach it from another device on the same Wi-Fi (e.g. `http://192.168.1.10:3000`) for mobile QA.

### Available scripts

| Script             | Description                                                       |
| ------------------ | ----------------------------------------------------------------- |
| `yarn start`       | Build the Less themes and start Vite dev server (port 3000).      |
| `yarn build`       | Production build into `build/`.                                   |
| `yarn preview`     | Serve the production build locally.                               |
| `yarn type-check`  | Run `tsc --noEmit` against the project.                           |
| `yarn lint`        | ESLint with auto-fix.                                             |
| `yarn lint:styles` | Stylelint over JS/TS files (styled-components).                   |
| `yarn format`      | Prettier on the whole repo.                                       |
| `yarn buildThemes` | Compile `src/styles/themes/main.less` → `public/themes/main.css`. |

### Environment variables

All exposed to the client must be prefixed with `VITE_`. Defined in [`.env.example`](.env.example):

| Variable             | Purpose                                                       |
| -------------------- | ------------------------------------------------------------- |
| `VITE_API_BASE_URL`  | Backend URL. In dev, usually `http://localhost:3010`.         |
| `VITE_BASE_URL`      | Public base path of the SPA (empty for root).                 |
| `VITE_ASSETS_BUCKET` | Optional CDN/bucket for remote assets.                        |
| `VITE_UPLOAD_MAX_MB` | Max upload size; must match `MAX_UPLOAD_MB` on the backend.   |
| `VITE_CLIENT_SECRET` | Shared secret with the backend; must match `CLIENT_SECRET`.   |
| `VITE_SIMULATE_PROD` | When `true`, dev behaves like prod (e.g. auto-logout on 401). |

> ⚠️ Anything in `.env` is shipped to the browser. Never put server-only secrets here.

---

## Project layout

```
phantasy-star-rpg.front
├── public/                Static assets (favicons, themes, robots.txt)
├── src/
│   ├── api/               Axios clients per domain (library, players, world…)
│   ├── assets/            Images and SVGs bundled with the app
│   ├── components/
│   │   ├── common/        Reusable UI (mobile/, AppIcon, pickers, etc.)
│   │   ├── header/        Top navigation, search, settings, profile dropdowns
│   │   ├── layouts/       Main / Profile / Auth layouts
│   │   └── rpg/           Domain widgets (PlayerCard, CityAdminDrawer, …)
│   ├── config/            Runtime config + env mapping
│   ├── constants/         Static maps and enums
│   ├── controllers/       Notifications & cross-cutting controllers
│   ├── hocs/              Higher-order components (e.g. lazy loading)
│   ├── hooks/             Custom hooks (useGMMode, useResponsive, …)
│   ├── pages/             Route-level components (one folder/file per route)
│   │   └── gm/            GM-only routes (sheets, notes, images)
│   ├── store/             Redux Toolkit slices, store, middlewares
│   ├── styles/            GlobalStyle, theme constants, Less variables
│   └── utils/             Pure helpers (no React)
├── eslint.config.cjs      Flat ESLint config
├── tsconfig.json          + tsconfig.paths.json (alias `@app/*` → `src/*`)
├── vite.config.mts        Vite + PWA + tsconfig-paths
└── index.html             SPA entry point
```

Path alias: `@app/*` resolves to `src/*`. Always prefer `@app/...` over relative `../../...` for cross-folder imports.

---

## 🔑 GM key

Picho-RPG has no user accounts. Players see the public view by default; the **Game Master** unlocks an extra editing layer with a single shared **GM key** managed by the backend.

### How a GM unlocks the panel

1. Open the **settings dropdown** (gear icon in the header).
2. Click **GM mode** → paste the key handed to you by whoever set up the deployment.
3. The client calls `POST /api/auth/login` with the key, receives a short-lived JWT (default 8h), and stores it.
4. From that moment on the GM-only navigation entries appear (`Lores admin`, `GM Notes`, `GM Images`, `GM Sheets`) and every entity drawer exposes its admin tab.
5. To "log out", clear the GM mode from the same settings dropdown — the JWT is dropped and the UI reverts to the player view.

### What's gated by the GM key

- All `*Admin*` UIs (uploads, edits, hidden flags, deletions).
- The `/lores`, `/gm/notes`, `/gm/images`, `/gm/sheets` routes (others redirect to `/403` without it).
- The "GM" tabs inside entity drawers (Cities, Quests, Sessions, NPCs, Bestiary, Dungeons, Library settings, etc.).

### Where the key actually lives

- The raw key is **only in the backend env** (`GM_API_KEY`).
- The browser only ever holds a JWT signed by the backend (`JWT_SECRET`), never the raw key.
- See the [backend's GM key section](https://github.com/picho-org/picho-rpg-backend#gm-key) for how to generate, set, and rotate it. The backend enforces minimum strength (≥ 24 chars, 3 character classes) and throttles failed attempts per IP.

> ⚠️ Do not put the GM key in `.env` of the front-end. The front-end only needs `VITE_API_BASE_URL` and `VITE_CLIENT_SECRET` (which is a soft sanity check, not the GM key).

---

## Architecture highlights

- **Mobile-first shell** for screens `< 768px`. Components in `src/components/common/mobile/` wrap `antd-mobile` primitives (`MobilePageScaffold`, `MobileEntitySheet`, `MobileFilterSheet`, `MobileActionBar`, `MobileForm`, `MobileList`, `MobileSelector`, `MobileDialog`, `MobileSearchBar`, `MobileActionSheet`). Pages keep one tree for desktop/tablet and one for mobile, picked via `useResponsive()`.
- **GM mode** is a client-side gate (`useGMMode()`) plus a route guard. Routes like `LORES`, `GM_NOTES`, `GM_IMAGES`, `GM_SHEETS` redirect to `/403` without an active GM key.
- **PWA** via `vite-plugin-pwa` with `registerType: 'autoUpdate'`, manifest generated at build time, runtime caching for fonts, `/api/*` (network-first) and remote assets (stale-while-revalidate).
- **Theming** uses styled-components plus a precompiled Less theme dropped into `public/themes/main.css` (Motavia/Dezolis variables).
- **Data layer** is per-domain Axios modules under `src/api/`. They throw a typed `ApiError` consumed by `apiErrorMessage()` for user-facing messages.

For deeper guidance — folder conventions, when to add a new page, how viewers are wired, where styles belong — see [`AGENTS.md`](AGENTS.md).

---

## Deployment

The frontend builds to a static SPA, so any static host works (Azure Static Web Apps, Netlify, Vercel, S3/CloudFront, Caddy, Nginx).

```bash
yarn build         # outputs ./build
```

This repo currently has two CD tracks:

- **Production:** [`deploy-production.yml`](.github/workflows/deploy-production.yml) builds `main` and deploys `build/` to Azure Static Web Apps.
- **Public demo:** [`deploy-demo.yml`](.github/workflows/deploy-demo.yml) builds the read-only mocked demo and publishes it to GitHub Pages.

The production workflow logs in to Azure through GitHub OIDC, reads the Static Web Apps deployment token at runtime, and reads the API client secret from the Azure Container App. No production value is stored in the repository; all deployment-specific values are supplied through GitHub Actions secrets and Azure resource secrets.

Required GitHub Actions secrets:

| Secret name              | Purpose                                                  |
| ------------------------ | -------------------------------------------------------- |
| `AZURE_CLIENT_ID`        | OIDC-enabled Azure identity client ID.                   |
| `AZURE_TENANT_ID`        | Azure tenant ID.                                         |
| `AZURE_SUBSCRIPTION_ID`  | Azure subscription ID.                                   |
| `AZURE_RESOURCE_GROUP`   | Resource group that owns the Static Web App and API.     |
| `STATIC_WEB_APP_NAME`    | Azure Static Web Apps resource name.                     |
| `API_CONTAINER_APP_NAME` | Azure Container Apps API resource name.                  |
| `CLIENT_SECRET_NAME`     | Container App secret name that stores the client secret. |
| `VITE_API_BASE_URL`      | Production API base URL used at build time.              |
| `VITE_BASE_URL`          | SPA public base path used at build time.                 |
| `VITE_SIMULATE_PROD`     | Production-like frontend behavior flag.                  |
| `VITE_UPLOAD_MAX_MB`     | Browser upload cap; must match backend `MAX_UPLOAD_MB`.  |

Azure Static Web Apps routing config lives in [`public/staticwebapp.config.json`](public/staticwebapp.config.json). The PWA service worker is generated at build time, so deploying `build/` is enough.

---

## Contributing

PRs are welcome. Read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening one. By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

To report a security issue, **don't open a GitHub issue** — see [`SECURITY.md`](SECURITY.md).

---

## License

[MIT](LICENSE) © Jonathan Mendonça — picho.org
