import type { CSSProperties } from 'react';
import styled, { css } from 'styled-components';
import {
  Card as AdmCard,
  Form as AdmForm,
  List as AdmList,
  SearchBar as AdmSearchBar,
  Tabs as AdmTabs,
} from 'antd-mobile';
import {
  MOBILE_ACTION_BAR_MIN_HEIGHT,
  MOBILE_CARD_RADIUS,
  MOBILE_PAGE_GUTTER,
  MOBILE_SECTION_GAP,
  MOBILE_SHEET_RADIUS,
  MOBILE_TOUCH_TARGET,
} from '@app/styles/styleUtils';

export const MOBILE_POPUP_BODY_CLASS = 'psr-mobile-popup-body';
export const MOBILE_DIALOG_BODY_CLASS = 'psr-mobile-dialog__body';
export const MOBILE_ACTION_SHEET_CLASS = 'psr-mobile-action-sheet';

const surfaceChrome = css`
  background: var(--psr-mobile-elevated-bg);
  border: 1px solid var(--border-color);
  box-shadow: var(--box-shadow);
  color: var(--text-main-color);
`;

export const mobileSearchBarStyle: CSSProperties = {
  '--background': 'var(--psr-mobile-elevated-bg)',
  '--border-radius': `${MOBILE_CARD_RADIUS}px`,
  '--height': '42px',
  '--padding-left': '14px',
  border: '1px solid var(--border-color)',
  boxShadow: 'var(--box-shadow)',
} as CSSProperties;

export const mobileSelectorStyle: CSSProperties = {
  '--border-radius': `${MOBILE_CARD_RADIUS}px`,
  '--border': '1px solid var(--border-color)',
  '--checked-border': '1px solid var(--primary-color)',
  '--padding': '12px 14px',
  '--gap': '10px',
  '--text-color': 'var(--text-main-color)',
  '--checked-text-color': 'var(--primary-color)',
  '--color': 'var(--psr-mobile-elevated-bg)',
  '--checked-color': 'rgba(24, 144, 255, 0.14)',
} as CSSProperties;

export const mobileDialogBodyStyle: CSSProperties = {
  borderRadius: MOBILE_SHEET_RADIUS,
  overflow: 'hidden',
};

export const getMobileActionSheetStyles = (
  styles?: Partial<Record<'body' | 'mask', CSSProperties>>,
): Partial<Record<'body' | 'mask', CSSProperties>> => ({
  body: {
    background: 'var(--psr-mobile-elevated-bg)',
    color: 'var(--text-main-color)',
    borderTopLeftRadius: MOBILE_SHEET_RADIUS,
    borderTopRightRadius: MOBILE_SHEET_RADIUS,
    boxShadow: 'var(--box-shadow)',
    ...styles?.body,
  },
  mask: styles?.mask,
});

export const getMobilePopupBodyStyle = (
  position: 'bottom' | 'top' | 'left' | 'right',
  fullscreen: boolean,
  bodyStyle?: CSSProperties,
): CSSProperties => {
  const base: CSSProperties = {
    background: 'var(--psr-mobile-surface-bg)',
    color: 'var(--text-main-color)',
  };

  const sheet = fullscreen
    ? {
        width: position === 'left' || position === 'right' ? '100vw' : '100%',
        height: '100vh',
        maxHeight: '100vh',
      }
    : position === 'left' || position === 'right'
      ? {
          width: '90vw',
          maxWidth: 480,
          height: '100vh',
        }
      : {
          width: '100%',
          maxHeight: '92vh',
        };

  return {
    ...base,
    ...sheet,
    ...bodyStyle,
  };
};

export const MobilePageRoot = styled.section`
  display: grid;
  gap: ${MOBILE_SECTION_GAP}px;
  padding: 0 0 calc(${MOBILE_SECTION_GAP}px + env(safe-area-inset-bottom));
`;

export const MobilePageHero = styled.header`
  display: grid;
  gap: 12px;
  padding: 0 ${MOBILE_PAGE_GUTTER}px;
`;

export const MobilePageTitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

export const MobilePageHeading = styled.div`
  min-width: 0;
  display: grid;
  gap: 6px;
`;

export const MobilePageTitle = styled.h1`
  margin: 0;
  color: var(--text-main-color);
  font-size: 1.625rem;
  line-height: 1.05;
  font-weight: 800;
`;

export const MobilePageSubtitle = styled.p`
  margin: 0;
  color: var(--text-secondary-color);
  font-size: 0.9375rem;
  line-height: 1.45;
`;

export const MobilePageMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

export const MobilePageFilters = styled.div`
  display: grid;
  gap: 10px;
  padding: 0 ${MOBILE_PAGE_GUTTER}px;
`;

export const MobilePageContent = styled.div`
  display: grid;
  gap: ${MOBILE_SECTION_GAP}px;
  padding: 0 ${MOBILE_PAGE_GUTTER}px;
`;

export const MobileSectionHeaderRoot = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

export const MobileSectionCopy = styled.div`
  min-width: 0;
  display: grid;
  gap: 4px;
`;

export const MobileSectionTitle = styled.h2`
  margin: 0;
  color: var(--text-main-color);
  font-size: 1rem;
  line-height: 1.2;
  font-weight: 700;
`;

export const MobileSectionDescription = styled.p`
  margin: 0;
  color: var(--text-secondary-color);
  font-size: 0.875rem;
  line-height: 1.45;
`;

export const MobileSectionAside = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const MobileCardRoot = styled(AdmCard)<{ $compact: boolean; $inset: boolean }>`
  ${surfaceChrome};
  overflow: hidden;
  border-radius: ${MOBILE_CARD_RADIUS}px;

  ${({ $inset }) =>
    $inset &&
    css`
      margin: 0;
    `}

  .adm-card-header {
    padding: ${({ $compact }) => ($compact ? '12px 14px 8px' : '16px 16px 10px')};
  }

  .adm-card-header-title {
    color: var(--text-main-color);
    font-weight: 700;
  }

  .adm-card-header-extra {
    color: var(--text-secondary-color);
  }

  .adm-card-body {
    padding: ${({ $compact }) => ($compact ? '12px 14px 14px' : '16px')};
    color: var(--text-main-color);
  }
`;

export const MobileListRoot = styled(AdmList)<{ $inset: boolean }>`
  ${({ $inset }) =>
    $inset &&
    css`
      margin: 0;
    `}

  overflow: hidden;
  border-radius: ${MOBILE_CARD_RADIUS}px;
  ${surfaceChrome};

  && {
    --border-top: none;
    --border-bottom: none;
    --padding-left: 14px;
    --padding-right: 14px;
    --prefix-padding-right: 12px;
    --font-size: 0.95rem;
    --header-font-size: 0.875rem;
  }
`;

export const MobileTabsRoot = styled(AdmTabs)`
  && {
    --title-font-size: 0.95rem;
    --active-line-height: 3px;
    --active-line-border-radius: 999px;
    --active-line-color: var(--primary-color);
    --active-title-color: var(--primary-color);
    --content-padding: 16px 0 0;
  }

  .adm-tabs-header {
    padding: 0;
  }
`;

export const MobileFormRoot = styled(AdmForm)`
  && {
    --border-top: none;
    --border-bottom: none;
    --border-inner: 1px solid rgba(140, 140, 140, 0.16);
  }

  .adm-form-item-label {
    color: var(--text-secondary-color);
    font-size: 0.82rem;
  }

  .adm-form-footer {
    padding-top: 8px;
  }
`;

export const MobileSearchBarRoot = styled(AdmSearchBar)<{ $inset: boolean }>`
  ${({ $inset }) =>
    $inset &&
    css`
      margin: 0;
    `}
`;

export const MobileSelectorShell = styled.div<{ $inset: boolean }>`
  ${({ $inset }) =>
    $inset &&
    css`
      margin: 0;
    `}
`;

export const MobileSheetHandle = styled.div`
  width: 38px;
  height: 4px;
  border-radius: 999px;
  background: rgba(140, 140, 140, 0.45);
  margin: 4px auto 0;
`;

export const MobileSheetFrame = styled.div`
  min-height: 0;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr) auto;
  height: 100%;
`;

export const MobileSheetHeader = styled.header`
  display: grid;
  gap: 10px;
  padding: 10px ${MOBILE_PAGE_GUTTER}px 0;
`;

export const MobileSheetLead = styled.div`
  display: grid;
  gap: 4px;
  padding: 0 4px 8px;
`;

export const MobileSheetTitle = styled.div`
  color: var(--text-main-color);
  font-size: 0.95rem;
  font-weight: 700;
`;

export const MobileSheetSubtitle = styled.div`
  color: var(--text-secondary-color);
  font-size: 0.875rem;
  line-height: 1.45;
`;

export const MobileSheetBody = styled.div`
  min-height: 0;
  overflow: auto;
  display: grid;
  gap: ${MOBILE_SECTION_GAP}px;
  padding: 0 ${MOBILE_PAGE_GUTTER}px ${MOBILE_PAGE_GUTTER}px;
`;

export const MobileSheetFooter = styled.footer`
  padding: 0 ${MOBILE_PAGE_GUTTER}px ${MOBILE_PAGE_GUTTER}px;
`;

export const MobileDismissButton = styled.button`
  width: ${MOBILE_TOUCH_TARGET}px;
  min-width: ${MOBILE_TOUCH_TARGET}px;
  height: ${MOBILE_TOUCH_TARGET}px;
  border: 0;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(140, 140, 140, 0.14);
  color: var(--text-main-color);
  cursor: pointer;
`;

export const MobileFilterHeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

export const MobileFilterBody = styled.div`
  display: grid;
  gap: 12px;
`;

export const MobileActionBarRoot = styled.div<{ $sticky: boolean }>`
  ${({ $sticky }) =>
    $sticky &&
    css`
      position: sticky;
      bottom: 0;
      z-index: 5;
    `}

  margin-top: auto;
`;

export const MobileActionBarSurface = styled.div<{ $stacked: boolean }>`
  ${surfaceChrome};
  display: grid;
  gap: 10px;
  padding: 12px ${MOBILE_PAGE_GUTTER}px 12px;
  border-radius: ${MOBILE_SHEET_RADIUS}px ${MOBILE_SHEET_RADIUS}px 0 0;
  min-height: ${MOBILE_ACTION_BAR_MIN_HEIGHT}px;
  backdrop-filter: blur(12px);

  ${({ $stacked }) =>
    !$stacked &&
    css`
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: stretch;
    `}
`;
