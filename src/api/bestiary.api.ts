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

/** Starfinder stat block of one stage/variant of a bestiary entry (GM only). */
export interface StatBlock {
  label: string;
  cr: string;
  xp?: number | null;
  size?: string | null;
  type?: string | null;
  initiative: number;
  senses?: string | null;
  hp: number;
  sp?: number | null;
  rp?: number | null;
  eac: number;
  kac: number;
  fort?: number | null;
  ref?: number | null;
  will?: number | null;
  speed?: string | null;
  attacks: { name: string; bonus?: number | null; damage?: string | null }[];
  abilities: { name: string; text: string }[];
  skills?: string | null;
  mods?: Record<string, number | null> | null;
  source?: string | null;
}

export async function listStatBlocks(): Promise<{ monsterId: number; blocks: StatBlock[] }[]> {
  return (await http.get('/api/gm/bestiary/stat-blocks')).data;
}

export async function setStatBlocks(monsterId: number, blocks: StatBlock[]): Promise<void> {
  await http.put(`/api/gm/bestiary/${monsterId}/stat-blocks`, { blocks });
}
