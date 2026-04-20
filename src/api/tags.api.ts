import { http } from './http.api';
import type { Tag, EntityTagType, TagEntities } from '@app/types/rpg';

export async function listTags(): Promise<Tag[]> {
  const { data } = await http.get('/api/tags');
  return data;
}

export async function createTag(body: { name: string; color?: string }): Promise<Tag> {
  const { data } = await http.post('/api/tags', body);
  return data;
}

export async function updateTag(id: number, body: { name?: string; color?: string }): Promise<void> {
  await http.patch(`/api/tags/${id}`, body);
}

export async function deleteTag(id: number): Promise<void> {
  await http.delete(`/api/tags/${id}`);
}

export async function getTagEntities(tagId: number): Promise<TagEntities> {
  const { data } = await http.get(`/api/tags/${tagId}/entities`);
  return data;
}

export async function getEntityTags(type: EntityTagType, entityId: number): Promise<Tag[]> {
  const { data } = await http.get(`/api/entity-tags/${type}/${entityId}`);
  return data;
}

export async function setEntityTags(type: EntityTagType, entityId: number, tagIds: number[]): Promise<void> {
  await http.put(`/api/entity-tags/${type}/${entityId}`, { tagIds });
}
