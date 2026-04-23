import type { CSSProperties } from 'react';

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
