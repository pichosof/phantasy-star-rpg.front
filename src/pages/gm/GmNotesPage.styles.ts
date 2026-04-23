import styled from 'styled-components';
import { Divider, Empty, Input, Tag, Typography } from 'antd';

const { TextArea } = Input;

export const NoteCardShell = styled.div<{ $active: boolean; $isDark: boolean }>`
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid
    ${({ $active, $isDark }) =>
      $active ? 'var(--primary-color)' : $isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'};
  background: ${({ $active }) => ($active ? 'rgba(var(--primary-rgb-color),0.08)' : 'transparent')};
  transition: all 0.12s;
`;

export const NoteCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
`;

export const NotePin = styled.span`
  display: inline-flex;
  font-size: 11px;
  color: var(--primary-color);
`;

export const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

export const TinyTag = styled(Tag)`
  margin: 0;
  font-size: 10px;
`;

export const FilterTag = styled(Tag)`
  cursor: pointer;
  margin: 0;
`;

export const NotePreview = styled(Typography.Text)`
  display: block;
  margin-top: 4px;
  font-size: 11px;
`;

export const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SidebarDivider = styled(Divider)<{ $color: string }>`
  margin: 4px 0;
  border-top-color: ${({ $color }) => $color};
`;

export const EditorArea = styled.div`
  display: grid;
  gap: 12px;
`;

export const EditorTextArea = styled(TextArea)`
  resize: vertical;
  font-family: monospace;
`;

export const MainHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
`;

export const ActiveTagsRow = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 6px;
  flex-wrap: wrap;
`;

export const ContentDivider = styled(Divider)<{ $color: string }>`
  margin: 8px 0;
  border-top-color: ${({ $color }) => $color};
`;

export const ContentParagraph = styled(Typography.Paragraph)`
  white-space: pre-wrap;
  line-height: 1.7;
`;

export const EmptyState = styled(Empty)`
  margin-top: 60px;
`;

export const PageGrid = styled.div<{ $mobile: boolean }>`
  display: ${({ $mobile }) => ($mobile ? 'block' : 'grid')};
  grid-template-columns: ${({ $mobile }) => ($mobile ? 'none' : '260px 1fr')};
  gap: 16px;
`;
