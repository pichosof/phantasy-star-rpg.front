import type { ColorScheme, ThemeDefinition } from './contract';
import { dezolis } from './dezolis';
import { motavia } from './motavia';

/** Every available world theme. Add new worlds (e.g. Rykros) here. */
export const THEMES = { motavia, dezolis } satisfies Record<string, ThemeDefinition>;

export type ThemeId = keyof typeof THEMES;

export const THEME_LIST: ThemeDefinition[] = Object.values(THEMES);

/** Default pairing for the automatic modes (system preference / night schedule). */
export const DEFAULT_THEME_FOR_SCHEME: Record<ColorScheme, ThemeId> = { light: 'motavia', dark: 'dezolis' };

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && value in THEMES;
}

/** Preferences saved before the world themes used 'light' / 'dark'. */
export function migrateThemeId(value: unknown, fallback: ThemeId = 'dezolis'): ThemeId {
  if (isThemeId(value)) return value;
  if (value === 'light') return 'motavia';
  if (value === 'dark') return 'dezolis';
  return fallback;
}

export const getTheme = (id: ThemeId): ThemeDefinition => THEMES[id];
