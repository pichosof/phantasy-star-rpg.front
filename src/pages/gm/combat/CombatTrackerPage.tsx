import React from 'react';
import { Alert, Button, Card, Input, Modal, Popconfirm, Select, Space, Tag, Tooltip, Typography, message } from 'antd';
import {
  CaretLeftOutlined,
  CaretRightOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  FlagOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  SaveOutlined,
  UndoOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { IconLabel } from '@app/components/common/AppIcon/AppIcon';
import {
  type Combatant,
  type Encounter,
  createEncounter,
  deleteEncounter,
  listEncounters,
} from '@app/api/encounters.api';
import { getCharacterSheet, updateCharacterSheet } from '@app/api/character-sheets.api';
import { type Session, listSessions } from '@app/api/sessions.api';
import { apiErrorMessage } from '@app/utils/api-error';
import * as E from './combat-engine';
import { AddCombatantsModal, type MonsterStats } from './AddCombatantsModal';
import { CombatantCard, type CombatantActions } from './CombatantCard';
import { forgetLocalEncounter, type SyncStatus, useEncounterSync } from './useEncounterSync';
import * as S from './CombatTracker.styles';

const CURRENT_KEY = 'picho.combat.current';

const readCurrent = (): number | null => {
  try {
    const v = Number(localStorage.getItem(CURRENT_KEY));
    return Number.isInteger(v) && v > 0 ? v : null;
  } catch {
    return null;
  }
};
const writeCurrent = (id: number | null) => {
  try {
    if (id === null) localStorage.removeItem(CURRENT_KEY);
    else localStorage.setItem(CURRENT_KEY, String(id));
  } catch {
    // remembering the last encounter is only a convenience
  }
};

const SYNC_TEXT: Record<SyncStatus, { text: string; tone: 'ok' | 'busy' | 'warn' | 'bad' }> = {
  loading: { text: 'Loading…', tone: 'busy' },
  saved: { text: 'Saved', tone: 'ok' },
  pending: { text: 'Saving…', tone: 'busy' },
  saving: { text: 'Saving…', tone: 'busy' },
  offline: { text: 'Offline — kept on this device, will sync', tone: 'warn' },
  conflict: { text: 'Changed on another device', tone: 'bad' },
  error: { text: 'Could not load', tone: 'bad' },
};

/** Most recent stats used per bestiary entry, across all encounters. */
function monsterStatsHistory(encounters: Encounter[]): Map<number, MonsterStats> {
  const map = new Map<number, MonsterStats>();
  const newestFirst = [...encounters].sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
  for (const e of newestFirst) {
    for (const c of e.state?.combatants ?? []) {
      if (c.kind !== 'monster' || !c.refId || map.has(c.refId)) continue;
      map.set(c.refId, {
        hp: c.hp.max,
        sp: c.sp.max,
        rp: c.rp.max,
        eac: c.eac ?? null,
        kac: c.kac ?? null,
        initBonus: c.initBonus,
      });
    }
  }
  return map;
}

const time = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const CombatTrackerPage: React.FC = () => {
  const [encounters, setEncounters] = React.useState<Encounter[]>([]);
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [currentId, setCurrentId] = React.useState<number | null>(readCurrent);
  const [adding, setAdding] = React.useState(false);
  const [note, setNote] = React.useState('');
  const [applying, setApplying] = React.useState(false);

  const sync = useEncounterSync(currentId);
  const { state, meta, update } = sync;

  const refreshList = React.useCallback(async () => {
    try {
      const list = await listEncounters();
      setEncounters(list);
      return list;
    } catch {
      return null;
    }
  }, []);

  React.useEffect(() => {
    void refreshList().then((list) => {
      if (!list) return;
      setCurrentId((id) => {
        if (id !== null && list.some((e) => e.id === id)) return id;
        return list.find((e) => e.status === 'active')?.id ?? list[0]?.id ?? null;
      });
    });
    listSessions()
      .then((s) => setSessions([...s].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))))
      .catch(() => setSessions([]));
  }, [refreshList]);

  React.useEffect(() => writeCurrent(currentId), [currentId]);

  // Keep the selector label in sync with renames made here.
  React.useEffect(() => {
    if (!meta || currentId === null) return;
    setEncounters((list) => list.map((e) => (e.id === currentId ? { ...e, name: meta.name, status: meta.status } : e)));
  }, [meta, currentId]);

  const history = React.useMemo(() => monsterStatsHistory(encounters), [encounters]);
  const presentRefs = React.useMemo(
    () => new Set((state?.combatants ?? []).map((c) => `${c.kind}:${c.refId ?? c.id}`)),
    [state],
  );

  async function handleNew() {
    try {
      const count = encounters.length + 1;
      const created = await createEncounter({ name: `Encounter ${count}` });
      setEncounters((l) => [created, ...l]);
      setCurrentId(created.id);
    } catch (e) {
      void message.error(apiErrorMessage(e, 'Could not create the encounter.'));
    }
  }

  async function handleDelete() {
    if (currentId === null) return;
    try {
      await deleteEncounter(currentId);
      forgetLocalEncounter(currentId);
      const rest = encounters.filter((e) => e.id !== currentId);
      setEncounters(rest);
      setCurrentId(rest.find((e) => e.status === 'active')?.id ?? rest[0]?.id ?? null);
    } catch (e) {
      void message.error(apiErrorMessage(e, 'Could not delete the encounter.'));
    }
  }

  /** Writes the PCs' current SP/HP/RP back into their Starfinder sheets. */
  async function applyToSheets() {
    const pcs = (state?.combatants ?? []).filter((c) => c.kind === 'pc' && c.refId);
    if (!pcs.length) return;
    setApplying(true);
    try {
      for (const c of pcs) {
        const sheet = await getCharacterSheet(c.refId as number);
        await updateCharacterSheet(sheet.id, {
          data: { ...sheet.data, staminaCurrent: c.sp.current, hpCurrent: c.hp.current, resolveCurrent: c.rp.current },
        });
      }
      update((s) => E.addNote(s, `SP/HP/RP written to ${pcs.map((c) => c.name).join(', ')}'s sheets.`));
      void message.success('Sheets updated.');
    } catch (e) {
      void message.error(apiErrorMessage(e, 'Could not update the sheets.'));
    } finally {
      setApplying(false);
    }
  }

  const actions: CombatantActions = {
    damage: (id, n) => update((s) => E.applyDamage(s, id, n)),
    heal: (id, pool, n) => update((s) => E.heal(s, id, pool, n)),
    spendResolve: (id) => update((s) => E.spendResolve(s, id)),
    addCondition: (id, name, rounds) => update((s) => E.addCondition(s, id, name, rounds)),
    removeCondition: (id, k) => update((s) => E.removeCondition(s, id, k)),
    setInitiative: (id, value) => update((s) => E.updateCombatant(s, id, { initiative: value })),
    setDefeated: (id, defeated) => update((s) => E.setDefeated(s, id, defeated)),
    edit: (id, patch) => update((s) => E.updateCombatant(s, id, patch)),
    remove: (id) => update((s) => E.removeCombatant(s, id)),
  };

  const syncInfo = SYNC_TEXT[sync.status];
  const started = (state?.round ?? 0) > 0;
  const acting = state ? E.currentCombatant(state) : undefined;
  const ended = meta?.status === 'ended';
  const hasPcs = (state?.combatants ?? []).some((c: Combatant) => c.kind === 'pc' && c.refId);

  const header = (
    <S.Toolbar>
      <Select
        onChange={(v) => setCurrentId(v)}
        options={[
          {
            label: 'Active',
            options: encounters.filter((e) => e.status === 'active').map((e) => ({ value: e.id, label: e.name })),
          },
          {
            label: 'Ended',
            options: encounters.filter((e) => e.status === 'ended').map((e) => ({ value: e.id, label: e.name })),
          },
        ].filter((g) => g.options.length)}
        placeholder="Pick an encounter"
        style={{ minWidth: 220 }}
        value={currentId ?? undefined}
      />
      <Button icon={<PlusOutlined />} onClick={() => void handleNew()}>
        New encounter
      </Button>
      {meta && (
        <>
          <Select
            allowClear
            onChange={(v) => sync.setMeta({ sessionId: v ?? null })}
            options={sessions.map((s) => ({ value: s.id, label: s.title }))}
            placeholder="Link to a session"
            style={{ minWidth: 200 }}
            value={meta.sessionId ?? undefined}
          />
          <Popconfirm
            description="The encounter and its log are deleted for good."
            okButtonProps={{ danger: true }}
            okText="Delete"
            onConfirm={() => void handleDelete()}
            title="Delete this encounter?"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </>
      )}
      <S.SyncText $tone={syncInfo.tone}>
        {syncInfo.text}
        {sync.status === 'saved' && sync.savedAt ? ` · ${time(sync.savedAt)}` : ''}
      </S.SyncText>
    </S.Toolbar>
  );

  return (
    <>
      <PageTitle>GM - Combat</PageTitle>
      <S.Page>
        <Typography.Title level={3} style={{ margin: 0 }}>
          <IconLabel icon="beast">Combat tracker</IconLabel>
        </Typography.Title>
        {header}

        {sync.status === 'conflict' && (
          <Alert
            action={
              <Space orientation="vertical">
                <Button onClick={() => void sync.resolveConflict('theirs')} size="small">
                  Use the other version
                </Button>
                <Button danger onClick={() => void sync.resolveConflict('mine')} size="small">
                  Keep this device&apos;s
                </Button>
              </Space>
            }
            description="This encounter was saved from another device after this one last synced. Choose which version to keep."
            message="Two versions of this encounter"
            showIcon
            type="warning"
          />
        )}
        {sync.missing && <Alert showIcon type="info" message="That encounter no longer exists." />}

        {currentId === null && !encounters.length && (
          <S.Empty>
            No encounters yet.{' '}
            <Button icon={<PlusOutlined />} onClick={() => void handleNew()} type="primary">
              Start one
            </Button>
          </S.Empty>
        )}

        {state && meta && (
          <>
            <S.Toolbar>
              <Typography.Title
                editable={{ onChange: (v) => v.trim() && sync.setMeta({ name: v.trim().slice(0, 120) }) }}
                level={4}
                style={{ margin: 0 }}
              >
                {meta.name}
              </Typography.Title>
              {ended && <Tag>Ended</Tag>}
            </S.Toolbar>

            <S.Toolbar>
              <Button
                icon={<UserAddOutlined />}
                onClick={() => {
                  void refreshList();
                  setAdding(true);
                }}
                type={state.combatants.length ? 'default' : 'primary'}
              >
                Add
              </Button>
              <Tooltip title="d20 + bonus for everyone without initiative">
                <Button
                  disabled={!state.combatants.some((c) => c.initiative === null)}
                  onClick={() => update((s) => E.rollInitiative(s))}
                >
                  Roll initiative
                </Button>
              </Tooltip>
              {!started ? (
                <Button
                  disabled={!state.combatants.length}
                  icon={<PlayCircleOutlined />}
                  onClick={() => update(E.startCombat)}
                  type="primary"
                >
                  Start combat
                </Button>
              ) : (
                <>
                  <Button icon={<CaretLeftOutlined />} onClick={() => update(E.previousTurn)} />
                  <S.RoundBox>
                    <small>Round</small> {state.round}
                  </S.RoundBox>
                  <Button
                    icon={<CaretRightOutlined />}
                    iconPosition="end"
                    onClick={() => update(E.nextTurn)}
                    type="primary"
                  >
                    Next turn
                  </Button>
                </>
              )}
              <Button disabled={!sync.canUndo} icon={<UndoOutlined />} onClick={sync.undo}>
                Undo
              </Button>
              {hasPcs && (
                <Popconfirm
                  description="Writes each player's current SP, HP and RP into their Starfinder sheet."
                  okText="Apply"
                  onConfirm={() => void applyToSheets()}
                  title="Apply to sheets?"
                >
                  <Button icon={<SaveOutlined />} loading={applying}>
                    Apply to sheets
                  </Button>
                </Popconfirm>
              )}
              {ended ? (
                <Button icon={<CheckCircleOutlined />} onClick={() => sync.setMeta({ status: 'active' })}>
                  Reopen
                </Button>
              ) : (
                <Button
                  icon={<FlagOutlined />}
                  onClick={() =>
                    Modal.confirm({
                      title: 'End this combat?',
                      content: 'It stays saved under “Ended”. You can reopen it later.',
                      okText: 'End combat',
                      onOk: () => {
                        update(E.endCombat);
                        sync.setMeta({ status: 'ended' });
                      },
                    })
                  }
                >
                  End combat
                </Button>
              )}
            </S.Toolbar>

            <S.Layout>
              <S.List>
                {state.combatants.length === 0 ? (
                  <S.Empty>Add the party and the enemies to begin.</S.Empty>
                ) : (
                  state.combatants.map((c) => (
                    <CombatantCard acting={acting?.id === c.id} actions={actions} c={c} key={c.id} />
                  ))
                )}
              </S.List>

              <S.Side>
                <Card size="small" title="Log">
                  <Space.Compact style={{ width: '100%', marginBottom: 10 }}>
                    <Input
                      maxLength={300}
                      onChange={(e) => setNote(e.target.value)}
                      onPressEnter={() => {
                        update((s) => E.addNote(s, note));
                        setNote('');
                      }}
                      placeholder="Add a note to the log"
                      value={note}
                    />
                    <Button
                      onClick={() => {
                        update((s) => E.addNote(s, note));
                        setNote('');
                      }}
                    >
                      Add
                    </Button>
                  </Space.Compact>
                  {state.log.length === 0 ? (
                    <Typography.Text type="secondary">Nothing yet.</Typography.Text>
                  ) : (
                    <S.Log>
                      {state.log.map((l) => (
                        <li key={l.id}>
                          <small>
                            R{l.round} · {time(l.at)}
                          </small>
                          <span>{l.text}</span>
                        </li>
                      ))}
                    </S.Log>
                  )}
                </Card>
              </S.Side>
            </S.Layout>

            <AddCombatantsModal
              monsterHistory={history}
              onAdd={(list) => update((s) => E.addCombatants(s, list))}
              onClose={() => setAdding(false)}
              open={adding}
              presentRefs={presentRefs}
            />
          </>
        )}
      </S.Page>
    </>
  );
};

export default CombatTrackerPage;
