// @app/api/cityLinks.api.ts
import { http } from '@app/api/http.api';
import type { Lore } from '@app/api/lore.api';
import type { Quest } from '@app/api/quests.api';

const unwrap = (x: any) => (x && typeof x === 'object' && 'props' in x ? x.props : x);

export async function listLoresByCityId(cityId: number): Promise<Lore[]> {
  const { data } = await http.get(`/api/cities/${cityId}/lores`);
  return (data as any[]).map(unwrap);
}

export async function listQuestsByCityId(cityId: number): Promise<Quest[]> {
  const { data } = await http.get(`/api/cities/${cityId}/quests`);
  return (data as any[]).map(unwrap);
}
