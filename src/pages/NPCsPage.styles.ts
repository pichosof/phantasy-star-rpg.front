import type { CSSProperties } from 'react';
import styled from 'styled-components';

export const adminDrawerBody: CSSProperties = {
  background: 'var(--additional-background-color)',
};

export const detailDrawerBody: CSSProperties = {
  padding: 0,
  background: 'var(--additional-background-color)',
};

export const detailHeroShell: CSSProperties = {
  position: 'relative',
  background: 'var(--additional-background-color)',
};

export const detailHeroImageWrap: CSSProperties = {
  height: 260,
  overflow: 'hidden',
  background: 'var(--secondary-background-color)',
};

export const detailHeroImage: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

export function detailHeroFallback(metaHex: string): CSSProperties {
  return {
    height: 180,
    background: `linear-gradient(135deg, ${metaHex}40 0%, var(--secondary-background-color) 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
}

export function detailHeroAvatar(metaHex: string): CSSProperties {
  return {
    background: metaHex,
    fontSize: 36,
    fontWeight: 700,
    boxShadow: `0 10px 30px ${metaHex}55`,
  };
}

export const detailCloseButton: CSSProperties = {
  position: 'absolute',
  top: 10,
  right: 10,
  background: 'rgba(0, 0, 0, 0.58)',
  border: 'none',
  color: '#fff',
  backdropFilter: 'blur(6px)',
};

export const detailHeroFade: CSSProperties = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 72,
  background: 'linear-gradient(180deg, transparent 0%, var(--additional-background-color) 100%)',
};

export const detailContent: CSSProperties = {
  padding: '0 20px 24px',
  background: 'var(--additional-background-color)',
};

export const detailHeaderStack: CSSProperties = {
  width: '100%',
  marginBottom: 12,
};

export function detailRoleTag(metaHex: string): CSSProperties {
  return {
    fontSize: 12,
    fontWeight: 600,
    padding: '2px 10px',
    background: `${metaHex}20`,
    borderColor: metaHex,
    color: metaHex,
  };
}

export const detailLocationMeta: CSSProperties = {
  color: 'var(--text-light-color)',
  fontSize: 13,
};

export function detailAccent(metaHex: string): CSSProperties {
  return {
    height: 3,
    borderRadius: 2,
    background: `linear-gradient(90deg, ${metaHex}, ${metaHex}20)`,
  };
}

export const detailParagraph: CSSProperties = {
  whiteSpace: 'pre-wrap',
  lineHeight: 1.7,
  color: 'var(--text-main-color)',
  marginBottom: 0,
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

export const MobileNpcsGrid = styled.div`
  display: grid;
  gap: 12px;
`;

export const MobileNpcCardBody = styled.div`
  display: grid;
  gap: 12px;
`;

export const MobileNpcCardMedia = styled.div<{ $accent: string }>`
  height: 190px;
  overflow: hidden;
  border-radius: 16px;
  background:
    radial-gradient(circle at 20% 18%, ${({ $accent }) => `${$accent}33`}, transparent 36%),
    linear-gradient(135deg, ${({ $accent }) => `${$accent}22`}, var(--secondary-background-color));
`;

export const MobileNpcCardImage = styled.img`
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
`;

export const MobileNpcHero = styled.div<{ $accent: string }>`
  min-height: 230px;
  overflow: hidden;
  border-radius: 18px;
  background:
    radial-gradient(circle at 20% 18%, ${({ $accent }) => `${$accent}33`}, transparent 36%),
    linear-gradient(135deg, ${({ $accent }) => `${$accent}22`}, var(--secondary-background-color));
`;

export const MobileNpcHeroImage = styled.img`
  width: 100%;
  height: 230px;
  display: block;
  object-fit: cover;
`;

export const MobileNpcFallback = styled.div<{ $accent: string }>`
  width: 100%;
  height: 100%;
  min-height: 190px;
  display: grid;
  place-items: center;
  color: #fff;

  span {
    width: 86px;
    height: 86px;
    display: grid;
    place-items: center;
    border-radius: 999px;
    background: ${({ $accent }) => $accent};
    box-shadow: 0 14px 34px ${({ $accent }) => `${$accent}66`};
    font-size: 28px;
    font-weight: 800;
    letter-spacing: 0.04em;
  }
`;

export const MobileNpcHeroInfo = styled.div`
  display: grid;
  gap: 10px;
  padding-top: 12px;
`;

export const MobileNpcTitle = styled.h2`
  margin: 0;
  color: var(--text-main-color);
  font-size: 20px;
  line-height: 1.12;
  font-weight: 800;
`;

export const MobileNpcPreview = styled.p`
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

export const MobileBodyText = styled.p`
  margin: 0;
  color: var(--text-main-color);
  font-size: 14px;
  line-height: 1.6;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
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

export const MobileEmptyState = styled.div`
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

export const MobileActionGrid = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  > :only-child {
    grid-column: 1 / -1;
  }
`;

export const MobileVisibilityRow = styled.div`
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const MobileInlineLabel = styled.span`
  color: var(--text-main-color);
  font-size: 14px;
  font-weight: 700;
`;

export const MobileUploadStack = styled.div`
  display: grid;
  gap: 10px;
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

export const MobileDangerZone = styled.div`
  display: grid;
  gap: 12px;
`;
