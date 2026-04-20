export type ID = number;

export type WithVisibility = { visible?: boolean };

export type Player = WithVisibility & {
  id: ID;
  name: string;
  level: number;
  background?: string | null;
  imageAlt?: string | null;
  imageUrl?: string | null;
  sheetUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreatePlayerDTO = {
  name: string;
  level?: number;
  background?: string | null;
};

export type CityImage = {
  id: number;
  cityId: number;
  url: string;
  alt: string | null;
  mime: string;
  size: number;
  position: number;
  createdAt: string;
};

export type City = WithVisibility & {
  id: ID;
  name: string;
  description?: string | null;
  discovered: boolean;
  worldId?: number | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  images?: CityImage[];
  createdAt: string;
  updatedAt: string;
};

export type CityForAdmin = {
  id: number;
  name: string;
  description?: string | null;
  region?: string | null;
  visible?: boolean;
  discovered?: boolean;
  worldId?: number | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
};

export type CreateCityDTO = {
  name: string;
  description?: string | null;
};

export type Quest = WithVisibility & {
  id: ID;
  title: string;
  description?: string | null;
  reward?: string | null;
  status: 'active' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
};

export type CreateQuestDTO = {
  title: string;
  description?: string | null;
  reward?: string | null;
};

export type Monster = WithVisibility & {
  id: ID;
  name: string;
  type?: string | null;
  habitat?: string | null;
  weaknesses?: string | null;
  description?: string | null;
  discovered: boolean;
  imageUrl?: string | null;
  imageAlt?: string | null;
  createdAt: string;
};

export type MonsterForAdmin = {
  id: ID;
  name: string;
  type?: string | null;
  habitat?: string | null;
  weaknesses?: string | null;
  description?: string | null;
  visible?: boolean;
  discovered?: boolean;
  imageUrl?: string | null;
  imageAlt?: string | null;
};

export type Npc = WithVisibility & {
  id: ID;
  name: string;
  role?: string | null;
  description?: string | null;
  location?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  sheetUrl?: string | null;
  sheetMime?: string | null;
  createdAt: string;
  updatedAt?: string;
};

export type CreateNpcDTO = {
  name: string;
  role?: string | null;
  description?: string | null;
  location?: string | null;
};

export type CreateMonsterDTO = {
  name: string;
  type?: string | null;
  habitat?: string | null;
  weaknesses?: string | null;
  description?: string | null;
};

export type DungeonImage = {
  id: number;
  dungeonId: number;
  url: string;
  alt: string | null;
  mime: string;
  size: number;
  position: number;
  createdAt: string;
};

export type Dungeon = WithVisibility & {
  id: ID;
  name: string;
  type?: string | null;
  description?: string | null;
  region?: string | null;
  coordinates?: string | null;
  discovered: boolean;
  cityId?: number | null;
  worldId?: number | null;
  images?: DungeonImage[];
  createdAt: string;
  updatedAt: string;
};

export type CreateDungeonDTO = {
  name: string;
  type?: string | null;
  description?: string | null;
  region?: string | null;
  cityId?: number | null;
  worldId?: number | null;
};

export type Tag = {
  id: ID;
  name: string;
  color: string;
  createdAt?: string;
};

export type EntityTagType = 'beast' | 'npc' | 'city' | 'dungeon' | 'world' | 'player' | 'lore' | 'quest';

export type TagEntities = {
  tag: Tag;
  beasts: Monster[];
  npcs: Npc[];
  cities: City[];
  dungeons: Dungeon[];
  worlds: any[];
  players: Player[];
  lores: any[];
  quests: any[];
};
