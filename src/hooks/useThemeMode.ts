import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@app/hooks/reduxHooks';
import { applyTheme } from '@app/store/slices/themeSlice';

const DAY_MS = 24 * 3600 * 1000;

/** ms since local midnight */
const nowOfDay = () => {
  const d = new Date();
  return ((d.getHours() * 60 + d.getMinutes()) * 60 + d.getSeconds()) * 1000 + d.getMilliseconds();
};

/** Is `t` inside the night window [start, end) — which may wrap past midnight? */
export function isNightAt(t: number, [start, end]: number[]): boolean {
  return start <= end ? t >= start && t < end : t >= start || t < end;
}

/** ms until the next window boundary. */
const msUntilNextBoundary = (t: number, [start, end]: number[]) =>
  Math.min(...[start, end].map((b) => (b - t + DAY_MS) % DAY_MS || DAY_MS));

/**
 * Applies the automatic theme modes:
 *  - system:   OS light/dark preference → dayTheme / nightTheme (live updates)
 *  - schedule: night window from the settings → nightTheme, otherwise dayTheme
 * Manual mode does nothing (the picked theme stays).
 */
export const useThemeMode = (): void => {
  const dispatch = useAppDispatch();
  const { mode, dayTheme, nightTheme, theme } = useAppSelector((state) => state.theme);
  const nightTime = useAppSelector((state) => state.nightMode.nightTime);

  useEffect(() => {
    if (mode !== 'system' || typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => {
      const next = media.matches ? nightTheme : dayTheme;
      if (next !== theme) dispatch(applyTheme(next));
    };
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, [dispatch, mode, dayTheme, nightTheme, theme]);

  useEffect(() => {
    if (mode !== 'schedule') return;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const t = nowOfDay();
      const next = isNightAt(t, nightTime) ? nightTheme : dayTheme;
      if (next !== theme) dispatch(applyTheme(next));
      timer = setTimeout(tick, msUntilNextBoundary(t, nightTime) + 500);
    };
    tick();
    return () => clearTimeout(timer);
  }, [dispatch, mode, dayTheme, nightTheme, theme, nightTime]);
};
