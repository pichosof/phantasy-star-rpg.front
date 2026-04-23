import styled from 'styled-components';
import { Button, Tag, Typography } from 'antd';

export const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
`;

export const HeaderTitle = styled(Typography.Title)`
  && {
    margin: 0;
  }
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

export const FileName = styled(Typography.Text)`
  && {
    display: block;
    font-size: 12px;
  }
`;

export const TagsRow = styled.div`
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

export const MetaTag = styled(Tag)`
  && {
    margin: 0;
    font-size: 10px;
  }
`;

export const ActionsRow = styled.div`
  margin-top: 8px;
  display: flex;
  gap: 6px;
`;

export const CopyButton = styled(Button)`
  && {
    flex: 1;
    font-size: 11px;
  }
`;

export const HiddenFileInput = styled.input`
  display: none;
`;

export const MobileMetaTags = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

export const MobileImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
`;

export const MobileImageBody = styled.div`
  display: grid;
  gap: 10px;
`;

export const MobileImageFrame = styled.div`
  min-height: 132px;
  border-radius: 14px;
  overflow: hidden;
  background: #080b10;
`;

export const MobileImageThumb = styled.img`
  width: 100%;
  height: 132px;
  object-fit: cover;
  display: block;
`;

export const MobileImageTitle = styled.h2`
  margin: 0;
  color: var(--text-main-color);
  font-size: 0.95rem;
  line-height: 1.25;
  font-weight: 800;
  overflow-wrap: anywhere;
`;

export const MobileImageActions = styled.div`
  display: grid;
  gap: 8px;
`;

export const MobilePreviewFrame = styled.div`
  border-radius: 16px;
  overflow: hidden;
  background: #080b10;
`;

export const MobilePreviewImage = styled.img`
  width: 100%;
  max-height: 58dvh;
  object-fit: contain;
  display: block;
`;

export const MobileDetailGrid = styled.div`
  display: grid;
  gap: 10px;
`;

export const MobileDetailItem = styled.div`
  display: grid;
  gap: 2px;
`;

export const MobileDetailLabel = styled.span`
  color: var(--text-secondary-color);
  font-size: 0.78rem;
`;

export const MobileDetailValue = styled.span`
  color: var(--text-main-color);
  font-size: 0.95rem;
  overflow-wrap: anywhere;
`;

export const MobileEmptyState = styled.div`
  min-height: 116px;
  display: grid;
  place-items: center;
  text-align: center;
  color: var(--text-secondary-color);
`;
