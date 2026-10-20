/**
 * Catalogue filter helpers. The API classifies each item (kind → type, plus damage family
 * for weapons; see the back end's use-cases/items/classify.ts); this only builds the UI.
 */

export type Damage = 'kinetic' | 'energy' | 'explosive';

export const DAMAGE_LABEL: Record<Damage, string> = {
  kinetic: 'Kinetic',
  energy: 'Energy',
  explosive: 'Explosive',
};

export interface Classified {
  kind: string;
  type: string;
  damageType: Damage | null;
}

/** Cascader options (kind → types, with counts) built from the items actually loaded. */
export function typeTree(items: Classified[], kindLabel: (k: string) => string) {
  const byKind = new Map<string, Map<string, number>>();
  for (const i of items) {
    const types = byKind.get(i.kind) ?? new Map<string, number>();
    types.set(i.type, (types.get(i.type) ?? 0) + 1);
    byKind.set(i.kind, types);
  }
  return [...byKind.entries()]
    .sort(([a], [b]) => kindLabel(a).localeCompare(kindLabel(b)))
    .map(([kind, types]) => ({
      value: kind,
      label: `${kindLabel(kind)} (${[...types.values()].reduce((s, n) => s + n, 0)})`,
      children: [...types.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([t, n]) => ({ value: t, label: `${t} (${n})` })),
    }));
}
