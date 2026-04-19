import axios from 'axios';
import { API_BASE_URL } from '../config/config';

const KEY_STORAGE = 'gm_api_key';

export const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

/** Decodes JWT payload (no signature check — just to read claims client-side). */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    // atob is the correct browser API; the TS hint targets Node.js only
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return JSON.parse(atob(token.split('.')[1]));
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
export async function loginGM(apiKey: string): Promise<{ success: boolean; error?: string; retryAfterSeconds?: number }> {
  try {
    const res = await http.post<{ token: string; expiresAt: string }>('/api/auth/login', { apiKey });
    const { token } = res.data;
    localStorage.setItem(KEY_STORAGE, token);
    http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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
}

/** Restores the Authorization header from a stored valid token on page load. */
export function initGMKeyFromStorage() {
  const token = localStorage.getItem(KEY_STORAGE);
  if (token && isTokenValid(token)) {
    http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else if (token) {
    // Expired token — clear it so isGM checks return false
    localStorage.removeItem(KEY_STORAGE);
  }
}

export function resolveApiUrl(u?: string | null) {
  if (!u) return undefined;
  if (/^https?:\/\//i.test(u)) return u;
  return `${API_BASE_URL}${u.startsWith('/') ? '' : '/'}${u}`;
}

// ── Request interceptor ──────────────────────────────────────────────────────
http.interceptors.request.use((config) => {
  const token = localStorage.getItem(KEY_STORAGE);
  if (token && isTokenValid(token)) {
    (config.headers ??= {})['Authorization'] = `Bearer ${token}`;
  }

  const clientSecret = process.env.REACT_APP_CLIENT_SECRET;
  if (clientSecret) {
    (config.headers ??= {})['x-client-id'] = clientSecret;
  }

  return config;
});

// ── Response interceptor ─────────────────────────────────────────────────────
// In production: clear the stored JWT automatically on 401 (expired mid-session).
// In development: keep the token so it can be inspected in DevTools/Network tab.
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const isDev = process.env.NODE_ENV === 'development';
    if (!isDev && err?.response?.status === 401) {
      const token = localStorage.getItem(KEY_STORAGE);
      if (token?.startsWith('eyJ')) {
        logoutGM();
      }
    }
    return Promise.reject(err);
  },
);
