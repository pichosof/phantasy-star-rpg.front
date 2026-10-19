import React from 'react';
import { Alert, Button, Checkbox, Input, InputNumber, Space, Spin, Table, Tooltip, Typography, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { PlayersApi } from '@app/api/rpg.api';
import { type SessionReward, getSessionRewards, setSessionRewards } from '@app/api/progress.api';
import {
  type CharacterSheet,
  getCharacterSheet,
  listCharacterSheets,
  updateCharacterSheet,
} from '@app/api/character-sheets.api';
import type { Player } from '@app/types/rpg';
import { apiErrorMessage } from '@app/utils/api-error';

type Row = { playerId: number; name: string; visible: boolean; xp: number; credits: number; note: string };

const norm = (s: string) => s.trim().toLowerCase();

/**
 * GM: XP and credits of every player for this session. Saving replaces this session's
 * awards; "Add to Starfinder sheets" applies only the difference to each matching sheet.
 */
export const SessionRewardsPanel: React.FC<{ sessionId: number }> = ({ sessionId }) => {
  const [rows, setRows] = React.useState<Row[] | null>(null);
  const [saved, setSaved] = React.useState<Map<number, { xp: number; credits: number }>>(new Map());
  const [sheets, setSheets] = React.useState<CharacterSheet[]>([]);
  const [applySheets, setApplySheets] = React.useState(true);
  const [allXp, setAllXp] = React.useState<number | null>(null);
  const [allCredits, setAllCredits] = React.useState<number | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    setRows(null);
    Promise.all([PlayersApi.list(), getSessionRewards(sessionId), listCharacterSheets('starfinder').catch(() => [])])
      .then(([players, rewards, sf]) => {
        if (!alive) return;
        const byPlayer = new Map(rewards.map((r) => [r.playerId, r]));
        setSaved(new Map(rewards.map((r) => [r.playerId, { xp: r.xp, credits: r.credits }])));
        setSheets(sf);
        setRows(
          [...players]
            .sort(
              (a: Player, b: Player) =>
                Number(b.visible !== false) - Number(a.visible !== false) || a.name.localeCompare(b.name),
            )
            .map((p) => {
              const r = byPlayer.get(Number(p.id));
              return {
                playerId: Number(p.id),
                name: p.name,
                visible: p.visible !== false,
                xp: r?.xp ?? 0,
                credits: r?.credits ?? 0,
                note: r?.note ?? '',
              };
            }),
        );
      })
      .catch((e) => alive && setError(apiErrorMessage(e, 'Could not load the rewards.')));
    return () => {
      alive = false;
    };
  }, [sessionId]);

  const sheetOf = (name: string) => sheets.find((s) => norm(s.name) === norm(name));
  const patch = (id: number, p: Partial<Row>) =>
    setRows((rs) => rs?.map((r) => (r.playerId === id ? { ...r, ...p } : r)) ?? rs);

  async function save() {
    if (!rows) return;
    setSaving(true);
    try {
      const rewards: SessionReward[] = rows.map((r) => ({
        playerId: r.playerId,
        xp: r.xp || 0,
        credits: r.credits || 0,
        note: r.note.trim() || null,
      }));
      await setSessionRewards(sessionId, rewards);

      const updated: string[] = [];
      if (applySheets) {
        for (const r of rows) {
          const before = saved.get(r.playerId) ?? { xp: 0, credits: 0 };
          const dXp = (r.xp || 0) - before.xp;
          const dCr = (r.credits || 0) - before.credits;
          const match = sheetOf(r.name);
          if (!match || (dXp === 0 && dCr === 0)) continue;
          const sheet = await getCharacterSheet(match.id);
          const d = sheet.data as { xpEarned?: number; credits?: number };
          await updateCharacterSheet(sheet.id, {
            data: { ...sheet.data, xpEarned: (d.xpEarned ?? 0) + dXp, credits: (d.credits ?? 0) + dCr },
          });
          updated.push(r.name);
        }
      }
      setSaved(new Map(rows.map((r) => [r.playerId, { xp: r.xp || 0, credits: r.credits || 0 }])));
      void message.success(updated.length ? `Rewards saved. Sheets updated: ${updated.join(', ')}.` : 'Rewards saved.');
    } catch (e) {
      void message.error(apiErrorMessage(e, 'Could not save the rewards.'));
    } finally {
      setSaving(false);
    }
  }

  if (error) return <Alert showIcon type="error" message={error} />;
  if (!rows) return <Spin />;

  return (
    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
      <Typography.Text type="secondary">
        XP and credits earned in this session. Players see them in their profile (Progress tab). Negative credits are
        expenses.
      </Typography.Text>
      <Space wrap>
        <InputNumber onChange={setAllXp} placeholder="XP for all" style={{ width: 130 }} value={allXp} />
        <InputNumber onChange={setAllCredits} placeholder="Credits for all" style={{ width: 150 }} value={allCredits} />
        <Button
          disabled={allXp === null && allCredits === null}
          onClick={() =>
            setRows(
              (rs) =>
                rs?.map((r) => (r.visible ? { ...r, xp: allXp ?? r.xp, credits: allCredits ?? r.credits } : r)) ?? rs,
            )
          }
        >
          Apply to visible players
        </Button>
      </Space>
      <Table
        columns={[
          {
            title: 'Player',
            dataIndex: 'name',
            render: (name: string, r: Row) => (
              <Space orientation="vertical" size={0}>
                <Typography.Text type={r.visible ? undefined : 'secondary'}>
                  {name}
                  {r.visible ? '' : ' (hidden)'}
                </Typography.Text>
                {sheetOf(name) && (
                  <Typography.Text style={{ fontSize: 12 }} type="secondary">
                    Starfinder sheet
                  </Typography.Text>
                )}
              </Space>
            ),
          },
          {
            title: 'XP',
            width: 110,
            render: (_: unknown, r: Row) => (
              <InputNumber onChange={(v) => patch(r.playerId, { xp: v ?? 0 })} style={{ width: 100 }} value={r.xp} />
            ),
          },
          {
            title: 'Credits',
            width: 120,
            render: (_: unknown, r: Row) => (
              <InputNumber
                onChange={(v) => patch(r.playerId, { credits: v ?? 0 })}
                style={{ width: 110 }}
                value={r.credits}
              />
            ),
          },
          {
            title: 'Note',
            render: (_: unknown, r: Row) => (
              <Input
                maxLength={300}
                onChange={(e) => patch(r.playerId, { note: e.target.value })}
                placeholder="Optional"
                value={r.note}
              />
            ),
          },
        ]}
        dataSource={rows}
        pagination={false}
        rowKey="playerId"
        scroll={{ x: 520 }}
        size="small"
      />
      <Space wrap>
        <Button icon={<SaveOutlined />} loading={saving} onClick={() => void save()} type="primary">
          Save rewards
        </Button>
        <Tooltip title="Adds only what changed since the last save to xpEarned and credits of the Starfinder sheet with the same name.">
          <Checkbox checked={applySheets} onChange={(e) => setApplySheets(e.target.checked)}>
            Add to Starfinder sheets
          </Checkbox>
        </Tooltip>
      </Space>
    </Space>
  );
};
