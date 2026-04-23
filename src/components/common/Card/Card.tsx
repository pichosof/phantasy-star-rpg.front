import React from 'react';
import { CardProps as AntCardProps } from 'antd';
import { defaultPaddings, PaddingDensity } from '@app/constants/defaultPaddings';
import { useResponsive } from '@app/hooks/useResponsive';
import * as S from './Card.styles';

export interface CardProps extends AntCardProps {
  className?: string;
  padding?: string | number | [number, number];
  autoHeight?: boolean;
  density?: PaddingDensity; // comfy | dense
}

export const Card: React.FC<CardProps> = ({
  className,
  padding,
  size,
  autoHeight = false,
  density = 'comfy',
  children,
  variant = 'outlined',
  ...props
}) => {
  const { isTablet, isDesktop } = useResponsive();

  const responsivePadding: [number, number] = isDesktop
    ? defaultPaddings[density].desktop
    : isTablet
      ? defaultPaddings[density].tablet
      : defaultPaddings[density].mobile;

  const resolvedPadding = padding || padding === 0 ? padding : responsivePadding;

  const resolvedSize = size ? (size === 'default' ? 'medium' : size) : isTablet ? 'medium' : 'small';

  return (
    <S.Card
      size={resolvedSize}
      className={className}
      variant={variant}
      $padding={resolvedPadding}
      $autoHeight={autoHeight}
      {...props}
    >
      {children}
    </S.Card>
  );
};
