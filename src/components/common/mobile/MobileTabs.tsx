import React from 'react';
import { Tabs as AdmTabs, TabsProps as AdmTabsProps } from 'antd-mobile';
import type { MobileTabItem } from './mobile.types';
import * as S from './mobile.styles';

export interface MobileTabsProps extends AdmTabsProps {
  items?: MobileTabItem[];
}

type MobileTabsComponent = React.FC<MobileTabsProps> & {
  Tab: typeof AdmTabs.Tab;
};

const MobileTabsBase: React.FC<MobileTabsProps> = ({ items, children, ...props }) => {
  return (
    <S.MobileTabsRoot {...props}>
      {items
        ? items.map((item) => (
            <AdmTabs.Tab
              key={item.key}
              title={item.title}
              disabled={item.disabled}
              forceRender={item.forceRender}
              destroyOnClose={item.destroyOnClose}
            >
              {item.children}
            </AdmTabs.Tab>
          ))
        : children}
    </S.MobileTabsRoot>
  );
};

export const MobileTabs = Object.assign(MobileTabsBase, {
  Tab: AdmTabs.Tab,
}) as MobileTabsComponent;
