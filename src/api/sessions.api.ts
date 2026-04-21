/* eslint-disable @typescript-eslint/no-explicit-any */
// src/api/sessions.api.ts
import { http } from './http.api';

export interface Session {
  id: number;
  title: string;
  date: string; // ISO string ou data in-game
  summary?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  visible?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CreateSessionInput {
  title: string;
  date: string;
  summary?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
}

export interface UpdateSessionInput {
  title?: string;
  date?: string;
  summary?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  visible?: boolean;
}

const unwrap = (x: any): any => (x && typeof x === 'object' && 'props' in x ? x.props : x);

export async function listSessions(): Promise<Session[]> {
  const { data } = await http.get('/api/sessions');
  return (data as any[]).map(unwrap);
}

export async function createSession(input: CreateSessionInput): Promise<Session> {
  const { data } = await http.post('/api/sessions', input);
  return unwrap(data) as Session;
}

export async function updateSession(id: number, input: UpdateSessionInput): Promise<void> {
  await http.patch(`/api/sessions/${id}`, input);
}

export async function deleteSession(id: number): Promise<void> {
  await http.delete(`/api/sessions/${id}`);
}

export async function setSessionVisibility(id: number, visible: boolean): Promise<void> {
  await http.patch(`/api/sessions/${id}/visibility`, { visible });
}
