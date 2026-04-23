import type { CSSProperties } from 'react';
import styled from 'styled-components';

export const emptyUploadState: CSSProperties = {
  padding: '24px 0',
  textAlign: 'center',
};

export const emptyImages: CSSProperties = {
  padding: 16,
};

export const carouselWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const thumbsRow = styled.div`
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
`;

export function thumb(isActive: boolean): CSSProperties {
  return {
    width: 56,
    height: 40,
    objectFit: 'cover',
    borderRadius: 4,
    cursor: 'pointer',
    border: isActive ? '2px solid #1677ff' : '2px solid transparent',
    opacity: isActive ? 1 : 0.65,
    flexShrink: 0,
  };
}

export const lightboxBody: CSSProperties = {
  padding: 0,
};

export const lightboxFrame: CSSProperties = {
  position: 'relative',
  background: '#000',
  minHeight: 300,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const lightboxImage: CSSProperties = {
  maxWidth: '100%',
  maxHeight: '85vh',
  objectFit: 'contain',
};

export const PublicGrid = styled.div<{ $mobileOnly: boolean }>`
  display: grid;
  gap: 16px;
  grid-template-columns: ${(props) => (props.$mobileOnly ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))')};
`;

export const PublicCard = styled.div`
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  background: var(--background-color, #fff);
  cursor: pointer;
  transition:
    box-shadow 0.2s,
    transform 0.2s;

  &:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
    transform: translateY(-2px);
  }
`;

export const publicCardBody: CSSProperties = {
  padding: '12px 14px',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

export const visibleTag: CSSProperties = {
  margin: 0,
  fontSize: 10,
};

export const publicDescription: CSSProperties = {
  margin: 0,
  fontSize: 12,
  color: '#595959',
};

export const tableMinWidth: CSSProperties = {
  minWidth: 800,
};

export const clickableText: CSSProperties = {
  cursor: 'pointer',
};

export const tagsLabel: CSSProperties = {
  fontSize: 12,
  display: 'block',
  marginBottom: 6,
};

export const discoveredMeta: CSSProperties = {
  fontSize: 12,
  color: '#8c8c8c',
  marginLeft: 8,
};

export const headerSearch: CSSProperties = {
  maxWidth: 320,
};

export const createForm = styled.form`
  display: grid;
  gap: 10px;
  max-width: 720px;
`;

export const createNameInput: CSSProperties = {
  minWidth: 240,
};

export const createTypeInput: CSSProperties = {
  minWidth: 160,
};

export const createRegionInput: CSSProperties = {
  minWidth: 160,
};

export const createCityInput: CSSProperties = {
  minWidth: 200,
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

export const MobileDungeonsGrid = styled.div`
  display: grid;
  gap: 12px;
`;

export const MobileDungeonCardBody = styled.div`
  display: grid;
  gap: 12px;
`;

export const MobileDungeonCardMedia = styled.div`
  height: 184px;
  overflow: hidden;
  border-radius: 16px;
  background:
    radial-gradient(circle at 18% 20%, rgba(114, 46, 209, 0.28), transparent 36%),
    linear-gradient(135deg, var(--secondary-background-color), var(--additional-background-color));
`;

export const MobileDungeonCardImage = styled.img`
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
`;

export const MobileDungeonHero = styled.div`
  min-height: 230px;
  overflow: hidden;
  border-radius: 18px;
  background:
    radial-gradient(circle at 18% 20%, rgba(114, 46, 209, 0.28), transparent 36%),
    linear-gradient(135deg, var(--secondary-background-color), var(--additional-background-color));
`;

export const MobileDungeonHeroImage = styled.img`
  width: 100%;
  height: 230px;
  display: block;
  object-fit: cover;
`;

export const MobileDungeonFallback = styled.div`
  width: 100%;
  height: 100%;
  min-height: 184px;
  display: grid;
  place-items: center;
  color: var(--text-secondary-color);
  background:
    radial-gradient(circle at 26% 24%, rgba(114, 46, 209, 0.2), transparent 34%),
    linear-gradient(135deg, var(--secondary-background-color), var(--additional-background-color));
`;

export const MobileDungeonInfo = styled.div`
  display: grid;
  gap: 10px;
  padding-top: 12px;
`;

export const MobileDungeonTitle = styled.h2`
  margin: 0;
  color: var(--text-main-color);
  font-size: 20px;
  line-height: 1.12;
  font-weight: 800;
`;

export const MobileDungeonPreview = styled.p`
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
  min-height: 150px;
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

export const MobileImageStrip = styled.div`
  display: grid;
  grid-auto-columns: minmax(128px, 46vw);
  grid-auto-flow: column;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
`;

export const MobileGalleryThumb = styled.img`
  width: 100%;
  height: 96px;
  display: block;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid var(--border-color);
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
  gap: 12px;
`;

export const MobileImageManageGrid = styled.div`
  display: grid;
  gap: 12px;
`;

export const MobileImageManageItem = styled.div`
  display: grid;
  gap: 8px;
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

export const MobileCityPicker = styled.div`
  display: grid;
  gap: 10px;
`;

export const MobileCityCurrent = styled.div`
  display: grid;
  gap: 3px;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--additional-background-color);
`;

export const MobileCityCurrentLabel = styled.span`
  color: var(--text-secondary-color);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

export const MobileCityCurrentValue = styled.span`
  color: var(--text-main-color);
  font-size: 14px;
  font-weight: 800;
`;

export const MobileCityList = styled.div`
  max-height: 260px;
  display: grid;
  gap: 8px;
  overflow-y: auto;
  padding-right: 2px;
`;

export const MobileCityOption = styled.button<{ $active?: boolean }>`
  width: 100%;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid ${({ $active }) => ($active ? 'var(--primary-color)' : 'var(--border-color)')};
  border-radius: 12px;
  background: ${({ $active }) => ($active ? 'rgba(24, 144, 255, 0.14)' : 'var(--additional-background-color)')};
  color: var(--text-main-color);
  font: inherit;
  text-align: left;
`;

export const MobileCityOptionName = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 700;
`;

export const MobileCityOptionMeta = styled.span`
  flex-shrink: 0;
  color: var(--text-secondary-color);
  font-size: 12px;
  font-weight: 700;
`;

export const MobileCityHint = styled.p`
  margin: 0;
  color: var(--text-secondary-color);
  font-size: 12px;
  line-height: 1.4;
`;

export const MobileDangerZone = styled.div`
  display: grid;
  gap: 12px;
`;
