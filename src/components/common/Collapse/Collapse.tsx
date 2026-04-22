import React from 'react';
import { CollapseProps, Collapse as AntdCollapse } from 'antd';
import * as S from './Collapse.styles';

type LegacyPanelProps = React.ComponentProps<typeof AntdCollapse.Panel>;
type CompatCollapseProps = CollapseProps & {
  children?: React.ReactNode;
};

const Panel: React.FC<LegacyPanelProps> = () => null;

const normalizeLegacyKey = (key: React.Key) => String(key).replace(/^\.\$?/, '');

const getLegacyItems = (children: React.ReactNode): CollapseProps['items'] => {
  const legacyItems: NonNullable<CollapseProps['items']> = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement<LegacyPanelProps>(child) || child.key == null) {
      return;
    }

    const { children: panelChildren, header, ref: legacyRef, ...itemProps } = child.props;
    void legacyRef;

    legacyItems.push({
      ...itemProps,
      key: normalizeLegacyKey(child.key),
      label: header,
      children: panelChildren,
    });
  });
  return legacyItems;
};

type CollapseComponent = React.FC<CompatCollapseProps> & {
  Panel: typeof Panel;
};

export const Collapse = Object.assign(
  ({ children, destroyInactivePanel, expandIconPosition, items, ...props }: CompatCollapseProps) => {
    return (
      <S.Collapse
        {...props}
        destroyOnHidden={props.destroyOnHidden ?? destroyInactivePanel}
        expandIconPlacement={props.expandIconPlacement ?? expandIconPosition}
        items={items ?? getLegacyItems(children)}
      />
    );
  },
  { Panel },
) as CollapseComponent;
