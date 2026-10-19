import type { CSSProperties } from 'react';
import styled from 'styled-components';

import { textSm } from '@app/styles/styleUtils';

export const searchField: CSSProperties = {
  maxWidth: 360,
};

export const createForm = styled.form`
  display: grid;
  gap: 10px;
  max-width: 720px;
`;

export const createInputsRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const createTitleInput: CSSProperties = {
  minWidth: 280,
};

export const createDateInput: CSSProperties = {
  minWidth: 280,
};

export const tableMinWidth: CSSProperties = {
  minWidth: 860,
};

export const emptyTopSpacing: CSSProperties = {
  marginTop: 16,
};

export const clickableTitle: CSSProperties = {
  cursor: 'pointer',
};

export const drawerTitleText: CSSProperties = {
  fontWeight: 800,
};

export const summaryPreviewText: CSSProperties = {
  ...textSm,
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export const fieldLabelTextSm: CSSProperties = {
  ...textSm,
  display: 'block',
  marginBottom: 4,
};

export const previewFrame: CSSProperties = {
  borderRadius: 10,
  overflow: 'hidden',
  marginTop: 4,
};

export const CoverFrame = styled.div<{ $height: number }>`
  position: relative;
  height: ${({ $height }) => `${$height}px`};
  overflow: hidden;
  background: #000; /* theme-isolation-ignore: overlay on images/media, dark in every theme */
`;

export const CoverImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

export const CoverOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    transparent 40%,
    /* theme-isolation-ignore: overlay on images/media, dark in every theme */ rgba(0, 0, 0, 0.65) 100%
  );
`;

export const CoverFallback = styled.div<{ $gradient: string; $height: number }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${({ $height }) => `${$height}px`};
  background: ${({ $gradient }) => $gradient};
`;

export const CoverWatermark = styled.span`
  color: rgba(255, 255, 255, 0.12); /* theme-isolation-ignore: overlay on images/media, dark in every theme */
  user-select: none;
`;

export const CoverBrand = styled.span`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 12px;
  display: flex;
  justify-content: center;
  color: rgba(255, 255, 255, 0.35); /* theme-isolation-ignore: overlay on images/media, dark in every theme */
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 3px;
  text-transform: uppercase;
`;

export const AdminTitleStack = styled.div`
  display: grid;
  gap: 2px;
`;

export const DrawerSectionStack = styled.div`
  display: grid;
  gap: 16px;
`;

export const MobileFilterRow = styled.div`
  display: flex;
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

export const MobileDetailGrid = styled.dl`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 10px;
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
  font-weight: 600;
`;

export const MobileDetailValue = styled.dd`
  margin: 0;
  color: var(--text-main-color);
  font-size: 14px;
  line-height: 1.4;
  overflow-wrap: anywhere;
`;

export const MobileInlineLabel = styled.span`
  color: var(--text-muted-color);
  font-size: 13px;
  font-weight: 600;
`;

export const MobileFieldLabel = styled.label`
  color: var(--text-muted-color);
  font-size: 12px;
  font-weight: 600;
`;

export const MobileCreateFields = styled.div`
  display: grid;
  gap: 12px;
`;

export const MobileCreateField = styled.div`
  display: grid;
  gap: 6px;
`;

export const MobileEmptyState = styled.div`
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

export const MobileDangerZone = styled.div`
  display: grid;
  gap: 10px;
`;

export const MobileBodyText = styled.p`
  margin: 0;
  color: var(--text-muted-color);
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
`;
