import React from 'react';
import {
  BookOutlined,
  BugOutlined,
  CalendarOutlined,
  CloseOutlined,
  EditOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  FlagOutlined,
  GiftOutlined,
  GlobalOutlined,
  IdcardOutlined,
  PictureOutlined,
  PlusOutlined,
  ReadOutlined,
  SettingOutlined,
  StarOutlined,
  TagOutlined,
  ThunderboltOutlined,
  UserOutlined,
  EyeOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import {
  AddOutline,
  CalculatorOutline,
  CalendarOutline,
  CloseOutline,
  CompassOutline,
  ContentOutline,
  EditSOutline,
  EnvironmentOutline,
  ExclamationCircleOutline,
  FileOutline,
  FireFill,
  FlagOutline,
  GiftOutline,
  GlobalOutline,
  PictureOutline,
  SetOutline,
  StarOutline,
  TagOutline,
  UserContactOutline,
  UserOutline,
  EyeOutline,
  TextOutline,
} from 'antd-mobile-icons';
import { useResponsive } from '@app/hooks/useResponsive';
import * as S from './AppIcon.styles';

export type AppIconName =
  | 'add'
  | 'alert'
  | 'beast'
  | 'calendar'
  | 'close'
  | 'controls'
  | 'dice'
  | 'dungeon'
  | 'edit'
  | 'gm'
  | 'image'
  | 'location'
  | 'lore'
  | 'notes'
  | 'npc'
  | 'player'
  | 'quest'
  | 'read'
  | 'reward'
  | 'settings'
  | 'sheet'
  | 'star'
  | 'tags'
  | 'timeline'
  | 'view'
  | 'world';

type IconComponent = React.ComponentType<Record<string, unknown>>;

const desktopIcons: Record<AppIconName, IconComponent> = {
  add: PlusOutlined,
  alert: ExclamationCircleOutlined,
  beast: BugOutlined,
  calendar: CalendarOutlined,
  close: CloseOutlined,
  controls: SettingOutlined,
  dice: ExperimentOutlined,
  dungeon: ThunderboltOutlined,
  edit: EditOutlined,
  gm: SettingOutlined,
  image: PictureOutlined,
  location: EnvironmentOutlined,
  lore: BookOutlined,
  notes: FileTextOutlined,
  npc: UserOutlined,
  player: UserOutlined,
  quest: FlagOutlined,
  read: ReadOutlined,
  reward: GiftOutlined,
  settings: SettingOutlined,
  sheet: IdcardOutlined,
  star: StarOutlined,
  tags: TagOutlined,
  timeline: CalendarOutlined,
  view: EyeOutlined,
  world: GlobalOutlined,
};

const mobileIcons: Record<AppIconName, IconComponent> = {
  add: AddOutline,
  alert: ExclamationCircleOutline,
  beast: FireFill,
  calendar: CalendarOutline,
  close: CloseOutline,
  controls: SetOutline,
  dice: CalculatorOutline,
  dungeon: CompassOutline,
  edit: EditSOutline,
  gm: SetOutline,
  image: PictureOutline,
  location: EnvironmentOutline,
  lore: ContentOutline,
  notes: TextOutline,
  npc: UserContactOutline,
  player: UserOutline,
  quest: FlagOutline,
  read: FileOutline,
  reward: GiftOutline,
  settings: SetOutline,
  sheet: UserContactOutline,
  star: StarOutline,
  tags: TagOutline,
  timeline: CalendarOutline,
  view: EyeOutline,
  world: GlobalOutline,
};

export interface AppIconProps {
  className?: string;
  name: AppIconName;
  size?: number | string;
}

export const AppIcon: React.FC<AppIconProps> = ({ className, name, size }) => {
  const { mobileOnly } = useResponsive();
  const Icon = mobileOnly ? mobileIcons[name] : desktopIcons[name];

  return (
    <S.IconSlot $size={size} className={className} aria-hidden="true">
      <Icon />
    </S.IconSlot>
  );
};

export interface IconLabelProps {
  children: React.ReactNode;
  className?: string;
  gap?: number | string;
  icon: AppIconName;
  iconSize?: number | string;
}

export const IconLabel: React.FC<IconLabelProps> = ({ children, className, gap = 8, icon, iconSize }) => {
  return (
    <S.IconLabelRoot className={className} $gap={gap}>
      <AppIcon name={icon} size={iconSize} />
      <span>{children}</span>
    </S.IconLabelRoot>
  );
};
