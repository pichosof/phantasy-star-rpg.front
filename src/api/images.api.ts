import React from 'react';
import { http } from './http.api';

/**
 * Image helpers shared by cards, drawers and galleries.
 *
 * - thumbUrl: the API resizes uploads on demand (`/files/<key>?w=320|640|1280`, WebP,
 *   first frame for animated GIFs). Cards/drawers use these; the lightbox keeps the original.
 * - focus: a per-image focal point (0–100 %) set by the GM, used as CSS object-position.
 */

export type ThumbWidth = 320 | 640 | 1280;

const FILES_MARKER = '/files/';

export function isUploadUrl(url?: string | null): url is string {
  return Boolean(url && url.includes(FILES_MARKER));
}

/** Resized version of an uploaded image; other URLs (external, blob:, data:) pass through. */
export function thumbUrl(url: string | null | undefined, width: ThumbWidth): string | undefined {
  if (!url) return undefined;
  if (!isUploadUrl(url) || url.includes('?')) return url;
  return `${url}?w=${width}`;
}

/** Storage key of an uploaded image URL (what the focus API is keyed by). */
export function storageKeyOf(url?: string | null): string | null {
  if (!isUploadUrl(url)) return null;
  const path = url.slice(url.indexOf(FILES_MARKER) + FILES_MARKER.length).split('?')[0];
  try {
    return path
      .split('/')
      .map((s) => decodeURIComponent(s))
      .join('/');
  } catch {
    return null;
  }
}

// ── Focal points ─────────────────────────────────────────────────────────────

export interface ImageFocus {
  x: number;
  y: number;
}

const focusCache = new Map<string, ImageFocus | null>();
const listeners = new Set<() => void>();
let pending = new Set<string>();
let flushScheduled = false;

const notify = () => listeners.forEach((l) => l());

/** Keys requested in the same tick are fetched in one call. */
function request(key: string) {
  if (focusCache.has(key) || pending.has(key)) return;
  pending.add(key);
  if (flushScheduled) return;
  flushScheduled = true;
  queueMicrotask(async () => {
    const keys = [...pending];
    pending = new Set();
    flushScheduled = false;
    keys.forEach((k) => focusCache.set(k, null));
    try {
      for (let i = 0; i < keys.length; i += 150) {
        const chunk = keys.slice(i, i + 150);
        const { data } = await http.get<{ key: string; x: number; y: number }[]>('/api/image-focus', {
          params: { keys: chunk.map(encodeURIComponent).join(',') },
        });
        data.forEach((f) => focusCache.set(f.key, { x: f.x, y: f.y }));
      }
    } catch {
      // focus is cosmetic: fall back to the default position
    }
    notify();
  });
}

/** Focal point of an uploaded image, or null (not set / not an upload). */
export function useImageFocus(url?: string | null): ImageFocus | null {
  const key = storageKeyOf(url);
  const [, force] = React.useReducer((n: number) => n + 1, 0);
  React.useEffect(() => {
    listeners.add(force);
    return () => {
      listeners.delete(force);
    };
  }, []);
  React.useEffect(() => {
    if (key) request(key);
  }, [key]);
  return key ? (focusCache.get(key) ?? null) : null;
}

export async function saveImageFocus(url: string, focus: ImageFocus): Promise<void> {
  const key = storageKeyOf(url);
  if (!key) return;
  await http.put('/api/gm/image-focus', { key, x: focus.x, y: focus.y });
  focusCache.set(key, focus);
  notify();
}

/** CSS object-position for a cover; portraits default to the upper third (faces). */
export function objectPosition(focus: ImageFocus | null, shape: ImageShape = 'landscape'): string {
  if (focus) return `${focus.x}% ${focus.y}%`;
  return shape === 'portrait' ? '50% 22%' : '50% 50%';
}

// ── Shapes ───────────────────────────────────────────────────────────────────

/** How a domain's pictures are framed: portraits (people), squares (creatures), landscapes (places). */
export type ImageShape = 'portrait' | 'square' | 'landscape';

export const SHAPE_ASPECT: Record<ImageShape, string> = {
  portrait: '4 / 5',
  square: '1 / 1',
  landscape: '16 / 9',
};
