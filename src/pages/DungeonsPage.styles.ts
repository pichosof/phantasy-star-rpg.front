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
