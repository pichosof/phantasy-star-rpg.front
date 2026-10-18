import { theme as antTheme } from 'antd';
import logoMark from '@app/assets/logo-mark-light.png';
import type { ThemeDefinition } from '../contract';
import { FOUNDATION_ANTD_TOKENS } from '../foundation';
import { motaviaTokens as tokens } from './tokens';

/** Motavia — every color of this world lives in this folder. */
export const motavia: ThemeDefinition = {
  id: 'motavia',
  name: 'Motavia',
  tagline: 'Scorching desert under the sun of Algol',
  scheme: 'light',
  tokens,
  neutrals: { white: '#ffffff', black: '#000000', lightgrey: '#c5d3e0' },
  logoMark,
  antd: {
    algorithm: antTheme.defaultAlgorithm,
    token: {
      ...FOUNDATION_ANTD_TOKENS,
      colorPrimary: tokens.primary,
      colorInfo: tokens.primary,
      colorSuccess: tokens.success,
      colorWarning: tokens.warning,
      colorError: tokens.error,
      colorTextBase: tokens.textMain,
      colorBgBase: tokens.background,
      colorBorder: tokens.border,
    },
  },
};
