import { Space } from 'antd';
import React from 'react';
import { TimeRangePicker } from 'components/common/pickers/TimeRangePicker';
import * as S from './NightTimePicker.styles';

interface NightTimePickerProps {
  nightTime: number[];
  setNightTime: (nightTime: number[]) => void;
}

export const NightTimePicker: React.FC<NightTimePickerProps> = ({ nightTime, setNightTime }) => {
  return (
    <>
      <Space size={[50, 20]} style={{ marginTop: '0.5rem' }}>
        <S.PickerLabel>From</S.PickerLabel>
        <S.PickerLabel>To</S.PickerLabel>
      </Space>
      <TimeRangePicker timeRange={nightTime} setTimeRange={setNightTime} />
    </>
  );
};
