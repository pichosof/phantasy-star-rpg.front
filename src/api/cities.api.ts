import { http } from './http.api';

export interface City {
  id: number;
  name: string;
  region?: string | null;
  description?: string | null;
  coordinates?: string | null; // "u,v" normalizado [0..1]
  visible?: boolean;
  discovered?: boolean;
  worldId?: number | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export async function listCities(): Promise<City[]> {
  const { data } = await http.get('/api/cities');
  return data;
}

export async function createCity(body: {
  name: string;
  description?: string | null;
  region?: string | null;
  worldId?: number | null;
}): Promise<City> {
  const { data } = await http.post('/api/cities', body);
  return data;
}

export async function updateCity(
  id: number,
  body: {
    name?: string;
    description?: string | null;
    region?: string | null;
    worldId?: number | null;
    coordinates?: string | null;
  },
): Promise<void> {
  await http.patch(`/api/cities/${id}`, body);
}

export async function updateCityCoords(cityId: number, u: number | null, v: number | null) {
  const coordinates = u !== null && v !== null ? `${u.toFixed(6)},${v.toFixed(6)}` : null;
  await http.patch(`/api/cities/${cityId}`, { coordinates });
}

export async function setCityVisible(id: number, visible: boolean): Promise<void> {
  await http.patch(`/api/cities/${id}/visibility`, { visible });
}

export async function setCityDiscovered(id: number, discovered: boolean): Promise<void> {
  await http.patch(`/api/cities/${id}/discovered`, { discovered });
}

export async function uploadCityImage(id: number, file: File, alt?: string): Promise<void> {
  const form = new FormData();
  form.append('image', file);
  await http.patch(`/api/cities/${id}/image`, form, {
    headers: alt ? { 'x-image-alt': alt } : undefined,
  });
}

export async function deleteCity(id: number): Promise<void> {
  await http.delete(`/api/cities/${id}`);
}
