import React, { useMemo } from 'react';
import { Popup } from 'antd-mobile';
import { useResponsive } from 'hooks/useResponsive';
import * as S from './MainSider.styles';
import { SiderLogo } from '../SiderLogo';
import SiderMenu from '../SiderMenu/SiderMenu';
import { MobileSiderMenu } from '../MobileSiderMenu/MobileSiderMenu';

interface MainSiderProps {
  isCollapsed: boolean;
  setCollapsed: (isCollapsed: boolean) => void;
}

const MainSider: React.FC<MainSiderProps> = ({ isCollapsed, setCollapsed, ...props }) => {
  const { isDesktop, mobileOnly, tabletOnly } = useResponsive();

  const isCollapsible = useMemo(() => tabletOnly, [tabletOnly]);

  const toggleSider = () => setCollapsed(!isCollapsed);

  if (mobileOnly) {
    return (
      <Popup
        visible={!isCollapsed}
        position="right"
        onClose={() => setCollapsed(true)}
        onMaskClick={() => setCollapsed(true)}
        destroyOnClose
        bodyStyle={{ background: 'transparent' }}
      >
        <MobileSiderMenu onClose={() => setCollapsed(true)} />
      </Popup>
    );
  }

  return (
    <S.Sider
      trigger={null}
      collapsed={!isDesktop && isCollapsed}
      collapsedWidth={tabletOnly ? 80 : 0}
      collapsible={isCollapsible}
      width={260}
      {...props}
    >
      <SiderLogo isSiderCollapsed={isCollapsed} toggleSider={toggleSider} />
      <S.SiderContent>
        <SiderMenu setCollapsed={setCollapsed} />
      </S.SiderContent>
    </S.Sider>
  );
};

export default MainSider;
