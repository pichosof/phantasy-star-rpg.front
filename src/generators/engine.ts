/**
 * Generator engine (no AI, no dependencies):
 * - Rng: seedable PRNG (mulberry32) so a result can be reproduced from its seed.
 * - pick/weighted/sample helpers.
 * - Markov: character-level name model trained on a culture's corpus.
 * - fill(): tiny Tracery-style templates: "{a|b|c}" picks one option, "[key]" inserts a value.
 * - History: per-generator memory (localStorage) so results are not repeated by accident.
 */

export type Seed = number;

export const newSeed = (): Seed => {
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    return crypto.getRandomValues(new Uint32Array(1))[0];
  }
  return Math.floor(Math.random() * 2 ** 32);
};

export class Rng {
  private s: number;
  constructor(readonly seed: Seed = newSeed()) {
    this.s = seed >>> 0 || 0x9e3779b9;
  }

  /** [0, 1) */
  next(): number {
    let t = (this.s = (this.s + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  chance(p: number): boolean {
    return this.next() < p;
  }

  pick<T>(list: readonly T[]): T {
    return list[Math.floor(this.next() * list.length)];
  }

  /** Weighted pick from [item, weight] pairs. */
  weighted<T>(list: readonly (readonly [T, number])[]): T {
    const total = list.reduce((s, [, w]) => s + w, 0);
    let r = this.next() * total;
    for (const [item, w] of list) {
      r -= w;
      if (r <= 0) return item;
    }
    return list[list.length - 1][0];
  }

  /** `n` distinct items (fewer if the list is shorter). */
  sample<T>(list: readonly T[], n: number): T[] {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(this.next() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, Math.max(0, n));
  }

  /** Roll dice like "2d6+3". */
  roll(expr: string): number {
    const m = expr.replace(/\s/g, '').match(/^(\d*)d(\d+)([+-]\d+)?$/i);
    if (!m) return Number(expr) || 0;
    const n = Number(m[1] || 1);
    let total = Number(m[3] || 0);
    for (let i = 0; i < n; i += 1) total += this.int(1, Number(m[2]));
    return total;
  }
}

// ── Templates ──

/**
 * "{a|b}" → one option; "[key]" → values[key] (a string, list or function).
 * Options may nest: "{o [job]|a {velha|antiga} [job]}".
 */
export function fill(
  rng: Rng,
  template: string,
  values: Record<string, string | readonly string[] | ((rng: Rng) => string)> = {},
  depth = 0,
): string {
  if (depth > 8) return template;
  let out = '';
  for (let i = 0; i < template.length; i += 1) {
    const c = template[i];
    if (c === '{') {
      let level = 1;
      let j = i + 1;
      const parts: string[] = [];
      let start = j;
      for (; j < template.length && level > 0; j += 1) {
        if (template[j] === '{') level += 1;
        else if (template[j] === '}') level -= 1;
        if ((template[j] === '|' && level === 1) || level === 0) {
          parts.push(template.slice(start, j));
          start = j + 1;
        }
      }
      out += fill(rng, rng.pick(parts), values, depth + 1);
      i = j - 1;
    } else if (c === '[') {
      const end = template.indexOf(']', i);
      const key = template.slice(i + 1, end);
      const v = values[key];
      const raw = typeof v === 'function' ? v(rng) : Array.isArray(v) ? rng.pick(v) : (v ?? `[${key}]`);
      out += fill(rng, String(raw), values, depth + 1);
      i = end;
    } else {
      out += c;
    }
  }
  return out;
}

export const capitalize = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

// ── Markov names ──

export class Markov {
  private table = new Map<string, string[]>();
  private known: Set<string>;

  constructor(
    corpus: readonly string[],
    private order = 2,
  ) {
    this.known = new Set(corpus.map((n) => n.toLowerCase()));
    for (const raw of corpus) {
      const w = `${'^'.repeat(order)}${raw.toLowerCase()}$`;
      for (let i = 0; i + order < w.length; i += 1) {
        const key = w.slice(i, i + order);
        const list = this.table.get(key) ?? [];
        list.push(w[i + order]);
        this.table.set(key, list);
      }
    }
  }

  /** A new name (not one of the training names), or null after too many tries. */
  generate(rng: Rng, minLen = 3, maxLen = 10, avoid?: (n: string) => boolean): string | null {
    for (let attempt = 0; attempt < 60; attempt += 1) {
      let key = '^'.repeat(this.order);
      let name = '';
      for (let guard = 0; guard < 20; guard += 1) {
        const next = rng.pick(this.table.get(key) ?? ['$']);
        if (next === '$') break;
        name += next;
        key = (key + next).slice(-this.order);
      }
      if (name.length < minLen || name.length > maxLen) continue;
      if (/(.)\1\1/.test(name) || /[^aeiouáéíóúâêôãõy']{4}/.test(name)) continue;
      if (this.known.has(name)) continue;
      const pretty = name
        .split(/([-' ])/)
        .map((p) => capitalize(p))
        .join('');
      if (avoid?.(pretty)) continue;
      return pretty;
    }
    return null;
  }
}

// ── Anti-repetition history ──

const HISTORY_MAX = 600;

/** Remembers recent outputs per generator (this browser) to avoid accidental repeats. */
export class History {
  private seen: string[];
  constructor(private key: string) {
    this.seen = History.load(key);
  }

  private static load(key: string): string[] {
    try {
      const raw = localStorage.getItem(`picho.gen.${key}`);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  }

  has(value: string): boolean {
    return this.seen.includes(value.toLowerCase());
  }

  add(value: string) {
    const v = value.toLowerCase();
    this.seen = [v, ...this.seen.filter((x) => x !== v)].slice(0, HISTORY_MAX);
    try {
      localStorage.setItem(`picho.gen.${this.key}`, JSON.stringify(this.seen));
    } catch {
      // storage full: repetition avoidance just becomes per-session
    }
  }

  clear() {
    this.seen = [];
    try {
      localStorage.removeItem(`picho.gen.${this.key}`);
    } catch {
      // nothing to clear
    }
  }

  get size() {
    return this.seen.length;
  }
}

/** Runs `make` until it yields something not in history (or gives up and accepts it). */
export function fresh<T>(history: History, rng: Rng, make: (rng: Rng) => T, keyOf: (t: T) => string, tries = 25): T {
  let last = make(rng);
  for (let i = 0; i < tries && history.has(keyOf(last)); i += 1) last = make(rng);
  history.add(keyOf(last));
  return last;
}
