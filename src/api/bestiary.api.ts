import type { CreateMonsterDTO, ID, Monster } from '../types/rpg';
import { http } from './http.api';

export const BestiaryApi = {
  async list(): Promise<Monster[]> {
    const { data } = await http.get('/api/bestiary');
    return data;
  },

  async create(body: CreateMonsterDTO): Promise<Monster> {
    const { data } = await http.post('/api/bestiary', body);
    return data;
  },

  async update(id: ID, body: Partial<CreateMonsterDTO>): Promise<void> {
    await http.patch(`/api/bestiary/${id}`, body);
  },

  async setVisible(id: ID, visible: boolean): Promise<void> {
    await http.patch(`/api/bestiary/${id}/visibility`, { visible });
  },

  async setDiscovered(id: ID, discovered: boolean): Promise<void> {
    await http.patch(`/api/bestiary/${id}/discovered`, { discovered });
  },

  async uploadImage(id: ID, file: File, alt?: string): Promise<void> {
    const form = new FormData();
    form.append('image', file);
    await http.patch(`/api/bestiary/${id}/image`, form, {
      headers: alt ? { 'x-image-alt': alt } : undefined,
    });
  },

  async remove(id: ID): Promise<void> {
    await http.delete(`/api/bestiary/${id}`);
  },
};
