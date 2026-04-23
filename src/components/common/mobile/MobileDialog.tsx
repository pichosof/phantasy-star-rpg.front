import React from 'react';
import { Dialog as AdmDialog, DialogProps as AdmDialogProps } from 'antd-mobile';
import { mobileDialogBodyStyle, MOBILE_DIALOG_BODY_CLASS } from './mobile.styles';

export interface MobileDialogProps extends AdmDialogProps {}

export const MobileDialog: React.FC<MobileDialogProps> = ({
  bodyClassName,
  bodyStyle,
  closeOnMaskClick = true,
  ...props
}) => {
  return (
    <AdmDialog
      {...props}
      closeOnMaskClick={closeOnMaskClick}
      bodyClassName={[MOBILE_DIALOG_BODY_CLASS, bodyClassName].filter(Boolean).join(' ')}
      bodyStyle={{ ...mobileDialogBodyStyle, ...bodyStyle }}
    />
  );
};
