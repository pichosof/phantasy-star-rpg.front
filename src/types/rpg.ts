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

export type City = WithVisibility & {
  id: ID;
  name: string;
  description?: string | null;
  discovered: boolean;
  worldId?: number | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CityForAdmin = {
  id: number;
  name: string;
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

export type CreateMonsterDTO = {
  name: string;
  type?: string | null;
  habitat?: string | null;
  weaknesses?: string | null;
  description?: string | null;
};
