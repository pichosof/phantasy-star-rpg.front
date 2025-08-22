import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '../config/config';

const KEY_STORAGE = 'gm_api_key';

export const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

export function setGMKey(key?: string) {
  if (key) localStorage.setItem(KEY_STORAGE, key);
  else localStorage.removeItem(KEY_STORAGE);
}

export function resolveApiUrl(u?: string | null) {
  if (!u) return undefined;
  if (/^https?:\/\//i.test(u)) return u;
  return `${API_BASE_URL}${u.startsWith('/') ? '' : '/'}${u}`;
}

export function initGMKeyFromStorage() {
  const stored = localStorage.getItem(KEY_STORAGE);
  if (stored) {
    http.defaults.headers.common['x-api-key'] = stored;
    console.log(stored);
  }
}

http.interceptors.request.use((config) => {
  const key = localStorage.getItem(KEY_STORAGE);
  if (key) {
    (config.headers ??= {})['x-api-key'] = key;
  }
  return config;
});
