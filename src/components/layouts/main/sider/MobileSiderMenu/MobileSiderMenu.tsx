import React from 'react';
import { List, SafeArea, SideBar } from 'antd-mobile';
import { CloseOutline, LeftOutline } from 'antd-mobile-icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGMMode } from '@app/hooks/useGMMode';
import { useAppSelector } from '@app/hooks/reduxHooks';
import logoMarkDark from '@app/assets/logo-mark-dark.png';
import logoMarkLight from '@app/assets/logo-mark-light.png';
import { getSidebarNavigation, SidebarNavigationItem } from '../sidebarNavigation';
import * as S from './MobileSiderMenu.styles';

interface MobileSiderMenuProps {
  onClose: () => void;
}

const getSectionForPath = (items: SidebarNavigationItem[], pathname: string): SidebarNavigationItem | undefined =>
  items.find(({ children, url }) => url === pathname || children?.some((child) => child.url === pathname));

const getThemeLabel = (theme: 'light' | 'dark') => (theme === 'dark' ? 'Dezolis' : 'Motavia');

export const MobileSiderMenu: React.FC<MobileSiderMenuProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useAppSelector((state) => state.theme.theme);
  const isGM = useGMMode();
  const sidebarNavigation = React.useMemo(() => getSidebarNavigation(isGM), [isGM]);
  const activeSectionFromPath = React.useMemo(
    () => getSectionForPath(sidebarNavigation, location.pathname),
    [location.pathname, sidebarNavigation],
  );
  const [activeSectionKey, setActiveSectionKey] = React.useState<string | null>(activeSectionFromPath?.key ?? null);

  React.useEffect(() => {
    const nextKey = activeSectionFromPath?.key ?? (sidebarNavigation.length > 0 ? sidebarNavigation[0].key : null);

    setActiveSectionKey((currentKey) =>
      currentKey && sidebarNavigation.some((item) => item.key === currentKey) ? currentKey : nextKey,
    );
  }, [activeSectionFromPath?.key, sidebarNavigation]);

  const activeSection =
    sidebarNavigation.find((item) => item.key === activeSectionKey) ?? activeSectionFromPath ?? sidebarNavigation[0];

  const markSrc = theme === 'dark' ? logoMarkDark : logoMarkLight;

  const handleNavigate = (url?: string) => {
    if (!url) return;
    onClose();
    navigate(url);
  };

  return (
    <S.MenuSheet>
      <SafeArea position="top" />
      <S.MenuHeader>
        <S.BrandLink to="/" onClick={onClose}>
          <S.LogoMark src={markSrc} alt="RPG Companion" />
          <S.BrandCopy>
            <S.BrandEyebrow>Algol System</S.BrandEyebrow>
            <S.BrandTitle>RPG Companion</S.BrandTitle>
            <S.BrandSubtitle>{getThemeLabel(theme)}</S.BrandSubtitle>
          </S.BrandCopy>
        </S.BrandLink>

        <S.SheetCloseButton fill="none" onClick={onClose}>
          <CloseOutline />
        </S.SheetCloseButton>
      </S.MenuHeader>

      <S.MenuBody>
        <S.MenuPanel>
          <S.SectionMeta>
            <S.SectionEyebrow>Navigation</S.SectionEyebrow>
            <S.SectionTitle>{activeSection?.title ?? 'Explore'}</S.SectionTitle>
            <S.SectionHint>
              {isGM ? 'GM shortcuts and player routes are available.' : 'Player routes optimized for mobile access.'}
            </S.SectionHint>
          </S.SectionMeta>

          <S.SectionList mode="card">
            {activeSection?.children?.map((item) => (
              <List.Item
                key={item.key}
                prefix={item.icon}
                clickable
                arrowIcon={<S.ItemArrow as={LeftOutline} />}
                onClick={() => handleNavigate(item.url)}
                description={
                  <S.ItemSubtitle>{item.url === location.pathname ? 'Current page' : 'Open page'}</S.ItemSubtitle>
                }
              >
                <S.ItemTitle>{item.title}</S.ItemTitle>
              </List.Item>
            ))}
          </S.SectionList>
        </S.MenuPanel>

        <S.MobileSideBar activeKey={activeSection?.key ?? null} onChange={setActiveSectionKey}>
          {sidebarNavigation.map((section) => (
            <SideBar.Item
              key={section.key}
              title={
                <S.SideBarTitle>
                  {section.icon}
                  <span>{section.title}</span>
                </S.SideBarTitle>
              }
            />
          ))}
        </S.MobileSideBar>
      </S.MenuBody>

      <SafeArea position="bottom" />
    </S.MenuSheet>
  );
};
