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

export const MobileBodyText = styled.p`
  margin: 0;
  color: var(--text-main-color);
  font-size: 14px;
  line-height: 1.6;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
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
