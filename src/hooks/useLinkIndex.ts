import React from 'react';
import { GM_MODE_CHANGE_EVENT } from '@app/api/http.api';
import { type LinkIndexEntry, getLinkIndex } from '@app/api/links.api';
import { type LinkResolver, makeResolver } from '@app/utils/wiki-links';

/** Shared, lightly cached link index (one request for the whole page). */
const TTL_MS = 60_000;
let cache: { at: number; data: LinkIndexEntry[] } | null = null;
let inflight: Promise<LinkIndexEntry[]> | null = null;
const listeners = new Set<() => void>();

function load(force = false): Promise<LinkIndexEntry[]> {
  if (!force && cache && Date.now() - cache.at < TTL_MS) return Promise.resolve(cache.data);
  inflight ??= getLinkIndex()
    .then((data) => {
      cache = { at: Date.now(), data };
      listeners.forEach((l) => l());
      return data;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** Call after creating/renaming entities so links pick the change up. */
export function invalidateLinkIndex() {
  cache = null;
  void load(true).catch(() => undefined);
}

if (typeof window !== 'undefined') {
  window.addEventListener(GM_MODE_CHANGE_EVENT, () => invalidateLinkIndex());
}

/** `enabled=false` skips the request (e.g. text without any `[[`). */
export function useLinkIndex(enabled = true): { index: LinkIndexEntry[]; resolve: LinkResolver | null } {
  const [data, setData] = React.useState<LinkIndexEntry[] | null>(cache?.data ?? null);
  React.useEffect(() => {
    if (!enabled) return undefined;
    const update = () => setData(cache?.data ?? null);
    listeners.add(update);
    void load()
      .then(setData)
      .catch(() => undefined);
    return () => {
      listeners.delete(update);
    };
  }, [enabled]);
  const resolve = React.useMemo(() => (data ? makeResolver(data) : null), [data]);
  return { index: data ?? [], resolve };
}
