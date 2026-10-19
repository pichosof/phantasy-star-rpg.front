import { http } from './http.api';

/** GM-only: downloads a consistent snapshot of the whole SQLite database. */
export async function downloadDatabase(): Promise<void> {
  const res = await http.get<Blob>('/api/gm/database/download', { responseType: 'blob' });
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = `picho-rpg-${stamp}.db`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export interface DatabaseBackup {
  name: string;
  size: number;
  createdAt: string;
}

export interface RestoreResult {
  restoredFrom: string;
  safetyBackup: string;
}

export type BackupNowResult = { status: 'uploaded' | 'unchanged'; name: string; size?: number };

/** Word the GM must type to confirm a restore (checked by the API too). */
export const RESTORE_CONFIRM_WORD = 'RESTORE';

export async function listBackups(): Promise<DatabaseBackup[]> {
  return (await http.get<DatabaseBackup[]>('/api/gm/database/backups')).data;
}

export async function backupNow(): Promise<BackupNowResult> {
  return (await http.post<BackupNowResult>('/api/gm/database/backup')).data;
}

export async function restoreBackup(name: string, confirm: string): Promise<RestoreResult> {
  return (await http.post<RestoreResult>('/api/gm/database/restore', { name, confirm })).data;
}

export async function restoreFromFile(file: File, confirm: string): Promise<RestoreResult> {
  const form = new FormData();
  form.append('confirm', confirm);
  form.append('file', file);
  return (await http.post<RestoreResult>('/api/gm/database/restore/upload', form)).data;
}
