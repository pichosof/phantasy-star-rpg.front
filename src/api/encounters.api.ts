import { http } from './http.api';

export type CombatantKind = 'pc' | 'monster' | 'npc';

export interface Pool {
  current: number;
  max: number;
}

export interface CombatCondition {
  id: string;
  name: string;
  /** Rounds left; null = until removed. */
  rounds: number | null;
}

export interface Combatant {
  id: string;
  kind: CombatantKind;
  name: string;
  /** character_sheets.id for PCs, bestiary.id for monsters. */
  refId?: number | null;
  imageUrl?: string | null;
  initiative: number | null;
  initBonus: number;
  sp: Pool;
  hp: Pool;
  rp: Pool;
  eac?: number | null;
  kac?: number | null;
  conditions: CombatCondition[];
  notes?: string | null;
  defeated: boolean;
}

export interface CombatLogEntry {
  id: string;
  round: number;
  text: string;
  at: string;
}

/** Combatants are kept in turn order; `turn` indexes into that array. Round 0 = not started. */
export interface EncounterState {
  round: number;
  turn: number;
  combatants: Combatant[];
  log: CombatLogEntry[];
}

export type EncounterStatus = 'active' | 'ended';

export interface Encounter {
  id: number;
  name: string;
  sessionId?: number | null;
  status: EncounterStatus;
  state: EncounterState;
  version: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaveEncounterBody {
  version: number;
  force?: boolean;
  name?: string;
  sessionId?: number | null;
  status?: EncounterStatus;
  state?: EncounterState;
}

export async function listEncounters(): Promise<Encounter[]> {
  return (await http.get<Encounter[]>('/api/gm/encounters')).data;
}

export async function getEncounter(id: number): Promise<Encounter> {
  return (await http.get<Encounter>(`/api/gm/encounters/${id}`)).data;
}

export async function createEncounter(body: { name: string; sessionId?: number | null }): Promise<Encounter> {
  return (await http.post<Encounter>('/api/gm/encounters', body)).data;
}

/** Throws an Axios error with status 409 when another device saved first. */
export async function saveEncounter(id: number, body: SaveEncounterBody): Promise<Encounter> {
  return (await http.put<Encounter>(`/api/gm/encounters/${id}`, body)).data;
}

export async function deleteEncounter(id: number): Promise<void> {
  await http.delete(`/api/gm/encounters/${id}`);
}
