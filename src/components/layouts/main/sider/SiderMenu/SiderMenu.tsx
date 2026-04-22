import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { MenuProps } from 'antd';
import * as S from './SiderMenu.styles';
import { sidebarNavigation, SidebarNavigationItem } from '../sidebarNavigation';

interface SiderContentProps {
  setCollapsed: (isCollapsed: boolean) => void;
}

const sidebarNavFlat = sidebarNavigation.reduce(
  (result: SidebarNavigationItem[], current) =>
    result.concat(current.children && current.children.length > 0 ? current.children : current),
  [],
);

const SiderMenu: React.FC<SiderContentProps> = ({ setCollapsed }) => {
  const location = useLocation();

  const currentMenuItem = sidebarNavFlat.find(({ url }) => url === location.pathname);
  const defaultSelectedKeys = currentMenuItem ? [currentMenuItem.key] : [];

  const openedSubmenu = sidebarNavigation.find(({ children }) =>
    children?.some(({ url }) => url === location.pathname),
  );
  const defaultOpenKeys = openedSubmenu ? [openedSubmenu.key] : [];
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
      defaultSelectedKeys={defaultSelectedKeys}
      defaultOpenKeys={defaultOpenKeys}
      onClick={() => setCollapsed(true)}
      items={menuItems}
      onOpenChange={(openKeys) => {
        if (openKeys.length > 0) {
          setCollapsed(false);
        }
      }}
    />
  );
};

export default SiderMenu;
