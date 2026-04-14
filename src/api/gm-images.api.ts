import { http, resolveApiUrl } from './http.api';

export interface GmImage {
  id: number;
  filename: string;
  url: string;
  alt?: string | null;
  mime: string;
  size: number;
  createdAt?: string;
}

export async function listGmImages(): Promise<GmImage[]> {
  const { data } = await http.get('/api/gm/images');
  return data;
}

export async function uploadGmImage(file: File, alt?: string): Promise<GmImage> {
  const form = new FormData();
  form.append('image', file);
  const { data } = await http.post('/api/gm/images', form, {
    headers: alt ? { 'x-image-alt': alt } : undefined,
  });
  return data;
}

export async function deleteGmImage(id: number): Promise<void> {
  await http.delete(`/api/gm/images/${id}`);
}

export function resolveGmImageUrl(url?: string | null) {
  return resolveApiUrl(url ?? undefined);
}
