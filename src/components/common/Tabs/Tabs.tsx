import React from 'react';
import { Tabs as AntdTabs, TabsProps } from 'antd';
import * as S from './Tabs.styles';

type LegacyTabPaneProps = React.ComponentProps<typeof AntdTabs.TabPane>;
type CompatTabsProps = TabsProps & {
  children?: React.ReactNode;
};

const TabPane: React.FC<LegacyTabPaneProps> = () => null;

const normalizeLegacyKey = (key: React.Key) => String(key).replace(/^\.\$?/, '');

const getLegacyItems = (children: React.ReactNode): TabsProps['items'] => {
  const legacyItems: NonNullable<TabsProps['items']> = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement<LegacyTabPaneProps>(child) || child.key == null) {
      return;
    }

    const { children: tabChildren, destroyInactiveTabPane, tab, ...itemProps } = child.props;

    legacyItems.push({
      ...itemProps,
      key: normalizeLegacyKey(child.key),
      label: tab,
      children: tabChildren,
      destroyOnHidden: itemProps.destroyOnHidden ?? destroyInactiveTabPane,
    });
  });
  return legacyItems;
};

type TabsComponent = React.FC<CompatTabsProps> & {
  TabPane: typeof TabPane;
};

export const Tabs = Object.assign(
  ({ children, destroyInactiveTabPane, items, ...props }: CompatTabsProps) => {
    return (
      <S.Tabs
        {...props}
        destroyOnHidden={props.destroyOnHidden ?? destroyInactiveTabPane}
        items={items ?? getLegacyItems(children)}
      />
    );
  },
  { TabPane },
) as TabsComponent;
