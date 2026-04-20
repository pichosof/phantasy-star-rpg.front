// src/api/quests.api.ts
import { http } from './http.api';

export type QuestStatus = 'active' | 'completed' | 'failed';

export interface Quest {
  id: number;
  title: string;
  status?: QuestStatus;
  description?: string | null;
  reward?: string | null;
  visible?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CreateQuestInput {
  title: string;
  status?: QuestStatus;
  description?: string | null;
  reward?: string | null;
}

export interface UpdateQuestInput {
  title?: string;
  status?: QuestStatus;
  description?: string | null;
  reward?: string | null;
}

const unwrap = (x: any) => (x && typeof x === 'object' && 'props' in x ? x.props : x);

/**
 * Players (se você quiser usar em algum lugar)
 * Sugestão: backend devolver só visible=true (e talvez filtrar por city via outro endpoint)
 */
export async function listQuestsPublic(): Promise<Quest[]> {
  const { data } = await http.get('/api/quests');
  return (data as any[]).map(unwrap);
}

/**
 * GM Admin
 */
export async function listQuestsAdmin(): Promise<Quest[]> {
  const { data } = await http.get('/api/quests');
  return (data as any[]).map(unwrap);
}

export async function createQuest(input: CreateQuestInput): Promise<Quest> {
  const { data } = await http.post('/api/quests', input);
  return unwrap(data) as Quest;
}

export async function updateQuest(id: number, input: UpdateQuestInput): Promise<void> {
  await http.patch(`/api/quests/${id}`, input);
}

export async function deleteQuest(id: number): Promise<void> {
  await http.delete(`/api/quests/${id}`);
}

export async function setQuestVisibility(id: number, visible: boolean): Promise<void> {
  await http.patch(`/api/quests/${id}/visibility`, { visible });
}

export async function listQuests(): Promise<Quest[]> {
  const { data } = await http.get('/api/quests');
  const unwrap = (x: any) => (x && typeof x === 'object' && 'props' in x ? x.props : x);
  return (data as any[]).map(unwrap);
}

export interface QuestCity {
  id: number;
  name: string;
  region?: string | null;
  description?: string | null;
  discovered?: boolean | null;
  visible?: boolean | null;
}

export async function listQuestCities(questId: number): Promise<QuestCity[]> {
  const { data } = await http.get(`/api/quests/${questId}/cities`);
  return data as QuestCity[];
}

export async function linkQuestToCity(questId: number, cityId: number): Promise<void> {
  await http.post(`/api/quests/${questId}/cities/${cityId}`);
}

export async function unlinkQuestFromCity(questId: number, cityId: number): Promise<void> {
  await http.delete(`/api/quests/${questId}/cities/${cityId}`);
}
