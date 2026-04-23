import type { CSSProperties } from 'react';

export const fullWidth: CSSProperties = {
  width: '100%',
};

export const imagesGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
  gap: 8,
};

export const imageCard: CSSProperties = {
  position: 'relative',
  borderRadius: 6,
  overflow: 'hidden',
  background: '#111',
};

export const imageThumb: CSSProperties = {
  width: '100%',
  height: 100,
  objectFit: 'cover',
  display: 'block',
  cursor: 'zoom-in',
};

export const imageDeleteButton: CSSProperties = {
  position: 'absolute',
  top: 4,
  right: 4,
  opacity: 0.85,
};

export const emptyImagesState: CSSProperties = {
  height: 100,
  borderRadius: 8,
  border: '1px dashed rgba(255,255,255,0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'rgba(255,255,255,0.25)',
  fontSize: 13,
  gap: 8,
};

export const fieldLabel: CSSProperties = {
  fontSize: 12,
  display: 'block',
  marginBottom: 4,
};

export const uploadHint: CSSProperties = {
  fontSize: 11,
};

export const lightboxBody: CSSProperties = {
  padding: 0,
  background: '#000',
  borderRadius: 8,
  overflow: 'hidden',
  textAlign: 'center',
};

export const lightboxImage: CSSProperties = {
  maxWidth: '100%',
  maxHeight: '85vh',
  objectFit: 'contain',
  display: 'inline-block',
};

export const drawerTitle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  minWidth: 0,
};

export const drawerTitleRow: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
};

export const drawerTitleText: CSSProperties = {
  fontWeight: 800,
  fontSize: 16,
  lineHeight: 1.2,
};

export const drawerTagRow: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
};

export const textAreaResize: CSSProperties = {
  resize: 'vertical',
};

export const dividerSpaced: CSSProperties = {
  margin: '8px 0',
};

export const sectionGrid: CSSProperties = {
  display: 'grid',
  gap: 8,
};

export const listItem: CSSProperties = {
  display: 'grid',
  gap: 6,
};

export const itemTitle: CSSProperties = {
  fontWeight: 600,
};

export function scrollList(mobile: boolean): CSSProperties {
  return {
    display: 'grid',
    gap: 10,
    maxHeight: mobile ? '45vh' : 320,
    overflow: 'auto',
    paddingRight: 4,
  };
}

export const statusTag: CSSProperties = {
  marginLeft: 8,
};

export function worldSelect(mobile: boolean): CSSProperties {
  return {
    width: mobile ? '100%' : 260,
  };
}

export function drawerStyles(isMobile: boolean) {
  return {
    header: isMobile
      ? {
          padding: 'calc(12px + env(safe-area-inset-top)) 12px 8px',
          alignItems: 'flex-start' as const,
        }
      : undefined,
    body: isMobile
      ? {
          padding: 12,
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        }
      : undefined,
  };
}
