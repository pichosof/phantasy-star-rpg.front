import { http, resolveApiUrl } from './http.api';

export interface World {
  id: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  visible?: boolean;
}

export async function listWorlds(): Promise<World[]> {
  const { data } = await http.get('/api/worlds');
  return data;
}

export async function createWorld(body: { name: string; description?: string | null }): Promise<World> {
  const { data } = await http.post('/api/worlds', body);
  return data;
}

export async function updateWorld(id: number, body: { name?: string; description?: string | null }): Promise<void> {
  await http.patch(`/api/worlds/${id}`, body);
}

export async function uploadWorldImage(id: number, file: File): Promise<void> {
  const form = new FormData();
  form.append('image', file);
  await http.patch(`/api/worlds/${id}/image`, form);
}

export function resolveWorldImage(url?: string | null) {
  return resolveApiUrl(url ?? undefined);
}
