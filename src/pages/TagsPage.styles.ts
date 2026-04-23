import type { CSSProperties } from 'react';
import { textSm } from '@app/styles/styleUtils';

export const detailModalTitleLabel: CSSProperties = {
  ...textSm,
};

export const detailAvatar: CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: '50%',
  objectFit: 'cover',
};

export const detailFieldLabel: CSSProperties = {
  ...textSm,
  display: 'block',
  marginBottom: 2,
};

export const detailFieldValue: CSSProperties = {
  whiteSpace: 'pre-wrap',
};

export const entityGroupLabel: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
};

export const entityGroupItems: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
  marginTop: 4,
};

export const entityTag: CSSProperties = {
  cursor: 'pointer',
};

export const entityTagAvatar: CSSProperties = {
  width: 16,
  height: 16,
  borderRadius: '50%',
  objectFit: 'cover',
  marginRight: 4,
  verticalAlign: 'middle',
};

export function layoutGrid(mobile: boolean): CSSProperties {
  return {
    display: 'grid',
    gridTemplateColumns: mobile ? '1fr' : 'minmax(280px,360px) 1fr',
    gap: 16,
    alignItems: 'start',
  };
}

export const sidebarColumn: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

export const colorInput: CSSProperties = {
  width: 36,
  height: 28,
  padding: 2,
  border: '1px solid #d9d9d9',
  borderRadius: 4,
  cursor: 'pointer',
};

export function selectedTagRow(active: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 8px',
    borderRadius: 6,
    cursor: 'pointer',
    background: active ? 'rgba(22,119,255,0.08)' : 'transparent',
    transition: 'background 0.15s',
  };
}

export const editColorInput: CSSProperties = {
  width: 28,
  height: 22,
  padding: 1,
  border: '1px solid #d9d9d9',
  borderRadius: 4,
  cursor: 'pointer',
};

export const editNameInput: CSSProperties = {
  flex: 1,
  padding: '2px 6px',
  border: '1px solid #d9d9d9',
  borderRadius: 4,
  background: 'transparent',
  color: 'inherit',
  fontSize: 13,
};

export const selectedTagChip: CSSProperties = {
  margin: 0,
  flex: 1,
};

export const detailCard: CSSProperties = {
  minHeight: 200,
};

export const emptySelection: CSSProperties = {
  padding: '40px 0',
  textAlign: 'center',
};

export const emptySelectionIcon: CSSProperties = {
  fontSize: 48,
  opacity: 0.2,
};

export const emptySelectionText: CSSProperties = {
  marginTop: 12,
  color: '#8c8c8c',
};

export const selectedTagPill: CSSProperties = {
  fontSize: 14,
  padding: '4px 12px',
};

export const loadingState: CSSProperties = {
  textAlign: 'center',
  padding: 40,
};
