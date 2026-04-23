import type { CSSProperties } from 'react';
import { imgThumb } from '@app/styles/styleUtils';

export const formCompact: CSSProperties = {
  gap: 0,
};

export const searchField: CSSProperties = {
  maxWidth: 360,
};

export const createForm: CSSProperties = {
  display: 'grid',
  gap: 10,
  maxWidth: 560,
};

export const monsterCardCover: CSSProperties = {
  margin: '-12px -12px 12px',
  borderRadius: '8px 8px 0 0',
  overflow: 'hidden',
  height: 140,
};

export const monsterCardCoverImage: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

export const adminTable: CSSProperties = {
  minWidth: 1000,
};

export const habitatEllipsis: CSSProperties = {
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export const emptyWithTopSpacing: CSSProperties = {
  marginTop: 16,
};

export const drawerImageFormItem: CSSProperties = {
  marginBottom: 8,
};

export const drawerImagePreview: CSSProperties = {
  ...imgThumb,
  maxHeight: 220,
};

export const publicDrawerImagePreview: CSSProperties = {
  ...imgThumb,
  maxHeight: 240,
  marginBottom: 16,
};
