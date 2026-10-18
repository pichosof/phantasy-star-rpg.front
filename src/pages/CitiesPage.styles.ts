import type { CSSProperties } from 'react';
import { textSm } from '@app/styles/styleUtils';

export const carouselFrame: CSSProperties = {
  position: 'relative',
  marginBottom: 12,
  borderRadius: 8,
  overflow: 'hidden',
  background: '#000', // theme-isolation-ignore: overlay on images/media, dark in every theme
  userSelect: 'none',
};

export const carouselThumbStrip: CSSProperties = {
  display: 'flex',
  gap: 6,
  marginBottom: 12,
  overflowX: 'auto',
};

export function carouselThumb(active: boolean): CSSProperties {
  return {
    width: 56,
    height: 40,
    objectFit: 'cover',
    borderRadius: 4,
    cursor: 'pointer',
    flexShrink: 0,
    border: active ? '2px solid var(--primary-color)' : '2px solid transparent',
    opacity: active ? 1 : 0.6,
  };
}

export const searchField: CSSProperties = {
  maxWidth: 360,
};

export const createForm: CSSProperties = {
  display: 'grid',
  gap: 10,
  maxWidth: 560,
};

export const adminTable: CSSProperties = {
  minWidth: 960,
};

export const tableDescription: CSSProperties = {
  ...textSm,
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export const emptyWithTopSpacing: CSSProperties = {
  marginTop: 16,
};

export const linkedCardsGrid: CSSProperties = {
  display: 'grid',
  gap: 10,
};

export const linkedParagraph: CSSProperties = {
  marginTop: 8,
  whiteSpace: 'pre-wrap',
};

export const rewardText: CSSProperties = {
  display: 'block',
};

export const mobileMetaTags: CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
};

export const mobileActionRow: CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
};

export const mobileSectionStack: CSSProperties = {
  display: 'grid',
  gap: 12,
};

export const mobileCreateFields: CSSProperties = {
  display: 'grid',
  gap: 12,
};

export const mobileCreateField: CSSProperties = {
  display: 'grid',
  gap: 6,
};

export const mobileFieldLabel: CSSProperties = {
  color: 'var(--text-secondary-color)',
  fontSize: 12,
  fontWeight: 600,
};

export const mobileLoadingState: CSSProperties = {
  minHeight: 160,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
