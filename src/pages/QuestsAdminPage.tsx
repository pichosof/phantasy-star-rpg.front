/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/rpg/QuestsAdminPage.tsx
import React from 'react';
import { Badge, Divider, Drawer, Empty, Popconfirm, Select, Space, Tag, Typography, message } from 'antd';

import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { Table } from '@app/components/common/Table/Table';
import { Input, TextArea } from '@app/components/common/inputs/Input/Input';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Switch } from '@app/components/common/Switch/Switch';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { Tabs } from '@app/components/common/Tabs/Tabs';
import { useResponsive } from '@app/hooks/useResponsive';

import { createQuest, deleteQuest, listQuestsPublic, setQuestVisibility, updateQuest } from '@app/api/quests.api';
import { apiErrorMessage } from '../utils/api-error';
import type { Quest, QuestStatus } from '@app/api/quests.api';
import { m0, w100, bold700, bold800, spaceBetween, dividerMd, tableWrap, mutedSm } from '@app/styles/styleUtils';
import * as S from './QuestsAdminPage.styles';

const GM_KEY_STORAGE = 'gm_api_key';

function isQuestVisible(q: Quest) {
  return (q.visible ?? true) === true;
}

function formatDate(v?: string | null) {
  if (!v) return '-';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString();
}

const statusOptions: { value: QuestStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

export const QuestsAdminPage: React.FC = () => {
  const { mobileOnly } = useResponsive();
  const isGM = Boolean(localStorage.getItem(GM_KEY_STORAGE));

  const [items, setItems] = React.useState<Quest[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [search, setSearch] = React.useState('');

  const [creating, setCreating] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newStatus, setNewStatus] = React.useState<QuestStatus>('active');
  const [newDescription, setNewDescription] = React.useState('');
  const [newReward, setNewReward] = React.useState('');

  const [openId, setOpenId] = React.useState<number | null>(null);
  const openQuest = React.useMemo(() => items.find((x) => x.id === openId) ?? null, [items, openId]);

  const [editTitle, setEditTitle] = React.useState('');
  const [editStatus, setEditStatus] = React.useState<QuestStatus>('active');
  const [editDescription, setEditDescription] = React.useState('');
  const [editReward, setEditReward] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listQuestsPublic();
      setItems(data);
    } catch (e) {
      console.error(e);
      message.error(apiErrorMessage(e, 'Failed to load quests'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    if (!openQuest) return;
    setEditTitle(openQuest.title ?? '');
    setEditStatus((openQuest.status ?? 'active') as QuestStatus);
    setEditDescription(openQuest.description ?? '');
    setEditReward(openQuest.reward ?? '');
  }, [openQuest?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = search.trim().toLowerCase();
  const filtered = React.useMemo(() => {
    return items
      .filter((x) => {
        if (!q) return true;
        const t = (x.title ?? '').toLowerCase();
        const d = (x.description ?? '').toLowerCase();
        const r = (x.reward ?? '').toLowerCase();
        return t.includes(q) || d.includes(q) || r.includes(q);
      })
      .sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
  }, [items, q]);

  const stats = React.useMemo(() => {
    const total = items.length;
    const visible = items.filter(isQuestVisible).length;
    const hidden = total - visible;
    const active = items.filter((x) => (x.status ?? 'active') === 'active').length;
    const completed = items.filter((x) => x.status === 'completed').length;
    const failed = items.filter((x) => x.status === 'failed').length;
    const withReward = items.filter((x) => Boolean((x.reward ?? '').trim())).length;
    return { total, visible, hidden, active, completed, failed, withReward };
  }, [items]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return message.warning('Please provide a title');

    try {
      const created = await createQuest({
        title,
        status: newStatus,
        description: newDescription.trim() ? newDescription.trim() : null,
        reward: newReward.trim() ? newReward.trim() : null,
      });

      setCreating(false);
      setNewTitle('');
      setNewStatus('active');
      setNewDescription('');
      setNewReward('');

      setItems((prev) => [...prev, created].sort((a, b) => (a.id ?? 0) - (b.id ?? 0)));
      message.success('Quest created');
    } catch (e) {
      console.error(e);
      message.error(apiErrorMessage(e, 'Failed to create quest (GM key?)'));
    }
  }

  async function toggleVisible(qt: Quest) {
    const next = !isQuestVisible(qt);

    // otimista
    setItems((prev) => prev.map((x) => (x.id === qt.id ? { ...x, visible: next } : x)));

    try {
      await setQuestVisibility(qt.id, next);
      message.success(next ? 'Quest visible to players' : 'Quest hidden from players');
    } catch (e) {
      console.error(e);
      message.error(apiErrorMessage(e, 'Failed to change visibility (GM key?)'));
      await load();
    }
  }

  async function saveEdit() {
    if (!openQuest) return;

    const title = editTitle.trim();
    if (!title) return message.warning('Title cannot be empty');

    try {
      await updateQuest(openQuest.id, {
        title,
        status: editStatus,
        description: editDescription.trim() ? editDescription.trim() : null,
        reward: editReward.trim() ? editReward.trim() : null,
      });

      setItems((prev) =>
        prev.map((x) =>
          x.id === openQuest.id
            ? {
                ...x,
                title,
                status: editStatus,
                description: editDescription.trim() ? editDescription.trim() : null,
                reward: editReward.trim() ? editReward.trim() : null,
              }
            : x,
        ),
      );

      message.success('Quest updated');
    } catch (e) {
      console.error(e);
      message.error(apiErrorMessage(e, 'Failed to update quest (GM key?)'));
    }
  }

  async function removeQuest(id: number) {
    try {
      await deleteQuest(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      if (openId === id) setOpenId(null);
      message.success('Quest removed');
    } catch (e) {
      console.error(e);
      message.error(apiErrorMessage(e, 'Failed to remove quest (GM key?)'));
    }
  }

  function closeDrawer() {
    setOpenId(null);
  }

  if (!isGM) {
    return (
      <>
        <PageTitle>Quests (GM)</PageTitle>
        <Card density="comfy">
          <Typography.Title level={5} style={S.restrictedTitle}>
            Restricted access
          </Typography.Title>
          <Typography.Text type="secondary">
            This page is only visible and functional when GM mode is enabled (GM API key in the browser).
          </Typography.Text>
        </Card>
      </>
    );
  }

  // ====== UI helpers (sem criar componente Drawer separado!) ======

  const Header: React.FC = () => (
    <Card density="dense">
      <Space orientation="vertical" size={8} style={w100}>
        <Typography.Title level={5} style={m0}>
          Admin — Quests
        </Typography.Title>

        <Typography.Text type="secondary">
          Manage quests (status, visibility and content). Completed/failed quests remain available for city links.
        </Typography.Text>

        <Divider style={dividerMd} />

        <Space wrap style={spaceBetween}>
          <Space wrap size={10}>
            <Tag>All: {stats.total}</Tag>
            <Tag color="green">Visible: {stats.visible}</Tag>
            <Tag color="red">Hidden: {stats.hidden}</Tag>
            <Tag>Active: {stats.active}</Tag>
            <Tag color="gold">Completed: {stats.completed}</Tag>
            <Tag color="volcano">Failed: {stats.failed}</Tag>
            <Tag color="cyan">Reward: {stats.withReward}</Tag>
          </Space>

          <Space wrap>
            <Input
              allowClear
              placeholder="Search (title/description/reward)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={S.searchField}
            />
            <Button onClick={() => setCreating((v) => !v)}>{creating ? 'Close' : 'Create quest'}</Button>
          </Space>
        </Space>

        {creating && (
          <>
            <Divider style={dividerMd} />
            <form onSubmit={(e) => void onCreate(e)} style={S.createForm}>
              <Input placeholder="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />

              <Space wrap>
                <span>Status:</span>
                <Select
                  style={S.statusSelect}
                  value={newStatus}
                  onChange={(v) => setNewStatus(v as QuestStatus)}
                  options={statusOptions}
                />
              </Space>

              <TextArea
                placeholder="Description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={mobileOnly ? 6 : 5}
              />

              <Input placeholder="Reward (optional)" value={newReward} onChange={(e) => setNewReward(e.target.value)} />

              <Space>
                <Button type="primary" htmlType="submit">
                  Create
                </Button>
                <Button onClick={() => setCreating(false)}>Cancel</Button>
              </Space>
            </form>
          </>
        )}
      </Space>
    </Card>
  );

  const MobileCards: React.FC = () => {
    if (loading) return <Spinner />;

    if (!filtered.length) {
      return (
        <Card density="comfy">
          <Empty description="No quests found." />
        </Card>
      );
    }

    return (
      <div style={S.mobileCardsGrid}>
        {filtered.map((qt) => (
          <Card
            key={qt.id}
            density="dense"
            title={
              <Space wrap size={8}>
                <span style={bold700}>{qt.title}</span>
                <Tag>{qt.status ?? 'active'}</Tag>
                {isQuestVisible(qt) ? <Tag color="green">Visible</Tag> : <Tag color="red">Hidden</Tag>}
                {qt.reward?.trim() ? <Tag color="gold">Reward</Tag> : null}
              </Space>
            }
            extra={
              <Button size="small" onClick={() => setOpenId(qt.id)}>
                Admin
              </Button>
            }
          >
            <Typography.Paragraph style={m0} ellipsis={{ rows: 3 }}>
              {qt.description?.trim() || '—'}
            </Typography.Paragraph>

            <Divider style={dividerMd} />

            <Space wrap size={14}>
              <Space size={8}>
                <span style={mutedSm}>Visible:</span>
                <Switch checked={isQuestVisible(qt)} onChange={() => void toggleVisible(qt)} />
              </Space>
              <Space size={8}>
                <span style={mutedSm}>Status:</span>
                <Tag>{qt.status ?? 'active'}</Tag>
              </Space>
            </Space>
          </Card>
        ))}
      </div>
    );
  };

  const DesktopTable: React.FC = () => (
    <Card density="dense" title="Admin — Quests">
      <div style={tableWrap}>
        <Table
          rowKey="id"
          dataSource={filtered}
          loading={loading}
          style={S.adminTable}
          scroll={{ x: 1020 }}
          onRow={(qt: Quest) => ({
            onClick: () => setOpenId(qt.id),
          })}
          columns={[
            { title: '#', dataIndex: 'id', key: 'id', width: 70 },
            {
              title: 'Quest',
              key: 'title',
              render: (_: any, qt: Quest) => (
                <Space orientation="vertical" size={2} style={w100}>
                  <Space size={8} wrap>
                    <span style={bold700}>{qt.title}</span>
                    <Tag>{qt.status ?? 'active'}</Tag>
                    {isQuestVisible(qt) ? <Tag color="green">Visible</Tag> : <Tag color="red">Hidden</Tag>}
                    {qt.reward?.trim() ? <Tag color="gold">Reward</Tag> : null}
                  </Space>
                  <Typography.Text type="secondary" ellipsis>
                    {qt.description?.trim() ? qt.description : '—'}
                  </Typography.Text>
                </Space>
              ),
            },
            {
              title: 'Visible',
              key: 'visible',
              width: 110,
              render: (_: any, qt: Quest) => (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Switch checked={isQuestVisible(qt)} onChange={() => void toggleVisible(qt)} />
                </span>
              ),
            },
            {
              title: 'Created',
              dataIndex: 'createdAt',
              key: 'createdAt',
              width: 180,
              render: (v: string) => formatDate(v),
            },
            {
              title: 'Updated',
              dataIndex: 'updatedAt',
              key: 'updatedAt',
              width: 180,
              render: (v: string) => formatDate(v),
            },
          ]}
        />
      </div>

      <Typography.Text type="secondary" style={S.helperText}>
        Click a row to open the admin panel.
      </Typography.Text>

      {!filtered.length && !loading && (
        <Card density="comfy" style={S.helperCard}>
          <Empty description="No quests found." />
        </Card>
      )}
    </Card>
  );

  return (
    <>
      <PageTitle>Quests (GM)</PageTitle>

      <Header />

      {mobileOnly ? <MobileCards /> : <DesktopTable />}

      {/* ✅ Drawer INLINE (não vira componente interno) */}
      {openQuest && (
        <Drawer
          open={true}
          onClose={closeDrawer}
          size={mobileOnly ? '100%' : 720}
          title={
            <Space wrap size={8}>
              <span style={bold800}>Edit · {openQuest.title}</span>
              <Tag>{openQuest.status ?? 'active'}</Tag>
              {isQuestVisible(openQuest) ? <Tag color="green">Visible</Tag> : <Tag color="red">Hidden</Tag>}
              {openQuest.reward?.trim() ? <Tag color="gold">Reward</Tag> : null}
              <Badge count={`#${openQuest.id}`} />
            </Space>
          }
          extra={
            <Space>
              <Popconfirm
                title="Remove this quest? This will delete it permanently."
                okText="Remove"
                cancelText="Cancel"
                onConfirm={() => void removeQuest(openQuest.id)}
              >
                <Button danger>Remove</Button>
              </Popconfirm>
              <Button type="primary" onClick={() => void saveEdit()}>
                Save
              </Button>
            </Space>
          }
        >
          <Tabs defaultActiveKey="edit">
            <Tabs.TabPane tab="Edit" key="edit">
              <Card density="dense" title="Data">
                <Space orientation="vertical" size={10} style={w100}>
                  <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title" />

                  <Space wrap>
                    <span>Status:</span>
                    <Select
                      style={S.drawerStatusSelect}
                      value={editStatus}
                      onChange={(v) => setEditStatus(v as QuestStatus)}
                      options={statusOptions}
                    />
                  </Space>

                  <TextArea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Description"
                    rows={mobileOnly ? 12 : 10}
                  />

                  <Input
                    value={editReward}
                    onChange={(e) => setEditReward(e.target.value)}
                    placeholder="Reward (optional)"
                  />

                  <Divider style={S.drawerDivider} />

                  <Space style={spaceBetween}>
                    <Typography.Text>Visible to players</Typography.Text>
                    <Switch checked={isQuestVisible(openQuest)} onChange={() => void toggleVisible(openQuest)} />
                  </Space>

                  <Typography.Text type="secondary">
                    Created: {formatDate((openQuest as any).createdAt)}
                    <br />
                    Updated: {formatDate((openQuest as any).updatedAt)}
                  </Typography.Text>
                </Space>
              </Card>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Preview" key="preview">
              <Space orientation="vertical" size={10} style={w100}>
                <Card density="comfy" title="Description">
                  <Typography.Paragraph style={S.previewParagraph}>
                    {(editDescription ?? '').trim() ? (editDescription ?? '').trim() : '—'}
                  </Typography.Paragraph>
                </Card>

                <Card density="comfy" title="Reward">
                  <Typography.Paragraph style={S.previewParagraph}>
                    {(editReward ?? '').trim() ? (editReward ?? '').trim() : '—'}
                  </Typography.Paragraph>
                </Card>
              </Space>
            </Tabs.TabPane>
          </Tabs>

          {loading && <Spinner />}
        </Drawer>
      )}
    </>
  );
};

export default QuestsAdminPage;
