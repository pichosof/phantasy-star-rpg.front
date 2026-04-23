import type { CSSProperties } from 'react';
import styled from 'styled-components';

type ReaderTheme = 'light' | 'sepia' | 'dark';

function tocTextColor(themeVariant: ReaderTheme) {
  if (themeVariant === 'dark') return '#ccc';
  if (themeVariant === 'sepia') return '#5b4636';
  return '#333';
}

function tocHoverColor(themeVariant: ReaderTheme) {
  return themeVariant === 'dark' ? '#222' : '#f0f0f0';
}

export const pdfViewer: CSSProperties = {
  height: '100%',
  overflow: 'auto',
};

export const viewerError: CSSProperties = {
  padding: 24,
  color: 'var(--error-color)',
};

export function docxViewer(isMobile: boolean): CSSProperties {
  return {
    height: '100%',
    overflowY: 'auto',
    background: '#fff',
    lineHeight: 1.7,
    padding: isMobile ? '16px' : '24px 40px',
    fontSize: isMobile ? 15 : 16,
  };
}

export function txtViewer(isMobile: boolean): CSSProperties {
  return {
    height: '100%',
    overflowY: 'auto',
    margin: 0,
    padding: isMobile ? '12px 14px' : '24px 32px',
    fontFamily: 'monospace',
    fontSize: isMobile ? 13 : 14,
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    background: '#fafafa',
  };
}

export const mobiFallback: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  gap: 16,
  padding: 24,
  textAlign: 'center',
};

export const mobiFallbackText: CSSProperties = {
  maxWidth: 360,
};

export const EpubRoot = styled.div<{ $bg: string }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${(p) => p.$bg};
`;

export const EpubToolbar = styled.div<{ $mobile: boolean; $border: string; $bar: string }>`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${(p) => (p.$mobile ? '4px' : '8px')};
  padding: ${(p) => (p.$mobile ? '5px 8px' : '6px 12px')};
  border-bottom: 1px solid ${(p) => p.$border};
  background: ${(p) => p.$bar};
`;

export const EpubToolbarSpacer = styled.div`
  flex: 1;
`;

export function epubFontSize(fgMuted: string): CSSProperties {
  return {
    fontSize: 12,
    minWidth: 34,
    textAlign: 'center',
    color: fgMuted,
  };
}

export const EpubBody = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
`;

export const EpubTocPanel = styled.div<{ $mobile: boolean; $border: string; $bar: string }>`
  position: ${(p) => (p.$mobile ? 'absolute' : 'relative')};
  top: ${(p) => (p.$mobile ? '0' : 'auto')};
  left: ${(p) => (p.$mobile ? '0' : 'auto')};
  bottom: ${(p) => (p.$mobile ? '0' : 'auto')};
  z-index: ${(p) => (p.$mobile ? 10 : 'auto')};
  box-shadow: ${(p) => (p.$mobile ? '2px 0 12px rgba(0,0,0,0.18)' : 'none')};
  border-right: ${(p) => (p.$mobile ? 'none' : `1px solid ${p.$border}`)};
  width: ${(p) => (p.$mobile ? '80vw' : '220px')};
  max-width: 320px;
  overflow-y: auto;
  padding: 8px 0;
  background: ${(p) => p.$bar};
`;

export const EpubTocHeader = styled.div`
  padding: 6px 14px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export function epubTocTitle(fgMuted: string): CSSProperties {
  return {
    color: fgMuted,
    fontSize: 13,
  };
}

export const EpubTocItem = styled.div<{ $mobile: boolean; $themeVariant: ReaderTheme }>`
  padding: ${(p) => (p.$mobile ? '10px 16px' : '6px 14px')};
  cursor: pointer;
  font-size: ${(p) => (p.$mobile ? '15px' : '13px')};
  color: ${(p) => tocTextColor(p.$themeVariant)};
  transition: background 0.12s;

  &:hover {
    background: ${(p) => tocHoverColor(p.$themeVariant)};
  }
`;

export const epubBackdrop: CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(0,0,0,0.35)',
  zIndex: 9,
};

export const epubReaderPane: CSSProperties = {
  flex: 1,
  position: 'relative',
  minWidth: 0,
};

export function viewerModal(modalTop: number, mobileOnly: boolean): CSSProperties {
  return {
    top: modalTop,
    padding: 0,
    margin: mobileOnly ? 0 : undefined,
    maxWidth: '100vw',
  };
}

export function viewerModalStyles(bodyHeight: string): { body: CSSProperties } {
  return {
    body: {
      padding: 0,
      height: bodyHeight,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },
  };
}

export const viewerLoading: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
};

export const keyEntryScreen: CSSProperties = {
  minHeight: '60vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
};

export const keyEntryCard: CSSProperties = {
  maxWidth: 420,
  width: '100%',
  textAlign: 'center',
};

export const keyEntryIcon: CSSProperties = {
  fontSize: 48,
  color: 'var(--primary-color)',
};

export function docCard(hidden: boolean): CSSProperties {
  return {
    opacity: hidden ? 0.65 : 1,
  };
}

export function docHeaderRow(isMobile: boolean): CSSProperties {
  return {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? 8 : 12,
    alignItems: isMobile ? 'stretch' : 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  };
}

export function docActions(isMobile: boolean): CSSProperties {
  return {
    flexShrink: 0,
    justifyContent: isMobile ? 'flex-end' : undefined,
  };
}

export function docMetaWrap(hasDescription: boolean): CSSProperties {
  return {
    marginTop: hasDescription ? 6 : 0,
  };
}

export const docMetaText: CSSProperties = {
  fontSize: 11,
  wordBreak: 'break-all',
};

export const editModalStack: CSSProperties = {
  width: '100%',
  marginTop: 8,
};

export const modalFieldLabel: CSSProperties = {
  fontSize: 12,
  display: 'block',
  marginBottom: 4,
};

export const uploadTitleInput: CSSProperties = {
  minWidth: 220,
  flex: 1,
};

export const uploadCategorySelect: CSSProperties = {
  minWidth: 160,
};

export const headerDivider: CSSProperties = {
  margin: '6px 0',
};

export const headerSearchInput: CSSProperties = {
  width: 260,
};

export const headerFilterSelect: CSSProperties = {
  minWidth: 180,
};

export const DocListGrid = styled.div`
  display: grid;
  gap: 10px;
`;
