import { http } from './http.api';
import { resolveApiUrl } from './http.api';

export interface World {
  id: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
}

export async function listWorlds(): Promise<World[]> {
  const { data } = await http.get('/api/worlds');
  return data;
}

export function resolveWorldImage(url?: string | null) {
  return resolveApiUrl(url ?? undefined);
}
