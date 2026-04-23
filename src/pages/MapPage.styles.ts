import type { CSSProperties } from 'react';
import styled from 'styled-components';

export const WorldCard = styled.div<{ $active: boolean }>`
  border: 1px solid ${(p) => (p.$active ? 'var(--primary-color)' : 'var(--border-color)')};
  border-radius: 8px;
  padding: 12px;
  background: ${(p) => (p.$active ? 'rgba(22, 119, 255, 0.1)' : 'transparent')};
`;

export const worldDescription: CSSProperties = {
  fontSize: 12,
  display: 'block',
  marginTop: 4,
};

export const worldThumbWrap: CSSProperties = {
  marginTop: 8,
  borderRadius: 6,
  overflow: 'hidden',
  maxHeight: 80,
};

export const worldThumbImage: CSSProperties = {
  width: '100%',
  maxHeight: 80,
  objectFit: 'cover',
  display: 'block',
};

export const worldCreateNote: CSSProperties = {
  fontSize: 12,
};

export const loadingSpinner: CSSProperties = {
  display: 'block',
  margin: '64px auto',
};

export const emptyStateWrap: CSSProperties = {
  padding: 24,
};

export const pageWrap: CSSProperties = {
  padding: 16,
};

export const searchInput: CSSProperties = {
  width: 220,
};

export const regionSelect: CSSProperties = {
  width: 180,
};

export const statusSelect: CSSProperties = {
  width: 160,
};

export const gmPickerSelect: CSSProperties = {
  width: 260,
};

export function mapCanvas(presentMode: boolean, isFullscreen: boolean, cursorActive: boolean): CSSProperties {
  return {
    position: presentMode && !isFullscreen ? 'fixed' : 'relative',
    inset: presentMode && !isFullscreen ? 0 : undefined,
    zIndex: presentMode && !isFullscreen ? 9999 : undefined,
    width: '100%',
    height: presentMode ? '100vh' : undefined,
    margin: presentMode && !isFullscreen ? 0 : '0 auto',
    borderRadius: presentMode ? 0 : 8,
    overflow: 'hidden',
    background: 'black',
    boxShadow: presentMode ? 'none' : '0 2px 8px rgba(0,0,0,0.15)',
    cursor: cursorActive ? 'crosshair' : 'default',
  };
}

export const presentToolbar: CSSProperties = {
  position: 'absolute',
  left: 12,
  top: 12,
  zIndex: 10000,
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  background: 'rgba(0,0,0,0.55)',
  padding: '8px 10px',
  borderRadius: 10,
  color: '#fff',
  backdropFilter: 'blur(2px)',
};

export function mapImage(presentMode: boolean): CSSProperties {
  return {
    display: 'block',
    width: '100%',
    height: presentMode ? '100%' : 'auto',
    objectFit: presentMode ? 'contain' : undefined,
    userSelect: 'none',
    background: 'black',
  };
}

export function markerTooltip(left: string, top: string): CSSProperties {
  return {
    position: 'absolute',
    left,
    top,
    transform: 'translate(-50%, calc(-100% - 10px))',
    background: 'rgba(0,0,0,0.75)',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: 6,
    fontSize: 12,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    zIndex: 20,
  };
}

export function cityMarker(left: string, top: string, bg: string, selected: boolean): CSSProperties {
  return {
    position: 'absolute',
    left,
    top,
    transform: 'translate(-50%, -50%)',
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: bg,
    border: '2px solid rgba(0,0,0,0.85)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
    cursor: 'pointer',
    zIndex: 10,
    outline: selected ? '3px solid rgba(255,255,0,0.8)' : 'none',
    outlineOffset: 2,
  };
}

export function dungeonMarker(left: string, top: string, bg: string, selected: boolean): CSSProperties {
  return {
    position: 'absolute',
    left,
    top,
    transform: 'translate(-50%, -50%) rotate(45deg)',
    width: 14,
    height: 14,
    background: bg,
    border: '2px solid rgba(0,0,0,0.85)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
    cursor: 'pointer',
    zIndex: 10,
    outline: selected ? '3px solid rgba(255,255,0,0.8)' : 'none',
    outlineOffset: 2,
  };
}

export const rulerSvg: CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
};

export const drawerTitleText: CSSProperties = {
  fontWeight: 800,
};

export function drawerImageWrap(maxHeight: number, marginBottom = 0): CSSProperties {
  return {
    borderRadius: 8,
    overflow: 'hidden',
    maxHeight,
    marginBottom,
  };
}

export function drawerImage(maxHeight: number): CSSProperties {
  return {
    width: '100%',
    maxHeight,
    objectFit: 'cover',
    display: 'block',
  };
}

export const drawerParagraph: CSSProperties = {
  whiteSpace: 'pre-wrap',
  marginTop: 8,
};

export const drawerCompactParagraph: CSSProperties = {
  whiteSpace: 'pre-wrap',
};

export const imageAltFormItem: CSSProperties = {
  marginBottom: 8,
};

export const LinkedGrid = styled.div`
  display: grid;
  gap: 10px;
`;

export const LinkedCard = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 12px;
  background: var(--additional-background-color);
`;

export const linkedParagraph: CSSProperties = {
  marginTop: 8,
  whiteSpace: 'pre-wrap',
};

export const MobileMapStack = styled.div`
  display: grid;
  gap: 12px;
`;

export const MobileWorldTitle = styled.h1`
  margin: 0;
  color: var(--text-main-color);
  font-size: 1.35rem;
  line-height: 1.1;
  font-weight: 900;
  letter-spacing: -0.035em;
`;

export const MobileWorldDescription = styled.p`
  margin: 6px 0 0;
  color: var(--text-secondary-color);
  font-size: 0.86rem;
  line-height: 1.45;
`;

export const MobileMetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const MobileControlGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
`;

export const MobileMapViewport = styled.div`
  width: 100%;
  overflow: auto;
  border-radius: 18px;
  border: 1px solid var(--border-color);
  background: #050609;
  -webkit-overflow-scrolling: touch;
`;

export function mobileMapCanvas(presentMode: boolean, isFullscreen: boolean, cursorActive: boolean): CSSProperties {
  return {
    ...mapCanvas(presentMode, isFullscreen, cursorActive),
    minWidth: presentMode ? '100%' : 680,
    borderRadius: presentMode ? 0 : 18,
    boxShadow: presentMode ? 'none' : '0 18px 48px rgba(0,0,0,0.24)',
    touchAction: cursorActive ? 'manipulation' : 'pan-x pan-y',
  };
}

export function mobileCityMarker(left: string, top: string, bg: string, selected: boolean): CSSProperties {
  return {
    ...cityMarker(left, top, bg, selected),
    width: 28,
    height: 28,
    borderWidth: 3,
    boxShadow: '0 4px 12px rgba(0,0,0,0.34)',
  };
}

export function mobileDungeonMarker(left: string, top: string, bg: string, selected: boolean): CSSProperties {
  return {
    ...dungeonMarker(left, top, bg, selected),
    width: 24,
    height: 24,
    borderWidth: 3,
    boxShadow: '0 4px 12px rgba(0,0,0,0.38)',
  };
}

export const MobileInstruction = styled.div`
  border: 1px solid color-mix(in srgb, var(--primary-color) 45%, transparent);
  border-radius: 16px;
  padding: 10px 12px;
  background: color-mix(in srgb, var(--primary-color) 12%, transparent);
  color: var(--text-main-color);
  font-size: 0.86rem;
  line-height: 1.4;
`;

export const MobileSheetStack = styled.div`
  display: grid;
  gap: 12px;
`;

export const MobileLinkedList = styled.div`
  display: grid;
  gap: 10px;
`;

export const MobileLinkedCard = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 10px;
  background: var(--psr-mobile-elevated-bg);
`;

export const MobileLinkedTitle = styled.div`
  color: var(--text-main-color);
  font-weight: 800;
`;

export const MobileLinkedText = styled.p`
  margin: 8px 0 0;
  color: var(--text-secondary-color);
  font-size: 0.84rem;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const MobilePickerList = styled.div`
  display: grid;
  gap: 8px;
`;

export const MobilePickerButton = styled.button<{ $active?: boolean }>`
  width: 100%;
  border: 1px solid ${(p) => (p.$active ? 'var(--primary-color)' : 'var(--border-color)')};
  border-radius: 14px;
  padding: 10px 12px;
  background: ${(p) =>
    p.$active ? 'color-mix(in srgb, var(--primary-color) 12%, transparent)' : 'var(--psr-mobile-elevated-bg)'};
  color: var(--text-main-color);
  text-align: left;
  display: grid;
  gap: 4px;
`;

export const MobilePickerTitle = styled.span`
  font-weight: 800;
`;

export const MobilePickerMeta = styled.span`
  color: var(--text-secondary-color);
  font-size: 0.78rem;
`;

export const MobileEmptyState = styled.div`
  min-height: 116px;
  display: grid;
  place-items: center;
  text-align: center;
  color: var(--text-secondary-color);
  line-height: 1.45;
`;
