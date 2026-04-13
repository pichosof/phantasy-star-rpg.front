import { http } from './http.api';

export interface TimelineEvent {
  id: number;
  title: string;
  date: string;
  description?: string | null;
  visible?: boolean | null;
  createdAt?: string | null;
}

export interface CreateTimelineEventInput {
  title: string;
  date: string;
  description?: string | null;
}

export interface UpdateTimelineEventInput {
  title?: string;
  date?: string;
  description?: string | null;
}

const unwrap = (x: any): any => (x && typeof x === 'object' && 'props' in x ? x.props : x);

export async function listTimelineEvents(): Promise<TimelineEvent[]> {
  const { data } = await http.get('/api/timeline');
  return (data as any[]).map(unwrap);
}

export async function createTimelineEvent(input: CreateTimelineEventInput): Promise<TimelineEvent> {
  const { data } = await http.post('/api/timeline', input);
  return unwrap(data) as TimelineEvent;
}

export async function updateTimelineEvent(id: number, input: UpdateTimelineEventInput): Promise<void> {
  await http.patch(`/api/timeline/${id}`, input);
}

export async function setTimelineEventVisibility(id: number, visible: boolean): Promise<void> {
  await http.patch(`/api/timeline/${id}/visibility`, { visible });
}

export async function deleteTimelineEvent(id: number): Promise<void> {
  await http.delete(`/api/timeline/${id}`);
}
