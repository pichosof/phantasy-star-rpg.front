import type { Damage } from '@app/items/classify';
import { http } from './http.api';

export type ItemAccess = 'free' | 'order' | 'spot' | 'institutional' | 'relic' | 'none';
export type ItemStatus = 'proposal' | 'approved' | 'published';
export type ItemVisibility = 'public' | 'gm';
export type ItemOrigin = 'starfinder' | 'algol' | 'homebrew';
export type ItemRegion = 'motavia' | 'dezolis' | 'kolian';
export type LootSite = 'seed' | 'orbital' | 'cave' | 'cellar';

/** What players get from /api/items (the API whitelists these fields). */
export interface PlayerItem {
  id: number;
  code: string;
  name: string;
  originalName: string | null;
  origin: ItemOrigin;
  kind: string;
  /** Computed by the API (kind → type). */
  type: string;
  damageType: Damage | null;
  group: string | null;
  category: string | null;
  level: number;
  damage: string | null;
  unit: string | null;
  region: ItemRegion;
  description: string | null;
  rules: string | null;
  sourceUrl: string | null;
  localPrice: number | null;
  availability: string | null;
  availabilityNote: string | null;
}

/** Full item (GM). The list omits `audit`; open one item to get it. */
export interface GmItem {
  id: number;
  code: string;
  name: string;
  localName: string | null;
  origin: ItemOrigin;
  kind: string;
  group: string | null;
  category: string | null;
  level: number;
  damage: string | null;
  unit: string | null;
  region: ItemRegion;
  description: string | null;
  rules: string | null;
  sourceUrl: string | null;
  localPrice: number | null;
  availabilityNote: string | null;
  refPrice: number | null;
  access: ItemAccess;
  channel: string | null;
  tags: string[];
  shops: string[];
  loot: LootSite[];
  policies: string | null;
  flags: string | null;
  gmNotes: string | null;
  audit?: Record<string, string> | null;
  visibility: ItemVisibility;
  status: ItemStatus;
  /** Computed by the API (read-only). */
  type: string;
  damageType: Damage | null;
  createdAt?: string;
  updatedAt?: string;
}

export type GmItemInput = Omit<GmItem, 'id' | 'createdAt' | 'updatedAt' | 'type' | 'damageType'>;

export const ACCESS_LABEL: Record<ItemAccess, string> = {
  free: 'Common trade',
  order: 'Made to order',
  spot: 'Occasional (grey market)',
  institutional: 'Institutional only',
  relic: 'Relic / find',
  none: 'Not available',
};
export const STATUS_LABEL: Record<ItemStatus, string> = {
  proposal: 'Proposal',
  approved: 'Approved',
  published: 'Published',
};
export const LOOT_LABEL: Record<LootSite, string> = {
  seed: 'Wonder-age facility (SEED)',
  orbital: 'Forgotten orbital satellite',
  cave: 'Cave',
  cellar: 'Old city cellar',
};

export const listItems = async (): Promise<PlayerItem[]> => (await http.get('/api/items')).data;
export const getItem = async (id: number): Promise<PlayerItem> => (await http.get(`/api/items/${id}`)).data;

let gmCache: Promise<GmItem[]> | null = null;
/** GM catalogue, cached for the generators; editing an item clears the cache. */
export const listGmItems = (fresh = false): Promise<GmItem[]> => {
  if (fresh || !gmCache) gmCache = http.get<GmItem[]>('/api/gm/items').then((r) => r.data);
  gmCache.catch(() => (gmCache = null));
  return gmCache;
};
const invalidate = () => (gmCache = null);

export const getGmItem = async (id: number): Promise<GmItem> => (await http.get(`/api/gm/items/${id}`)).data;
export async function createItem(body: Partial<GmItemInput>): Promise<GmItem> {
  invalidate();
  return (await http.post('/api/gm/items', body)).data;
}
export async function updateItem(id: number, body: Partial<GmItemInput>): Promise<GmItem> {
  invalidate();
  return (await http.patch(`/api/gm/items/${id}`, body)).data;
}
export async function deleteItem(id: number): Promise<void> {
  invalidate();
  await http.delete(`/api/gm/items/${id}`);
}
