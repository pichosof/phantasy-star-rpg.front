import type { CSSProperties } from 'react';
import styled from 'styled-components';

export function timelineDot(color: string, pulse?: boolean): CSSProperties {
  return {
    width: 14,
    height: 14,
    borderRadius: '50%',
    background: color,
    border: `2px solid ${color}`,
    boxShadow: `0 0 ${pulse ? 14 : 8}px ${color}, 0 0 ${pulse ? 28 : 16}px ${color}40`,
    transition: 'all 0.25s ease',
    flexShrink: 0,
  };
}

export function eventCard(color: string, hovered: boolean, side: 'left' | 'right'): CSSProperties {
  return {
    background: 'var(--additional-background-color)',
    border: `1px solid ${hovered ? color : 'var(--border-color)'}`,
    borderRadius: 10,
    padding: '14px 16px',
    cursor: 'pointer',
    transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
    boxShadow: hovered ? `0 8px 24px ${color}40, 0 0 0 1px ${color}55` : 'var(--box-shadow)',
    transition: 'all 0.2s ease',
    textAlign: side === 'right' ? 'left' : 'right',
  };
}

export function dateBadge(color: string): CSSProperties {
  return {
    display: 'inline-block',
    background: `${color}22`,
    border: `1px solid ${color}55`,
    borderRadius: 4,
    padding: '2px 8px',
    marginBottom: 8,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color,
    fontWeight: 600,
  };
}

export const visibleTag: CSSProperties = {
  margin: 0,
  fontSize: 11,
};

export const eventTitle: CSSProperties = {
  fontSize: 15,
  display: 'block',
  lineHeight: 1.4,
  color: 'var(--text-main-color)',
};

export const eventDescription: CSSProperties = {
  fontSize: 13,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  marginTop: 6,
  lineHeight: 1.5,
  color: 'var(--text-light-color)',
};

export const headerSearch: CSSProperties = {
  maxWidth: 360,
};

export const marginBottom6: CSSProperties = {
  marginBottom: 6,
};

export const createForm = styled.form`
  display: grid;
  gap: 10px;
  max-width: 520px;
`;

export const createTitleInput: CSSProperties = {
  minWidth: 240,
};

export const createDateInput: CSSProperties = {
  minWidth: 200,
};

export const editForm = styled.form`
  display: grid;
  gap: 10px;
`;

export const adminTitle: CSSProperties = {
  cursor: 'pointer',
  fontSize: 13,
};

export function timelineWrap(mobileOnly: boolean): CSSProperties {
  return {
    position: 'relative',
    padding: mobileOnly ? '8px 0 8px 32px' : '8px 0',
  };
}

export const mobileLine: CSSProperties = {
  position: 'absolute',
  left: 7,
  top: 0,
  bottom: 0,
  width: 2,
  background:
    'linear-gradient(180deg, transparent 0%, #00C8E8 5%, #7722DD 30%, #FF6B1A 58%, #FF2244 82%, transparent 100%)',
  borderRadius: 1,
};

export const desktopLine: CSSProperties = {
  position: 'absolute',
  left: '50%',
  top: 0,
  bottom: 0,
  width: 2,
  transform: 'translateX(-50%)',
  background:
    'linear-gradient(180deg, transparent 0%, #00C8E8 5%, #7722DD 30%, #FF6B1A 58%, #FF2244 82%, transparent 100%)',
  borderRadius: 1,
};

export const mobileItem: CSSProperties = {
  position: 'relative',
  marginBottom: 24,
};

export const mobileDotWrap: CSSProperties = {
  position: 'absolute',
  left: -28,
  top: 18,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const timelineRow: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 56px 1fr',
  alignItems: 'flex-start',
  marginBottom: 32,
  gap: 0,
};

export const leftSlot: CSSProperties = {
  paddingRight: 20,
  paddingTop: 4,
};

export const centerSlot: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  paddingTop: 18,
};

export const rightSlot: CSSProperties = {
  paddingLeft: 20,
  paddingTop: 4,
};

export const drawerSectionLabel: CSSProperties = {
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: 1,
  color: 'var(--text-light-color)',
};

export const drawerDateText: CSSProperties = {
  fontSize: 15,
  color: 'var(--text-main-color)',
};

export const drawerRawDate: CSSProperties = {
  fontSize: 12,
  marginLeft: 8,
  color: 'var(--text-light-color)',
};

export const drawerDescription: CSSProperties = {
  marginTop: 4,
  marginBottom: 0,
  fontSize: 14,
  lineHeight: 1.7,
};
