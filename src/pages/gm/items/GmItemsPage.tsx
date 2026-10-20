import React from 'react';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import { DeleteOutlined, EditOutlined, EyeInvisibleOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import {
  ACCESS_LABEL,
  type GmItem,
  type GmItemInput,
  type ItemAccess,
  type ItemStatus,
  LOOT_LABEL,
  type LootSite,
  STATUS_LABEL,
  createItem,
  deleteItem,
  getGmItem,
  listGmItems,
  updateItem,
} from '@app/api/items.api';
import { SHOP_TYPES } from '@app/generators/data/shops';
import { apiErrorMessage } from '@app/utils/api-error';
import { KIND_LABEL, ItemText, KindCell, useItemFilters } from '@app/pages/items-shared';

const opts = <T extends string>(labels: Record<T, string>) =>
  (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));
const ORIGINS = { starfinder: 'Starfinder', algol: 'Algol', homebrew: 'Homebrew' };
const REGIONS = { motavia: 'Motávia', dezolis: 'Dezolis', kolian: 'Kolian lands' };
const VISIBILITY = { public: 'Players can see', gm: 'GM only' };
const STATUS_COLOR: Record<ItemStatus, string> = { proposal: 'default', approved: 'blue', published: 'green' };
const ACCESS_COLOR: Partial<Record<ItemAccess, string>> = {
  free: 'green',
  order: 'cyan',
  spot: 'orange',
  institutional: 'blue',
  relic: 'magenta',
};

type Filters = {
  access?: ItemAccess;
  status?: ItemStatus;
  visibility?: 'public' | 'gm';
  origin?: string;
  region?: string;
  loot?: LootSite;
};

const EMPTY: Partial<GmItemInput> = {
  origin: 'homebrew',
  kind: 'other',
  level: 1,
  region: 'motavia',
  access: 'order',
  visibility: 'gm',
  status: 'proposal',
  tags: [],
  shops: [],
  loot: [],
};

/** Item editor: player fields and GM fields in separate tabs, plus the read-only audit. */
const ItemEditor: React.FC<{
  item: GmItem | 'new' | null;
  onClose: () => void;
  onSaved: (i: GmItem) => void;
  onDeleted: (id: number) => void;
}> = ({ item, onClose, onSaved, onDeleted }) => {
  const [form] = Form.useForm<Partial<GmItemInput>>();
  const [audit, setAudit] = React.useState<Record<string, string> | null>(null);
  const [saving, setSaving] = React.useState(false);
  const isNew = item === 'new';

  React.useEffect(() => {
    setAudit(null);
    if (!item) return;
    if (isNew) {
      form.setFieldsValue({ ...EMPTY, code: `HB-${Date.now().toString(36).toUpperCase()}` });
      return;
    }
    form.setFieldsValue(item);
    void getGmItem(item.id)
      .then((full) => setAudit(full.audit ?? null))
      .catch(() => setAudit(null));
  }, [item, isNew, form]);

  const save = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const saved = isNew ? await createItem(values) : await updateItem((item as GmItem).id, values);
      void message.success('Saved.');
      onSaved(saved);
    } catch (e) {
      void message.error(apiErrorMessage(e, 'Could not save.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      extra={
        <Space>
          {!isNew && item && (
            <Popconfirm
              onConfirm={async () => {
                try {
                  await deleteItem(item.id);
                  onDeleted(item.id);
                } catch (e) {
                  void message.error(apiErrorMessage(e, 'Could not delete.'));
                }
              }}
              title="Delete this item?"
            >
              <Button danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          )}
          <Button loading={saving} onClick={() => void save()} type="primary">
            Save
          </Button>
        </Space>
      }
      onClose={onClose}
      open={Boolean(item)}
      title={isNew ? 'New item' : item ? (item.localName ?? item.name) : ''}
      size={720}
    >
      <Form form={form} layout="vertical">
        <Tabs
          items={[
            {
              key: 'player',
              label: 'Player view',
              forceRender: true,
              children: (
                <>
                  <Alert
                    showIcon
                    style={{ marginBottom: 12 }}
                    type="info"
                    title="Players see these fields only when the item is visible to players and published."
                  />
                  <Space wrap>
                    <Form.Item label="Code" name="code" rules={[{ required: true }]}>
                      <Input disabled={!isNew} style={{ width: 140 }} />
                    </Form.Item>
                    <Form.Item label="Name (catalogue)" name="name" rules={[{ required: true }]}>
                      <Input style={{ width: 260 }} />
                    </Form.Item>
                    <Form.Item label="Motávia name" name="localName">
                      <Input style={{ width: 240 }} />
                    </Form.Item>
                  </Space>
                  <Space wrap>
                    <Form.Item label="Origin" name="origin">
                      <Select options={opts(ORIGINS)} style={{ width: 140 }} />
                    </Form.Item>
                    <Form.Item label="Kind" name="kind" rules={[{ required: true }]}>
                      <Select options={opts(KIND_LABEL)} style={{ width: 170 }} />
                    </Form.Item>
                    <Form.Item label="Group" name="group">
                      <Input style={{ width: 130 }} />
                    </Form.Item>
                    <Form.Item label="Category" name="category">
                      <Input style={{ width: 130 }} />
                    </Form.Item>
                    <Form.Item label="Level" name="level">
                      <InputNumber max={30} min={0} />
                    </Form.Item>
                  </Space>
                  <Space wrap>
                    <Form.Item label="Damage" name="damage">
                      <Input style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item label="Unit" name="unit">
                      <Input style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item label="Region" name="region">
                      <Select options={opts(REGIONS)} style={{ width: 150 }} />
                    </Form.Item>
                    <Form.Item
                      label="Local price (cr)"
                      name="localPrice"
                      tooltip="Leave empty while the price is not fixed"
                    >
                      <InputNumber min={0} />
                    </Form.Item>
                  </Space>
                  <Form.Item label="Description" name="description">
                    <Input.TextArea autoSize={{ minRows: 3, maxRows: 10 }} />
                  </Form.Item>
                  <Form.Item label="Rules" name="rules">
                    <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
                  </Form.Item>
                  <Space wrap>
                    <Form.Item label="Rules link" name="sourceUrl">
                      <Input style={{ width: 360 }} />
                    </Form.Item>
                    <Form.Item label="Availability note" name="availabilityNote">
                      <Input style={{ width: 280 }} />
                    </Form.Item>
                  </Space>
                </>
              ),
            },
            {
              key: 'gm',
              label: 'GM',
              forceRender: true,
              children: (
                <>
                  <Space wrap>
                    <Form.Item label="Visibility" name="visibility">
                      <Select options={opts(VISIBILITY)} style={{ width: 170 }} />
                    </Form.Item>
                    <Form.Item label="Status" name="status">
                      <Select options={opts(STATUS_LABEL)} style={{ width: 150 }} />
                    </Form.Item>
                    <Form.Item label="Access (canon)" name="access">
                      <Select options={opts(ACCESS_LABEL)} style={{ width: 220 }} />
                    </Form.Item>
                    <Form.Item label="Reference price (cr)" name="refPrice">
                      <InputNumber min={0} />
                    </Form.Item>
                  </Space>
                  <Form.Item label="Channel (who makes or sells it)" name="channel">
                    <Input />
                  </Form.Item>
                  <Form.Item label="Loot sites" name="loot">
                    <Select mode="multiple" options={opts(LOOT_LABEL)} />
                  </Form.Item>
                  <Form.Item
                    label="Always stocked by (shops)"
                    name="shops"
                    tooltip="Forces the item into these shop types"
                  >
                    <Select mode="multiple" options={SHOP_TYPES.map((t) => ({ value: t.key, label: t.label }))} />
                  </Form.Item>
                  <Form.Item label="Tags (local goods matching)" name="tags">
                    <Select mode="tags" />
                  </Form.Item>
                  <Space wrap>
                    <Form.Item label="Canon policies" name="policies">
                      <Input style={{ width: 280 }} />
                    </Form.Item>
                    <Form.Item label="Audit flags" name="flags">
                      <Input style={{ width: 340 }} />
                    </Form.Item>
                  </Space>
                  <Form.Item label="GM notes" name="gmNotes">
                    <Input.TextArea autoSize={{ minRows: 4, maxRows: 14 }} />
                  </Form.Item>
                </>
              ),
            },
            ...(audit
              ? [
                  {
                    key: 'audit',
                    label: 'Audit (read-only)',
                    children: (
                      <Descriptions
                        bordered
                        column={1}
                        items={Object.entries(audit).map(([k, v]) => ({ key: k, label: k, children: v }))}
                        size="small"
                      />
                    ),
                  },
                ]
              : []),
          ]}
        />
      </Form>
    </Drawer>
  );
};

/** GM catalogue: the source of the generators. Publish what players may see. */
export const GmItemsPage: React.FC = () => {
  const [items, setItems] = React.useState<GmItem[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState<Filters>({});
  const [selected, setSelected] = React.useState<number[]>([]);
  const [editing, setEditing] = React.useState<GmItem | 'new' | null>(null);
  const [busy, setBusy] = React.useState(false);

  const load = React.useCallback(() => {
    listGmItems(true)
      .then(setItems)
      .catch((e) => setError(apiErrorMessage(e, 'Could not load the catalogue.')));
  }, []);
  React.useEffect(load, [load]);

  const counts = React.useMemo(() => {
    const all = items ?? [];
    return {
      total: all.length,
      published: all.filter((i) => i.visibility === 'public' && i.status === 'published').length,
    };
  }, [items]);

  const bulk = async (patch: Partial<GmItemInput>, label: string) => {
    setBusy(true);
    try {
      const updated: GmItem[] = [];
      for (let k = 0; k < selected.length; k += 10) {
        updated.push(...(await Promise.all(selected.slice(k, k + 10).map((id) => updateItem(id, patch)))));
      }
      const byId = new Map(updated.map((u) => [u.id, u]));
      setItems((all) => (all ?? []).map((i) => byId.get(i.id) ?? i));
      setSelected([]);
      void message.success(`${label}: ${updated.length} item(s).`);
    } catch (e) {
      void message.error(apiErrorMessage(e, 'Bulk update failed.'));
    } finally {
      setBusy(false);
    }
  };

  const set =
    <K extends keyof Filters>(k: K) =>
    (v: Filters[K]) =>
      setFilters((f) => ({ ...f, [k]: v }));

  const { shown, controls } = useItemFilters(items, {
    searchText: (i) => `${i.code} ${i.name} ${i.localName ?? ''} ${i.policies ?? ''} ${i.channel ?? ''}`,
    predicate: (i) =>
      (!filters.access || i.access === filters.access) &&
      (!filters.status || i.status === filters.status) &&
      (!filters.visibility || i.visibility === filters.visibility) &&
      (!filters.origin || i.origin === filters.origin) &&
      (!filters.region || i.region === filters.region) &&
      (!filters.loot || i.loot.includes(filters.loot)),
    extra: (
      <>
        <Select
          allowClear
          onChange={set('access')}
          options={opts(ACCESS_LABEL)}
          placeholder="Access"
          style={{ width: 200 }}
          value={filters.access}
        />
        <Select
          allowClear
          onChange={set('status')}
          options={opts(STATUS_LABEL)}
          placeholder="Status"
          style={{ width: 130 }}
          value={filters.status}
        />
        <Select
          allowClear
          onChange={set('visibility')}
          options={opts(VISIBILITY)}
          placeholder="Visibility"
          style={{ width: 160 }}
          value={filters.visibility}
        />
        <Select
          allowClear
          onChange={set('origin')}
          options={opts(ORIGINS)}
          placeholder="Origin"
          style={{ width: 130 }}
          value={filters.origin}
        />
        <Select
          allowClear
          onChange={set('region')}
          options={opts(REGIONS)}
          placeholder="Region"
          style={{ width: 140 }}
          value={filters.region}
        />
        <Select
          allowClear
          onChange={set('loot')}
          options={opts(LOOT_LABEL)}
          placeholder="Loot site"
          style={{ width: 220 }}
          value={filters.loot}
        />
      </>
    ),
  });

  return (
    <>
      <PageTitle>GM - Items</PageTitle>
      <Space orientation="vertical" size={12} style={{ width: '100%' }}>
        <Space style={{ justifyContent: 'space-between', width: '100%' }} wrap>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Items catalogue
          </Typography.Title>
          <Button icon={<PlusOutlined />} onClick={() => setEditing('new')} type="primary">
            New item
          </Button>
        </Space>
        <Typography.Text type="secondary">
          {counts.total} items · {counts.published} visible to players. The generators read this catalogue; only items
          visible to players <b>and</b> published appear in the players&apos; Items page.
        </Typography.Text>
        {error && <Alert showIcon type="error" title={error} />}
        <Card size="small">
          {controls}
          {selected.length > 0 && (
            <Space style={{ marginBottom: 12 }} wrap>
              <Typography.Text>{selected.length} selected:</Typography.Text>
              <Button
                disabled={busy}
                icon={<EyeOutlined />}
                onClick={() => void bulk({ visibility: 'public', status: 'published' }, 'Published')}
                size="small"
              >
                Publish to players
              </Button>
              <Button disabled={busy} onClick={() => void bulk({ status: 'approved' }, 'Approved')} size="small">
                Mark approved
              </Button>
              <Button
                disabled={busy}
                icon={<EyeInvisibleOutlined />}
                onClick={() => void bulk({ visibility: 'gm' }, 'Hidden')}
                size="small"
              >
                GM only
              </Button>
            </Space>
          )}
          <Table
            columns={[
              {
                title: 'Code',
                dataIndex: 'code',
                width: 110,
                sorter: (a: GmItem, b: GmItem) => a.code.localeCompare(b.code),
              },
              {
                title: 'Item',
                dataIndex: 'name',
                render: (n: string, i: GmItem) => (
                  <Space orientation="vertical" size={0}>
                    <span>{i.localName ?? n}</span>
                    {i.localName && (
                      <Typography.Text style={{ fontSize: 12 }} type="secondary">
                        {n}
                      </Typography.Text>
                    )}
                  </Space>
                ),
              },
              { title: 'Kind', dataIndex: 'kind', render: (_: string, i: GmItem) => <KindCell item={i} /> },
              { title: 'Lvl', dataIndex: 'level', width: 60, sorter: (a: GmItem, b: GmItem) => a.level - b.level },
              {
                title: 'Access',
                dataIndex: 'access',
                render: (a: ItemAccess) => <Tag color={ACCESS_COLOR[a]}>{ACCESS_LABEL[a]}</Tag>,
              },
              {
                title: 'Players',
                key: 'players',
                render: (_: unknown, i: GmItem) => (
                  <Space size={2} wrap>
                    <Tag color={STATUS_COLOR[i.status]}>{STATUS_LABEL[i.status]}</Tag>
                    {i.visibility === 'gm' ? (
                      <Tag icon={<EyeInvisibleOutlined />}>GM</Tag>
                    ) : (
                      <Tag icon={<EyeOutlined />}>Public</Tag>
                    )}
                  </Space>
                ),
              },
              {
                title: 'Loot',
                dataIndex: 'loot',
                render: (l: LootSite[]) => (l.length ? l.join(', ') : '—'),
              },
              {
                title: '',
                key: 'edit',
                width: 50,
                render: (_: unknown, i: GmItem) => (
                  <Button
                    aria-label={`Edit ${i.name}`}
                    icon={<EditOutlined />}
                    onClick={() => setEditing(i)}
                    size="small"
                    type="text"
                  />
                ),
              },
            ]}
            dataSource={shown}
            expandable={{
              expandedRowRender: (i: GmItem) => (
                <Space orientation="vertical" size={6}>
                  <ItemText description={i.description} rules={i.rules} sourceUrl={i.sourceUrl} />
                  {i.channel && (
                    <Typography.Text style={{ fontSize: 12 }}>
                      <b>Channel:</b> {i.channel}
                    </Typography.Text>
                  )}
                  {i.gmNotes && (
                    <Typography.Paragraph style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }} type="secondary">
                      {i.gmNotes}
                    </Typography.Paragraph>
                  )}
                </Space>
              ),
            }}
            loading={!items && !error}
            pagination={{ pageSize: 50, showSizeChanger: true }}
            rowKey="id"
            rowSelection={{ selectedRowKeys: selected, onChange: (keys) => setSelected(keys as number[]) }}
            scroll={{ x: 860 }}
            size="small"
          />
        </Card>
      </Space>
      <ItemEditor
        item={editing}
        onClose={() => setEditing(null)}
        onDeleted={(id) => {
          setItems((all) => (all ?? []).filter((i) => i.id !== id));
          setEditing(null);
        }}
        onSaved={(saved) => {
          setItems((all) => {
            const list = all ?? [];
            return list.some((i) => i.id === saved.id)
              ? list.map((i) => (i.id === saved.id ? saved : i))
              : [...list, saved];
          });
          setEditing(null);
        }}
      />
    </>
  );
};

export default GmItemsPage;
