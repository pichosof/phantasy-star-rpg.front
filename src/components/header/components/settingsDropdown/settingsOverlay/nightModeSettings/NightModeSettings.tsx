import React from 'react';
import { NightTimePicker } from './NightTimePicker/NightTimePicker';
import { Switch } from '@app/components/common/Switch/Switch';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '@app/hooks/reduxHooks';
import { setNightMode, setNightTime } from '@app/store/slices/nightModeSlice';

export const NightModeSettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const nightModeState = useAppSelector((state) => state.nightMode);
  const isNightMode = nightModeState.isNightMode;
  const nightTime = nightModeState.nightTime;

  return (
    <>
      <SwitchContainer>
        <span>Auto</span>
        <Switch checkedChildren="On" unCheckedChildren="Off" checked={isNightMode} />
      </SwitchContainer>
      {isNightMode && <NightTimePicker nightTime={nightTime} setNightTime={(t) => dispatch(setNightTime(t))} />}
    </>
  );
};

export const SwitchContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;
