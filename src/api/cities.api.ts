import { http } from './http.api';

export interface City {
  id: number;
  name: string;
  region?: string | null;
  description?: string | null;
  coordinates?: string | null; // "u,v" normalizado [0..1]
  visible?: boolean;
}

export async function listCities(): Promise<City[]> {
  const { data } = await http.get('/api/cities');
  return data;
}

export async function updateCityCoords(id: number, u: number, v: number) {
  const coordinates = `${u.toFixed(6)},${v.toFixed(6)}`;
  await http.patch(`/api/cities/${id}`, { coordinates });
}
