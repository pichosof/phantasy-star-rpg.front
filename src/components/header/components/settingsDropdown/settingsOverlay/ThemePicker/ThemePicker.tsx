import React from 'react';
import { Select } from 'antd';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '@app/hooks/reduxHooks';
import { setAutoThemes, setTheme, setThemeMode, type ThemeMode } from '@app/store/slices/themeSlice';
import { THEME_LIST, type ThemeId } from '@app/styles/themes/registry';

/**
 * World theme picker. Lists every registered theme (styles/themes/registry.ts), so a new
 * world shows up here automatically. Swatches use each theme's own tokens.
 */

const Worlds = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
`;

const WorldButton = styled.button<{ $bg: string; $fg: string; $accent: string; $active: boolean }>`
  display: grid;
  gap: 2px;
  padding: 10px 12px;
  border-radius: 10px;
  text-align: left;
  cursor: pointer;
  background: ${({ $bg }) => $bg};
  color: ${({ $fg }) => $fg};
  border: 2px solid ${({ $active, $accent }) => ($active ? $accent : 'transparent')};
  box-shadow: 0 0 0 1px rgba(127, 127, 127, 0.35); /* theme-isolation-ignore: swatch outline must read on any theme */

  strong {
    font-size: 14px;
  }
  span {
    font-size: 11px;
    opacity: 0.85;
  }
  i {
    display: block;
    height: 4px;
    margin-top: 6px;
    border-radius: 2px;
    background: ${({ $accent }) => $accent};
  }
`;

const Row = styled.div`
  display: grid;
  gap: 6px;
  margin-top: 10px;
  font-size: 13px;
`;

/** Wraps instead of squeezing: the settings dropdown is narrow on desktop. */
const Modes = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(84px, 1fr));
  gap: 6px;
`;

const ModeButton = styled.button<{ $active: boolean }>`
  padding: 6px 8px;
  border-radius: 7px;
  font-size: 13px;
  white-space: nowrap;
  cursor: pointer;
  color: ${({ $active }) => ($active ? 'var(--text-on-color)' : 'var(--text-main-color)')};
  background: ${({ $active }) => ($active ? 'var(--primary-color)' : 'transparent')};
  border: 1px solid ${({ $active }) => ($active ? 'var(--primary-color)' : 'var(--border-strong-color)')};
`;

const MODE_OPTIONS: { label: string; value: ThemeMode }[] = [
  { label: 'Manual', value: 'manual' },
  { label: 'System', value: 'system' },
  { label: 'Schedule', value: 'schedule' },
];

export const ThemePicker: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme, mode, dayTheme, nightTheme } = useAppSelector((state) => state.theme);
  const options = THEME_LIST.map((t) => ({ label: t.name, value: t.id as ThemeId }));

  return (
    <>
      <Worlds>
        {THEME_LIST.map((t) => (
          <WorldButton
            $accent={t.tokens.primary}
            $active={t.id === theme}
            $bg={t.tokens.background}
            $fg={t.tokens.textMain}
            aria-pressed={t.id === theme}
            key={t.id}
            onClick={() => dispatch(setTheme(t.id as ThemeId))}
            type="button"
          >
            <strong>{t.name}</strong>
            <span>{t.tagline}</span>
            <i />
          </WorldButton>
        ))}
      </Worlds>

      <Row>
        <span>Automatic</span>
        <Modes role="radiogroup">
          {MODE_OPTIONS.map((o) => (
            <ModeButton
              $active={mode === o.value}
              aria-checked={mode === o.value}
              key={o.value}
              onClick={() => dispatch(setThemeMode(o.value))}
              role="radio"
              type="button"
            >
              {o.label}
            </ModeButton>
          ))}
        </Modes>
      </Row>

      {mode !== 'manual' && (
        <Row>
          <span>{mode === 'system' ? 'World for a light / dark system' : 'World for day / night'}</span>
          <Select
            onChange={(v: ThemeId) => dispatch(setAutoThemes({ dayTheme: v, nightTheme }))}
            options={options}
            prefix="Day"
            value={dayTheme}
          />
          <Select
            onChange={(v: ThemeId) => dispatch(setAutoThemes({ dayTheme, nightTheme: v }))}
            options={options}
            prefix="Night"
            value={nightTheme}
          />
        </Row>
      )}
    </>
  );
};
