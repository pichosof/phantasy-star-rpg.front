import { useAppSelector } from '@app/hooks/reduxHooks';
import type { ThemeDefinition } from '@app/styles/themes/contract';
import { getTheme } from '@app/styles/themes/registry';

/** Definition of the theme currently applied (tokens, scheme, logo, antd config). */
export const useActiveTheme = (): ThemeDefinition => getTheme(useAppSelector((state) => state.theme.theme));
