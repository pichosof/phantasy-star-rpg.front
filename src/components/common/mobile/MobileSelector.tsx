import React from 'react';
import { Selector as AdmSelector, SelectorProps as AdmSelectorProps } from 'antd-mobile';
import type { MobileSelectorValue } from './mobile.types';
import * as S from './mobile.styles';

export interface MobileSelectorProps<V extends MobileSelectorValue> extends AdmSelectorProps<V> {
  inset?: boolean;
}

export const MobileSelector = <V extends MobileSelectorValue>({
  inset = true,
  columns = 2,
  showCheckMark = false,
  style,
  ...props
}: MobileSelectorProps<V>): React.ReactElement => {
  return (
    <S.MobileSelectorShell $inset={inset}>
      <AdmSelector<V>
        columns={columns}
        showCheckMark={showCheckMark}
        style={{ ...S.mobileSelectorStyle, ...style }}
        {...props}
      />
    </S.MobileSelectorShell>
  );
};
