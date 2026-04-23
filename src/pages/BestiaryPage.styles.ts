import type { CSSProperties } from 'react';
import styled from 'styled-components';
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

export const MobileBestiaryGrid = styled.div`
  display: grid;
  gap: 12px;
`;

export const MobileMonsterCardBody = styled.div`
  display: grid;
  gap: 12px;
`;

export const MobileMonsterCardMedia = styled.div`
  height: 170px;
  overflow: hidden;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(82, 196, 26, 0.22), var(--secondary-background-color));
`;

export const MobileMonsterCardImage = styled.img`
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
`;

export const MobileMonsterHero = styled.div`
  min-height: 220px;
  overflow: hidden;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(82, 196, 26, 0.2), var(--secondary-background-color));
`;

export const MobileMonsterImage = styled.img`
  width: 100%;
  height: 220px;
  display: block;
  object-fit: cover;
`;

export const MobileMonsterFallback = styled.div`
  width: 100%;
  height: 100%;
  min-height: 170px;
  display: grid;
  place-items: center;
  color: var(--text-secondary-color);
  background:
    radial-gradient(circle at 20% 20%, rgba(82, 196, 26, 0.22), transparent 34%),
    linear-gradient(135deg, var(--secondary-background-color), var(--additional-background-color));
`;

export const MobileMonsterInfo = styled.div`
  display: grid;
  gap: 10px;
  padding-top: 12px;
`;

export const MobileMonsterTitle = styled.h2`
  margin: 0;
  color: var(--text-main-color);
  font-size: 20px;
  line-height: 1.12;
  font-weight: 800;
`;

export const MobileMonsterPreview = styled.p`
  display: -webkit-box;
  margin: 0;
  color: var(--text-secondary-color);
  font-size: 14px;
  line-height: 1.5;
  overflow: hidden;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
`;

export const MobileActionGrid = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  > :only-child {
    grid-column: 1 / -1;
  }
`;

export const MobileEmptyState = styled.div`
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
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

export const MobileBodyText = styled.p`
  margin: 0;
  color: var(--text-main-color);
  font-size: 14px;
  line-height: 1.6;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
`;

export const MobileVisibilityRow = styled.div`
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  & + & {
    margin-top: 10px;
  }
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
  color: var(--text-secondary-color);
  font-size: 12px;
  font-weight: 700;
`;

export const MobileDangerZone = styled.div`
  display: grid;
  gap: 12px;
`;
