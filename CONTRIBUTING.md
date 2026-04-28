# Contributing to Picho-RPG · Front-end

First off — thanks for taking the time to contribute. Picho-RPG is built and maintained openly under the [picho.org](https://picho.org) umbrella, and every patch, bug report or idea helps it grow.

This document describes how to set up the project, how we expect changes to be proposed, and what we look for in a PR. Please also read the [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

> If you're an AI agent or contributor reading this for orientation, you'll find an exhaustive technical guide in [`AGENTS.md`](AGENTS.md).

---

## Ways to contribute

| Contribution         | Where to start                                                                       |
| -------------------- | ------------------------------------------------------------------------------------ |
| Bug report           | [Open an issue](https://github.com/picho-org/picho-rpg-front/issues/new/choose) using the bug template. |
| Feature suggestion   | Open an issue with the "feature request" template; describe the use case first.      |
| Documentation fix    | Direct PR — small docs PRs get merged fast.                                          |
| New page or feature  | Open an issue first to align scope, then a PR.                                       |
| Translation          | Add or extend a folder under `src/locales/<lang>/translation.json`.                  |
| Security report      | **Do not open a public issue.** See [`SECURITY.md`](SECURITY.md).                    |

---

## Getting set up

```bash
corepack enable          # turns on Yarn 3
yarn install
cp .env.example .env     # adjust VITE_API_BASE_URL and VITE_CLIENT_SECRET
yarn start               # http://localhost:3000
```

The backend ([`picho-rpg-backend`](https://github.com/picho-org/picho-rpg-backend)) needs to run alongside the SPA. Default port is `3010`.

For mobile QA on a real device, the dev server binds to `0.0.0.0`, so any machine on the same network can reach `http://<your-ip>:3000`.

---

## Branch and PR workflow

1. **Fork** the repository (or, if you have write access, create a feature branch on the upstream remote).
2. Branch from `main` using a [conventional](https://www.conventionalcommits.org/en/v1.0.0/) prefix:
   - `feat/...` for new features
   - `fix/...` for bug fixes
   - `chore/...` for tooling, deps, refactors
   - `docs/...` for documentation
3. Keep commits small and focused. Squashing happens at merge time when needed; you don't have to squash locally.
4. Open the PR against `main`. The PR body should follow the template — explain the *why*, list the changes, and include screenshots or a recording for visual changes.
5. Make sure the PR is green:
   - `yarn type-check`
   - `yarn lint`
   - `yarn build`
6. Mention any related issue with `closes #<id>` (or `fixes #<id>`).

We squash-merge by default. The merge commit message becomes the commit on `main`, so make the PR title meaningful — it'll show up in the changelog.

---

## Code style

- **TypeScript first.** New files are `.ts` / `.tsx`. Prefer explicit types at module boundaries; let inference handle the inside.
- **Path alias**: `@app/*` → `src/*`. Use it for cross-folder imports; relative paths are fine inside the same folder.
- **Styles live in `*.styles.ts`** next to the component (`styled-components`). Inline styles are OK only for one-off tweaks; if it grows beyond a couple of properties, lift it.
- **Mobile-first when touching mobile**: always check the `useResponsive()` flags and reuse the kit in `src/components/common/mobile/`.
- **No GM bypass**: GM-only routes go through `useGMMode()` and the `/403` guard. Don't gate behind feature flags or hardcoded booleans.
- **No untyped `any`** unless absolutely necessary — and even then, prefer `unknown` with a type guard.
- **Format** with Prettier (`yarn format`) and lint with ESLint. The pre-commit hook runs both via `lint-staged`.

### Adding a new page

1. Create the route component under `src/pages/` (or `src/pages/gm/` for GM-only).
2. Add the route to the router config and, if GM-only, the guard list.
3. Build a desktop tree using AntD and a mobile tree using the mobile kit; gate them with `useResponsive()`.
4. Extract styling into `<Page>.styles.ts`.
5. Wire the API calls in `src/api/<domain>.api.ts` (one file per domain).

### Adding a new viewer (Library)

`LibraryPage.tsx` dispatches to per-format viewer components. To add one:

1. Add the MIME and extension to `ACCEPTED` and `VIEWABLE_MIME` (and a label to `mimeLabel()` in `src/api/library.api.ts`).
2. Implement the viewer component with the shared toolbar pattern (search, zoom, optional outline panel) and reuse `S.DocxRoot/Toolbar` from `LibraryPage.styles.ts` when the layout fits.
3. Hook it up inside `DocumentViewerModal`.
4. Mirror the MIME/extension allow-list in the **backend** (`library.controller.ts` → `ALLOWED_MIME`).

---

## Testing

Right now the front-end has no automated test suite. Before opening a PR, please **manually verify**:

- The page works on Chrome desktop, a mobile viewport (DevTools or a real device) and ideally Safari iOS or Chrome Android.
- No console errors / warnings introduced.
- Both themes (Motavia and Dezolis) render correctly.
- GM gate still kicks in for GM-only flows.

For visual changes, attach before/after screenshots in the PR description.

---

## Working on Windows

A few gotchas to keep in mind:

- Yarn 3 with PnP is **not** what we use here — `nodeLinker: node-modules` keeps things compatible with Windows tooling. If you cloned and don't see `node_modules/`, run `yarn install`.
- The build script compiles Less themes via `lessc`. Make sure you don't have antivirus / OneDrive locking files in `public/themes/`.
- Long Windows paths can break Git operations; enable long-path support: `git config --system core.longpaths true`.

---

## Release notes

Versioning lives in `package.json`. We don't publish the front-end to npm — releases are deploy-driven (every `main` push goes out via the configured static-host pipeline).

When a PR is large enough to deserve a note (new feature, breaking change), add an entry under "Notes" in the PR body — that's what the maintainer copies into release annotations.

---

## Getting help

- General questions or roadmap: open a GitHub Discussion.
- Help with a stuck PR: ping the maintainer directly in the PR — friendly nudge is welcome after 48h.
- Anything off-topic: `contact@picho.org`.

Happy hacking. May your dice always favor you.
