import type { CreateNpcDTO, ID, Npc } from '../types/rpg';
import { http } from './http.api';

export const NpcApi = {
  async list(): Promise<Npc[]> {
    const { data } = await http.get('/api/npcs');
    return data;
  },

  async create(body: CreateNpcDTO): Promise<Npc> {
    const { data } = await http.post('/api/npcs', body);
    return data;
  },

  async update(id: ID, body: Partial<CreateNpcDTO>): Promise<void> {
    await http.patch(`/api/npcs/${id}`, body);
  },

  async setVisible(id: ID, visible: boolean): Promise<void> {
    await http.patch(`/api/npcs/${id}/visibility`, { visible });
  },

  async uploadImage(id: ID, file: File, alt?: string): Promise<void> {
    const form = new FormData();
    form.append('image', file);
    await http.patch(`/api/npcs/${id}/image`, form, {
      headers: alt ? { 'x-image-alt': alt } : undefined,
    });
  },

  async uploadSheet(id: ID, file: File): Promise<void> {
    const form = new FormData();
    form.append('sheet', file);
    await http.patch(`/api/npcs/${id}/sheet`, form);
  },

  async remove(id: ID): Promise<void> {
    await http.delete(`/api/npcs/${id}`);
  },
};
