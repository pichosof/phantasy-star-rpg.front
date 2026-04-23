import { createGlobalStyle } from 'styled-components';
import { resetCss } from './resetCss';
import { BREAKPOINTS, FONT_SIZE, FONT_WEIGHT, media } from './themes/constants';
import { lightThemeVariables, darkThemeVariables, commonThemeVariables } from './themes/themeVariables';
import {
  MOBILE_ACTION_BAR_MIN_HEIGHT,
  MOBILE_CARD_RADIUS,
  MOBILE_PAGE_GUTTER,
  MOBILE_SECTION_GAP,
  MOBILE_SHEET_RADIUS,
} from './styleUtils';

export default createGlobalStyle`

  ${resetCss}

  [data-theme='light'],
  :root {
    ${lightThemeVariables}
  }

  [data-theme='dark'] {
    ${darkThemeVariables}
  }

  :root {
    ${commonThemeVariables};
    --adm-color-primary: var(--primary-color);
    --adm-color-success: var(--success-color);
    --adm-color-warning: var(--warning-color);
    --adm-color-danger: var(--error-color);
    --adm-color-text: var(--text-main-color);
    --adm-color-text-secondary: var(--text-secondary-color);
    --adm-color-weak: var(--text-light-color);
    --adm-color-light: var(--text-superLight-color);
    --adm-color-border: var(--border-color);
    --adm-color-background: var(--additional-background-color);
    --adm-color-background-body: var(--background-color);
    --adm-color-box: var(--secondary-background-color);
    --adm-color-fill-content: var(--secondary-background-color);
    --adm-border-color: var(--border-color);
    --adm-font-family: var(--font-main);
    --adm-radius-s: 7px;
    --adm-radius-m: 10px;
    --adm-radius-l: 16px;
    --psr-mobile-page-gutter: ${MOBILE_PAGE_GUTTER}px;
    --psr-mobile-section-gap: ${MOBILE_SECTION_GAP}px;
    --psr-mobile-card-radius: ${MOBILE_CARD_RADIUS}px;
    --psr-mobile-sheet-radius: ${MOBILE_SHEET_RADIUS}px;
    --psr-mobile-action-bar-min-height: ${MOBILE_ACTION_BAR_MIN_HEIGHT}px;
    --psr-mobile-surface-bg: var(--secondary-background-color);
    --psr-mobile-elevated-bg: var(--additional-background-color);
  } 

  [data-no-transition] * {
    transition: none !important;
  }
  
  .range-picker {
    & .ant-picker-panels {
      @media only screen and ${media.xs} and (max-width: ${BREAKPOINTS.md - 0.02}px) {
        display: flex;
      flex-direction: column;
      }
    }
  }

  .search-dropdown {
    box-shadow: var(--box-shadow);

    @media only screen and ${media.xs} and (max-width: ${BREAKPOINTS.md - 0.02}px)  {
      width: calc(100vw - 16px);
    max-width: 600px;
    }

    @media only screen and ${media.md} {
      max-width: 323px;
    }
  }

  h1, h2, h3, h4, h5, h6,
  .ant-typography h1, .ant-typography h2, .ant-typography h3,
  .ant-typography h4, .ant-typography h5 {
    font-family: 'Montserrat', sans-serif;
  }

  a {
    color: var(--primary-color);
    &:hover,:active {
      color: var(--primary-color);
    }
  }
  
  .d-none {
    display: none;
  }

  @keyframes edge-glow {
    from {
      box-shadow: 0 0 8px rgba(250,173,20,0.5), 0 0 16px rgba(212,56,13,0.3);
    }

    to {
      box-shadow: 0 0 16px rgba(250,173,20,0.9), 0 0 32px rgba(212,56,13,0.6);
    }
  }

  /* ── RPG utility classes ──────────────────────────────────────────────────── */
  .rpg-m0  { margin: 0; }
  .rpg-w-full { width: 100%; }
  .rpg-mb-4  { margin-bottom: 4px; }
  .rpg-mb-8  { margin-bottom: 8px; }
  .rpg-mb-12 { margin-bottom: 12px; }
  .rpg-mb-16 { margin-bottom: 16px; }
  .rpg-text-xs  { font-size: 11px; }
  .rpg-text-sm  { font-size: 12px; }
  .rpg-text-md  { font-size: 13px; }
  .rpg-font-bold      { font-weight: 700; }
  .rpg-font-extrabold { font-weight: 800; }
  .rpg-muted    { color: #8c8c8c; }
  .rpg-pre-wrap { white-space: pre-wrap; margin: 0; }
  .rpg-overflow-x { overflow-x: auto; }
  .rpg-table-wrap { overflow-x: auto; width: 100%; }
  .rpg-img-cover  { width: 100%; object-fit: cover; display: block; }
  .rpg-flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .rpg-page-header-card { margin-bottom: 16px; }
  .rpg-divider-sm { margin: 4px 0; }
  .rpg-divider-md { margin: 8px 0; }

  .ant-picker-cell {
    color: var(--text-main-color);
  }

  .ant-picker-cell-in-view .ant-picker-calendar-date-value {
    color: var(--text-main-color);
    font-weight: ${FONT_WEIGHT.bold};
  }

  .ant-picker svg {
    color: var(--text-light-color);
  }

  // notifications start
  .ant-notification-notice {
    width: 36rem;
    padding: 2rem;
    min-height: 6rem;
    
    .ant-notification-notice-with-icon .ant-notification-notice-message {
      margin-bottom: 0;
      margin-left: 2.8125rem;
    }

    .ant-notification-notice-with-icon .ant-notification-notice-description {
      margin-left: 4.375rem;
      margin-top: 0;
    }

    .ant-notification-notice-icon {
      font-size: 2.8125rem;
      margin-left: 0
    }

    .ant-notification-notice-close {
      top: 1.25rem;
      right: 1.25rem;
    }

    .ant-notification-notice-close-x {
      display: flex;
      font-size: 0.9375rem;
    }

    .notification-without-description {
      .ant-notification-notice-close {
        top: 1.875rem;
      }
      .ant-notification-notice-with-icon .ant-notification-notice-description  {
        margin-top: 0.625rem;
      }
    }
    
    .title {
      font-size: ${FONT_SIZE.xxl};
      height: 3rem;
      margin-left: 1.5rem;
      display: flex;
      align-items: center;
      font-weight: ${FONT_WEIGHT.bold};

      &.title-only {
        color: var(--text-main-color);
        font-size: ${FONT_SIZE.md};
        height: 2rem;
        line-height: 2rem;
        margin-left: 0.75rem;
        font-weight: ${FONT_WEIGHT.semibold};
      }
  }
  
    .description {
      color: #404040;
      font-size: ${FONT_SIZE.md};
      font-weight: ${FONT_WEIGHT.semibold};
      line-height: 1.375rem;
    }
  
    &.ant-notification-notice-success {
      border: 1px solid var(--success-color);
      background: var(--notification-success-color);
      
      .title {
        color: var(--success-color);
      }
    }
  
    &.ant-notification-notice-info {
      border: 1px solid var(--primary-color);
      background: var(--notification-primary-color);
  
      .title {
        color: var(--primary-color);
      }
    }
  
    &.ant-notification-notice-warning {
      border: 1px solid var(--warning-color);
      background: var(--notification-warning-color);
  
      .title {
        color: var(--warning-color);
      }
    }
  
    &.ant-notification-notice-error {
      border: 1px solid var(--error-color);
      background: var(--notification-error-color);
  
      .title {
        color: var(--error-color);
      }
    }
  
    .success-icon {
      color: var(--success-color);
    }
  
    .info-icon {
      color: var(--primary-color);
    }
  
    .warning-icon {
      color: var(--warning-color);
    }
  
    .error-icon {
      color: var(--error-color);
    }
  }
  
  .ant-menu-inline, .ant-menu-vertical {
    border-right: 0;
  }

  .psr-mobile-popup-body {
    background: var(--psr-mobile-surface-bg);
    color: var(--text-main-color);
    box-shadow: var(--box-shadow);
  }

  .psr-mobile-popup-body.psr-mobile-popup-body--bottom {
    border-radius: var(--psr-mobile-sheet-radius) var(--psr-mobile-sheet-radius) 0 0;
  }

  .psr-mobile-popup-body.psr-mobile-popup-body--top {
    border-radius: 0 0 var(--psr-mobile-sheet-radius) var(--psr-mobile-sheet-radius);
  }

  .psr-mobile-popup-body.psr-mobile-popup-body--fullscreen {
    border-radius: 0;
  }

  .psr-mobile-dialog__body {
    background: var(--psr-mobile-elevated-bg);
    color: var(--text-main-color);
    box-shadow: var(--box-shadow);
  }
  // notifications end
`;
