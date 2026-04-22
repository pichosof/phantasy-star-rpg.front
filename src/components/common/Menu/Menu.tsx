import React from 'react';
import { MenuProps } from 'antd';
import * as S from './Menu.styles';

export const Menu: React.FC<MenuProps> = ({ children, ...props }) => {
  return <S.Menu {...props}>{children}</S.Menu>;
};
