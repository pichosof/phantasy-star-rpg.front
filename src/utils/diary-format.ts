/**
 * Free (no AI) session diary formatting: turns loose notes into Markdown bullets and links
 * the entity names found in them as [[Name]].
 */
import { ENTITY_TYPE_LABEL, type LinkEntityType, type LinkIndexEntry } from '@app/api/links.api';

/** Lowercase + accents removed, one char per char (keeps indexes aligned with the original). */
const fold = (s: string) => Array.from(s, (c) => c.normalize('NFD')[0].toLowerCase()).join('');

const isWordChar = (c: string | undefined) => Boolean(c && /[\p{L}\p{N}]/u.test(c));

/** Links the first occurrence of every known entity name in `text`. */
export function linkNames(text: string, index: LinkIndexEntry[]): { text: string; found: LinkIndexEntry[] } {
  const names = index
    .filter((e) => e.type !== 'gmNote' && e.type !== 'session' && e.type !== 'item' && e.name.trim().length >= 3)
    .sort((a, b) => b.name.length - a.name.length);
  let out = text;
  const found: LinkIndexEntry[] = [];
  for (const entry of names) {
    const folded = fold(out);
    const needle = fold(entry.name);
    let from = 0;
    while (from <= folded.length) {
      const at = folded.indexOf(needle, from);
      if (at < 0) break;
      const end = at + needle.length;
      const insideLink = out.lastIndexOf('[[', at) > out.lastIndexOf(']]', at);
      if (!insideLink && !isWordChar(out[at - 1]) && !isWordChar(out[end])) {
        const original = out.slice(at, end);
        const link = original === entry.name ? `[[${entry.name}]]` : `[[${entry.name}|${original}]]`;
        out = out.slice(0, at) + link + out.slice(end);
        found.push(entry);
        break;
      }
      from = at + 1;
    }
  }
  return { text: out, found };
}

const GROUP_ORDER: LinkEntityType[] = [
  'player',
  'npc',
  'city',
  'dungeon',
  'world',
  'beast',
  'quest',
  'lore',
  'wiki',
  'timeline',
];

/** Notes → "## Notes" bullets + "## People and places" with every linked entity. */
export function formatDiary(notes: string, index: LinkIndexEntry[]): string {
  const lines = notes
    .split('\n')
    .map((l) => l.trim().replace(/^[-*•]\s*/, ''))
    .filter(Boolean);
  if (!lines.length) return '';
  const { text, found } = linkNames(lines.map((l) => `- ${l}`).join('\n'), index);
  const parts = [`## Notes\n\n${text}`];
  if (found.length) {
    const groups = GROUP_ORDER.map((type) => ({ type, items: found.filter((f) => f.type === type) })).filter(
      (g) => g.items.length,
    );
    parts.push(
      `## People and places\n\n${groups
        .map((g) => `- **${ENTITY_TYPE_LABEL[g.type]}:** ${g.items.map((i) => `[[${i.name}]]`).join(', ')}`)
        .join('\n')}`,
    );
  }
  return parts.join('\n\n');
}
