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
