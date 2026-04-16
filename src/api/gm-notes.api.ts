import { http } from './http.api';

export interface GmNote {
  id: number;
  title: string;
  content?: string | null;
  tags?: string | null;
  pinned?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export async function listGmNotes(tag?: string): Promise<GmNote[]> {
  const { data } = await http.get('/api/gm/notes', { params: tag ? { tag } : undefined });
  return data;
}

export async function createGmNote(body: {
  title: string;
  content?: string | null;
  tags?: string | null;
  pinned?: boolean;
}): Promise<GmNote> {
  const { data } = await http.post('/api/gm/notes', body);
  return data;
}

export async function updateGmNote(
  id: number,
  body: { title?: string; content?: string | null; tags?: string | null; pinned?: boolean },
): Promise<void> {
  await http.patch(`/api/gm/notes/${id}`, body);
}

export async function deleteGmNote(id: number): Promise<void> {
  await http.delete(`/api/gm/notes/${id}`);
}
