import React from 'react';
import { Button, Drawer, Input, Modal, Space, Tag, Tabs, Typography, message } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { useResponsive } from '@app/hooks/useResponsive';
import {
  type CharacterSheet,
  type SheetType,
  type GurpsSheetData,
  type StarfinderSheetData,
  listCharacterSheets,
  getCharacterSheet,
  createCharacterSheet,
  updateCharacterSheet,
  deleteCharacterSheet,
} from '@app/api/character-sheets.api';
import { apiErrorMessage } from '../../utils/api-error';
import { m0, w100, textSm, bold700 } from '@app/styles/styleUtils';
import { GurpsSheetForm } from './GurpsSheetForm';
import { StarfinderSheetForm } from './StarfinderSheetForm';

// ── Sheet card ────────────────────────────────────────────────────────────────

function SheetCard({ sheet, onOpen, onDelete }: { sheet: CharacterSheet; onOpen: () => void; onDelete: () => void }) {
  return (
    <Card
      density="dense"
      title={
        <Space size={8}>
          <span style={bold700}>{sheet.name}</span>
          <Tag color={sheet.type === 'gurps' ? 'gold' : 'blue'}>{sheet.type === 'gurps' ? 'GURPS' : 'Starfinder'}</Tag>
        </Space>
      }
      extra={
        <Space size={4}>
          <Button size="small" onClick={onOpen}>
            Open
          </Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={onDelete} />
        </Space>
      }
    >
      <Typography.Text type="secondary" style={textSm}>
        Updated: {sheet.updatedAt ? new Date(sheet.updatedAt).toLocaleString() : '—'}
      </Typography.Text>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export const GmSheetsPage: React.FC = () => {
  const { mobileOnly } = useResponsive();

  const [sheets, setSheets] = React.useState<CharacterSheet[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [typeFilter, setTypeFilter] = React.useState<SheetType | 'all'>('all');

  // Drawer state
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [activeSheet, setActiveSheet] = React.useState<CharacterSheet | null>(null);
  const [sheetData, setSheetData] = React.useState<Record<string, unknown>>({});
  const [savingSheet, setSavingSheet] = React.useState(false);
  const [sheetName, setSheetName] = React.useState('');

  // Create modal
  const [createOpen, setCreateOpen] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newType, setNewType] = React.useState<SheetType>('starfinder');
  const [creating, setCreating] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      setSheets(await listCharacterSheets());
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to load sheets'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const filtered = React.useMemo(
    () => (typeFilter === 'all' ? sheets : sheets.filter((s) => s.type === typeFilter)),
    [sheets, typeFilter],
  );

  async function openSheet(sheet: CharacterSheet) {
    try {
      const full = await getCharacterSheet(sheet.id);
      setActiveSheet(full);
      setSheetData(full.data ?? {});
      setSheetName(full.name);
      setDrawerOpen(true);
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to load sheet'));
    }
  }

  async function saveSheet() {
    if (!activeSheet) return;
    setSavingSheet(true);
    try {
      await updateCharacterSheet(activeSheet.id, { name: sheetName, data: sheetData });
      await load();
      message.success('Sheet saved');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to save (GM key?)'));
    } finally {
      setSavingSheet(false);
    }
  }

  async function doCreate() {
    if (!newName.trim()) return message.warning('Enter a name');
    setCreating(true);
    try {
      const created = await createCharacterSheet({ type: newType, name: newName.trim(), data: {} });
      await load();
      setCreateOpen(false);
      setNewName('');
      const full = await getCharacterSheet(created.id);
      setActiveSheet(full);
      setSheetData({});
      setSheetName(full.name);
      setDrawerOpen(true);
      message.success('Sheet created');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to create (GM key?)'));
    } finally {
      setCreating(false);
    }
  }

  function confirmDelete(sheet: CharacterSheet) {
    Modal.confirm({
      title: `Delete sheet "${sheet.name}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteCharacterSheet(sheet.id);
          if (activeSheet?.id === sheet.id) {
            setDrawerOpen(false);
            setActiveSheet(null);
          }
          await load();
          message.success('Sheet removed');
        } catch (e) {
          message.error(apiErrorMessage(e, 'Failed to remove'));
        }
      },
    });
  }

  if (loading) return <Spinner />;

  return (
    <>
      <PageTitle>GM — Sheets</PageTitle>

      <Card density="comfy">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <Typography.Title level={4} style={m0}>
            Character Sheets · {sheets.length}
          </Typography.Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            New sheet
          </Button>
        </div>

        <Tabs
          activeKey={typeFilter}
          onChange={(k) => setTypeFilter(k as SheetType | 'all')}
          style={{ marginBottom: 16 }}
        >
          <Tabs.TabPane key="all" tab="All" />
          <Tabs.TabPane key="gurps" tab="⚙️ GURPS" />
          <Tabs.TabPane key="starfinder" tab="🚀 Starfinder" />
        </Tabs>

        {filtered.length === 0 ? (
          <Typography.Text type="secondary">No sheets. Create one!</Typography.Text>
        ) : (
          <div
            style={{
              display: 'grid',
              gap: 10,
              gridTemplateColumns: mobileOnly ? '1fr' : 'repeat(auto-fill,minmax(280px,1fr))',
            }}
          >
            {filtered.map((s) => (
              <SheetCard key={s.id} sheet={s} onOpen={() => void openSheet(s)} onDelete={() => confirmDelete(s)} />
            ))}
          </div>
        )}
      </Card>

      {/* ── Sheet editor drawer ── */}
      <Drawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={mobileOnly ? '100%' : 860}
        placement={mobileOnly ? 'bottom' : 'right'}
        height={mobileOnly ? '95vh' : undefined}
        title={
          activeSheet ? (
            <Space size={12}>
              <Input
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                style={{ width: 220, fontWeight: 700 }}
              />
              <Tag color={activeSheet.type === 'gurps' ? 'gold' : 'blue'}>
                {activeSheet.type === 'gurps' ? 'GURPS' : 'Starfinder'}
              </Tag>
            </Space>
          ) : (
            'Sheet'
          )
        }
        extra={
          <Button type="primary" loading={savingSheet} onClick={() => void saveSheet()}>
            Save
          </Button>
        }
        destroyOnClose
      >
        {activeSheet?.type === 'gurps' && (
          <GurpsSheetForm
            data={sheetData as unknown as GurpsSheetData}
            onChange={(d) => setSheetData(d as unknown as Record<string, unknown>)}
          />
        )}
        {activeSheet?.type === 'starfinder' && (
          <StarfinderSheetForm
            data={sheetData as unknown as StarfinderSheetData}
            onChange={(d) => setSheetData(d as unknown as Record<string, unknown>)}
          />
        )}
      </Drawer>

      {/* ── Create modal ── */}
      <Modal
        visible={createOpen}
        title="New Character Sheet"
        onCancel={() => setCreateOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setCreateOpen(false)}>
            Cancel
          </Button>,
          <Button key="ok" type="primary" loading={creating} onClick={() => void doCreate()}>
            Create
          </Button>,
        ]}
      >
        <Space direction="vertical" style={w100} size={12}>
          <div>
            <Typography.Text type="secondary" style={{ ...textSm, display: 'block', marginBottom: 4 }}>
              Character name
            </Typography.Text>
            <Input
              placeholder="Ex: Alis Landale"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onPressEnter={() => void doCreate()}
            />
          </div>
          <div>
            <Typography.Text type="secondary" style={{ ...textSm, display: 'block', marginBottom: 8 }}>
              System
            </Typography.Text>
            <Space size={12}>
              <Button type={newType === 'starfinder' ? 'primary' : 'default'} onClick={() => setNewType('starfinder')}>
                🚀 Starfinder
              </Button>
              <Button type={newType === 'gurps' ? 'primary' : 'default'} onClick={() => setNewType('gurps')}>
                ⚙️ GURPS
              </Button>
            </Space>
          </div>
        </Space>
      </Modal>
    </>
  );
};

export default GmSheetsPage;
