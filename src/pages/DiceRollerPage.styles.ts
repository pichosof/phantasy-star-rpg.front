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

export const MobileDiceStack = styled.div`
  display: grid;
  gap: 12px;
  padding-bottom: 86px;
`;

export const MobileHero = styled.div`
  display: grid;
  gap: 10px;
`;

export const MobileHeroTitle = styled.h1`
  margin: 0;
  color: var(--text-main-color);
  font-size: 1.55rem;
  line-height: 1.05;
  font-weight: 900;
  letter-spacing: -0.04em;
`;

export const MobileHeroText = styled.p`
  margin: 0;
  color: var(--text-secondary-color);
  font-size: 0.88rem;
  line-height: 1.45;
`;

export const MobileMetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const MobileDiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 9px;
`;

export const MobileDieCard = styled.div<{ $active: boolean; $color: string; $isDark: boolean }>`
  min-height: 106px;
  border: 1px solid ${(p) => (p.$active ? `${p.$color}88` : p.$isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)')};
  border-radius: 18px;
  padding: 10px 8px;
  background: ${(p) => (p.$active ? `${p.$color}20` : 'var(--psr-mobile-elevated-bg)')};
  color: var(--text-main-color);
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 8px;
  box-shadow: ${(p) => (p.$active ? `0 12px 26px ${p.$color}22` : 'none')};
  touch-action: manipulation;
`;

export const MobileDieShape = styled.span<{ $active: boolean; $color: string; $shape: string }>`
  width: 46px;
  height: 46px;
  clip-path: ${(p) => p.$shape};
  background: ${(p) => (p.$active ? p.$color : `${p.$color}55`)};
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 900;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.45);
`;

export const MobileDieCount = styled.span<{ $active: boolean; $color: string }>`
  min-width: 30px;
  min-height: 30px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  color: ${(p) => (p.$active ? '#fff' : 'var(--text-secondary-color)')};
  background: ${(p) => (p.$active ? p.$color : 'transparent')};
  font-size: 1rem;
  font-weight: 900;
`;

export const MobileDieStepper = styled.div`
  display: grid;
  grid-template-columns: 34px 1fr 34px;
  align-items: center;
  gap: 4px;
  width: 100%;
`;

export const MobileAdjustButton = styled.button<{ $disabled?: boolean }>`
  width: 34px;
  height: 34px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--additional-background-color);
  color: ${(p) => (p.$disabled ? 'var(--disabled-color)' : 'var(--text-main-color)')};
  font-size: 1.15rem;
  font-weight: 900;
  line-height: 1;
  touch-action: manipulation;
`;

export const MobileFormula = styled.div`
  color: var(--text-secondary-color);
  font-family: monospace;
  font-size: 0.86rem;
  line-height: 1.45;
  overflow-wrap: anywhere;
`;

export const MobileResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
`;

export const MobileResultTotal = styled.div`
  color: var(--text-main-color);
  font-size: clamp(3.4rem, 18vw, 5.5rem);
  font-weight: 950;
  line-height: 0.9;
  letter-spacing: -0.08em;
`;

export const MobileResultLabel = styled.div`
  color: var(--text-secondary-color);
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

export const MobileDiceCloud = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

export const MobileHistoryList = styled.div`
  display: grid;
  gap: 10px;
`;

export const MobileEmptyState = styled.div`
  min-height: 120px;
  display: grid;
  place-items: center;
  text-align: center;
  color: var(--text-secondary-color);
  line-height: 1.45;
`;

export const MobileRollDock = styled.div`
  position: fixed;
  right: 12px;
  bottom: calc(12px + env(safe-area-inset-bottom));
  left: 12px;
  z-index: 40;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 22px;
  background: color-mix(in srgb, var(--additional-background-color) 88%, transparent);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(16px);
`;
