/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { API_BASE_URL } from '../config/config';

const KEY_STORAGE = 'gm_api_key';
export const GM_MODE_CHANGE_EVENT = 'gm-mode-changed';

function emitGMModeChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(GM_MODE_CHANGE_EVENT));
  }
}

export const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

/** Decodes JWT payload (no signature check — just to read claims client-side). */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    return JSON.parse(window.atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

/** Returns true if the stored value looks like a non-expired JWT. */
function isTokenValid(token: string): boolean {
  if (!token.startsWith('eyJ')) return false;
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload['exp'] !== 'number') return false;
  return (payload['exp'] as number) * 1000 > Date.now();
}

/** Returns true if the GM JWT is present and not yet expired. */
export function isGMAuthenticated(): boolean {
  const token = localStorage.getItem(KEY_STORAGE);
  return token ? isTokenValid(token) : false;
}

/**
 * Calls POST /api/auth/login with the raw GM key.
 * On success, stores the returned JWT and injects it into Axios defaults.
 */
export async function loginGM(
  apiKey: string,
): Promise<{ success: boolean; error?: string; retryAfterSeconds?: number }> {
  try {
    const res = await http.post<{ token: string; expiresAt: string }>('/api/auth/login', { apiKey });
    const { token } = res.data;
    localStorage.setItem(KEY_STORAGE, token);
    http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    emitGMModeChange();
    return { success: true };
  } catch (err: any) {
    if (err?.response?.status === 429) {
      return {
        success: false,
        error: `Too many failed attempts.`,
        retryAfterSeconds: err.response.data?.retryAfterSeconds,
      };
    }
    return { success: false, error: 'Invalid key.' };
  }
}

/** Clears the stored GM token and removes the Authorization header. */
export function logoutGM() {
  localStorage.removeItem(KEY_STORAGE);
  delete http.defaults.headers.common['Authorization'];
  emitGMModeChange();
}

/** Restores the Authorization header from a stored valid token on page load. */
export function initGMKeyFromStorage() {
  const token = localStorage.getItem(KEY_STORAGE);
  if (token && isTokenValid(token)) {
    http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else if (token) {
    // Expired token — clear it so isGM checks return false
    localStorage.removeItem(KEY_STORAGE);
    emitGMModeChange();
  }
}

export function resolveApiUrl(u?: string | null) {
  if (!u) return undefined;
  if (/^https?:\/\//i.test(u)) return u;
  return `${API_BASE_URL}${u.startsWith('/') ? '' : '/'}${u}`;
}

/** Fetches any relative URL through the authenticated axios instance and returns a blob URL. */
export async function fetchBlobUrl(relativeUrl: string): Promise<string> {
  const { data } = await http.get(relativeUrl, { responseType: 'blob' });
  return URL.createObjectURL(data as Blob);
}

// ── Request interceptor ──────────────────────────────────────────────────────
http.interceptors.request.use((config) => {
  const token = localStorage.getItem(KEY_STORAGE);
  if (token && isTokenValid(token)) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  const clientSecret = import.meta.env.VITE_CLIENT_SECRET;
  if (clientSecret) {
    config.headers.set('x-client-id', clientSecret);
  }

  return config;
});

const SIMULATE_PROD_KEY = 'dev_simulate_prod';

/**
 * Dev-only: toggle production-like behaviour (e.g. auto-logout on 401).
 * Usage in DevTools console:
 *   simulateProd(true)   // enable
 *   simulateProd(false)  // disable
 */
(window as any).simulateProd = (enabled: boolean) => {
  if (enabled) localStorage.setItem(SIMULATE_PROD_KEY, '1');
  else localStorage.removeItem(SIMULATE_PROD_KEY);
  console.info(`[dev] simulate_prod = ${enabled}`);
};

function isProdBehaviour(): boolean {
  if (!import.meta.env.DEV) return true;
  if (import.meta.env.VITE_SIMULATE_PROD === 'true') return true;
  return localStorage.getItem(SIMULATE_PROD_KEY) === '1';
}

// ── Response interceptor ─────────────────────────────────────────────────────
// Production: clears JWT automatically on 401 (expired mid-session).
// Development: keeps token for inspection unless simulateProd(true) is active.
http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (isProdBehaviour() && err?.response?.status === 401) {
      const token = localStorage.getItem(KEY_STORAGE);
      if (token?.startsWith('eyJ')) {
        logoutGM();
      }
    }
    return Promise.reject(err);
  },
);
