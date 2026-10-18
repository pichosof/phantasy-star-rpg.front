import type { ThemeConfig } from 'antd';
import type { ITheme } from './types';

/**
 * The ONLY thing themes share: the names (and meaning) of the tokens.
 * Every theme must define every value itself — the type system enforces it and the
 * generated CSS never falls back from one theme to another.
 *
 * Adding a world (e.g. Rykros): create `styles/themes/<world>/` with tokens.ts +
 * index.ts exporting a ThemeDefinition, then register it in registry.ts.
 */
export type ThemeTokens = ITheme;

export type ColorScheme = 'light' | 'dark';

export interface ThemeDefinition {
  /** Stable id stored in preferences and used as `data-theme`. */
  id: string;
  /** World name shown in the UI. */
  name: string;
  tagline: string;
  /** Light or dark surface — drives the browser color-scheme and the antd algorithm. */
  scheme: ColorScheme;
  tokens: ThemeTokens;
  /** Plain neutrals this theme wants exposed as --white / --black / --lightgrey. */
  neutrals: { white: string; black: string; lightgrey: string };
  /** Sider/menu logo mark for this world. */
  logoMark: string;
  /** antd configuration owned by this theme (algorithm + tokens). */
  antd: ThemeConfig;
}
