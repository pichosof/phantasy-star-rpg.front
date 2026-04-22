import React from 'react';
import { InputNumberProps as AntdInputNumberProps } from 'antd';
import type { InputNumberRef } from '@rc-component/input-number';
import * as S from './InputNumber.styles';

export interface InputNumberProps extends AntdInputNumberProps {
  className?: string;
  $block?: boolean;
}

export const InputNumber = React.forwardRef<InputNumberRef, InputNumberProps>(
  ({ className, children, $block, ...props }, ref) => (
    <S.InputNumber ref={ref} className={className} $block={$block} {...props}>
      {children}
    </S.InputNumber>
  ),
);
