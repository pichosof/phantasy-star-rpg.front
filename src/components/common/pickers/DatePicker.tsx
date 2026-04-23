import React from 'react';
import { DatePicker as AntDatePicker, DatePickerProps } from 'antd';

export const DatePicker = React.forwardRef<React.ElementRef<typeof AntDatePicker>, DatePickerProps>(
  ({ className, ...props }, ref) => <AntDatePicker ref={ref} className={className} {...props} />,
);
