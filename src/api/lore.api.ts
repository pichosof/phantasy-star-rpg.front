import { http } from './http.api';

export interface Lore {
  id: number;
  title: string;
  category?: string | null;
  content?: string | null;
  visible?: boolean;
}

export async function listLores(): Promise<Lore[]> {
  const { data } = await http.get('/api/lores');
  // alguns backends retornam {props}; normaliza
  const unwrap = (x: any) => (x && typeof x === 'object' && 'props' in x ? x.props : x);
  return (data as any[]).map(unwrap);
}

export async function linkLoreToCity(loreId: number, cityId: number): Promise<void> {
  await http.post(`/api/lores/${loreId}/cities/${cityId}`);
}

export async function unlinkLoreFromCity(loreId: number, cityId: number): Promise<void> {
  await http.delete(`/api/lores/${loreId}/cities/${cityId}`);
}
