import type { CSSProperties } from 'react';
import { textSm } from '@app/styles/styleUtils';

export const carouselFrame: CSSProperties = {
  position: 'relative',
  marginBottom: 12,
  borderRadius: 8,
  overflow: 'hidden',
  background: '#000',
  userSelect: 'none',
};

export const carouselImage: CSSProperties = {
  width: '100%',
  height: 200,
  objectFit: 'cover',
  display: 'block',
};

export const carouselThumbStrip: CSSProperties = {
  display: 'flex',
  gap: 6,
  marginBottom: 12,
  overflowX: 'auto',
};

export function carouselThumb(active: boolean): CSSProperties {
  return {
    width: 56,
    height: 40,
    objectFit: 'cover',
    borderRadius: 4,
    cursor: 'pointer',
    flexShrink: 0,
    border: active ? '2px solid #1890ff' : '2px solid transparent',
    opacity: active ? 1 : 0.6,
  };
}

export const carouselLightboxBody: CSSProperties = {
  padding: 0,
  background: '#000',
  borderRadius: 8,
  overflow: 'hidden',
  textAlign: 'center',
  position: 'relative',
};

export const carouselLightboxImage: CSSProperties = {
  maxWidth: '100%',
  maxHeight: '85vh',
  objectFit: 'contain',
  display: 'inline-block',
};

export const searchField: CSSProperties = {
  maxWidth: 360,
};

export const createForm: CSSProperties = {
  display: 'grid',
  gap: 10,
  maxWidth: 560,
};

export const cityCoverImage: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

export const adminTable: CSSProperties = {
  minWidth: 960,
};

export const tableDescription: CSSProperties = {
  ...textSm,
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export const emptyWithTopSpacing: CSSProperties = {
  marginTop: 16,
};

export const linkedCardsGrid: CSSProperties = {
  display: 'grid',
  gap: 10,
};

export const linkedParagraph: CSSProperties = {
  marginTop: 8,
  whiteSpace: 'pre-wrap',
};

export const rewardText: CSSProperties = {
  display: 'block',
};

export const mobileMetaTags: CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
};

export const mobileActionRow: CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
};

export const mobileCitiesGrid: CSSProperties = {
  display: 'grid',
  gap: 12,
};

export const mobileCityCardBody: CSSProperties = {
  display: 'grid',
  gap: 12,
};

export const mobileCityMedia: CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  borderRadius: 14,
  aspectRatio: '16 / 10',
  background: 'var(--secondary-background-color)',
};

export const mobileCityImage: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center top',
  display: 'block',
};

export const mobileImageFallback: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text-secondary-color)',
  background:
    'radial-gradient(circle at top, rgba(255,255,255,0.08), transparent 55%), var(--secondary-background-color)',
};

export const mobileCityTitleRow: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 10,
};

export const mobileCityIdentity: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gap: 6,
};

export const mobileCityName: CSSProperties = {
  color: 'var(--text-main-color)',
  fontWeight: 800,
  fontSize: 18,
  lineHeight: 1.1,
};

export const mobileCitySummary: CSSProperties = {
  margin: 0,
  color: 'var(--text-secondary-color)',
  fontSize: 13,
  lineHeight: 1.55,
  whiteSpace: 'pre-wrap',
};

export const mobileCityButtons: CSSProperties = {
  display: 'grid',
  gap: 8,
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
};

export const mobileSectionStack: CSSProperties = {
  display: 'grid',
  gap: 12,
};

export const mobileDetailGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 12,
};

export const mobileDetailItem: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gap: 4,
};

export const mobileDetailLabel: CSSProperties = {
  margin: 0,
  color: 'var(--text-secondary-color)',
  fontSize: 12,
  fontWeight: 600,
};

export const mobileDetailValue: CSSProperties = {
  margin: 0,
  color: 'var(--text-main-color)',
  fontSize: 14,
  lineHeight: 1.4,
  overflowWrap: 'anywhere',
};

export const mobileStatusRow: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 10,
};

export const mobileInlineLabel: CSSProperties = {
  color: 'var(--text-secondary-color)',
  fontSize: 13,
  fontWeight: 600,
};

export const mobileCreateFields: CSSProperties = {
  display: 'grid',
  gap: 12,
};

export const mobileCreateField: CSSProperties = {
  display: 'grid',
  gap: 6,
};

export const mobileFieldLabel: CSSProperties = {
  color: 'var(--text-secondary-color)',
  fontSize: 12,
  fontWeight: 600,
};

export const mobileLinkedList: CSSProperties = {
  display: 'grid',
  gap: 10,
};

export const mobileLoadingState: CSSProperties = {
  minHeight: 160,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
