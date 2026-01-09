import { http } from './http.api';

export interface Quest {
  id: number;
  title: string;
  status?: 'active' | 'completed' | 'failed';
  description?: string | null;
  reward?: string | null;
  visible?: boolean;
}

export async function listQuests(): Promise<Quest[]> {
  const { data } = await http.get('/api/quests');
  const unwrap = (x: any) => (x && typeof x === 'object' && 'props' in x ? x.props : x);
  return (data as any[]).map(unwrap);
}

export async function linkQuestToCity(questId: number, cityId: number): Promise<void> {
  await http.post(`/api/quests/${questId}/cities/${cityId}`);
}

export async function unlinkQuestFromCity(questId: number, cityId: number): Promise<void> {
  await http.delete(`/api/quests/${questId}/cities/${cityId}`);
}
