import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { MenuProps } from 'antd';
import * as S from './SiderMenu.styles';
import { getSidebarNavigation, SidebarNavigationItem } from '../sidebarNavigation';
import { useGMMode } from '@app/hooks/useGMMode';

interface SiderContentProps {
  setCollapsed: (isCollapsed: boolean) => void;
}

const SiderMenu: React.FC<SiderContentProps> = ({ setCollapsed }) => {
  const isGM = useGMMode();
  const location = useLocation();
  const sidebarNavigation = React.useMemo(() => getSidebarNavigation(isGM), [isGM]);
  const sidebarNavFlat = React.useMemo(
    () =>
      sidebarNavigation.reduce(
        (result: SidebarNavigationItem[], current) =>
          result.concat(current.children && current.children.length > 0 ? current.children : current),
        [],
      ),
    [sidebarNavigation],
  );

  const currentMenuItem = sidebarNavFlat.find(({ url }) => url === location.pathname);
  const selectedKeys = currentMenuItem ? [currentMenuItem.key] : [];

  const openedSubmenu = sidebarNavigation.find(({ children }) =>
    children?.some(({ url }) => url === location.pathname),
  );
  const derivedOpenKeys = React.useMemo(() => (openedSubmenu ? [openedSubmenu.key] : []), [openedSubmenu]);
  const openKeysSignature = derivedOpenKeys.join('|');
  const [openKeys, setOpenKeys] = React.useState<string[]>(derivedOpenKeys);

  React.useEffect(() => {
    setOpenKeys(derivedOpenKeys);
  }, [derivedOpenKeys, openKeysSignature]);

  const menuItems: MenuProps['items'] = sidebarNavigation.map((nav) =>
    nav.children && nav.children.length > 0
      ? {
          key: nav.key,
          label: nav.title,
          icon: nav.icon,
          popupClassName: 'd-none',
          children: nav.children.map((childNav) => ({
            key: childNav.key,
            icon: childNav.icon,
            label: <Link to={childNav.url || ''}>{childNav.title}</Link>,
            title: '',
          })),
        }
      : {
          key: nav.key,
          icon: nav.icon,
          label: <Link to={nav.url || ''}>{nav.title}</Link>,
          title: '',
        },
  );

  return (
    <S.Menu
      mode="inline"
      selectedKeys={selectedKeys}
      openKeys={openKeys}
      onClick={() => setCollapsed(true)}
      items={menuItems}
      onOpenChange={(openKeys) => {
        setOpenKeys(openKeys as string[]);
        if (openKeys.length > 0) {
          setCollapsed(false);
        }
      }}
    />
  );
};

export default SiderMenu;
