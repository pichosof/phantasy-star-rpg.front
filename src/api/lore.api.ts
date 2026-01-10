// @app/api/lore.api.ts
import { http } from './http.api';

export type LoreCategory = 'history' | 'culture' | 'tech' | 'biology' | 'myth';

export interface Lore {
  id: number;
  title: string;
  category?: LoreCategory | null;
  content?: string | null;
  visible?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

const unwrap = (x: any) => (x && typeof x === 'object' && 'props' in x ? x.props : x);

export async function listLores(): Promise<Lore[]> {
  const { data } = await http.get('/api/lores');
  // alguns backends retornam {props}; normaliza
  const unwrap = (x: any) => (x && typeof x === 'object' && 'props' in x ? x.props : x);
  return (data as any[]).map(unwrap);
}

export async function createLore(input: {
  title: string;
  category?: LoreCategory | null;
  content?: string | null;
}): Promise<Lore> {
  const { data } = await http.post('/api/lores', input);
  return unwrap(data) as Lore;
}

export async function updateLore(
  id: number,
  input: {
    title?: string;
    category?: LoreCategory | null;
    content?: string | null;
  },
): Promise<void> {
  await http.patch(`/api/lores/${id}`, input);
}

export async function deleteLore(id: number): Promise<void> {
  await http.delete(`/api/lores/${id}`);
}

export async function setLoreVisibility(id: number, visible: boolean): Promise<void> {
  await http.patch(`/api/lores/${id}/visibility`, { visible });
}

export async function linkLoreToCity(loreId: number, cityId: number): Promise<void> {
  await http.post(`/api/lores/${loreId}/cities/${cityId}`);
}

export async function unlinkLoreFromCity(loreId: number, cityId: number): Promise<void> {
  await http.delete(`/api/lores/${loreId}/cities/${cityId}`);
}
