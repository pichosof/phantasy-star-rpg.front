import React from 'react';
import { Tabs as AntdTabs, TabsProps } from 'antd';
import * as S from './Tabs.styles';

type LegacyTabPaneProps = React.ComponentProps<typeof AntdTabs.TabPane>;
type CompatTabsProps = TabsProps & {
  children?: React.ReactNode;
};

const TabPane: React.FC<LegacyTabPaneProps> = () => null;

const getLegacyItems = (children: React.ReactNode): TabsProps['items'] =>
  React.Children.toArray(children).flatMap((child) => {
    if (!React.isValidElement<LegacyTabPaneProps>(child) || child.key == null) {
      return [];
    }

    const { children: tabChildren, destroyInactiveTabPane, tab, ...itemProps } = child.props;

    return [
      {
        ...itemProps,
        key: String(child.key),
        label: tab,
        children: tabChildren,
        destroyOnHidden: itemProps.destroyOnHidden ?? destroyInactiveTabPane,
      },
    ];
  });

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
