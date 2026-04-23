import type { CSSProperties } from 'react';
import styled from 'styled-components';

import { textSm } from '@app/styles/styleUtils';

export const NotesHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

export const NotesLoading: CSSProperties = {
  textAlign: 'center',
  padding: '12px 0',
};

export const NotesGrid = styled.div`
  display: grid;
  gap: 8px;
`;

export const NoteCard = styled.div`
  background: rgba(255, 255, 255, 0.04);
  border-radius: 6px;
  padding: 8px 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

export const NoteCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
`;

export const NoteMain: CSSProperties = {
  minWidth: 0,
};

export const noteTitle: CSSProperties = {
  fontSize: 13,
  display: 'block',
};

export const noteDateTag: CSSProperties = {
  marginTop: 2,
  fontSize: 11,
};

export const noteActions: CSSProperties = {
  flexShrink: 0,
};

export const noteEditIcon: CSSProperties = {
  cursor: 'pointer',
  color: '#8c8c8c',
  fontSize: 13,
};

export const noteDeleteIcon: CSSProperties = {
  cursor: 'pointer',
  color: '#ff4d4f',
  fontSize: 13,
};

export const addNoteTag: CSSProperties = {
  cursor: 'pointer',
  userSelect: 'none',
};

export const noteContent: CSSProperties = {
  fontSize: 12,
  display: 'block',
  marginTop: 6,
  whiteSpace: 'pre-wrap',
};

export const fieldLabel: CSSProperties = {
  display: 'block',
  marginBottom: 4,
};

export const fieldLabelTextSm: CSSProperties = {
  ...textSm,
  ...fieldLabel,
};

export const tableMinWidth: CSSProperties = {
  minWidth: 700,
};

export const playerAvatar: CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: '50%',
  objectFit: 'cover',
};

export const emptyList: CSSProperties = {
  marginTop: 16,
};

export const headerSearch: CSSProperties = {
  maxWidth: 360,
};

export const createForm = styled.form`
  display: grid;
  gap: 10px;
  max-width: 520px;
`;

export const createNameInput: CSSProperties = {
  minWidth: 240,
};

export const emptyCardState: CSSProperties = {
  width: '100%',
  alignItems: 'center',
};

export const PublicGrid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
`;

export const PlayerStack = styled.div`
  display: grid;
  gap: 8px;
`;

export const editNameInput: CSSProperties = {
  minWidth: 180,
};

export const levelInput: CSSProperties = {
  width: 70,
};

export const mediaRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
`;

export const altInput: CSSProperties = {
  maxWidth: 200,
};

export const MobileFilterShell = styled.div`
  display: grid;
  gap: 10px;
`;

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

export const MobilePlayersGrid = styled.div`
  display: grid;
  gap: 12px;
`;

export const MobilePlayerMedia = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  aspect-ratio: 16 / 10;
  background: var(--secondary-background-color);
`;

export const MobileImageFallback = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary-color);
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.08), transparent 55%), var(--secondary-background-color);
`;

export const MobilePlayerImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  display: block;
`;

export const MobilePlayerBody = styled.div`
  display: grid;
  gap: 12px;
`;

export const MobilePlayerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
`;

export const MobilePlayerIdentity = styled.div`
  min-width: 0;
  display: grid;
  gap: 6px;
`;

export const MobilePlayerName = styled.div`
  color: var(--text-main-color);
  font-weight: 800;
  font-size: 18px;
  line-height: 1.1;
`;

export const MobilePlayerLevel = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.48);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
`;

export const MobilePlayerPreview = styled.p`
  margin: 0;
  color: var(--text-secondary-color);
  font-size: 13px;
  line-height: 1.55;
  white-space: pre-wrap;
`;

export const MobilePlayerActions = styled.div`
  display: grid;
  gap: 8px;
`;

export const MobilePlayerActionRow = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
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

export const MobileSectionStack = styled.div`
  display: grid;
  gap: 12px;
`;

export const MobileHeroFrame = styled.div`
  overflow: hidden;
  border-radius: 14px;
  background: var(--secondary-background-color);
  aspect-ratio: 4 / 3;
`;

export const MobileHeroImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  display: block;
`;

export const MobileHeroContent = styled.div`
  display: grid;
  gap: 12px;
`;

export const MobileHeroTitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
`;

export const MobileHeroName = styled.div`
  color: var(--text-main-color);
  font-size: 24px;
  line-height: 1.05;
  font-weight: 800;
`;

export const MobileBadgeRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const MobileStoryText = styled.div`
  color: var(--text-main-color);
  line-height: 1.7;
  white-space: pre-wrap;
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

export const MobileNoteExtra = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const MobileNoteDate = styled.span`
  color: var(--text-secondary-color);
  font-size: 12px;
  white-space: nowrap;
`;

export const MobileIconButton = styled.button`
  width: 32px;
  height: 32px;
  min-width: 32px;
  border: 0;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(140, 140, 140, 0.12);
  color: var(--text-main-color);
  cursor: pointer;
`;

export const MobileNoteEditorFields = styled.div`
  display: grid;
  gap: 12px;
`;

export const MobileNoteField = styled.div`
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

export const MobileGMStack = styled.div`
  display: grid;
  gap: 12px;
`;

export const MobileUploadGrid = styled.div`
  display: grid;
  gap: 10px;
`;

export const MobileUploadRow = styled.div`
  display: grid;
  gap: 8px;
`;

export const MobileDangerZone = styled.div`
  display: grid;
  gap: 10px;
`;

export const MobilePdfShell = styled.div`
  display: grid;
  min-height: 70vh;
`;

export const MobilePdfViewerFrame = styled.div`
  width: 100%;
  height: 70vh;
  min-height: 70vh;
  border-radius: 14px;
  overflow: hidden;
  background: var(--secondary-background-color);
`;
