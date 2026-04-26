import React, { useMemo } from 'react';
import { Dates } from '@app/constants/Dates';
import { Select, SelectProps } from '../Select/Select';

export const MonthSelect: React.FC<SelectProps> = ({ className, ...props }) => {
  const months = Dates.getMonths();

  const monthsOptions = useMemo(() => months.map((month, index) => ({ label: month, value: index })), [months]);

  return <Select className={className} options={monthsOptions} {...props} />;
};
