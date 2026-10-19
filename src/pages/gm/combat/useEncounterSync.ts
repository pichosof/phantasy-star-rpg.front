/**
 * Keeps an encounter safe across dead batteries, closed tabs and flaky Wi-Fi:
 *  - every change is written at once to localStorage (this device), then
 *  - saved to the API shortly after (debounced), with the version it started from.
 *  - Offline / server errors: keeps retrying; the local copy is never dropped until saved.
 *  - Another device saved first (409): the GM chooses "use theirs" or "keep mine".
 *  - On open, unsaved local changes are recovered (or flagged as a conflict).
 */
import React from 'react';
import {
  type Encounter,
  type EncounterState,
  type EncounterStatus,
  getEncounter,
  saveEncounter,
} from '@app/api/encounters.api';

export type SyncStatus = 'loading' | 'saved' | 'pending' | 'saving' | 'offline' | 'conflict' | 'error';

export interface EncounterMeta {
  name: string;
  status: EncounterStatus;
  sessionId: number | null;
}

interface LocalCopy extends EncounterMeta {
  state: EncounterState;
  baseVersion: number;
  dirty: boolean;
  savedAt: string;
}

const SAVE_DELAY_MS = 800;
const RETRY_MS = 5000;
const MAX_UNDO = 30;

const storageKey = (id: number) => `picho.combat.encounter.${id}`;

function readLocal(id: number): LocalCopy | null {
  try {
    const raw = localStorage.getItem(storageKey(id));
    return raw ? (JSON.parse(raw) as LocalCopy) : null;
  } catch {
    return null;
  }
}

function writeLocal(id: number, copy: LocalCopy) {
  try {
    localStorage.setItem(storageKey(id), JSON.stringify(copy));
  } catch {
    // storage full or blocked: the server save still runs
  }
}

export function forgetLocalEncounter(id: number) {
  try {
    localStorage.removeItem(storageKey(id));
  } catch {
    // nothing to clean
  }
}

const isConflict = (e: unknown) => (e as { response?: { status?: number } })?.response?.status === 409;
const isNotFound = (e: unknown) => (e as { response?: { status?: number } })?.response?.status === 404;

const metaOf = (e: Encounter): EncounterMeta => ({ name: e.name, status: e.status, sessionId: e.sessionId ?? null });

export function useEncounterSync(id: number | null) {
  const [state, setState] = React.useState<EncounterState | null>(null);
  const [meta, setMetaState] = React.useState<EncounterMeta | null>(null);
  const [status, setStatus] = React.useState<SyncStatus>('loading');
  const [savedAt, setSavedAt] = React.useState<string | null>(null);
  const [canUndo, setCanUndo] = React.useState(false);
  const [missing, setMissing] = React.useState(false);

  const stateRef = React.useRef<EncounterState | null>(null);
  const metaRef = React.useRef<EncounterMeta | null>(null);
  const baseVersion = React.useRef(0);
  const changeSeq = React.useRef(0);
  const savedSeq = React.useRef(0);
  const saving = React.useRef(false);
  const blocked = React.useRef(false); // true while a conflict waits for the GM
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const undoStack = React.useRef<EncounterState[]>([]);
  const idRef = React.useRef(id);
  idRef.current = id;

  const persistLocal = React.useCallback((dirty: boolean) => {
    const currentId = idRef.current;
    if (currentId === null || !stateRef.current || !metaRef.current) return;
    writeLocal(currentId, {
      ...metaRef.current,
      state: stateRef.current,
      baseVersion: baseVersion.current,
      dirty,
      savedAt: new Date().toISOString(),
    });
  }, []);

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const save = React.useCallback(
    async (force = false): Promise<void> => {
      const currentId = idRef.current;
      if (currentId === null || !stateRef.current || !metaRef.current) return;
      if (blocked.current && !force) return;
      if (saving.current) {
        // another save is in flight; try again right after it
        clearTimer();
        timer.current = setTimeout(() => void save(force), 300);
        return;
      }
      if (!force && savedSeq.current === changeSeq.current) return;

      saving.current = true;
      setStatus('saving');
      const seq = changeSeq.current;
      try {
        const saved = await saveEncounter(currentId, {
          version: baseVersion.current,
          force: force || undefined,
          ...metaRef.current,
          state: stateRef.current,
        });
        if (idRef.current !== currentId) return;
        baseVersion.current = saved.version;
        savedSeq.current = seq;
        blocked.current = false;
        const clean = seq === changeSeq.current;
        persistLocal(!clean);
        setSavedAt(new Date().toISOString());
        setStatus(clean ? 'saved' : 'pending');
        if (!clean) {
          clearTimer();
          timer.current = setTimeout(() => void save(), SAVE_DELAY_MS);
        }
      } catch (e) {
        if (idRef.current !== currentId) return;
        if (isConflict(e)) {
          blocked.current = true;
          setStatus('conflict');
        } else {
          setStatus(isNotFound(e) ? 'error' : 'offline');
          clearTimer();
          timer.current = setTimeout(() => void save(), RETRY_MS);
        }
      } finally {
        saving.current = false;
      }
    },
    [persistLocal],
  );

  const markChanged = React.useCallback(() => {
    changeSeq.current += 1;
    persistLocal(true);
    if (blocked.current) return;
    setStatus((s) => (s === 'offline' ? s : 'pending'));
    clearTimer();
    timer.current = setTimeout(() => void save(), SAVE_DELAY_MS);
  }, [persistLocal, save]);

  /** Applies a combat action; no-op actions (same object) are ignored. */
  const update = React.useCallback(
    (fn: (s: EncounterState) => EncounterState) => {
      const prev = stateRef.current;
      if (!prev) return;
      const next = fn(prev);
      if (next === prev) return;
      undoStack.current = [prev, ...undoStack.current].slice(0, MAX_UNDO);
      setCanUndo(true);
      stateRef.current = next;
      setState(next);
      markChanged();
    },
    [markChanged],
  );

  const undo = React.useCallback(() => {
    const [prev, ...rest] = undoStack.current;
    if (!prev) return;
    undoStack.current = rest;
    setCanUndo(rest.length > 0);
    stateRef.current = prev;
    setState(prev);
    markChanged();
  }, [markChanged]);

  const setMeta = React.useCallback(
    (patch: Partial<EncounterMeta>) => {
      if (!metaRef.current) return;
      metaRef.current = { ...metaRef.current, ...patch };
      setMetaState(metaRef.current);
      markChanged();
    },
    [markChanged],
  );

  const adopt = React.useCallback((e: Encounter) => {
    baseVersion.current = e.version;
    stateRef.current = e.state;
    metaRef.current = metaOf(e);
    changeSeq.current = 0;
    savedSeq.current = 0;
    blocked.current = false;
    undoStack.current = [];
    setCanUndo(false);
    setState(e.state);
    setMetaState(metaRef.current);
  }, []);

  // Load (and recover unsaved local changes) whenever the encounter changes.
  React.useEffect(() => {
    clearTimer();
    setMissing(false);
    if (id === null) {
      stateRef.current = null;
      metaRef.current = null;
      setState(null);
      setMetaState(null);
      return;
    }
    let alive = true;
    setStatus('loading');
    const local = readLocal(id);
    getEncounter(id)
      .then((server) => {
        if (!alive) return;
        adopt(server);
        if (local?.dirty) {
          // Unsaved changes from a previous visit on this device.
          baseVersion.current = local.baseVersion;
          stateRef.current = local.state;
          metaRef.current = { name: local.name, status: local.status, sessionId: local.sessionId };
          setState(local.state);
          setMetaState(metaRef.current);
          changeSeq.current = 1;
          if (local.baseVersion === server.version) {
            setStatus('pending');
            void save();
          } else {
            blocked.current = true;
            setStatus('conflict');
          }
        } else {
          persistLocal(false);
          setSavedAt(server.updatedAt ?? null);
          setStatus('saved');
        }
      })
      .catch((e) => {
        if (!alive) return;
        if (isNotFound(e)) {
          forgetLocalEncounter(id);
          setMissing(true);
          setStatus('error');
          return;
        }
        if (local) {
          // Server unreachable: keep playing on the local copy and sync later.
          baseVersion.current = local.baseVersion;
          stateRef.current = local.state;
          metaRef.current = { name: local.name, status: local.status, sessionId: local.sessionId };
          setState(local.state);
          setMetaState(metaRef.current);
          changeSeq.current = local.dirty ? 1 : 0;
          savedSeq.current = 0;
          setStatus('offline');
          if (local.dirty) timer.current = setTimeout(() => void save(), RETRY_MS);
        } else {
          setStatus('error');
        }
      });
    return () => {
      alive = false;
    };
  }, [id, adopt, persistLocal, save]);

  // Save right away when the tab is hidden/closed or the connection comes back.
  React.useEffect(() => {
    const flush = () => {
      if (savedSeq.current !== changeSeq.current) void save();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', flush);
    window.addEventListener('online', flush);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('online', flush);
      clearTimer();
    };
  }, [save]);

  /** After a 409: take the server copy, or overwrite it with this device's copy. */
  const resolveConflict = React.useCallback(
    async (choice: 'theirs' | 'mine') => {
      const currentId = idRef.current;
      if (currentId === null) return;
      if (choice === 'mine') {
        blocked.current = false;
        await save(true);
        return;
      }
      setStatus('loading');
      try {
        const server = await getEncounter(currentId);
        adopt(server);
        persistLocal(false);
        setSavedAt(server.updatedAt ?? null);
        setStatus('saved');
      } catch {
        setStatus('offline');
      }
    },
    [adopt, persistLocal, save],
  );

  return {
    state,
    meta,
    status,
    savedAt,
    missing,
    update,
    undo,
    canUndo,
    setMeta,
    saveNow: () => save(),
    resolveConflict,
  };
}
