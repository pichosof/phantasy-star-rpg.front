import React from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import * as S from './CalendarSwitch.styles';
import { Button } from '../buttons/Button/Button';

interface CalendarSwitchProps {
  dateFormatted: string;
  onIncrease: () => void;
  onDecrease: () => void;
  onToday: () => void;
}

export const CalendarSwitch: React.FC<CalendarSwitchProps> = ({ dateFormatted, onIncrease, onDecrease, onToday }) => {
  return (
    <S.CalendarSwitch>
      <S.Text>{dateFormatted}</S.Text>
      <S.ButtonGroup>
        <Button type="text" onClick={onDecrease} size="small">
          <LeftOutlined />
        </Button>
        <Button type="text" onClick={onToday} size="small">
          TODAY
        </Button>
        <Button type="text" onClick={onIncrease} size="small">
          <RightOutlined />
        </Button>
      </S.ButtonGroup>
    </S.CalendarSwitch>
  );
};
