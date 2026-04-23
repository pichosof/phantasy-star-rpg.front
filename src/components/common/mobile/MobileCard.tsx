import React from 'react';
import { CardProps as AdmCardProps } from 'antd-mobile';
import * as S from './mobile.styles';

export interface MobileCardProps extends AdmCardProps {
  compact?: boolean;
  inset?: boolean;
}

export const MobileCard: React.FC<MobileCardProps> = ({ compact = false, inset = true, ...props }) => {
  return <S.MobileCardRoot $compact={compact} $inset={inset} {...props} />;
};
