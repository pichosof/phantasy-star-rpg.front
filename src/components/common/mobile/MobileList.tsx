import React from 'react';
import { List as AdmList, ListItemProps as AdmListItemProps, ListProps as AdmListProps } from 'antd-mobile';
import * as S from './mobile.styles';

export interface MobileListProps extends AdmListProps {
  inset?: boolean;
}

export interface MobileListItemProps extends AdmListItemProps {}

type MobileListComponent = React.FC<MobileListProps> & {
  Item: React.FC<MobileListItemProps>;
};

const MobileListBase: React.FC<MobileListProps> = ({ inset = true, mode = 'card', ...props }) => {
  return <S.MobileListRoot $inset={inset} mode={mode} {...props} />;
};

const MobileListItem: React.FC<MobileListItemProps> = ({ clickable, arrowIcon, onClick, ...props }) => {
  const resolvedClickable = clickable ?? Boolean(onClick);
  const resolvedArrowIcon = arrowIcon ?? resolvedClickable;

  return <AdmList.Item clickable={resolvedClickable} arrowIcon={resolvedArrowIcon} onClick={onClick} {...props} />;
};

export const MobileList = Object.assign(MobileListBase, {
  Item: MobileListItem,
}) as MobileListComponent;
