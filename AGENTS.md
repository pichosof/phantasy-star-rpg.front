# AGENTS.md · Picho-RPG · Front-end

> Single source of truth for AI agents and human contributors working on this codebase. Optimised to be **read once and remembered** — no fluff, lots of pointers.

If you're an LLM-driven agent, treat this file as your project briefing. The information here is dense by design: it should let you act without re-deriving conventions from scratch.

---

## 1. What is this?

Picho-RPG is a tabletop RPG companion app. This repo is the **web front-end** (React 19 + Vite 8 + TypeScript 6). It pairs with a separate Fastify backend (`picho-rpg-backend`) that owns the SQLite database and file storage.

**Domain entities** (mirrored on the backend):

| Entity            | What it is                                                           |
| ----------------- | -------------------------------------------------------------------- |
| World             | Top-level container; cities link to a world.                         |
| City              | Cities of the campaign. Have lores, quests, dungeons, NPCs, images.  |
| Dungeon           | Locations within or near a city.                                     |
| NPC               | Named characters; may have a portrait and a PDF sheet.               |
| Monster           | Creatures used in the bestiary.                                      |
| Player            | Player at the table; tied to one or more character sheets.           |
| Character Sheet   | GURPS or Starfinder; stored as JSON, edited via system-aware forms.  |
| Quest             | Story arc/objective; linked to cities and (optionally) players.      |
| Session           | One play session; logged with summary and visibility flags.          |
| Timeline Event    | Datable in-world event.                                              |
| Lore              | Lore article; can be city-scoped.                                    |
| Wiki Page         | Markdown article, optionally pinned/visible.                         |
| GM Note           | Private GM-only note.                                                |
| GM Image          | GM image gallery (uploads, URLs).                                    |
| Library Document  | Shared rulebooks, PDFs, EPUBs, etc. (See "Library viewers" below.)   |
| Map Marker        | Position of a city/dungeon on the world map.                         |

Two visibility "modes":

- **Player view** (default). What every party member sees.
- **GM mode** (gated). Adds editing UIs, hidden flags, GM notes, character-sheet editor.

GM mode is a client gate (`useGMMode()`) plus a route guard. GM-only routes are `LORES`, `GM_NOTES`, `GM_IMAGES`, `GM_SHEETS` (see `src/components/router/AppRouter.tsx` for the mapping).

---

## 2. Stack snapshot

| Layer            | Tech                                                                |
| ---------------- | ------------------------------------------------------------------- |
| Bundler / dev    | Vite 8 (`vite.config.mts`)                                          |
| Language         | TypeScript 6, `moduleResolution: "bundler"`, no `baseUrl`           |
| UI               | React 19 + `react-dom` 19                                           |
| Component kits   | `antd@6` (desktop/tablet) + `antd-mobile@5` (mobile <768px)         |
| Icons            | `@ant-design/icons` (desktop) + `antd-mobile-icons` (mobile)        |
| Styles           | `styled-components@6` + Less themes (`src/styles/themes/main.less`) |
| State            | Redux Toolkit 2 + `react-redux@9`                                   |
| Routing          | `react-router-dom@7`                                                |
| HTTP             | Axios 1; per-domain modules in `src/api/*.api.ts`                   |
| Charts           | ECharts 6 + `echarts-for-react`                                     |
| Maps             | Leaflet (with `react-leaflet`)                                      |
| File viewers     | `pdfjs-dist@3.11.174` + `@react-pdf-viewer`, `mammoth` (DOCX), `xlsx` (XLS/XLSX/CSV), `react-reader` (EPUB/MOBI), `@kandiforge/pptx-renderer` (PPTX) |
| Lint / format    | ESLint 9 (flat config), Prettier 3, Stylelint                       |
| PWA              | `vite-plugin-pwa` 1 (Workbox 7, `autoUpdate`)                       |
| Test             | None automated (manual QA, see CONTRIBUTING).                       |
| Package manager  | Yarn 3 with `nodeLinker: node-modules`                              |

> Pinned `pdfjs-dist@3.11.174` — `@react-pdf-viewer/core@3.12` is locked to that line. Don't bump unless you're prepared to migrate the viewer.

---

## 3. Folder map

```
src/
├── api/                    Axios per-domain (library.api.ts, world.api.ts, player.api.ts, …)
├── assets/                 Bundled images/SVGs
├── components/
│   ├── apps/               Domain widgets that aren't full pages (kanban, news feed)
│   ├── auth/               Auth forms (login, lock, sign-up)
│   ├── common/             Reusable UI (one folder per component)
│   │   ├── mobile/         Mobile-first kit (MobilePageScaffold, MobileEntitySheet, …)
│   │   ├── pdf/            PdfDocumentViewer (used in PlayerCard sheet preview)
│   │   ├── pickers/        DatePicker, TimeRangePicker (centralised for theme/locale)
│   │   ├── inputs/, selects/, charts/, forms/, typography/, icons/, …
│   │   ├── AppIcon/        Maps a semantic name → desktop or mobile icon component.
│   │   └── …
│   ├── header/             Top bar (search, settings, profile, GM toggle)
│   ├── layouts/            MainLayout, AuthLayout, ProfileLayout
│   ├── medical-dashboard/  Legacy dashboard widgets — most are dead, do not extend.
│   ├── nft-dashboard/      Legacy dashboard widgets — same warning.
│   ├── profile/            Profile page widgets
│   └── rpg/                Domain widgets (PlayerCard, CityAdminDrawer, …)  ← active dev
├── config/                 Runtime config (config.ts) — reads VITE_* env
├── constants/              Static maps (Dates, modalSizes, languages, patterns, …)
├── controllers/            Notification controller (toast bridge)
├── domain/                 Plain TS models (UserModel, …)
├── hocs/                   withLoading.hoc.tsx (Suspense wrapper)
├── hooks/                  Custom hooks (useGMMode, useResponsive, useThemeWatcher, …)
├── interfaces/             Cross-cutting TS interfaces
├── locales/                i18n (en, de) — JSON-based via i18next
├── pages/                  ROUTE-LEVEL components, one per route
│   └── gm/                 GM-only routes (sheets, notes, images)
├── services/               Browser-side services (localStorage, …)
├── store/                  Redux Toolkit
│   ├── slices/             nightModeSlice, themeSlice, pwaSlice (no userSlice)
│   ├── middlewares/        errorLogging.middleware.ts
│   └── store.ts
├── styles/
│   ├── GlobalStyle.ts      styled-components global rules
│   ├── styleUtils.ts       Reusable inline-style fragments (flexCenterFull, etc.)
│   ├── resetCss.ts
│   └── themes/             Theme tokens for Motavia/Dezolis + Less variables
├── types/                  Generic TS types
├── utils/                  Pure helpers (no React) — utils.tsx, api-error.ts
├── App.tsx                 Theme/router/store wiring
├── i18n.ts                 i18next setup
└── index.tsx               Entry point + service-worker registration
```

### Path alias

`@app/*` → `src/*` (configured in `tsconfig.paths.json` and mirrored in `vite.config.mts`).

**Rule:** import via `@app/...` for anything across folders. Relative `./` is fine inside the same folder.

---

## 4. How to run / test / build

```bash
yarn install           # first time
yarn start             # dev server on :3000, network-accessible
yarn type-check        # tsc --noEmit
yarn lint              # ESLint (auto-fix)
yarn build             # production bundle into ./build
yarn preview           # serve ./build for sanity check
```

There is **no automated test suite**. Manual QA on:

- Chrome desktop
- A mobile viewport (DevTools or a real device on the LAN)
- Both themes (toggle via the settings dropdown)
- GM mode on/off (key entered/cleared)

Pre-commit hook runs `lint-staged` (ESLint + Prettier on touched files).

---

## 5. Conventions that matter

### TypeScript

- `strict: true`, `noImplicitAny`, `noFallthroughCasesInSwitch`.
- Avoid `any`. If forced, use `unknown` and narrow with type guards.
- Boundary types are explicit; inference is fine for locals.
- `import type { ... }` for type-only imports.

### React

- Functional components only.
- Prefer custom hooks over HOCs (the only HOC, `withLoading`, is for `<Suspense>` boundaries).
- One file per component. Co-locate `<Component>.styles.ts`.
- Use `React.lazy` + `<Suspense>` for code-splitting heavy viewers (see `LibraryPage.tsx` PPTX renderer).

### Styling

- `styled-components` first. Define styles in `<Component>.styles.ts`, export them as `* as S` and consume as `<S.Foo>`.
- `inline styles` are tolerated for one-off layout (e.g. `marginTop: 8`); don't accumulate them.
- Theme variables live in `src/styles/themes/`. Use CSS vars (`var(--text-main-color)`) for runtime swap.
- Forced colours (e.g. PDF/Word viewers) override CSS vars to keep readability across themes.

### Mobile-first

- `useResponsive()` returns `{ mobileOnly, isTablet, isDesktop, ... }`. Use it to dispatch trees, not to gate behaviours.
- Mobile components live in `src/components/common/mobile/`. They are wrappers around `antd-mobile` primitives; extend the wrapper rather than importing `antd-mobile` directly in pages.
- Mobile sheets open from the **right** by ergonomic decision — keep that convention.

### Routing

- Routes are defined declaratively. GM routes go through a guard component that checks `useGMMode()`; without an active GM key the user is redirected to `/403`.
- Public auth routes (`/login`, `/forgot-password`, …) live under `AuthLayout`.

### Forms

- AntD forms on desktop; the mobile kit's `MobileForm` wraps `antd-mobile`'s `Form`. Both use Zod-friendly shape but **validation is currently runtime in the page** — backend has the real Zod schemas.

### API layer

- One file per domain in `src/api/`. Export typed functions; throw `ApiError` (in `src/api/ApiError.ts`) on non-2xx.
- For UI errors, call `apiErrorMessage(err, fallback)` from `src/utils/api-error.ts` to produce a user-friendly message.

### Errors and notifications

- Use `notificationController.{info,success,warning,error}({ title, description? })` from `src/controllers/notificationController.tsx`.
- Don't `console.error` in production paths; route via the notification controller or the global error boundary.

---

## 6. Library viewers (the trickiest area)

The Library lets a GM upload books/handouts and players read them in-browser. Each MIME type has its own viewer in `src/pages/LibraryPage.tsx`. Pattern is consistent:

| Format       | Viewer component         | Notes                                                   |
| ------------ | ------------------------ | ------------------------------------------------------- |
| PDF          | `PdfViewer`              | `@react-pdf-viewer` + custom worker URL (CDN, pdfjs `3.11.174`). `transformGetDocumentParams` injects `standardFontDataUrl`. |
| DOC / DOCX   | `DocxViewer`             | `mammoth` → HTML; toolbar with search highlight, zoom, headings outline; forced black-on-white. |
| TXT / MD     | `TxtViewer`              | Plain `<pre>` with light bg.                            |
| XLS / XLSX / CSV | `SpreadsheetViewer`  | `xlsx` (lazy import); sheet tabs, search, zoom; first row → `<thead>`. |
| EPUB / MOBI  | `EpubViewer` / `MobiViewer` | `react-reader` + custom toolbar (TOC, font, theme). MOBI is converted to EPUB on the **backend** via Calibre. |
| PPT / PPTX   | `PptxViewer`             | Uses **deep-imports** of `@kandiforge/pptx-renderer/dist/lib/{parser,renderer}` (the lib's React components transitively pull in MUI; we bypass them). Custom `<canvas>` with `SlideRenderer`. **Two known fixes**: (1) `parsePPTX` emits images as `data:application/octet-stream`; we sniff magic bytes and rewrite to `data:image/jpeg|png|gif|bmp|webp`. (2) The `SlideRenderer` constructor only computes `ptScale` when both `width` and `height` are passed — without them shapes render at raw EMU coords and the slide is blank. |
| Legacy `.ppt` | `PptxViewer` (fallback) | Detected by CFB/OLE2 signature `D0 CF 11 E0…`; we surface a clear "convert to .pptx or download" message. |

To add a new format: extend `ACCEPTED`, `VIEWABLE_MIME` and `mimeLabel()` in `src/api/library.api.ts`, add a viewer component, dispatch in `DocumentViewerModal`, and **mirror the MIME on the backend's `ALLOWED_MIME` map**.

---

## 7. PWA

- Configured in `vite.config.mts` via `vite-plugin-pwa`.
- `registerType: 'autoUpdate'`, manifest generated at build time.
- Runtime caching:
  - Google Fonts → `CacheFirst`
  - `/api/*` → `NetworkFirst` (10s timeout, 5 min TTL)
  - `*.amazonaws.com` / `*.cloudfront.net` → `StaleWhileRevalidate`
- Service worker is bundled at build time. To debug, use Chrome DevTools → Application → Service Workers and "Unregister" before reloading.

---

## 8. Theming

- Two themes: `motavia` (light) and `dezolis` (dark). Picked via `theme` slice; the choice is persisted to `localStorage`.
- Theme tokens are JS objects in `src/styles/themes/light/` and `src/styles/themes/dark/`. They're injected as CSS variables by `GlobalStyle`.
- Less file `src/styles/themes/main.less` is compiled to `public/themes/main.css` by `yarn buildThemes` (runs as part of `yarn start` and `yarn build`). It overrides AntD's Less variables to match the theme tokens.

> When fixing a "the text is blue but should be black" issue, check whether the component is using a CSS var (`var(--text-main-color)`). If yes, the fix is theme-level. If a viewer renders third-party HTML (DOCX, EPUB), force black-on-white inside that container.

---

## 9. Common patterns

### Adding a new page

1. Create `src/pages/<Name>Page.tsx` and `<Name>Page.styles.ts`.
2. Build the desktop tree using AntD; build the mobile tree using the mobile kit. Switch via `useResponsive()`.
3. Add the route to the router config; if GM-only, add it to the GM guard list.
4. Wire API calls under `src/api/<domain>.api.ts`.

### Adding a new mobile primitive

Extend `src/components/common/mobile/` and re-export from `index.ts`. Don't import `antd-mobile` directly from a page.

### Adding a Redux slice

1. Create `src/store/slices/<name>Slice.ts` exporting the reducer as default.
2. Register it in `src/store/slices/index.ts`.
3. Create selectors right next to the slice.
4. Expose typed hooks via `useAppDispatch`/`useAppSelector` from `src/hooks/reduxHooks.ts`.

### Lazy-loading a heavy dependency

```ts
const MyHeavyComp = React.lazy(() => import('heavy-pkg').then((m) => ({ default: m.Comp })));
// Or for non-React modules:
useEffect(() => {
  let cancelled = false;
  import('heavy-pkg').then((mod) => {
    if (!cancelled) doStuff(mod);
  });
  return () => { cancelled = true; };
}, []);
```

---

## 10. Gotchas (read before debugging)

- **Vite pre-bundling cache.** When you change a deep-import path or add a new dep, the existing `node_modules/.vite/deps/` may serve stale content. Stop the dev server, delete `.vite`, and restart.
- **Service Worker caching.** The PWA SW caches the previous build. After a fresh deploy, force-reload twice or unregister via DevTools.
- **Service Worker in dev.** `vite-plugin-pwa` registers it in dev too; if you see weird stale chunks, disable the SW in DevTools while developing.
- **`pdfjs-dist` worker URL** must match the API version. Currently `3.11.174` (pinned). Don't replace with `^4` without migrating away from `@react-pdf-viewer`.
- **`react-pdf-viewer` standard fonts.** `transformGetDocumentParams` provides `standardFontDataUrl` so PDFs that use `ZapfDingbats` etc. don't render glyphs as missing.
- **EPUB iframe sandbox.** We deliberately use the **strict** sandbox (no `allow-scripts`). It's a security trade-off — see commit history. Don't enable scripts again without an isolated origin.
- **PPTX deep imports.** Importing the package's index pulls `@mui/icons-material` (an undeclared peer dep) and breaks the build. Always import from `@kandiforge/pptx-renderer/dist/lib/{parser,renderer}.js`.
- **`useLayoutEffect` mounting order.** If a component conditionally renders the ref-bearing node only after data loads (e.g. canvas after parse), the layout effect must depend on `data`, not `[]`. Otherwise the ref is null on first run and the effect never re-fires.
- **Yarn 3 nuances.** Don't run `npm install` here — it'll wreck the lockfile. Use `yarn add`.
- **Less build.** `yarn start` runs `yarn buildThemes` first. If `public/themes/main.css` is missing, the dev server will start without theme overrides.
- **GM key.** Stored in `localStorage` under `gmKey`. Clear it via the settings dropdown to test the player view.
- **`baseUrl` is gone.** TypeScript 6 deprecated it; we removed it. Always use `@app/*` aliases. New imports without `@app` will silently break in production builds.

---

## 11. Don'ts

- Don't reintroduce `baseUrl` in `tsconfig.json`.
- Don't import `@kandiforge/pptx-renderer` directly (only `dist/lib/...`).
- Don't import `antd-mobile` directly from a page — use the wrappers.
- Don't add inline styles for anything bigger than a couple of properties.
- Don't bump `pdfjs-dist` past `3.11.174` without migrating off `@react-pdf-viewer`.
- Don't use `npm` — Yarn 3 only.
- Don't gate a GM feature behind a feature-flag boolean — go through `useGMMode()`.
- Don't create new files outside `src/` for app code (scripts go in `scripts/`, build artefacts in `build/`).
- Don't add new dashboards in `src/components/medical-dashboard/` or `nft-dashboard/` — those are legacy carry-overs and are slated for removal.

---

## 12. Useful pointers

| Need…                                | Look at                                                                       |
| ------------------------------------ | ----------------------------------------------------------------------------- |
| Adding a Library viewer              | [src/pages/LibraryPage.tsx](src/pages/LibraryPage.tsx)                        |
| GM gate / route guard                | [src/hooks/useGMMode.ts](src/hooks/useGMMode.ts)                              |
| Mobile kit                           | [src/components/common/mobile/](src/components/common/mobile/)                |
| Theme tokens & vars                  | [src/styles/themes/](src/styles/themes/)                                      |
| API error handling                   | [src/api/ApiError.ts](src/api/ApiError.ts), [src/utils/api-error.ts](src/utils/api-error.ts) |
| Notification toasts                  | [src/controllers/notificationController.tsx](src/controllers/notificationController.tsx) |
| Vite + PWA config                    | [vite.config.mts](vite.config.mts)                                            |
| Worker URL for PDF.js                | constant near the top of [LibraryPage.tsx](src/pages/LibraryPage.tsx)         |

---

## 13. Roadmap context

Recent migrations (already completed) are documented in [`MIGRATION_PLAN.md`](MIGRATION_PLAN.md). Headline moves:

- CRA → Vite 5/8.
- React 17 → 19.
- AntD 4 → 6 + AntD 4-icons → 6-icons.
- TypeScript 4 → 6 (deprecated `baseUrl` removed; `moduleResolution: "bundler"`).
- ESLint 7 → 9 (flat config).
- Workbox 7 PWA stack.
- Mobile-first shell with `antd-mobile` and dedicated mobile kit.

If you're touching a page that still has `inline style` blocks or relative-path imports, that's tech debt — moving it to the current convention is welcome.

---

## 14. Contact

- GitHub: <https://github.com/picho-org/picho-rpg-front>
- General: `contact@picho.org`
- Security: `security@picho.org` (see [SECURITY.md](SECURITY.md))
- Code of conduct issues: `conduct@picho.org`
