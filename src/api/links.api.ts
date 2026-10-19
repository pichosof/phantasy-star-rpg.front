import { http } from './http.api';

export type LinkEntityType =
  | 'city'
  | 'npc'
  | 'player'
  | 'dungeon'
  | 'world'
  | 'quest'
  | 'session'
  | 'lore'
  | 'wiki'
  | 'beast'
  | 'timeline'
  | 'gmNote';

export interface LinkIndexEntry {
  type: LinkEntityType;
  id: number;
  name: string;
  subtitle?: string | null;
}

export interface LinkMention {
  type: LinkEntityType;
  id: number;
  name: string;
  date?: string | null;
  explicit: boolean;
  snippet: string;
}

export interface EntityLinks {
  entity: {
    type: LinkEntityType;
    id: number;
    name: string;
    subtitle?: string | null;
    imageUrl?: string | null;
    text: string;
    date?: string | null;
    readable: boolean;
  };
  appearsIn: LinkMention[];
  history: { timeline: LinkMention[]; sessions: LinkMention[] };
}

export const ENTITY_TYPE_LABEL: Record<LinkEntityType, string> = {
  city: 'City',
  npc: 'NPC',
  player: 'Player',
  dungeon: 'Dungeon',
  world: 'World',
  quest: 'Quest',
  session: 'Session',
  lore: 'Lore',
  wiki: 'Wiki',
  beast: 'Creature',
  timeline: 'Timeline',
  gmNote: 'GM note',
};

export async function getLinkIndex(): Promise<LinkIndexEntry[]> {
  return (await http.get<LinkIndexEntry[]>('/api/links/index')).data;
}

export async function getEntityLinks(type: LinkEntityType, id: number): Promise<EntityLinks> {
  return (await http.get<EntityLinks>(`/api/links/${type}/${id}`)).data;
}

// ── Session diary (GM) ──

export async function getAiStatus(): Promise<{ enabled: boolean }> {
  return (await http.get('/api/gm/ai/status')).data;
}

export async function getSessionDiary(sessionId: number): Promise<{ notes: string; updatedAt: string | null }> {
  return (await http.get(`/api/gm/sessions/${sessionId}/diary`)).data;
}

export async function saveSessionDiary(sessionId: number, notes: string): Promise<void> {
  await http.put(`/api/gm/sessions/${sessionId}/diary`, { notes });
}

export async function summarizeSessionDiary(sessionId: number, notes: string): Promise<{ markdown: string }> {
  return (await http.post(`/api/gm/sessions/${sessionId}/diary/summarize`, { notes }, { timeout: 90_000 })).data;
}
