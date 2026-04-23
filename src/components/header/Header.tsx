import React from 'react';
import { DesktopHeader } from './layouts/DesktopHeader';
import { MobileHeader } from './layouts/MobileHeader';
import { useIsMobile } from '@app/hooks/useIsMobile';

interface HeaderProps {
  toggleSider: () => void;
  isSiderOpened: boolean;
  isTwoColumnsLayout: boolean;
}

export const Header: React.FC<HeaderProps> = ({ toggleSider, isSiderOpened, isTwoColumnsLayout }) => {
  const isMobile = useIsMobile();

  return isMobile ? (
    <MobileHeader toggleSider={toggleSider} isSiderOpened={isSiderOpened} />
  ) : (
    <DesktopHeader isTwoColumnsLayout={isTwoColumnsLayout} />
  );
};
