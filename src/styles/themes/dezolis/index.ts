import { theme as antTheme } from 'antd';
import logoMark from '@app/assets/logo-mark-dark.png';
import type { ThemeDefinition } from '../contract';
import { FOUNDATION_ANTD_TOKENS } from '../foundation';
import { dezolisTokens as tokens } from './tokens';

/** Dezolis — every color of this world lives in this folder. */
export const dezolis: ThemeDefinition = {
  id: 'dezolis',
  name: 'Dezolis',
  tagline: 'Glacial abyss beneath the aurora',
  scheme: 'dark',
  tokens,
  neutrals: { white: '#ffffff', black: '#000000', lightgrey: '#c5d3e0' },
  logoMark,
  antd: {
    algorithm: antTheme.darkAlgorithm,
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
