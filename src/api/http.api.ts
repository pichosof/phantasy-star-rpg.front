import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '../config/config';

const KEY_STORAGE = 'gm_api_key';

export const http = axios.create({
  baseURL: API_BASE_URL,
});

export function setGMKey(key?: string) {
  if (!key) {
    localStorage.removeItem(KEY_STORAGE);
    delete http.defaults.headers.common['x-api-key'];
  } else {
    localStorage.setItem(KEY_STORAGE, key);
    http.defaults.headers.common['x-api-key'] = key;
  }
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
  }
}

http.interceptors.response.use(
  (r) => r,
  (err: AxiosError) => {
    // feedback básico
    if (err.response?.status === 401) {
      console.warn('Unauthorized (GM key inválida?)');
    }
    return Promise.reject(err);
  },
);
