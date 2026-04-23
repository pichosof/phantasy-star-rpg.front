import type { CSSProperties } from 'react';
import styled from 'styled-components';

const fixedWidth = (width: number): CSSProperties => ({ width });

export const gridGap8: CSSProperties = {
  display: 'grid',
  gap: 8,
};

export const compactGroup: CSSProperties = {
  width: '100%',
  display: 'flex',
};

export const importActions: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  marginBottom: 10,
  gap: 8,
};

export const width60 = fixedWidth(60);
export const width70 = fixedWidth(70);
export const width80 = fixedWidth(80);
export const width90 = fixedWidth(90);
export const width100 = fixedWidth(100);
export const width120 = fixedWidth(120);
export const width140 = fixedWidth(140);
export const width160 = fixedWidth(160);

export const labelText: CSSProperties = {
  fontSize: 11,
  display: 'block',
  marginBottom: 3,
};

export const statCard: CSSProperties = {
  textAlign: 'center',
  padding: '6px 10px',
  borderRadius: 6,
  background: 'rgba(128,128,128,0.08)',
  minWidth: 60,
};

export const statLabel: CSSProperties = {
  fontSize: 10,
  color: 'rgba(128,128,128,0.8)',
  marginBottom: 2,
};

export const statValue: CSSProperties = {
  fontWeight: 700,
  fontSize: 15,
};

export const identityGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: 10,
};

export const sectionTopMargin: CSSProperties = {
  marginTop: 10,
};

export const attributesGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4,1fr)',
  gap: 10,
};

export const sectionDivider: CSSProperties = {
  margin: '12px 0 8px',
};

export const speedAdjustGrid: CSSProperties = {
  marginTop: 8,
  display: 'grid',
  gridTemplateColumns: 'repeat(2,1fr)',
  gap: 8,
};

export const secondaryGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))',
  gap: 10,
};

export const encumbranceWrap: CSSProperties = {
  overflowX: 'auto',
};

export const encumbranceTable: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 13,
};

export const encumbranceHeaderCell: CSSProperties = {
  padding: '4px 8px',
  textAlign: 'left',
  opacity: 0.6,
};

export const encumbranceCell: CSSProperties = {
  padding: '4px 8px',
};

export const combatGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))',
  gap: 10,
};

export const rangedHint: CSSProperties = {
  marginBottom: 6,
  fontSize: 11,
  opacity: 0.6,
};

export const notesTextarea: CSSProperties = {
  resize: 'vertical',
};

export function rangedInputWidth(field: string): CSSProperties {
  if (field === 'weapon') return fixedWidth(110);
  if (field === 'notes') return fixedWidth(140);
  return fixedWidth(60);
}

export const HiddenFileInput = styled.input`
  display: none;
`;

export const MobileStack = styled.div`
  display: grid;
  gap: 12px;
`;

export const MobileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
`;

export const MobileGridSingle = styled.div`
  display: grid;
  gap: 10px;
`;

export const MobileStatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
`;

export const MobileStatCard = styled.div`
  min-height: 62px;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 10px;
  background: var(--psr-mobile-elevated-bg);
  text-align: center;
`;

export const MobileStatLabel = styled.div`
  color: var(--text-secondary-color);
  font-size: 0.72rem;
  line-height: 1.2;
`;

export const MobileStatValue = styled.div`
  color: var(--text-main-color);
  font-size: 1rem;
  font-weight: 800;
`;

export const MobileList = styled.div`
  display: grid;
  gap: 10px;
`;

export const MobileListItem = styled.div`
  display: grid;
  gap: 8px;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 10px;
  background: var(--psr-mobile-elevated-bg);
`;

export const MobileListActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const MobileTableWrap = styled.div`
  overflow-x: auto;
`;

export const MobileEncumbranceTable = styled.table`
  width: 100%;
  min-width: 430px;
  border-collapse: collapse;
  font-size: 0.82rem;

  th,
  td {
    padding: 7px 8px;
    border-bottom: 1px solid var(--border-color);
    text-align: left;
  }

  th {
    color: var(--text-secondary-color);
    font-size: 0.75rem;
  }
`;

export const MobileHint = styled.p`
  margin: 0;
  color: var(--text-secondary-color);
  font-size: 0.82rem;
  line-height: 1.45;
`;
