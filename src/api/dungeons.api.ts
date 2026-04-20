import { http, resolveApiUrl } from './http.api';
import type { Dungeon, DungeonImage, CreateDungeonDTO } from '@app/types/rpg';

export async function listDungeons(): Promise<Dungeon[]> {
  const { data } = await http.get('/api/dungeons');
  return data;
}

export async function createDungeon(body: CreateDungeonDTO): Promise<Dungeon> {
  const { data } = await http.post('/api/dungeons', body);
  return data;
}

export async function updateDungeon(
  id: number,
  body: Partial<CreateDungeonDTO & { coordinates?: string | null; discovered?: boolean }>,
): Promise<void> {
  await http.patch(`/api/dungeons/${id}`, body);
}

export async function setDungeonVisible(id: number, visible: boolean): Promise<void> {
  await http.patch(`/api/dungeons/${id}/visibility`, { visible });
}

export async function setDungeonDiscovered(id: number, discovered: boolean): Promise<void> {
  await http.patch(`/api/dungeons/${id}/discovered`, { discovered });
}

export async function deleteDungeon(id: number): Promise<void> {
  await http.delete(`/api/dungeons/${id}`);
}

export async function addDungeonImage(id: number, file: File, alt?: string): Promise<DungeonImage> {
  const form = new FormData();
  form.append('image', file);
  const { data } = await http.post(`/api/dungeons/${id}/images`, form, {
    headers: alt ? { 'x-image-alt': alt } : undefined,
  });
  return data as DungeonImage;
}

export async function deleteDungeonImage(dungeonId: number, imageId: number): Promise<void> {
  await http.delete(`/api/dungeons/${dungeonId}/images/${imageId}`);
}

export function resolveDungeonImageUrl(url: string): string {
  return resolveApiUrl(url) ?? url;
}
