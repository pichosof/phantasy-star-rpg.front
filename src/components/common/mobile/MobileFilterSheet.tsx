import React from 'react';
import { CloseOutline } from 'antd-mobile-icons';
import { MobilePopup, MobilePopupProps } from './MobilePopup';
import * as S from './mobile.styles';

export interface MobileFilterSheetProps extends Omit<
  MobilePopupProps,
  'children' | 'position' | 'fullscreen' | 'withSafeArea'
> {
  title: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

export const MobileFilterSheet: React.FC<MobileFilterSheetProps> = ({
  title,
  description,
  footer,
  onClose,
  children,
  ...props
}) => {
  return (
    <MobilePopup {...props} position="bottom" fullscreen={false}>
      <S.MobileSheetHandle />
      <S.MobileSheetHeader>
        <S.MobileFilterHeaderRow>
          <S.MobileSectionCopy>
            <S.MobileSectionTitle>{title}</S.MobileSectionTitle>
            {description && <S.MobileSectionDescription>{description}</S.MobileSectionDescription>}
          </S.MobileSectionCopy>
          {onClose && (
            <S.MobileDismissButton aria-label="Close filters" onClick={onClose} type="button">
              <CloseOutline fontSize={18} />
            </S.MobileDismissButton>
          )}
        </S.MobileFilterHeaderRow>
      </S.MobileSheetHeader>

      <S.MobileSheetBody>
        <S.MobileFilterBody>{children}</S.MobileFilterBody>
      </S.MobileSheetBody>

      {footer && <S.MobileSheetFooter>{footer}</S.MobileSheetFooter>}
    </MobilePopup>
  );
};
