/* eslint-disable @typescript-eslint/no-explicit-any */
// @app/api/cityLinks.api.ts
import { http } from '@app/api/http.api';
import type { Lore } from '@app/api/lore.api';
import type { Quest } from '@app/api/quests.api';

const unwrap = (x: any) => (x && typeof x === 'object' && 'props' in x ? x.props : x);

export async function listLoresByCityId(cityId: number, opts?: { gm?: boolean }): Promise<Lore[]> {
  const url = opts?.gm ? `/api/gm/cities/${cityId}/lores` : `/api/cities/${cityId}/lores`;
  const { data } = await http.get(url);
  return (data as any[]).map(unwrap);
}

export async function listQuestsByCityId(cityId: number, opts?: { gm?: boolean }): Promise<Quest[]> {
  const url = opts?.gm ? `/api/gm/cities/${cityId}/quests` : `/api/cities/${cityId}/quests`;
  const { data } = await http.get(url);
  return (data as any[]).map(unwrap);
}
