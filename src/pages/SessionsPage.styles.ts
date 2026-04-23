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

export const drawerIdBadge: CSSProperties = {
  backgroundColor: '#595959',
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

export const detailSummaryText: CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.75,
  whiteSpace: 'pre-wrap',
};

export const detailTimestamp: CSSProperties = {
  fontSize: 12,
  color: 'var(--text-secondary-color)',
};

export const previewFrame: CSSProperties = {
  borderRadius: 10,
  overflow: 'hidden',
  marginTop: 4,
};

export const inlineSwitchRow: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
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

export const PublicCardBody = styled.div`
  display: grid;
  gap: 8px;
  padding: 14px 16px 12px;
  min-width: 0;
`;

export const PublicCardTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
`;

export const PublicCardLabel = styled.span`
  color: var(--text-secondary-color);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
`;

export const PublicCardMeta = styled.div`
  color: var(--text-secondary-color);
  font-size: 12px;
`;

export const PublicCardTitle = styled.div`
  color: var(--text-main-color);
  font-size: 18px;
  font-weight: 800;
  line-height: 1.3;
`;

export const PublicCardSummary = styled.p`
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
  min-height: 4px;
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

export const CoverFrame = styled.div<{ $height: number }>`
  position: relative;
  height: ${({ $height }) => `${$height}px`};
  overflow: hidden;
  background: #000;
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
  background: linear-gradient(to bottom, transparent 40%, rgba(0, 0, 0, 0.65) 100%);
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
  color: rgba(255, 255, 255, 0.12);
  user-select: none;
`;

export const CoverBrand = styled.span`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 12px;
  display: flex;
  justify-content: center;
  color: rgba(255, 255, 255, 0.35);
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

export const MobileSessionsGrid = styled.div`
  display: grid;
  gap: 12px;
`;

export const MobileSessionBody = styled.div`
  display: grid;
  gap: 12px;
`;

export const MobileSessionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
`;

export const MobileSessionIdentity = styled.div`
  min-width: 0;
  display: grid;
  gap: 6px;
`;

export const MobileSessionTitle = styled.div`
  color: var(--text-main-color);
  font-size: 18px;
  font-weight: 800;
  line-height: 1.1;
`;

export const MobileSessionPreview = styled.p`
  margin: 0;
  color: var(--text-secondary-color);
  font-size: 13px;
  line-height: 1.55;
  white-space: pre-wrap;
`;

export const MobileSessionActions = styled.div`
  display: grid;
  gap: 8px;
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

export const MobileFieldLabel = styled.label`
  color: var(--text-secondary-color);
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
  color: var(--text-secondary-color);
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
`;
