import React from 'react';
import * as S from './MainSider/MainSider.styles';
import { RightOutlined } from '@ant-design/icons';
import { useResponsive } from '@app/hooks/useResponsive';
import { useActiveTheme } from '@app/hooks/useActiveTheme';

interface SiderLogoProps {
  isSiderCollapsed: boolean;
  toggleSider: () => void;
}

export const SiderLogo: React.FC<SiderLogoProps> = ({ isSiderCollapsed, toggleSider }) => {
  const { tabletOnly } = useResponsive();
  const activeTheme = useActiveTheme();

  const markSrc = activeTheme.logoMark;
  const themeName = activeTheme.name.toUpperCase();
  const isCollapsed = tabletOnly && isSiderCollapsed;

  return (
    <S.SiderLogoDiv $isCollapsed={isCollapsed}>
      <S.SiderLogoLink to="/">
        <S.LogoMark src={markSrc} alt="RPG Companion" />
        {!isCollapsed && (
          <S.BrandBlock>
            <S.BrandName>
              RPG <S.BrandAccent>Companion</S.BrandAccent>
            </S.BrandName>
            <S.BrandSub>· {themeName} ·</S.BrandSub>
          </S.BrandBlock>
        )}
      </S.SiderLogoLink>

      {tabletOnly && (
        <S.CollapseButton
          shape="circle"
          size="small"
          $isCollapsed={isSiderCollapsed}
          icon={<RightOutlined rotate={isSiderCollapsed ? 0 : 180} />}
          onClick={toggleSider}
        />
      )}
    </S.SiderLogoDiv>
  );
};
