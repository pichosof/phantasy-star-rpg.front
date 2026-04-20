import { http } from './http.api';

export interface PlayerNote {
  id: number;
  playerId: number;
  title: string;
  content: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export async function listPlayerNotes(playerId: number): Promise<PlayerNote[]> {
  const { data } = await http.get(`/api/players/${playerId}/notes`);
  return data;
}

export async function createPlayerNote(
  playerId: number,
  body: { title: string; content?: string | null; date: string },
): Promise<PlayerNote> {
  const { data } = await http.post(`/api/players/${playerId}/notes`, body);
  return data;
}

export async function updatePlayerNote(
  playerId: number,
  noteId: number,
  body: { title?: string; content?: string | null; date?: string },
): Promise<void> {
  await http.patch(`/api/players/${playerId}/notes/${noteId}`, body);
}

export async function deletePlayerNote(playerId: number, noteId: number): Promise<void> {
  await http.delete(`/api/players/${playerId}/notes/${noteId}`);
}
