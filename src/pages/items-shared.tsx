import React from 'react';
import { Cascader, Input, InputNumber, Select, Space, Typography } from 'antd';
import { type Classified, DAMAGE_LABEL, type Damage, typeTree } from '@app/items/classify';

export const KIND_LABEL: Record<string, string> = {
  weapon: 'Weapon',
  armor: 'Armor',
  armorUpgrade: 'Armor upgrade',
  tech: 'Technology',
  other: 'Gear & services',
  cybernetic: 'Cybernetics',
  biotech: 'Biotech',
  hybrid: 'Hybrid',
  personalUpgrade: 'Personal upgrade',
  local: 'Local goods',
};

export const kindLabel = (k: string) => KIND_LABEL[k] ?? k;

export const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Kind and type, e.g. "Weapon · Melee (analog) · Kinetic". */
export const KindCell: React.FC<{ item: Classified }> = ({ item }) => {
  const damage = item.damageType;
  return (
    <Space orientation="vertical" size={0}>
      <span>{kindLabel(item.kind)}</span>
      <Typography.Text style={{ fontSize: 12 }} type="secondary">
        {item.type}
        {damage ? ` · ${DAMAGE_LABEL[damage]}` : ''}
      </Typography.Text>
    </Space>
  );
};

type Filterable = Classified & {
  name: string;
  level: number;
  localName?: string | null;
  description?: string | null;
  code?: string;
};

/**
 * Shared catalogue filters: search, kind → type (cascader with counts), damage (weapons)
 * and level range. Pages add their own filters through `extra` and `predicate`.
 */
export function useItemFilters<T extends Filterable>(
  items: T[] | null,
  opts: { searchText?: (i: T) => string; extra?: React.ReactNode; predicate?: (i: T) => boolean } = {},
) {
  const [q, setQ] = React.useState('');
  const [path, setPath] = React.useState<string[]>([]);
  const [damage, setDamage] = React.useState<Damage | undefined>();
  const [minLevel, setMinLevel] = React.useState<number | null>(null);
  const [maxLevel, setMaxLevel] = React.useState<number | null>(null);

  const tree = React.useMemo(() => typeTree(items ?? [], kindLabel), [items]);
  const [kind, type] = path;
  const showDamage = !kind || kind === 'weapon';

  const shown = React.useMemo(() => {
    const t = normalize(q.trim());
    const text = opts.searchText ?? ((i: T) => `${i.code ?? ''} ${i.name} ${i.localName ?? ''} ${i.description ?? ''}`);
    return (items ?? []).filter(
      (i) =>
        (!kind || i.kind === kind) &&
        (!type || i.type === type) &&
        (!damage || i.damageType === damage) &&
        (minLevel == null || i.level >= minLevel) &&
        (maxLevel == null || i.level <= maxLevel) &&
        (!t || normalize(text(i)).includes(t)) &&
        (!opts.predicate || opts.predicate(i)),
    );
  }, [items, q, kind, type, damage, minLevel, maxLevel, opts]);

  const controls = (
    <Space style={{ marginBottom: 12 }} wrap>
      <Input.Search allowClear onChange={(e) => setQ(e.target.value)} placeholder="Search" style={{ width: 220 }} />
      <Cascader
        allowClear
        changeOnSelect
        expandTrigger="hover"
        onChange={(v) => setPath((v as string[] | undefined) ?? [])}
        options={tree}
        placeholder="Kind / type"
        style={{ minWidth: 240 }}
        value={path}
      />
      {showDamage && (
        <Select
          allowClear
          onChange={setDamage}
          options={(Object.keys(DAMAGE_LABEL) as Damage[]).map((d) => ({ value: d, label: DAMAGE_LABEL[d] }))}
          placeholder="Damage"
          style={{ width: 130 }}
          value={damage}
        />
      )}
      <Space size={4}>
        <Typography.Text type="secondary">Level</Typography.Text>
        <InputNumber max={30} min={0} onChange={setMinLevel} placeholder="min" style={{ width: 70 }} value={minLevel} />
        <InputNumber max={30} min={0} onChange={setMaxLevel} placeholder="max" style={{ width: 70 }} value={maxLevel} />
      </Space>
      {opts.extra}
      <Typography.Text type="secondary">{shown.length} shown</Typography.Text>
    </Space>
  );
  return { shown, controls };
}

/** Description + rules block shared by the player and GM catalogues. */
export const ItemText: React.FC<{
  description: string | null;
  rules: string | null;
  sourceUrl: string | null;
}> = ({ description, rules, sourceUrl }) => (
  <Space orientation="vertical" size={4} style={{ maxWidth: 760 }}>
    {rules && (
      <Typography.Text style={{ fontSize: 12 }} type="secondary">
        {rules}
      </Typography.Text>
    )}
    <Typography.Paragraph style={{ margin: 0 }}>{description || 'No description yet.'}</Typography.Paragraph>
    {sourceUrl && (
      <Typography.Link href={sourceUrl} rel="noopener noreferrer" style={{ fontSize: 12 }} target="_blank">
        Full rules on Archives of Nethys
      </Typography.Link>
    )}
  </Space>
);
