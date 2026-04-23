import type { CSSProperties } from 'react';
import styled from 'styled-components';

const fixedWidth = (width: number): CSSProperties => ({ width });

export const labelText: CSSProperties = {
  fontSize: 11,
  display: 'block',
  marginBottom: 3,
};

export const calcBoxBase: CSSProperties = {
  textAlign: 'center',
  padding: '6px 12px',
  borderRadius: 6,
  minWidth: 60,
};

export function calcBox(color?: string): CSSProperties {
  return {
    ...calcBoxBase,
    background: color ? `${color}18` : 'rgba(128,128,128,0.08)',
    border: color ? `1px solid ${color}44` : undefined,
  };
}

export const calcBoxLabel: CSSProperties = {
  fontSize: 10,
  opacity: 0.6,
  marginBottom: 2,
};

export const calcBoxValue: CSSProperties = {
  fontWeight: 800,
  fontSize: 16,
};

export function calcBoxValueColor(color?: string): CSSProperties {
  return {
    ...calcBoxValue,
    color: color ?? 'inherit',
  };
}

export const identityGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))',
  gap: 10,
};

export const abilitiesGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(6,1fr)',
  gap: 8,
};

export const abilityCell: CSSProperties = {
  textAlign: 'center',
};

export const abilityHeader: CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  opacity: 0.7,
  marginBottom: 4,
};

export const abilityUpgradeLabel: CSSProperties = {
  fontSize: 10,
  opacity: 0.5,
  margin: '3px 0',
};

export const abilityModValue: CSSProperties = {
  marginTop: 4,
  fontWeight: 700,
  fontSize: 13,
};

export const combatStatsRow: CSSProperties = {
  marginBottom: 12,
};

export const combatGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))',
  gap: 8,
};

export const sectionDivider: CSSProperties = {
  margin: '12px 0 8px',
};

export const savesGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3,1fr)',
  gap: 8,
  marginTop: 8,
};

export const saveCard: CSSProperties = {
  padding: 8,
  borderRadius: 8,
  background: 'rgba(128,128,128,0.06)',
  textAlign: 'center',
};

export const saveTitle: CSSProperties = {
  fontWeight: 700,
  fontSize: 13,
  marginBottom: 6,
};

export const saveHelper: CSSProperties = {
  fontSize: 10,
  opacity: 0.5,
};

export const attacksGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))',
  gap: 8,
  marginTop: 8,
};

export const hpGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3,1fr)',
  gap: 8,
};

export function hpCard(color: string): CSSProperties {
  return {
    padding: 10,
    borderRadius: 8,
    background: `${color}10`,
    border: `1px solid ${color}33`,
    textAlign: 'center',
  };
}

export function hpCardTitle(color: string): CSSProperties {
  return {
    fontWeight: 700,
    fontSize: 12,
    color,
    marginBottom: 8,
  };
}

export const skillsHeaderGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  gap: '2px 0',
  marginBottom: 8,
};

export const skillsHeaderCols: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '60px 80px 60px 60px',
  gap: 4,
  padding: '0 4px',
  fontSize: 11,
  opacity: 0.6,
};

export const skillRow: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  alignItems: 'center',
  gap: 4,
  marginBottom: 4,
};

export const skillName: CSSProperties = {
  minWidth: 170,
  fontSize: 12,
};

export const trainedOnlyMark: CSSProperties = {
  color: '#ff4d4f',
  fontSize: 10,
};

export const skillAttr: CSSProperties = {
  opacity: 0.5,
  fontSize: 10,
  marginLeft: 4,
};

export const skillInputsGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '60px 80px 60px 60px',
  gap: 4,
  alignItems: 'center',
};

export const skillTotal: CSSProperties = {
  fontWeight: 700,
  fontSize: 13,
  textAlign: 'center',
};

export const weaponCard: CSSProperties = {
  marginBottom: 12,
  padding: 10,
  borderRadius: 8,
  background: 'rgba(128,128,128,0.05)',
  border: '1px solid rgba(128,128,128,0.1)',
};

export const weaponCardTitle: CSSProperties = {
  fontSize: 12,
  opacity: 0.6,
};

export const weaponGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))',
  gap: 6,
  marginTop: 6,
};

export const armorGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))',
  gap: 10,
};

export const topMargin8: CSSProperties = {
  marginTop: 8,
};

export const simpleListGrid: CSSProperties = {
  display: 'grid',
  gap: 6,
};

export const compactGroup: CSSProperties = {
  width: '100%',
  display: 'flex',
};

export const width70 = fixedWidth(70);
export const width80 = fixedWidth(80);
export const width100 = fixedWidth(100);
export const width200 = fixedWidth(200);

export const spellsDivider: CSSProperties = {
  margin: '10px 0',
};

export const spellsLevelsGrid: CSSProperties = {
  display: 'grid',
  gap: 10,
};

export const spellLevelRow: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'auto repeat(3,1fr)',
  gap: 6,
  alignItems: 'center',
};

export const spellLevelLabel: CSSProperties = {
  width: 40,
};

export const spellsListGrid: CSSProperties = {
  display: 'grid',
  gap: 6,
  marginTop: 8,
};

export const backPacksLabel: CSSProperties = {
  fontSize: 11,
  display: 'block',
  marginBottom: 4,
};

export const carryDivider: CSSProperties = {
  margin: '10px 0 6px',
};

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

export const MobileListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: var(--text-main-color);
  font-weight: 800;
`;

export const MobileListMeta = styled.span`
  color: var(--text-secondary-color);
  font-size: 0.76rem;
  font-weight: 600;
`;

export const MobileListActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const MobileHint = styled.p`
  margin: 0;
  color: var(--text-secondary-color);
  font-size: 0.82rem;
  line-height: 1.45;
`;
