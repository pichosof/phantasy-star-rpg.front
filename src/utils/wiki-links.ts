/**
 * `[[Name]]`, `[[Name|label]]`, `[[npc:Name]]` wiki links: parsing and resolution against the
 * link index. Mirrors the API rules (src/core/use-cases/links in the back end).
 */
import type { LinkEntityType, LinkIndexEntry } from '@app/api/links.api';

const TYPES: LinkEntityType[] = [
  'city',
  'npc',
  'player',
  'dungeon',
  'world',
  'quest',
  'session',
  'lore',
  'wiki',
  'beast',
  'timeline',
  'gmNote',
];

/** Order in which types win when two entities share a name (same as the API). */
const PRIORITY: LinkEntityType[] = [
  'npc',
  'player',
  'city',
  'dungeon',
  'world',
  'beast',
  'quest',
  'lore',
  'wiki',
  'session',
  'timeline',
  'gmNote',
];

export const LINK_RE = /\[\[([^[\]|\n]{1,120})(?:\|([^[\]\n]{1,120}))?\]\]/g;

export function normalizeName(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function parseTarget(raw: string): { type?: LinkEntityType; name: string } {
  const name = raw.trim();
  const colon = name.indexOf(':');
  if (colon > 0) {
    const prefix = name.slice(0, colon).trim() as LinkEntityType;
    if (TYPES.includes(prefix)) return { type: prefix, name: name.slice(colon + 1).trim() };
  }
  return { name };
}

export type LinkResolver = (raw: string) => LinkIndexEntry | undefined;

export function makeResolver(index: LinkIndexEntry[]): LinkResolver {
  const byName = new Map<string, LinkIndexEntry[]>();
  for (const e of index) {
    const key = normalizeName(e.name);
    byName.set(key, [...(byName.get(key) ?? []), e]);
  }
  for (const list of byName.values()) list.sort((a, b) => PRIORITY.indexOf(a.type) - PRIORITY.indexOf(b.type));
  return (raw) => {
    const { type, name } = parseTarget(raw);
    const list = byName.get(normalizeName(name)) ?? [];
    return type ? list.find((e) => e.type === type) : list[0];
  };
}

export const entityHref = (e: { type: LinkEntityType; id: number }) => `#entity:${e.type}:${e.id}`;

export function parseEntityHref(href?: string): { type: LinkEntityType; id: number } | null {
  const m = href?.match(/^#entity:([a-zA-Z]+):(\d+)$/);
  if (!m || !TYPES.includes(m[1] as LinkEntityType)) return null;
  return { type: m[1] as LinkEntityType, id: Number(m[2]) };
}

/**
 * Rewrites wiki links into Markdown links the renderer understands. Unknown or hidden
 * targets become plain text, so players never learn that a hidden entity exists.
 */
export function linkifyWikiLinks(markdown: string, resolve: LinkResolver | null): string {
  if (!markdown.includes('[[')) return markdown;
  return markdown.replace(LINK_RE, (_all, target: string, label?: string) => {
    const text = (label ?? parseTarget(target).name).replace(/[[\]]/g, '');
    const hit = resolve?.(target);
    return hit ? `[${text}](${entityHref(hit)})` : text;
  });
}

/** Opens the entity preview drawer from anywhere (see EntityPeekHost). */
export const OPEN_ENTITY_EVENT = 'picho:open-entity';
export function openEntity(type: LinkEntityType, id: number) {
  window.dispatchEvent(new CustomEvent(OPEN_ENTITY_EVENT, { detail: { type, id } }));
}
