import type { CSSProperties } from 'react';
import styled from 'styled-components';

import { textSm } from '@app/styles/styleUtils';

export const headerSearch: CSSProperties = {
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

export const createStatusInput: CSSProperties = {
  minWidth: 160,
};

export const tableMinWidth: CSSProperties = {
  minWidth: 900,
};

export const emptyList: CSSProperties = {
  marginTop: 16,
};

export const tableClickableText: CSSProperties = {
  cursor: 'pointer',
};

export const tableDescription: CSSProperties = {
  ...textSm,
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export const drawerBadge: CSSProperties = {
  backgroundColor: '#595959',
};

export const drawerTitleText: CSSProperties = {
  fontWeight: 800,
};

export const drawerDescription: CSSProperties = {
  whiteSpace: 'pre-wrap',
  margin: 0,
  lineHeight: 1.75,
  fontSize: 14,
};

export const drawerTimestamp: CSSProperties = {
  fontSize: 12,
  color: 'var(--text-secondary-color)',
};

export const fieldLabelTextSm: CSSProperties = {
  ...textSm,
  display: 'block',
  marginBottom: 4,
};

export const PublicGrid = styled.div<{ $tablet: boolean }>`
  display: grid;
  grid-template-columns: ${({ $tablet }) => ($tablet ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))')};
  gap: 16px;
  align-items: start;
`;

export const PublicCard = styled.article`
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  background: var(--additional-background-color);
  box-shadow: var(--box-shadow);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(24, 144, 255, 0.35);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
  }
`;

export const StatusStrip = styled.div<{ $color: string }>`
  height: 8px;
  background: ${({ $color }) => $color};
`;

export const PublicCardBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px 12px;
`;

export const PublicCardTitle = styled.div`
  color: var(--text-main-color);
  font-size: 18px;
  font-weight: 800;
  line-height: 1.3;
`;

export const PublicCardDescription = styled.p`
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: var(--text-secondary-color);
  font-size: 13px;
  line-height: 1.55;
  white-space: pre-wrap;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
`;

export const PublicCardSpacer = styled.div`
  flex: 1;
`;

export const PublicCardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
`;

export const PublicCardCreated = styled.span`
  color: var(--text-secondary-color);
  font-size: 11px;
`;

export const PublicCardOpenText = styled.span`
  color: var(--primary-color, #1890ff);
  font-size: 12px;
  font-weight: 700;
`;

export const MetaTags = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

export const DrawerSectionStack = styled.div`
  display: grid;
  gap: 16px;
`;

export const AdminTitleStack = styled.div`
  display: grid;
  gap: 2px;
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

export const MobileQuestsGrid = styled.div`
  display: grid;
  gap: 12px;
`;

export const MobileQuestBody = styled.div`
  display: grid;
  gap: 12px;
`;

export const MobileQuestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
`;

export const MobileQuestIdentity = styled.div`
  min-width: 0;
  display: grid;
  gap: 6px;
`;

export const MobileQuestTitle = styled.div`
  color: var(--text-main-color);
  font-size: 18px;
  font-weight: 800;
  line-height: 1.1;
`;

export const MobileQuestPreview = styled.p`
  margin: 0;
  color: var(--text-secondary-color);
  font-size: 13px;
  line-height: 1.55;
  white-space: pre-wrap;
`;

export const MobileQuestActions = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
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
  color: var(--text-secondary-color);
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

export const MobileVisibilityRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

export const MobileInlineLabel = styled.span`
  color: var(--text-secondary-color);
  font-size: 13px;
  font-weight: 600;
`;

export const MobileBodyText = styled.p`
  margin: 0;
  color: var(--text-secondary-color);
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
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
