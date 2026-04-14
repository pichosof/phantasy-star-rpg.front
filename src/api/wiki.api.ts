import { http } from './http.api';

export interface WikiPage {
  id: number;
  title: string;
  category?: string | null;
  content?: string | null;
  pinned?: boolean;
  visible?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CreateWikiPageInput {
  title: string;
  category?: string | null;
  content?: string | null;
  pinned?: boolean;
  visible?: boolean;
}

export interface UpdateWikiPageInput {
  title?: string;
  category?: string | null;
  content?: string | null;
  pinned?: boolean;
  visible?: boolean;
}

const unwrap = (x: any): any => (x && typeof x === 'object' && 'props' in x ? x.props : x);

export async function listWikiPages(): Promise<WikiPage[]> {
  const { data } = await http.get('/api/wiki');
  return (data as any[]).map(unwrap);
}

export async function createWikiPage(input: CreateWikiPageInput): Promise<WikiPage> {
  const { data } = await http.post('/api/wiki', input);
  return unwrap(data) as WikiPage;
}

export async function updateWikiPage(id: number, input: UpdateWikiPageInput): Promise<void> {
  await http.patch(`/api/wiki/${id}`, input);
}

export async function setWikiPageVisibility(id: number, visible: boolean): Promise<void> {
  await http.patch(`/api/wiki/${id}/visibility`, { visible });
}

export async function deleteWikiPage(id: number): Promise<void> {
  await http.delete(`/api/wiki/${id}`);
}

export async function uploadWikiImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await http.post<{ url: string }>('/api/wiki/upload', form);
  return data.url;
}
