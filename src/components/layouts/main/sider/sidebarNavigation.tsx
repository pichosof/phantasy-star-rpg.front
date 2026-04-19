// src/components/layouts/main/sider/sidebarNavigation.tsx
import React from 'react';
import {
  UserOutlined,
  EnvironmentOutlined,
  FlagOutlined,
  GlobalOutlined,
  BookOutlined,
  TeamOutlined,
  BugOutlined,
  AimOutlined,
  CalendarOutlined,
  ProfileOutlined,
  ReadOutlined,
  ExperimentOutlined,
  LockOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  PictureOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import { ROUTES } from '@app/constants/routes';

export interface SidebarNavigationItem {
  title: string;
  key: string;
  url?: string;
  children?: SidebarNavigationItem[];
  icon?: React.ReactNode;
}

const GM_KEY_STORAGE = 'gm_api_key';

function isGMMode() {
  // SSR safe (se um dia você renderizar fora do browser)
  if (typeof window === 'undefined') return false;
  return Boolean(window.localStorage.getItem(GM_KEY_STORAGE));
}

export const sidebarNavigation: SidebarNavigationItem[] = (() => {
  const isGM = isGMMode();

  // ✅ Base (PC / Players)
  const nav: SidebarNavigationItem[] = [
    {
      title: 'Campaign',
      key: 'campaign',
      icon: <TeamOutlined />,
      children: [
        { title: 'Players', key: 'players', url: ROUTES.PLAYERS, icon: <UserOutlined /> },
        { title: 'Cities', key: 'cities', url: ROUTES.CITIES, icon: <EnvironmentOutlined /> },
        // PC não precisa ver rota de criação/gestão de quest
        // Ele verá quests via vínculos (ex: City Drawer / Player views)
        { title: 'Sessions', key: 'sessions', url: ROUTES.SESSIONS, icon: <CalendarOutlined /> },
        { title: 'Timeline', key: 'timeline', url: ROUTES.TIMELINE, icon: <ProfileOutlined /> },
        { title: 'Wiki', key: 'wiki', url: ROUTES.WIKI, icon: <ReadOutlined /> },
      ],
    },
    {
      title: 'World',
      key: 'world',
      icon: <GlobalOutlined />,
      children: [
        { title: 'Worlds', key: 'worlds', url: ROUTES.WORLDS },
        // PC não precisa ver Lore Admin; verá lore via vínculos (World/Cities/NewsFeed)
        { title: 'Map Markers', key: 'map-markers', url: ROUTES.MAP_MARKERS, icon: <AimOutlined /> },
      ],
    },
    {
      title: 'Bestiary',
      key: 'bestiary',
      icon: <BugOutlined />,
      children: [
        { title: 'NPCs', key: 'npcs', url: ROUTES.NPCS },
        { title: 'Monsters', key: 'monsters', url: ROUTES.MONSTERS },
      ],
    },
    {
      title: 'Tools',
      key: 'tools',
      icon: <ExperimentOutlined />,
      children: [
        { title: 'Dice Roller', key: 'dice', url: ROUTES.DICE, icon: <ExperimentOutlined /> },
        { title: 'Library', key: 'library', url: ROUTES.LIBRARY, icon: <FolderOpenOutlined /> },
      ],
    },
  ];

  // ✅ GM extras (aparecem somente com GM mode ligado)
  if (isGM) {
    // Campaign -> GM tools
    const campaign = nav.find((x) => x.key === 'campaign');
    campaign?.children?.push(
      { title: 'Quests (GM)', key: 'quests-gm', url: ROUTES.QUESTS, icon: <FlagOutlined /> },
      // se você tiver rota separada de cities admin, coloca aqui também
      // { title: 'Cities (GM)', key: 'cities-gm', url: ROUTES.CITIES_ADMIN, icon: <EnvironmentOutlined /> },
    );

    // World -> GM tools
    const world = nav.find((x) => x.key === 'world');
    world?.children?.push(
      { title: 'Lores (GM)', key: 'lores-gm', url: ROUTES.LORES, icon: <BookOutlined /> },
      // se tiver rota separada:
      // { title: 'Lores (GM)', key: 'lores-gm', url: ROUTES.LORES_GM, icon: <BookOutlined /> },
    );
  }

  if (isGM) {
    nav.push({
      title: 'GM Area',
      key: 'gm-area',
      icon: <LockOutlined />,
      children: [
        { title: 'Notes', key: 'gm-notes', url: ROUTES.GM_NOTES, icon: <FileTextOutlined /> },
        { title: 'Images', key: 'gm-images', url: ROUTES.GM_IMAGES, icon: <PictureOutlined /> },
        { title: 'Sheets', key: 'gm-sheets', url: ROUTES.GM_SHEETS, icon: <IdcardOutlined /> },
      ],
    });
  }

  return nav;
})();
