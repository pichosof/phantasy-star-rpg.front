import React from 'react';
import { Popup as AdmPopup, PopupProps as AdmPopupProps, SafeArea } from 'antd-mobile';
import { getMobilePopupBodyStyle, MOBILE_POPUP_BODY_CLASS } from './mobile.styles';

export interface MobilePopupProps extends AdmPopupProps {
  fullscreen?: boolean;
  withSafeArea?: boolean;
}

export const MobilePopup: React.FC<MobilePopupProps> = ({
  position = 'bottom',
  fullscreen = position === 'left' || position === 'right',
  withSafeArea = true,
  closeOnMaskClick = true,
  closeOnSwipe = true,
  bodyClassName,
  bodyStyle,
  children,
  ...props
}) => {
  const resolvedBodyClassName = [
    MOBILE_POPUP_BODY_CLASS,
    `${MOBILE_POPUP_BODY_CLASS}--${position}`,
    fullscreen && `${MOBILE_POPUP_BODY_CLASS}--fullscreen`,
    bodyClassName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <AdmPopup
      {...props}
      position={position}
      closeOnMaskClick={closeOnMaskClick}
      closeOnSwipe={closeOnSwipe}
      showCloseButton={false}
      bodyClassName={resolvedBodyClassName}
      bodyStyle={getMobilePopupBodyStyle(position, fullscreen, bodyStyle)}
    >
      {children}
      {withSafeArea && <SafeArea position="bottom" />}
    </AdmPopup>
  );
};
