import React from 'react';
import { NightTimePicker } from './NightTimePicker/NightTimePicker';
import { useAppDispatch, useAppSelector } from '@app/hooks/reduxHooks';
import { setNightTime } from '@app/store/slices/nightModeSlice';

/** Night window used by the "Schedule" theme mode. */
export const NightModeSettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);
  const nightTime = useAppSelector((state) => state.nightMode.nightTime);

  if (mode !== 'schedule') {
    return <span>Choose “Schedule” under Change Theme to switch worlds by time of day.</span>;
  }
  return <NightTimePicker nightTime={nightTime} setNightTime={(t) => dispatch(setNightTime(t))} />;
};
