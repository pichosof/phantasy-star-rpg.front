import React from 'react';
import { SearchBarProps as AdmSearchBarProps } from 'antd-mobile';
import * as S from './mobile.styles';

export interface MobileSearchBarProps extends AdmSearchBarProps {
  inset?: boolean;
}

const defaultCancelVisibility = (focus: boolean, value: string) => focus || Boolean(value);

export const MobileSearchBar: React.FC<MobileSearchBarProps> = ({
  inset = true,
  showCancelButton = defaultCancelVisibility,
  cancelText = 'Cancel',
  style,
  ...props
}) => {
  return (
    <S.MobileSearchBarRoot
      cancelText={cancelText}
      $inset={inset}
      showCancelButton={showCancelButton}
      style={{ ...S.mobileSearchBarStyle, ...style }}
      {...props}
    />
  );
};
