import type { CSSProperties } from 'react';
import styled from 'styled-components';

export function edgeDie(size: number, shape: string): CSSProperties {
  return {
    width: size,
    height: size,
    clipPath: shape,
    background: 'linear-gradient(135deg, #faad14, #d4380d, #faad14)',
    backgroundSize: '200% 200%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transform: 'rotate(45deg)',
    flexShrink: 0,
    boxShadow: `0 0 ${size / 3}px rgba(250,173,20,0.6)`,
    cursor: 'default',
    animation: 'edge-glow 1.4s ease-in-out infinite alternate',
  };
}

export function edgeDieText(size: number): CSSProperties {
  return {
    fontSize: size < 44 ? 13 : 16,
    fontWeight: 900,
    color: '#fff',
    lineHeight: 1,
    userSelect: 'none',
    transform: 'rotate(-45deg)',
    textShadow: '0 1px 4px rgba(0,0,0,0.8)',
    letterSpacing: 0,
  };
}

export function dieFace(size: number, shape: string, bgColor: string, border?: string): CSSProperties {
  return {
    width: size,
    height: size,
    clipPath: shape,
    background: bgColor,
    border,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
    cursor: 'default',
    flexShrink: 0,
  };
}

export function dieFaceText(size: number, textColor: string): CSSProperties {
  return {
    fontSize: size < 44 ? 11 : 14,
    fontWeight: 800,
    color: textColor,
    lineHeight: 1,
    userSelect: 'none',
  };
}

export function selectorCard(active: boolean, isDark: boolean, color: string): CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: '12px 8px',
    borderRadius: 10,
    background: active ? `${color}18` : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
    border: `1px solid ${active ? `${color}66` : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'}`,
    transition: 'all 0.15s',
    minWidth: 72,
  };
}

export function selectorDie(active: boolean, isDark: boolean, color: string, shape: string): CSSProperties {
  return {
    width: 44,
    height: 44,
    clipPath: shape,
    background: active ? color : isDark ? `${color}45` : `${color}35`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s',
    flexShrink: 0,
  };
}

export const selectorDieText: CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  color: '#fff',
  userSelect: 'none',
  textShadow: '0 1px 2px rgba(0,0,0,0.4)',
};

export const selectorControls: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

export function selectorAdjustButton(disabled: boolean, isDark: boolean): CSSProperties {
  return {
    width: 22,
    height: 22,
    borderRadius: 4,
    border: 'none',
    background: disabled
      ? isDark
        ? 'rgba(255,255,255,0.04)'
        : 'rgba(0,0,0,0.04)'
      : isDark
        ? 'rgba(255,255,255,0.1)'
        : 'rgba(0,0,0,0.07)',
    color: disabled ? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)') : isDark ? '#fff' : '#000',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    lineHeight: 1,
    padding: 0,
    transition: 'all 0.12s',
  };
}

export function selectorCount(active: boolean, isDark: boolean, color: string): CSSProperties {
  return {
    minWidth: 18,
    textAlign: 'center',
    fontWeight: 700,
    fontSize: 15,
    color: active ? color : isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.22)',
    transition: 'color 0.15s',
  };
}

export function historyRow(isDark: boolean): CSSProperties {
  return {
    padding: '10px 12px',
    borderRadius: 8,
    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}`,
  };
}

export const historyHeader: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  flexWrap: 'wrap',
};

export const historyMeta: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap',
  minWidth: 0,
};

export const historyTime: CSSProperties = {
  fontSize: 11,
  whiteSpace: 'nowrap',
};

export const historyLabelTag: CSSProperties = {
  margin: 0,
  fontFamily: 'monospace',
  fontSize: 12,
};

export const historyStatTag: CSSProperties = {
  margin: 0,
  fontSize: 11,
};

export const historyEdgeTag: CSSProperties = {
  margin: 0,
  fontSize: 11,
  fontWeight: 700,
};

export const historyTotalWrap: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

export function historyTotalValue(color: string): CSSProperties {
  return {
    fontSize: 20,
    fontWeight: 800,
    color,
    whiteSpace: 'nowrap',
  };
}

export function historyReplayButton(isDark: boolean): CSSProperties {
  return {
    width: 24,
    height: 24,
    borderRadius: 4,
    border: 'none',
    background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  };
}

export const historyReplayIcon: CSSProperties = {
  fontSize: 12,
};

export const historyDiceWrap: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
  marginTop: 8,
};

export const PageGrid = styled.div`
  display: grid;
  gap: 16px;
  max-width: 860px;
  margin: 0 auto;
`;

export const SelectorGrid = styled.div<{ $mobile: boolean }>`
  display: grid;
  grid-template-columns: ${(p) => (p.$mobile ? 'repeat(4, 1fr)' : 'repeat(6, 1fr)')};
  gap: 8px;
`;

export const pageHeading: CSSProperties = {
  margin: '0 0 16px',
};

export const sectionDivider: CSSProperties = {
  margin: '16px 0',
};

export const rollButton: CSSProperties = {
  minWidth: 120,
  fontWeight: 700,
  fontSize: 16,
};

export const lastHeader: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  flexWrap: 'wrap',
  marginBottom: 14,
};

export const lastTotalWrap: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

export function totalLabel(color: string): CSSProperties {
  return {
    fontSize: 13,
    color,
  };
}

export function totalValue(color: string): CSSProperties {
  return {
    fontSize: 42,
    fontWeight: 900,
    lineHeight: 1,
    color,
    letterSpacing: -1,
  };
}

export const lastDiceWrap: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
};

export function resultBanner(background: string, border: string): CSSProperties {
  return {
    marginTop: 12,
    padding: '8px 12px',
    borderRadius: 8,
    background,
    border: `1px solid ${border}`,
  };
}

export function resultBannerText(color: string, fontWeight: number): CSSProperties {
  return {
    color,
    fontWeight,
  };
}

export function historyBadge(isDark: boolean): CSSProperties {
  return {
    backgroundColor: 'rgba(128,128,128,0.3)',
    color: isDark ? '#fff' : '#000',
  };
}

export const historySumValue: CSSProperties = {
  fontWeight: 700,
  marginLeft: 4,
};

export const HistoryList = styled.div`
  display: grid;
  gap: 8px;
  max-height: 420px;
  overflow-y: auto;
  padding-right: 4px;
`;
