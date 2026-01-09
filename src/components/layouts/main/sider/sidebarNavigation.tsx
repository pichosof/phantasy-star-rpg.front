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
} from '@ant-design/icons';
import { ROUTES } from '@app/constants/routes';

export interface SidebarNavigationItem {
  title: string;
  key: string;
  url?: string;
  children?: SidebarNavigationItem[];
  icon?: React.ReactNode;
}

export const sidebarNavigation: SidebarNavigationItem[] = [
  {
    title: 'Campaign',
    key: 'campaign',
    icon: <TeamOutlined />,
    children: [
      { title: 'Players', key: 'players', url: ROUTES.PLAYERS, icon: <UserOutlined /> },
      { title: 'Cities', key: 'cities', url: ROUTES.CITIES, icon: <EnvironmentOutlined /> },
      { title: 'Quests', key: 'quests', url: ROUTES.QUESTS, icon: <FlagOutlined /> },
      { title: 'Sessions', key: 'sessions', url: ROUTES.SESSIONS, icon: <CalendarOutlined /> },
      { title: 'Timeline', key: 'timeline', url: ROUTES.TIMELINE, icon: <ProfileOutlined /> },
    ],
  },
  {
    title: 'World',
    key: 'world',
    icon: <GlobalOutlined />,
    children: [
      { title: 'Worlds', key: 'worlds', url: ROUTES.WORLDS },
      { title: 'Lores', key: 'lores', url: ROUTES.LORES, icon: <BookOutlined /> },
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
];
