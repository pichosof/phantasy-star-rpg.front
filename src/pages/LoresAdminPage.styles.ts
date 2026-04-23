import type { CSSProperties } from 'react';
import { lineHeight175 } from '@app/styles/styleUtils';

export const searchField: CSSProperties = {
  maxWidth: 360,
};

export const createForm: CSSProperties = {
  display: 'grid',
  gap: 10,
  maxWidth: 720,
};

export const createTitleField: CSSProperties = {
  minWidth: 280,
};

export const createCategoryField: CSSProperties = {
  minWidth: 180,
};

export function publicGrid(gridCols: string): CSSProperties {
  return {
    display: 'grid',
    gridTemplateColumns: gridCols,
    gap: 16,
    alignItems: 'start',
  };
}

export const loreCardShell: CSSProperties = {
  borderRadius: 8,
  overflow: 'hidden',
  boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
  background: 'var(--background-color, #fff)',
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  transition: 'box-shadow 0.2s, transform 0.2s',
};

export function loreCardStrip(color?: string | null): CSSProperties {
  return {
    height: 8,
    background: color ?? '#d9d9d9',
  };
}

export const loreCardBody: CSSProperties = {
  padding: '14px 16px 12px',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

export const visibilityTinyTag: CSSProperties = {
  margin: 0,
  fontSize: 10,
};

export function loreCardTitle(mobile: boolean): CSSProperties {
  return {
    margin: 0,
    lineHeight: 1.35,
    fontSize: mobile ? 15 : 16,
  };
}

export const loreCardExcerpt: CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: '#595959',
};

export const loreCardSpacer: CSSProperties = {
  flex: 1,
};

export const loreCardDate: CSSProperties = {
  fontSize: 11,
  color: '#bfbfbf',
};

export const loreCardLink: CSSProperties = {
  padding: 0,
  fontSize: 12,
};

export const adminMobileGrid: CSSProperties = {
  display: 'grid',
  gap: 10,
};

export const adminMobileTitle: CSSProperties = {
  cursor: 'pointer',
  display: 'block',
};

export const adminMobileExcerpt: CSSProperties = {
  margin: 0,
  fontSize: 12,
  color: '#8c8c8c',
};

export const adminTable: CSSProperties = {
  minWidth: 900,
};

export const emptyWithTopSpacing: CSSProperties = {
  marginTop: 16,
};

export const drawerBadge: CSSProperties = {
  backgroundColor: '#595959',
};

export const drawerContentParagraph: CSSProperties = {
  ...lineHeight175,
  fontSize: 14,
};
