import { http } from './http.api';

export interface ProgressEntry {
  id: number;
  playerId: number;
  sessionId: number | null;
  /** Null for players when the session is hidden. */
  sessionTitle: string | null;
  sessionDate: string | null;
  xp: number;
  credits: number;
  note: string | null;
  createdAt: string | null;
}

export interface PlayerProgress {
  entries: ProgressEntry[];
  totals: { xp: number; credits: number };
}

export interface SessionReward {
  playerId: number;
  xp: number;
  credits: number;
  note?: string | null;
}

export async function getPlayerProgress(playerId: number): Promise<PlayerProgress> {
  return (await http.get(`/api/players/${playerId}/progress`)).data;
}

export async function getSessionRewards(sessionId: number): Promise<ProgressEntry[]> {
  return (await http.get(`/api/gm/sessions/${sessionId}/rewards`)).data;
}

export async function setSessionRewards(sessionId: number, rewards: SessionReward[]): Promise<ProgressEntry[]> {
  return (await http.put(`/api/gm/sessions/${sessionId}/rewards`, { rewards })).data;
}
