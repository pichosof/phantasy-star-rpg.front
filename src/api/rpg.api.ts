import { http } from './http.api';
import type { City, CreateCityDTO, Player, CreatePlayerDTO, Quest, CreateQuestDTO, ID } from '../types/rpg';

// ---------- Players ----------
export const PlayersApi = {
  async list(): Promise<Player[]> {
    const { data } = await http.get('/api/players');
    return data;
  },
  async create(body: CreatePlayerDTO): Promise<Player> {
    const { data } = await http.post('/api/players', body);
    return data;
  },
  async setVisible(id: ID, visible: boolean): Promise<void> {
    await http.patch(`/api/players/${id}/visibility`, { visible });
  },
  async uploadImage(id: ID, file: File, alt?: string): Promise<void> {
    const form = new FormData();
    form.append('image', file);

    await http.patch(`/api/players/${id}/image`, form, {
      // NÃO definir Content-Type aqui
      headers: alt ? { 'x-image-alt': alt } : undefined,
    });
  },
  async update(id: ID, body: { name?: string; level?: number; background?: string | null }): Promise<void> {
    await http.patch(`/api/players/${id}`, body);
  },
  async uploadSheet(id: ID, file: File): Promise<void> {
    const form = new FormData();
    form.append('sheet', file);
    await http.patch(`/api/players/${id}/sheet`, form);
  },
  async delete(id: ID): Promise<void> {
    await http.delete(`/api/players/${id}`);
  },
};

// ---------- Cities ----------
export const CitiesApi = {
  async list(): Promise<City[]> {
    const { data } = await http.get('/api/cities');
    return data;
  },
  async create(body: CreateCityDTO): Promise<City> {
    const { data } = await http.post('/api/cities', body);
    return data;
  },
  async setVisible(id: ID, visible: boolean): Promise<void> {
    await http.patch(`/api/cities/${id}/visibility`, { visible });
  },
  async setDiscovered(id: ID, discovered: boolean): Promise<void> {
    await http.patch(`/api/cities/${id}/discovered`, { discovered });
  },
  async remove(id: ID): Promise<void> {
    await http.delete(`/api/cities/${id}`);
  },
  async update(id: ID, body: { name?: string; description?: string | null; region?: string | null }): Promise<void> {
    await http.patch(`/api/cities/${id}`, body);
  },
  async setWorld(cityId: number, worldId: number | null): Promise<void> {
    await http.patch(`/api/cities/${cityId}/world`, { worldId });
  },
  async assignToWorld(cityId: number, worldId: number): Promise<void> {
    await http.patch(`/api/cities/${cityId}/world`, { worldId });
  },

  async removeFromWorld(cityId: number): Promise<void> {
    await http.patch(`/api/cities/${cityId}/world`, { worldId: null });
  },
  async uploadImage(id: ID, file: File, alt?: string): Promise<void> {
    const form = new FormData();
    form.append('image', file);
    await http.patch(`/api/cities/${id}/image`, form, {
      headers: alt ? { 'x-image-alt': alt } : undefined,
    });
  },
};

// ---------- Quests ----------
export const QuestsApi = {
  async list(): Promise<Quest[]> {
    const { data } = await http.get('/api/quests');
    return data;
  },
  async create(body: CreateQuestDTO): Promise<Quest> {
    const { data } = await http.post('/api/quests', body);
    return data;
  },
  async setVisible(id: ID, visible: boolean): Promise<void> {
    await http.patch(`/api/quests/${id}/visibility`, { visible });
  },
  async complete(id: ID): Promise<void> {
    await http.post(`/api/quests/${id}/complete`);
  },
};
