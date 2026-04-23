import type { CSSProperties } from 'react';
import styled from 'styled-components';

import { textSm } from '@app/styles/styleUtils';

export const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 60px 0;
`;

export const ImageGrid = styled.div<{ $mobileOnly: boolean }>`
  display: grid;
  gap: 12px;
  grid-template-columns: ${(props) => (props.$mobileOnly ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))')};
`;

export const ImageCard = styled.div`
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(128, 128, 128, 0.15);
  background: rgba(128, 128, 128, 0.05);
`;

export const ImageFrame = styled.div`
  height: 140px;
  background: #111;
  position: relative;
  overflow: hidden;
`;

export const ImageThumb = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

export const CardBody = styled.div`
  padding: 8px 10px;
`;

export const fileName: CSSProperties = {
  ...textSm,
  display: 'block',
};

export const tagsRow: CSSProperties = {
  marginTop: 4,
};

export const metaTag: CSSProperties = {
  margin: 0,
  fontSize: 10,
};

export const actionsRow: CSSProperties = {
  marginTop: 8,
  display: 'flex',
  gap: 6,
};

export const copyButton: CSSProperties = {
  flex: 1,
  fontSize: 11,
};
