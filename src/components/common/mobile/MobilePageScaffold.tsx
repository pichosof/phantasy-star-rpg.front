import React from 'react';
import { SafeArea } from 'antd-mobile';
import * as S from './mobile.styles';

export interface MobilePageScaffoldProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  safeAreaTop?: boolean;
  safeAreaBottom?: boolean;
}

export const MobilePageScaffold: React.FC<MobilePageScaffoldProps> = ({
  title,
  subtitle,
  meta,
  actions,
  filters,
  children,
  footer,
  className,
  contentClassName,
  safeAreaTop = false,
  safeAreaBottom = false,
}) => {
  const hasHeader = Boolean(title || subtitle || meta || actions);

  return (
    <S.MobilePageRoot className={className}>
      {safeAreaTop && <SafeArea position="top" />}

      {hasHeader && (
        <S.MobilePageHero>
          <S.MobilePageTitleRow>
            <S.MobilePageHeading>
              {title && <S.MobilePageTitle>{title}</S.MobilePageTitle>}
              {subtitle && <S.MobilePageSubtitle>{subtitle}</S.MobilePageSubtitle>}
            </S.MobilePageHeading>
            {actions}
          </S.MobilePageTitleRow>
          {meta && <S.MobilePageMeta>{meta}</S.MobilePageMeta>}
        </S.MobilePageHero>
      )}

      {filters && <S.MobilePageFilters>{filters}</S.MobilePageFilters>}

      <S.MobilePageContent className={contentClassName}>{children}</S.MobilePageContent>

      {footer}
      {safeAreaBottom && !footer && <SafeArea position="bottom" />}
    </S.MobilePageRoot>
  );
};
