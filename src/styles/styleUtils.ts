import type { CSSProperties } from 'react';

// ── Spacing ───────────────────────────────────────────────────────────────────
export const m0: CSSProperties = { margin: 0 };
export const mb4: CSSProperties = { marginBottom: 4 };
export const mb6: CSSProperties = { marginBottom: 6 };
export const mb8: CSSProperties = { marginBottom: 8 };
export const mb12: CSSProperties = { marginBottom: 12 };
export const mb16: CSSProperties = { marginBottom: 16 };

// ── Sizing ────────────────────────────────────────────────────────────────────
export const w100: CSSProperties = { width: '100%' };
export const wAuto: CSSProperties = { width: 'auto' };

// ── Typography ────────────────────────────────────────────────────────────────
export const textXs: CSSProperties = { fontSize: 11 };
export const textSm: CSSProperties = { fontSize: 12 };
export const textMd: CSSProperties = { fontSize: 13 };
export const bold700: CSSProperties = { fontWeight: 700 };
export const bold800: CSSProperties = { fontWeight: 800 };
export const mutedSm: CSSProperties = { fontSize: 12, color: '#8c8c8c' };
export const mutedXs: CSSProperties = { fontSize: 11, color: '#8c8c8c' };
export const preWrap: CSSProperties = { whiteSpace: 'pre-wrap', margin: 0 };
export const lineHeight175: CSSProperties = { whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.75 };

// ── Layout ────────────────────────────────────────────────────────────────────
export const spaceBetween: CSSProperties = {
  justifyContent: 'space-between',
  width: '100%',
  flexWrap: 'wrap',
};

export const flexCenter: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const overflowXAuto: CSSProperties = { overflowX: 'auto' };
export const tableWrap: CSSProperties = { overflowX: 'auto', width: '100%' };

// ── Images ────────────────────────────────────────────────────────────────────
export const imgCover: CSSProperties = { width: '100%', objectFit: 'cover', display: 'block' };
export const imgContain: CSSProperties = { width: '100%', objectFit: 'contain', display: 'block' };
export const hiddenInput: CSSProperties = { display: 'none' };

export function imgCoverH(maxHeight: number): CSSProperties {
  return { width: '100%', maxHeight, objectFit: 'cover', display: 'block' };
}

export function imgContainH(maxHeight: number): CSSProperties {
  return { width: '100%', maxHeight, objectFit: 'contain', display: 'block' };
}

// ── Carousel ──────────────────────────────────────────────────────────────────
export const carouselLeft: CSSProperties = {
  position: 'absolute',
  left: 8,
  top: '50%',
  transform: 'translateY(-50%)',
};

export const carouselRight: CSSProperties = {
  position: 'absolute',
  right: 8,
  top: '50%',
  transform: 'translateY(-50%)',
};

export const carouselLeftLg: CSSProperties = {
  position: 'absolute',
  left: 16,
  top: '50%',
  transform: 'translateY(-50%)',
};

export const carouselRightLg: CSSProperties = {
  position: 'absolute',
  right: 16,
  top: '50%',
  transform: 'translateY(-50%)',
};

export const carouselCounter: CSSProperties = {
  position: 'absolute',
  bottom: 8,
  right: 8,
  background: 'rgba(0,0,0,0.5)',
  color: '#fff',
  fontSize: 11,
  padding: '2px 6px',
  borderRadius: 10,
};

export const carouselTopRight: CSSProperties = {
  position: 'absolute',
  top: 8,
  right: 8,
  display: 'flex',
  gap: 4,
};

// ── Card grid ─────────────────────────────────────────────────────────────────
export function cardGrid(mobile: boolean, minColWidth = 280): CSSProperties {
  return {
    display: 'grid',
    gridTemplateColumns: mobile ? '1fr' : `repeat(auto-fill, minmax(${minColWidth}px, 1fr))`,
    gap: 16,
    alignItems: 'start',
  };
}

export function cardGrid2(mobile: boolean): CSSProperties {
  return {
    display: 'grid',
    gap: 12,
    gridTemplateColumns: mobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
  };
}

// ── Common wrappers ───────────────────────────────────────────────────────────
export const imgThumb: CSSProperties = {
  borderRadius: 8,
  overflow: 'hidden',
};

export const imgThumbTop: CSSProperties = {
  margin: '-12px -12px 12px',
  borderRadius: '8px 8px 0 0',
  overflow: 'hidden',
  height: 140,
};

export const blackBg: CSSProperties = {
  position: 'relative',
  borderRadius: 6,
  overflow: 'hidden',
  background: '#000',
};

export const dungeon404: CSSProperties = {
  height: 80,
  background: 'linear-gradient(135deg,#1a1a2e,#16213e)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 32,
};

// ── Divider ───────────────────────────────────────────────────────────────────
export const dividerSm: CSSProperties = { margin: '4px 0' };
export const dividerMd: CSSProperties = { margin: '8px 0' };

// ── Native HTML carousel buttons ─────────────────────────────────────────────
const _navBase: CSSProperties = {
  position: 'absolute',
  background: 'rgba(0,0,0,0.55)',
  border: 'none',
  borderRadius: 6,
  color: '#fff',
  cursor: 'pointer',
};

export const carouselNavBtnLeft: CSSProperties = {
  ..._navBase,
  top: '50%',
  left: 8,
  transform: 'translateY(-50%)',
  padding: '6px 10px',
  fontSize: 16,
};

export const carouselNavBtnRight: CSSProperties = {
  ..._navBase,
  top: '50%',
  right: 8,
  transform: 'translateY(-50%)',
  padding: '6px 10px',
  fontSize: 16,
};

export const carouselNavBtnLeftLg: CSSProperties = {
  ..._navBase,
  background: 'rgba(0,0,0,0.6)',
  top: '50%',
  left: 12,
  transform: 'translateY(-50%)',
  padding: '8px 12px',
  fontSize: 18,
};

export const carouselNavBtnRightLg: CSSProperties = {
  ..._navBase,
  background: 'rgba(0,0,0,0.6)',
  top: '50%',
  right: 12,
  transform: 'translateY(-50%)',
  padding: '8px 12px',
  fontSize: 18,
};

export const carouselZoomBtn: CSSProperties = {
  position: 'absolute',
  top: 8,
  right: 8,
  background: 'rgba(0,0,0,0.55)',
  border: 'none',
  borderRadius: 6,
  color: '#fff',
  cursor: 'pointer',
  padding: '4px 8px',
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 13,
};

export const carouselCounterCenter: CSSProperties = {
  position: 'absolute',
  bottom: 8,
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(0,0,0,0.6)',
  borderRadius: 12,
  padding: '2px 10px',
  color: '#fff',
  fontSize: 12,
  pointerEvents: 'none',
};

export const carouselCounterCenterLg: CSSProperties = {
  position: 'absolute',
  bottom: 12,
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(0,0,0,0.6)',
  borderRadius: 12,
  padding: '2px 12px',
  color: '#fff',
  fontSize: 13,
};
