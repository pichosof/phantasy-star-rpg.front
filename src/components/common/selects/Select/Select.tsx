import React, { ComponentProps } from 'react';
import { Select as AntSelect, RefSelectProps } from 'antd';
import * as S from './Select.styles';

export interface SelectProps extends ComponentProps<typeof AntSelect>, S.SelectProps {
  className?: string;
}

export const Select = React.forwardRef<RefSelectProps, SelectProps>(({ className, width, children, ...props }, ref) => (
  <S.Select getPopupContainer={(triggerNode) => triggerNode} ref={ref} className={className} width={width} {...props}>
    {children}
  </S.Select>
));
