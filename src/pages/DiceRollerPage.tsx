import React from 'react';
import { Badge, Button, Divider, Space, Tag, Typography, message } from 'antd';
import { DeleteOutlined, RollbackOutlined } from '@ant-design/icons';

import { AppIcon, IconLabel } from '@app/components/common/AppIcon/AppIcon';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { useResponsive } from '@app/hooks/useResponsive';
import { useAppSelector } from '@app/hooks/reduxHooks';
import { m0, textSm, textMd, spaceBetween } from '@app/styles/styleUtils';
import * as S from './DiceRollerPage.styles';

// ── Edge config ───────────────────────────────────────────────────────────────
// Probability (%) that any single die roll edges instead of landing on a face.
// Change this to test — e.g. set to 50 to see it constantly in dev.
const EDGE_CHANCE_PERCENT = 2;

const EDGE_MESSAGES = [
  'The die edged! It flat-out refused to pick a side.',
  'EDGED! The die went on strike. No result recorded. Classic.',
  'The die defied physics and balanced on its edge. Not even the GM saw that coming.',
  'Edge detected! The die is fine. The result... is not.',
  'It edged like it was a 0.0001% chance. Because it was.',
  'The die balanced on its edge. The party laughs nervously.',
  'Edge! The die entered philosophical mode and refused to commit to a face.',
  'EDGED! This die was clearly crafted by a chaotic deity.',
  "The die edged. It says it's not its fault.",
  'Epic edge! The die tested the limits of reality and won.',
];

// ── Types ─────────────────────────────────────────────────────────────────────

type DiceType = 2 | 4 | 6 | 8 | 10 | 12 | 16 | 20 | 24 | 30 | 60 | 100;
type DieValue = number | 'edge';

const ALL_DICE: DiceType[] = [2, 4, 6, 8, 10, 12, 16, 20, 24, 30, 60, 100];

interface DiceGroup {
  type: DiceType;
  count: number;
}

interface SingleRoll {
  type: DiceType;
  values: DieValue[];
}

interface HistoryEntry {
  id: string;
  timestamp: Date;
  rolls: SingleRoll[];
  total: number;
  label: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function rollDie(sides: DiceType): DieValue {
  if (Math.random() * 100 < EDGE_CHANCE_PERCENT) return 'edge';
  return Math.floor(Math.random() * sides) + 1;
}

function buildLabel(groups: DiceGroup[]): string {
  return groups
    .filter((g) => g.count > 0)
    .map((g) => `${g.count}d${g.type}`)
    .join(' + ');
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function countEdges(rolls: SingleRoll[]): number {
  return rolls.flatMap((r) => r.values).filter((v) => v === 'edge').length;
}

function randomEdgeMessage(): string {
  return EDGE_MESSAGES[Math.floor(Math.random() * EDGE_MESSAGES.length)];
}

// ── Die shapes & colors ───────────────────────────────────────────────────────

const DIE_SHAPES: Record<DiceType, string> = {
  2: 'circle(48% at 50% 50%)',
  4: 'polygon(50% 0%, 0% 100%, 100% 100%)',
  6: 'polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%)',
  8: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  10: 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)',
  12: 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)',
  16: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
  20: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
  24: 'polygon(50% 0%, 83% 7%, 100% 37%, 100% 63%, 83% 93%, 50% 100%, 17% 93%, 0% 63%, 0% 37%, 17% 7%)',
  30: 'polygon(50% 0%, 79% 9%, 98% 35%, 98% 65%, 79% 91%, 50% 100%, 21% 91%, 2% 65%, 2% 35%, 21% 9%)',
  60: 'circle(48% at 50% 50%)',
  100: 'circle(48% at 50% 50%)',
};

const DIE_COLORS: Record<DiceType, string> = {
  2: '#597ef7',
  4: '#36cfc9',
  6: '#73d13d',
  8: '#ffc53d',
  10: '#ff7a45',
  12: '#f759ab',
  16: '#9254de',
  20: '#ff4d4f',
  24: '#13c2c2',
  30: '#52c41a',
  60: '#fa8c16',
  100: '#40a9ff',
};

// ── DiceFaceDisplay ───────────────────────────────────────────────────────────

function DiceFaceDisplay({
  type,
  value,
  size = 52,
  isDark,
}: {
  type: DiceType;
  value: DieValue;
  size?: number;
  isDark: boolean;
}) {
  if (value === 'edge') {
    return (
      <div title="EDGED! This die doesn't count." style={S.edgeDie(size, DIE_SHAPES[type])}>
        <span style={S.edgeDieText(size)}>E!</span>
      </div>
    );
  }

  const isMax = value === type;
  const isMin = value === 1;

  let bgColor: string;
  let textColor: string;

  if (isMax) {
    bgColor = DIE_COLORS[type];
    textColor = '#fff';
  } else if (isMin) {
    bgColor = '#ff4d4f';
    textColor = '#fff';
  } else {
    bgColor = isDark ? `${DIE_COLORS[type]}28` : `${DIE_COLORS[type]}22`;
    textColor = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)';
  }

  return (
    <div
      style={S.dieFace(
        size,
        DIE_SHAPES[type],
        bgColor,
        !isMax && !isMin ? `1.5px solid ${DIE_COLORS[type]}55` : undefined,
      )}
    >
      <span style={S.dieFaceText(size, textColor)}>{value}</span>
    </div>
  );
}

// ── DieSelectorCard ───────────────────────────────────────────────────────────

function DieSelectorCard({
  type,
  count,
  onChange,
  isDark,
}: {
  type: DiceType;
  count: number;
  onChange: (delta: number) => void;
  isDark: boolean;
}) {
  const color = DIE_COLORS[type];
  const active = count > 0;

  return (
    <div style={S.selectorCard(active, isDark, color)}>
      <div style={S.selectorDie(active, isDark, color, DIE_SHAPES[type])}>
        <span style={S.selectorDieText}>d{type}</span>
      </div>

      <div style={S.selectorControls}>
        <button onClick={() => onChange(-1)} disabled={count === 0} style={S.selectorAdjustButton(count === 0, isDark)}>
          −
        </button>
        <span style={S.selectorCount(active, isDark, color)}>{count}</span>
        <button onClick={() => onChange(1)} style={S.selectorAdjustButton(false, isDark)}>
          +
        </button>
      </div>
    </div>
  );
}

// ── HistoryRow ────────────────────────────────────────────────────────────────

function HistoryRow({
  entry,
  onReplay,
  isDark,
}: {
  entry: HistoryEntry;
  onReplay: (entry: HistoryEntry) => void;
  isDark: boolean;
}) {
  const maxes = entry.rolls.reduce((acc, r) => acc + r.values.filter((v) => v === r.type).length, 0);
  const mins = entry.rolls.flatMap((r) => r.values).filter((v) => v === 1).length;
  const edges = countEdges(entry.rolls);

  const totalColor = isDark ? '#fff' : 'rgba(0,0,0,0.85)';

  return (
    <div style={S.historyRow(isDark)}>
      <div style={S.historyHeader}>
        <div style={S.historyMeta}>
          <Typography.Text type="secondary" style={S.historyTime}>
            {formatTime(entry.timestamp)}
          </Typography.Text>
          <Tag style={S.historyLabelTag}>{entry.label}</Tag>
          {maxes > 0 && (
            <Tag color="gold" style={S.historyStatTag}>
              {maxes}× max
            </Tag>
          )}
          {mins > 0 && (
            <Tag color="red" style={S.historyStatTag}>
              {mins}× min
            </Tag>
          )}
          {edges > 0 && (
            <Tag color="orange" style={S.historyEdgeTag}>
              <IconLabel icon="alert" gap={6}>
                {edges}x EDGED
              </IconLabel>
            </Tag>
          )}
        </div>
        <div style={S.historyTotalWrap}>
          <span style={S.historyTotalValue(totalColor)}>{entry.total}</span>
          <button
            onClick={() => onReplay(entry)}
            title="Roll again with the same dice"
            style={S.historyReplayButton(isDark)}
          >
            <RollbackOutlined style={S.historyReplayIcon} />
          </button>
        </div>
      </div>

      <div style={S.historyDiceWrap}>
        {entry.rolls.flatMap((r) =>
          r.values.map((v, i) => (
            <DiceFaceDisplay key={`${r.type}-${i}`} type={r.type} value={v} size={34} isDark={isDark} />
          )),
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export const DiceRollerPage: React.FC = () => {
  const { mobileOnly } = useResponsive();
  const theme = useAppSelector((state) => state.theme.theme);
  const isDark = theme === 'dark';

  const [selection, setSelection] = React.useState<Record<DiceType, number>>(
    () => Object.fromEntries(ALL_DICE.map((d) => [d, 0])) as Record<DiceType, number>,
  );

  const [history, setHistory] = React.useState<HistoryEntry[]>([]);
  const [lastEntry, setLastEntry] = React.useState<HistoryEntry | null>(null);
  const [rolling, setRolling] = React.useState(false);

  const totalDice = Object.values(selection).reduce((a, b) => a + b, 0);

  function changeCount(type: DiceType, delta: number) {
    setSelection((prev) => ({
      ...prev,
      [type]: Math.max(0, Math.min(20, (prev[type] ?? 0) + delta)),
    }));
  }

  function clearSelection() {
    setSelection(Object.fromEntries(ALL_DICE.map((d) => [d, 0])) as Record<DiceType, number>);
  }

  function doRoll(overrideGroups?: DiceGroup[]) {
    const groups: DiceGroup[] =
      overrideGroups ?? ALL_DICE.filter((d) => selection[d] > 0).map((d) => ({ type: d, count: selection[d] }));

    if (!groups.length) {
      message.warning('Select at least one die to roll.');
      return;
    }

    setRolling(true);
    setTimeout(() => {
      const rolls: SingleRoll[] = groups.map((g) => ({
        type: g.type,
        values: Array.from({ length: g.count }, () => rollDie(g.type)),
      }));

      const numericValues = rolls.flatMap((r) => r.values).filter((v): v is number => v !== 'edge');
      const total = numericValues.reduce((a, b) => a + b, 0);
      const label = buildLabel(groups);
      const entry: HistoryEntry = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        rolls,
        total,
        label,
      };

      setLastEntry(entry);
      setHistory((prev) => [entry, ...prev].slice(0, 50));
      setRolling(false);

      // Quina notification
      const edgeCount = countEdges(rolls);
      if (edgeCount > 0) {
        const allEdged = numericValues.length === 0;
        const baseMsg = randomEdgeMessage();
        const suffix = allEdged
          ? ' ALL dice edged. That is legendary (and completely useless).'
          : edgeCount > 1
            ? ` ${edgeCount} dice edged at once. Remarkable.`
            : '';

        message.open({
          type: 'warning',
          icon: <AppIcon name="alert" />,
          content: baseMsg + suffix,
          duration: 7,
        });
      }
    }, 120);
  }

  function clearHistory() {
    setHistory([]);
    setLastEntry(null);
  }

  const historySum = React.useMemo(() => history.reduce((a, e) => a + e.total, 0), [history]);

  const totalLabelColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)';
  const totalValueColor = isDark ? '#fff' : 'rgba(0,0,0,0.88)';

  return (
    <>
      <PageTitle>Dice Roller</PageTitle>

      <S.PageGrid>
        {/* ── Selector ── */}
        <Card density="comfy">
          <Typography.Title level={4} style={S.pageHeading}>
            <IconLabel icon="dice">Dice Roller</IconLabel>
          </Typography.Title>

          <S.SelectorGrid $mobile={mobileOnly}>
            {ALL_DICE.map((d) => (
              <DieSelectorCard
                key={d}
                type={d}
                count={selection[d]}
                onChange={(delta) => changeCount(d, delta)}
                isDark={isDark}
              />
            ))}
          </S.SelectorGrid>

          <Divider style={S.sectionDivider} />

          <Space wrap size={10} style={spaceBetween}>
            <Space wrap size={8}>
              <Button
                type="primary"
                size="large"
                disabled={totalDice === 0}
                loading={rolling}
                onClick={() => doRoll()}
                style={S.rollButton}
              >
                <IconLabel icon="dice">Roll{totalDice > 0 ? ` (${totalDice})` : ''}</IconLabel>
              </Button>
              {totalDice > 0 && (
                <Button size="small" onClick={clearSelection}>
                  Clear selection
                </Button>
              )}
            </Space>
            {totalDice > 0 && (
              <Typography.Text type="secondary" style={textMd}>
                {buildLabel(ALL_DICE.filter((d) => selection[d] > 0).map((d) => ({ type: d, count: selection[d] })))}
              </Typography.Text>
            )}
          </Space>
        </Card>

        {/* ── Last result ── */}
        {lastEntry && (
          <Card density="comfy">
            <div style={S.lastHeader}>
              <Typography.Text type="secondary" style={textSm}>
                Last result · {lastEntry.label}
              </Typography.Text>
              <div style={S.lastTotalWrap}>
                <span style={S.totalLabel(totalLabelColor)}>Total</span>
                <span style={S.totalValue(totalValueColor)}>{lastEntry.total}</span>
              </div>
            </div>

            <div style={S.lastDiceWrap}>
              {lastEntry.rolls.flatMap((r) =>
                r.values.map((v, i) => (
                  <DiceFaceDisplay key={`last-${r.type}-${i}`} type={r.type} value={v} size={52} isDark={isDark} />
                )),
              )}
            </div>

            {(() => {
              const allValues = lastEntry.rolls.flatMap((r) => r.values);
              const numericOnly = allValues.filter((v): v is number => v !== 'edge');
              const edgeCount = allValues.length - numericOnly.length;
              const allEdged = allValues.length > 0 && edgeCount === allValues.length;
              const allMax =
                numericOnly.length > 0 &&
                edgeCount === 0 &&
                lastEntry.rolls.every((r) => r.values.every((v) => v === r.type));
              const allMin =
                numericOnly.length > 0 &&
                edgeCount === 0 &&
                lastEntry.rolls.every((r) => r.values.every((v) => v === 1));

              if (allEdged)
                return (
                  <div style={S.resultBanner('rgba(250,173,20,0.15)', 'rgba(250,173,20,0.5)')}>
                    <Typography.Text style={S.resultBannerText('#faad14', 700)}>
                      <IconLabel icon="alert">
                        TOTAL EDGE - every single die balanced on its edge. Historically useless. Absolutely legendary.
                      </IconLabel>
                    </Typography.Text>
                  </div>
                );
              if (allMax)
                return (
                  <div style={S.resultBanner('rgba(255,197,61,0.12)', 'rgba(255,197,61,0.3)')}>
                    <Typography.Text style={S.resultBannerText('#ffc53d', 700)}>
                      <IconLabel icon="star">All dice at maximum!</IconLabel>
                    </Typography.Text>
                  </div>
                );
              if (allMin)
                return (
                  <div style={S.resultBanner('rgba(255,77,79,0.12)', 'rgba(255,77,79,0.3)')}>
                    <Typography.Text style={S.resultBannerText('#ff4d4f', 700)}>
                      <IconLabel icon="alert">Total fumble - all dice at minimum!</IconLabel>
                    </Typography.Text>
                  </div>
                );
              if (edgeCount > 0)
                return (
                  <div style={S.resultBanner('rgba(250,173,20,0.08)', 'rgba(250,173,20,0.25)')}>
                    <Typography.Text style={S.resultBannerText('#faad14', 600)}>
                      <IconLabel icon="alert">
                        {edgeCount} {edgeCount > 1 ? 'dice' : 'die'} edged and did not count toward the total.
                      </IconLabel>
                    </Typography.Text>
                  </div>
                );
              return null;
            })()}
          </Card>
        )}

        {/* ── History ── */}
        {history.length > 0 && (
          <Card
            density="dense"
            title={
              <Space size={10}>
                <span>History</span>
                <Badge count={history.length} style={S.historyBadge(isDark)} />
                <Tag style={m0}>
                  Total sum: <span style={S.historySumValue}>{historySum}</span>
                </Tag>
              </Space>
            }
            extra={
              <Button size="small" danger icon={<DeleteOutlined />} onClick={clearHistory}>
                Clear history
              </Button>
            }
          >
            <S.HistoryList>
              {history.map((e) => (
                <HistoryRow
                  key={e.id}
                  entry={e}
                  isDark={isDark}
                  onReplay={(entry) => {
                    const groups: DiceGroup[] = entry.rolls.map((r) => ({ type: r.type, count: r.values.length }));
                    doRoll(groups);
                  }}
                />
              ))}
            </S.HistoryList>
          </Card>
        )}
      </S.PageGrid>
    </>
  );
};

export default DiceRollerPage;
