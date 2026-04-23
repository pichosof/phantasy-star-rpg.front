import type { CSSProperties } from 'react';
import styled from 'styled-components';

export const headerSearch: CSSProperties = {
  maxWidth: 360,
};

export const createForm = styled.form`
  display: grid;
  gap: 10px;
  max-width: 720px;
`;

export const createTitleInput: CSSProperties = {
  minWidth: 280,
};

export const createStatusInput: CSSProperties = {
  minWidth: 160,
};

export function publicGrid(gridCols: string): CSSProperties {
  return {
    display: 'grid',
    gridTemplateColumns: gridCols,
    gap: 16,
    alignItems: 'start',
  };
}

export const PublicCard = styled.div`
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  background: var(--background-color, #fff);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition:
    box-shadow 0.2s,
    transform 0.2s;

  &:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
    transform: translateY(-2px);
  }
`;

export function statusStrip(color: string): CSSProperties {
  return {
    height: 8,
    background: color,
  };
}

export const publicCardBody: CSSProperties = {
  padding: '14px 16px 12px',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

export const visibleTag: CSSProperties = {
  margin: 0,
  fontSize: 10,
};

export function questTitle(mobileOnly: boolean): CSSProperties {
  return {
    margin: 0,
    lineHeight: 1.35,
    fontSize: mobileOnly ? 15 : 16,
  };
}

export const publicDescription: CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: '#595959',
};

export const rewardTag: CSSProperties = {
  marginTop: 4,
  alignSelf: 'flex-start',
};

export const cityTags: CSSProperties = {
  marginTop: 2,
};

export const cityTag: CSSProperties = {
  margin: 0,
  fontSize: 11,
};

export const spacer: CSSProperties = {
  flex: 1,
};

export const footerDate: CSSProperties = {
  fontSize: 11,
  color: '#bfbfbf',
};

export const footerViewButton: CSSProperties = {
  padding: 0,
  fontSize: 12,
};

export const adminMobileGrid = styled.div`
  display: grid;
  gap: 10px;
`;

export const adminClickableTitle: CSSProperties = {
  cursor: 'pointer',
  display: 'block',
};

export const adminCardDescription: CSSProperties = {
  margin: 0,
  fontSize: 12,
  color: '#8c8c8c',
};

export const adminRewardTag: CSSProperties = {
  fontSize: 11,
};

export const tableMinWidth: CSSProperties = {
  minWidth: 900,
};

export const tableClickableText: CSSProperties = {
  cursor: 'pointer',
};

export const emptyList: CSSProperties = {
  marginTop: 16,
};

export const drawerBadge: CSSProperties = {
  backgroundColor: '#595959',
};

export const drawerDescription: CSSProperties = {
  whiteSpace: 'pre-wrap',
  margin: 0,
  lineHeight: 1.75,
  fontSize: 14,
};
