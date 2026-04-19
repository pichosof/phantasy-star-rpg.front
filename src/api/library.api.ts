import { http, resolveApiUrl } from './http.api';

export const LIBRARY_KEY_STORAGE = 'library_player_key';

export interface LibraryDocument {
  id: number;
  title: string;
  description?: string | null;
  category?: string | null;
  filename: string;
  originalName: string;
  url: string;
  mime: string;
  size: number;
  visible: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export function getLibraryKey(): string | null {
  return localStorage.getItem(LIBRARY_KEY_STORAGE);
}

export function setLibraryKey(key: string | null) {
  if (key) localStorage.setItem(LIBRARY_KEY_STORAGE, key);
  else localStorage.removeItem(LIBRARY_KEY_STORAGE);
}

function libraryHeaders(extra?: Record<string, string>) {
  const key = getLibraryKey();
  return key ? { 'x-library-key': key, ...extra } : { ...extra };
}

export async function listLibraryDocuments(): Promise<LibraryDocument[]> {
  const { data } = await http.get('/api/library/documents', { headers: libraryHeaders() });
  return data as LibraryDocument[];
}

export async function uploadLibraryDocument(
  file: File,
  meta: { title: string; description?: string; category?: string },
): Promise<LibraryDocument> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await http.post('/api/library/documents', form, {
    headers: {
      'x-doc-title': meta.title,
      ...(meta.description ? { 'x-doc-description': meta.description } : {}),
      ...(meta.category ? { 'x-doc-category': meta.category } : {}),
    },
  });
  return data as LibraryDocument;
}

export async function updateLibraryDocument(
  id: number,
  patch: { title?: string; description?: string | null; category?: string | null; visible?: boolean },
): Promise<void> {
  await http.patch(`/api/library/documents/${id}`, patch);
}

export async function deleteLibraryDocument(id: number): Promise<void> {
  await http.delete(`/api/library/documents/${id}`);
}

export async function getLibrarySettings(): Promise<{ hasPlayerKey: boolean }> {
  const { data } = await http.get('/api/library/settings');
  return data as { hasPlayerKey: boolean };
}

export async function setLibrarySettings(playerKey: string | null): Promise<void> {
  await http.patch('/api/library/settings', { playerKey });
}

export function resolveDocUrl(url: string): string {
  return resolveApiUrl(url) ?? url;
}

export function mimeLabel(mime: string): string {
  const map: Record<string, string> = {
    'application/pdf': 'PDF',
    'text/plain': 'TXT',
    'application/msword': 'DOC',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'application/vnd.ms-excel': 'XLS',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
    'application/vnd.ms-powerpoint': 'PPT',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
    'application/zip': 'ZIP',
    'application/epub+zip': 'EPUB',
    'text/markdown': 'MD',
  };
  return map[mime] ?? mime.split('/')[1]?.toUpperCase() ?? '—';
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
