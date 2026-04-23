import type { CSSProperties } from 'react';
import styled from 'styled-components';

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

export const MobileMetaTags = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const MobileTagsGrid = styled.div`
  display: grid;
  gap: 12px;
`;

export const MobileTagBody = styled.div`
  display: grid;
  gap: 12px;
`;

export const MobileTagHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
`;

export const MobileTagIdentity = styled.div`
  min-width: 0;
  display: grid;
  gap: 6px;
`;

export const MobileTagName = styled.div`
  color: var(--text-main-color);
  font-size: 18px;
  font-weight: 800;
  line-height: 1.1;
`;

export const MobileColorDot = styled.span<{ $color: string }>`
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.42);
  border-radius: 999px;
  background: ${({ $color }) => $color};
  box-shadow: 0 0 16px ${({ $color }) => `${$color}66`};
  flex-shrink: 0;
`;

export const MobileTagActions = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;

export const MobileSectionStack = styled.div`
  display: grid;
  gap: 12px;
`;

export const MobileCreateFields = styled.div`
  display: grid;
  gap: 12px;
`;

export const MobileCreateField = styled.div`
  display: grid;
  gap: 6px;
`;

export const MobileFieldLabel = styled.label`
  color: var(--text-secondary-color);
  font-size: 12px;
  font-weight: 600;
`;

export const MobileColorField = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const MobileColorInput = styled.input`
  width: 46px;
  height: 36px;
  padding: 2px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--additional-background-color);
`;

export const MobileEmptyState = styled.div`
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

export const MobileEntityPreview = styled.span`
  display: -webkit-box;
  color: var(--text-secondary-color);
  font-size: 13px;
  line-height: 1.4;
  overflow: hidden;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
`;

export const MobileDetailGrid = styled.dl`
  display: grid;
  gap: 12px;
  margin: 0;
`;

export const MobileDetailItem = styled.div`
  min-width: 0;
  display: grid;
  gap: 4px;
`;

export const MobileDetailLabel = styled.dt`
  margin: 0;
  color: var(--text-secondary-color);
  font-size: 12px;
  font-weight: 600;
`;

export const MobileDetailValue = styled.dd`
  margin: 0;
  color: var(--text-main-color);
  font-size: 14px;
  line-height: 1.45;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
`;

export const MobileAvatar = styled.img`
  width: 54px;
  height: 54px;
  border-radius: 999px;
  object-fit: cover;
`;
