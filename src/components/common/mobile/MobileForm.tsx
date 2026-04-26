import React from 'react';
import { Form as AdmForm, FormProps as AdmFormProps } from 'antd-mobile';
import * as S from './mobile.styles';

export type MobileFormProps = AdmFormProps;

type MobileFormRef = React.ElementRef<typeof AdmForm>;

type MobileFormComponent = React.ForwardRefExoticComponent<MobileFormProps & React.RefAttributes<MobileFormRef>> & {
  Item: typeof AdmForm.Item;
  Array: typeof AdmForm.Array;
  Header: typeof AdmForm.Header;
  Subscribe: typeof AdmForm.Subscribe;
  useForm: typeof AdmForm.useForm;
  useWatch: typeof AdmForm.useWatch;
};

const MobileFormBase = React.forwardRef<MobileFormRef, MobileFormProps>(
  ({ layout = 'vertical', mode = 'card', className, ...props }, ref) => {
    return (
      <S.MobileFormRoot
        ref={ref}
        layout={layout}
        mode={mode}
        className={['psr-mobile-form', className].filter(Boolean).join(' ')}
        {...props}
      />
    );
  },
);

MobileFormBase.displayName = 'MobileForm';

export const MobileForm = Object.assign(MobileFormBase, {
  Item: AdmForm.Item,
  Array: AdmForm.Array,
  Header: AdmForm.Header,
  Subscribe: AdmForm.Subscribe,
  useForm: AdmForm.useForm,
  useWatch: AdmForm.useWatch,
}) as MobileFormComponent;
