import React from 'react';
import { ActionSheet as AdmActionSheet, ActionSheetProps as AdmActionSheetProps } from 'antd-mobile';
import { getMobileActionSheetStyles, MOBILE_ACTION_SHEET_CLASS } from './mobile.styles';

export type MobileActionSheetProps = AdmActionSheetProps;

export const MobileActionSheet: React.FC<MobileActionSheetProps> = ({
  popupClassName,
  closeOnAction = true,
  closeOnMaskClick = true,
  safeArea = true,
  styles,
  ...props
}) => {
  return (
    <AdmActionSheet
      {...props}
      popupClassName={[MOBILE_ACTION_SHEET_CLASS, popupClassName].filter(Boolean).join(' ')}
      closeOnAction={closeOnAction}
      closeOnMaskClick={closeOnMaskClick}
      safeArea={safeArea}
      styles={getMobileActionSheetStyles(styles)}
    />
  );
};
