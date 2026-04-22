import React from 'react';
import type { StepsProps } from 'antd';
import * as S from './Steps.styles';

export type { StepsProps };

export const Steps: React.FC<StepsProps> = ({ ...otherProps }) => {
  return <S.Steps className="steps" {...otherProps} />;
};
