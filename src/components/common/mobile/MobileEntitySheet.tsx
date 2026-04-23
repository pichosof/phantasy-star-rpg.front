import React from 'react';
import { CloseOutline } from 'antd-mobile-icons';
import { NavBar } from 'antd-mobile';
import { MobilePopup, MobilePopupProps } from './MobilePopup';
import * as S from './mobile.styles';

export interface MobileEntitySheetProps extends Omit<MobilePopupProps, 'children' | 'withSafeArea' | 'fullscreen'> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  extra?: React.ReactNode;
  tabs?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  fullscreen?: boolean;
}

export const MobileEntitySheet: React.FC<MobileEntitySheetProps> = ({
  title,
  subtitle,
  description,
  extra,
  tabs,
  footer,
  children,
  onClose,
  position = 'right',
  fullscreen = true,
  ...props
}) => {
  return (
    <MobilePopup {...props} position={position} fullscreen={fullscreen}>
      <S.MobileSheetFrame>
        <S.MobileSheetHeader>
          <NavBar back={null} backIcon={<CloseOutline fontSize={20} />} onBack={onClose} right={extra}>
            {title}
          </NavBar>

          {(subtitle || description) && (
            <S.MobileSheetLead>
              {subtitle && <S.MobileSheetTitle>{subtitle}</S.MobileSheetTitle>}
              {description && <S.MobileSheetSubtitle>{description}</S.MobileSheetSubtitle>}
            </S.MobileSheetLead>
          )}
        </S.MobileSheetHeader>

        {tabs}

        <S.MobileSheetBody>{children}</S.MobileSheetBody>

        {footer && <S.MobileSheetFooter>{footer}</S.MobileSheetFooter>}
      </S.MobileSheetFrame>
    </MobilePopup>
  );
};
