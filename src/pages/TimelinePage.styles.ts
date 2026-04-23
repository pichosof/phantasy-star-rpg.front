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

export const createInputRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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

export const tableMinWidth: CSSProperties = {
  minWidth: 760,
};

export const emptyTopSpacing: CSSProperties = {
  marginTop: 16,
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
  whiteSpace: 'pre-wrap',
};

export const drawerTitleText: CSSProperties = {
  fontWeight: 800,
};

export const MobileFilterRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const MobileMetaTags = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const MobileTimelineRoot = styled.div`
  position: relative;
  display: grid;
  gap: 14px;
  padding: 4px 0 4px 28px;
`;

export const MobileTimelineRail = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 9px;
  width: 2px;
  border-radius: 2px;
  background: linear-gradient(
    180deg,
    transparent 0%,
    #00c8e8 5%,
    #7722dd 30%,
    #ff6b1a 58%,
    #ff2244 82%,
    transparent 100%
  );
`;

export const MobileTimelineItem = styled.div`
  position: relative;
  min-width: 0;
`;

export const MobileTimelineDot = styled.div<{ $color: string }>`
  position: absolute;
  top: 18px;
  left: -26px;
  width: 14px;
  height: 14px;
  border: 2px solid ${({ $color }) => $color};
  border-radius: 999px;
  background: ${({ $color }) => $color};
  box-shadow:
    0 0 10px ${({ $color }) => $color},
    0 0 20px ${({ $color }) => `${$color}55`};
`;

export const MobileEventBody = styled.div`
  display: grid;
  gap: 10px;
`;

export const MobileEventDate = styled.span<{ $color: string }>`
  justify-self: start;
  padding: 3px 9px;
  border: 1px solid ${({ $color }) => `${$color}66`};
  border-radius: 999px;
  background: ${({ $color }) => `${$color}22`};
  color: ${({ $color }) => $color};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
`;

export const MobileEventTitle = styled.div`
  color: var(--text-main-color);
  font-size: 18px;
  font-weight: 800;
  line-height: 1.15;
`;

export const MobileEventPreview = styled.p`
  margin: 0;
  color: var(--text-secondary-color);
  font-size: 13px;
  line-height: 1.55;
  white-space: pre-wrap;
`;

export const MobileEventActions = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;

export const MobileSectionStack = styled.div`
  display: grid;
  gap: 12px;
`;

export const MobileDetailGrid = styled.dl`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 10px;
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
  font-weight: 600;
`;

export const MobileDetailValue = styled.dd`
  margin: 0;
  color: var(--text-main-color);
  font-size: 14px;
  line-height: 1.4;
  overflow-wrap: anywhere;
`;

export const MobileVisibilityRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

export const MobileInlineLabel = styled.span`
  color: var(--text-secondary-color);
  font-size: 13px;
  font-weight: 600;
`;

export const MobileBodyText = styled.p`
  margin: 0;
  color: var(--text-secondary-color);
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
`;

export const MobileEmptyState = styled.div`
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

export const MobileDangerZone = styled.div`
  display: grid;
  gap: 10px;
`;
