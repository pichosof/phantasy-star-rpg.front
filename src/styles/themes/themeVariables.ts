import { css } from 'styled-components';
import { hexToRGB } from '@app/utils/utils';
import type { ThemeDefinition } from './contract';
import { FOUNDATION_FONTS } from './foundation';
import { THEME_LIST } from './registry';

/**
 * Builds the complete CSS-variable set of ONE theme. Each theme gets its own
 * [data-theme='<id>'] block with every variable — there is no shared/default block,
 * so a change in one theme can never leak into another.
 */
const themeColorVariables = (def: ThemeDefinition) => {
  const t = def.tokens;
  return css`
    color-scheme: ${def.scheme};
    --white: ${def.neutrals.white};
    --black: ${def.neutrals.black};
    --lightgrey: ${def.neutrals.lightgrey};

    --primary-color: ${t.primary};
    --primary1-color: ${t.primary1};
    --primary-gradient-color: ${t.primaryGradient};
    --info-color: var(--primary-color);
    --secondary-color: ${t.secondary};
    --error-color: ${t.error};
    --warning-color: ${t.warning};
    --success-color: ${t.success};
    --background-color: ${t.background};
    --secondary-background-color: ${t.secondaryBackground};
    --secondary-background-selected-color: ${t.secondaryBackgroundSelected};
    --additional-background-color: ${t.additionalBackground};
    --collapse-background-color: ${t.collapseBackground};
    --timeline-background-color: ${t.timelineBackground};
    --spinner-base-color: ${t.spinnerBase};
    --sider-background-color: ${t.siderBackground};
    --shadow-color: ${t.shadow};
    --border-color: ${t.border};
    --border-nft-color: ${t.borderNft};
    --scroll-color: ${t.scroll};

    --primary-rgb-color: ${hexToRGB(t.primary)};
    --info-rgb-color: ${hexToRGB(t.primary)};
    --secondary-rgb-color: ${hexToRGB(t.secondary)};
    --error-rgb-color: ${hexToRGB(t.error)};
    --warning-rgb-color: ${hexToRGB(t.warning)};
    --success-rgb-color: ${hexToRGB(t.success)};
    --background-rgb-color: ${hexToRGB(t.background)};

    --text-main-color: ${t.textMain};
    --text-light-color: ${t.textLight};
    --text-superLight-color: ${t.textSuperLight};
    --text-on-color: ${t.textOnColor};
    --text-muted-color: ${t.textMuted};
    --text-dark-color: ${t.textDark};
    --text-nft-light-color: ${t.textNftLight};
    --text-sider-primary-color: ${t.textSiderPrimary};
    --text-sider-secondary-color: ${t.textSiderSecondary};
    --subtext-color: ${t.subText};

    --dashboard-map-background-color: ${t.dashboardMapBackground};
    --dashboard-map-circle-color: ${t.dashboardMapCircleColor};
    --dashboard-map-control-disabled-background-color: ${t.dashboardMapControlDisabledBackground};

    --chart-tooltip-label-color: ${t.chartTooltipLabel};
    --chart-color1: ${t.chartColor1};
    --chart-rgb-color1: ${hexToRGB(t.chartColor1)};
    --chart-color1-tint: ${t.chartColor1Tint};
    --chart-color2: ${t.chartColor2};
    --chart-color2-tint: ${t.chartColor2Tint};
    --chart-color3: ${t.chartColor3};
    --chart-color3-tint: ${t.chartColor3Tint};
    --chart-color4: ${t.chartColor4};
    --chart-color4-tint: ${t.chartColor4Tint};
    --chart-color5: ${t.chartColor5};
    --chart-rgb-color5: ${hexToRGB(t.chartColor5)};
    --chart-color5-tint: ${t.chartColor5Tint};

    --notification-success-color: ${t.notificationSuccess};
    --notification-primary-color: ${t.notificationPrimary};
    --notification-warning-color: ${t.notificationWarning};
    --notification-error-color: ${t.notificationError};

    --icon-color: ${t.icon};
    --icon-hover-color: ${t.iconHover};
    --ink-faint: ${t.ink.faint};
    --ink-soft: ${t.ink.soft};
    --ink-line: ${t.ink.line};
    --ink-muted: ${t.ink.muted};
    --ink-subtle: ${t.ink.subtle};
    --ink-text: ${t.ink.text};
    --ink-strong: ${t.ink.strong};
    --domain-tint-soft: ${t.domainTintSoft};
    --domain-tint-strong: ${t.domainTintStrong};
    --shadow-elevated: ${t.shadowElevated};
    --sider-ink-faint: ${t.siderInk.faint};
    --sider-ink-soft: ${t.siderInk.soft};
    --sider-ink-line: ${t.siderInk.line};
    --sider-ink-strong: ${t.siderInk.strong};
    --sider-shadow: ${t.siderInk.shadow};
    --box-shadow: ${t.boxShadow};
    --box-shadow-hover: ${t.boxShadowHover};
    --box-shadow-nft-color: ${t.boxShadowNft};
    --box-shadow-nft-secondary-color: ${t.boxShadowNftSecondary};

    --heading-color: ${t.heading};
    --item-hover-bg: ${t.itemHoverBg};
    --background-base-color: ${t.backgroundColorBase};
    --border-base-color: ${t.borderBase};
    --disabled-color: ${t.disable};
    --disabled-bg-color: ${t.disabledBg};
    --layout-body-bg-color: ${t.layoutBodyBg};
    --layout-header-bg-color: ${t.layoutHeaderBg};
    --layout-sider-bg-color: ${t.layoutSiderBg};
    --input-placeholder-color: ${t.inputPlaceholder};
    --avatar-bg: ${t.avatarBg};
    --alert-text-color: ${t.alertTextColor};
    --breadcrumb-color: ${t.breadcrumb};

    /* antd-mobile, mapped from this theme's tokens */
    --adm-color-primary: var(--primary-color);
    --adm-color-success: var(--success-color);
    --adm-color-warning: var(--warning-color);
    --adm-color-danger: var(--error-color);
    --adm-color-text: var(--text-main-color);
    --adm-color-text-secondary: var(--text-muted-color);
    --adm-color-text-light-solid: var(--text-on-color);
    --adm-color-weak: var(--text-light-color);
    --adm-color-light: var(--text-superLight-color);
    --adm-color-border: var(--border-color);
    --adm-color-background: var(--additional-background-color);
    --adm-color-background-body: var(--background-color);
    --adm-color-box: var(--secondary-background-color);
    --adm-color-fill-content: var(--secondary-background-color);
    --adm-border-color: var(--border-color);
    --psr-mobile-surface-bg: var(--secondary-background-color);
    --psr-mobile-elevated-bg: var(--additional-background-color);
  `;
};

/** One isolated block per registered theme. */
export const themeBlocks = css`
  ${THEME_LIST.map(
    (def) => css`
      [data-theme='${def.id}'] {
        ${themeColorVariables(def)}
      }
    `,
  )}
`;

/** Theme-independent variables (no colors). */
export const foundationVariables = css`
  --font-main: ${FOUNDATION_FONTS.main};
  --font-secondary: ${FOUNDATION_FONTS.secondary};
`;
