/**
 * Demo mode flag and helpers.
 *
 * The flag is set at build time via the `VITE_DEMO_MODE` env var (see
 * `package.json` → `build:demo`). When true, the app:
 *   - Mounts the `<DemoBanner />` at the top of the layout.
 *   - Intercepts every API call via `axios-mock-adapter` (see `src/demo/mockApi.ts`).
 *   - Forces `useGMMode()` to return `false` permanently.
 *   - Hides GM controls from the settings dropdown.
 *   - Disables editing/upload buttons across pages.
 *
 * The same source is shipped as production: there is **no runtime toggle**.
 * Changing `IS_DEMO` requires a rebuild.
 */

export const IS_DEMO: boolean = String(import.meta.env.VITE_DEMO_MODE ?? '').toLowerCase() === 'true';

/** Throws in demo mode — used as a guard inside any code path that mutates server state. */
export function assertNotDemo(action: string): void {
  if (IS_DEMO) {
    throw new Error(`Action "${action}" is disabled in the read-only demo.`);
  }
}
