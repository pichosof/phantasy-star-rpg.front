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
    // cabeçalho opcional com alt (servidor aceita x-image-alt)
    const headers: Record<string, string> = { 'Content-Type': 'multipart/form-data' };
    if (alt) headers['x-image-alt'] = alt;
    await http.patch(`/api/players/${id}/image`, form, { headers });
  },
  async uploadSheet(id: ID, file: File): Promise<void> {
    const form = new FormData();
    form.append('sheet', file);
    await http.patch(`/api/players/${id}/sheet`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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
