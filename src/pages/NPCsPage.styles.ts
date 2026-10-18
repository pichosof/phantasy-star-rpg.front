import type { CSSProperties } from 'react';
import styled from 'styled-components';

export const adminDrawerBody: CSSProperties = {
  background: 'var(--additional-background-color)',
};

export function detailHeroFallback(metaHex: string): CSSProperties {
  return {
    height: 180,
    background: `linear-gradient(135deg, ${metaHex}40 0%, var(--secondary-background-color) 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
}

export function detailHeroAvatar(metaHex: string): CSSProperties {
  return {
    background: metaHex,
    fontSize: 36,
    fontWeight: 700,
    boxShadow: `0 10px 30px ${metaHex}55`,
  };
}

export function detailRoleTag(metaHex: string): CSSProperties {
  return {
    fontSize: 12,
    fontWeight: 600,
    padding: '2px 10px',
    background: `${metaHex}20`,
    borderColor: metaHex,
    color: metaHex,
  };
}

export function detailAccent(metaHex: string): CSSProperties {
  return {
    height: 3,
    borderRadius: 2,
    background: `linear-gradient(90deg, ${metaHex}, ${metaHex}20)`,
  };
}

export const MobileFilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

export const MobileMetaTags = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const MobileSectionStack = styled.div`
  display: grid;
  gap: 12px;
`;

export const MobileBodyText = styled.p`
  margin: 0;
  color: var(--text-main-color);
  font-size: 14px;
  line-height: 1.6;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
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
  color: var(--text-muted-color);
  font-size: 12px;
  font-weight: 700;
`;

export const MobileDetailValue = styled.dd`
  margin: 0;
  color: var(--text-main-color);
  font-size: 14px;
  line-height: 1.45;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
`;

export const MobileEmptyState = styled.div`
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

export const MobileActionGrid = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  > :only-child {
    grid-column: 1 / -1;
  }
`;

export const MobileVisibilityRow = styled.div`
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const MobileInlineLabel = styled.span`
  color: var(--text-main-color);
  font-size: 14px;
  font-weight: 700;
`;

export const MobileUploadStack = styled.div`
  display: grid;
  gap: 10px;
`;

export const MobileCreateField = styled.div`
  display: grid;
  gap: 6px;
`;

export const MobileFieldLabel = styled.label`
  color: var(--text-muted-color);
  font-size: 12px;
  font-weight: 700;
`;

export const MobileDangerZone = styled.div`
  display: grid;
  gap: 12px;
`;
