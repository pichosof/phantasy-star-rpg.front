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
