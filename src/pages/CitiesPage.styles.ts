import type { CSSProperties } from 'react';
import { textSm } from '@app/styles/styleUtils';

export const carouselFrame: CSSProperties = {
  position: 'relative',
  marginBottom: 12,
  borderRadius: 8,
  overflow: 'hidden',
  background: '#000',
  userSelect: 'none',
};

export const carouselImage: CSSProperties = {
  width: '100%',
  height: 200,
  objectFit: 'cover',
  display: 'block',
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
    border: active ? '2px solid #1890ff' : '2px solid transparent',
    opacity: active ? 1 : 0.6,
  };
}

export const carouselLightboxBody: CSSProperties = {
  padding: 0,
  background: '#000',
  borderRadius: 8,
  overflow: 'hidden',
  textAlign: 'center',
  position: 'relative',
};

export const carouselLightboxImage: CSSProperties = {
  maxWidth: '100%',
  maxHeight: '85vh',
  objectFit: 'contain',
  display: 'inline-block',
};

export const searchField: CSSProperties = {
  maxWidth: 360,
};

export const createForm: CSSProperties = {
  display: 'grid',
  gap: 10,
  maxWidth: 560,
};

export const cityCoverImage: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
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
