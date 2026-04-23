import React from 'react';
import { SafeArea } from 'antd-mobile';
import * as S from './mobile.styles';

export interface MobileActionBarProps {
  primary?: React.ReactNode;
  secondary?: React.ReactNode;
  children?: React.ReactNode;
  sticky?: boolean;
  stacked?: boolean;
}

export const MobileActionBar: React.FC<MobileActionBarProps> = ({
  primary,
  secondary,
  children,
  sticky = true,
  stacked = false,
}) => {
  const resolvedStacked = stacked || Boolean(children);

  return (
    <S.MobileActionBarRoot $sticky={sticky}>
      <S.MobileActionBarSurface $stacked={resolvedStacked}>
        {children || (
          <>
            {secondary}
            {primary}
          </>
        )}
      </S.MobileActionBarSurface>
      <SafeArea position="bottom" />
    </S.MobileActionBarRoot>
  );
};
