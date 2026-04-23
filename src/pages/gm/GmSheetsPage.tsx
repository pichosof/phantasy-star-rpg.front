import React from 'react';
import { Button, Drawer, Input, Modal, Space, Tag, Typography, message } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { IconLabel } from '@app/components/common/AppIcon/AppIcon';
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
import { m0 } from '@app/styles/styleUtils';
import { GurpsSheetForm } from './GurpsSheetForm';
import { StarfinderSheetForm } from './StarfinderSheetForm';
import * as S from './GmSheetsPage.styles';

function SheetCard({ sheet, onOpen, onDelete }: { sheet: CharacterSheet; onOpen: () => void; onDelete: () => void }) {
  return (
    <S.TitleCard
      density="dense"
      title={
        <Space size={8}>
          <S.SheetCardTitle>{sheet.name}</S.SheetCardTitle>
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
      <Typography.Text type="secondary">
        Updated: {sheet.updatedAt ? new Date(sheet.updatedAt).toLocaleString() : 'â€”'}
      </Typography.Text>
    </S.TitleCard>
  );
}

export const GmSheetsPage: React.FC = () => {
  const { mobileOnly } = useResponsive();

  const [sheets, setSheets] = React.useState<CharacterSheet[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [typeFilter, setTypeFilter] = React.useState<SheetType | 'all'>('all');

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [activeSheet, setActiveSheet] = React.useState<CharacterSheet | null>(null);
  const [sheetData, setSheetData] = React.useState<Record<string, unknown>>({});
  const [savingSheet, setSavingSheet] = React.useState(false);
  const [sheetName, setSheetName] = React.useState('');

  const [createOpen, setCreateOpen] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newType, setNewType] = React.useState<SheetType>('starfinder');
  const [creating, setCreating] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      setSheets(await listCharacterSheets());
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to load sheets'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const filtered = React.useMemo(
    () => (typeFilter === 'all' ? sheets : sheets.filter((sheet) => sheet.type === typeFilter)),
    [sheets, typeFilter],
  );

  const filterTabItems = React.useMemo(
    () => [
      { key: 'all', label: 'All' },
      { key: 'gurps', label: <IconLabel icon="sheet">GURPS</IconLabel> },
      { key: 'starfinder', label: <IconLabel icon="star">Starfinder</IconLabel> },
    ],
    [],
  );

  async function openSheet(sheet: CharacterSheet) {
    try {
      const full = await getCharacterSheet(sheet.id);
      setActiveSheet(full);
      setSheetData(full.data ?? {});
      setSheetName(full.name);
      setDrawerOpen(true);
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to load sheet'));
    }
  }

  async function saveSheet() {
    if (!activeSheet) return;

    setSavingSheet(true);
    try {
      await updateCharacterSheet(activeSheet.id, { name: sheetName, data: sheetData });
      await load();
      message.success('Sheet saved');
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to save (GM key?)'));
    } finally {
      setSavingSheet(false);
    }
  }

  async function doCreate() {
    if (!newName.trim()) {
      return message.warning('Enter a name');
    }

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
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to create (GM key?)'));
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
        } catch (error) {
          message.error(apiErrorMessage(error, 'Failed to remove'));
        }
      },
    });
  }

  if (loading) return <Spinner />;

  return (
    <>
      <PageTitle>GM — Sheets</PageTitle>

      <S.TitleCard density="comfy">
        <S.SheetToolbar>
          <Typography.Title level={4} style={m0}>
            Character Sheets {sheets.length}
          </Typography.Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            New sheet
          </Button>
        </S.SheetToolbar>

        <S.FilterTabs
          activeKey={typeFilter}
          onChange={(key) => setTypeFilter(key as SheetType | 'all')}
          items={filterTabItems}
        />

        {filtered.length === 0 ? (
          <Typography.Text type="secondary">No sheets. Create one!</Typography.Text>
        ) : (
          <S.SheetsGrid $mobile={mobileOnly}>
            {filtered.map((sheet) => (
              <SheetCard
                key={sheet.id}
                sheet={sheet}
                onOpen={() => void openSheet(sheet)}
                onDelete={() => confirmDelete(sheet)}
              />
            ))}
          </S.SheetsGrid>
        )}
      </S.TitleCard>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        size={mobileOnly ? '95vh' : 860}
        placement={mobileOnly ? 'bottom' : 'right'}
        title={
          activeSheet ? (
            <Space size={12}>
              <S.SheetNameInput value={sheetName} onChange={(e) => setSheetName(e.target.value)} />
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
        destroyOnHidden
      >
        {activeSheet?.type === 'gurps' && (
          <GurpsSheetForm
            data={sheetData as unknown as GurpsSheetData}
            onChange={(data) => setSheetData(data as unknown as Record<string, unknown>)}
          />
        )}
        {activeSheet?.type === 'starfinder' && (
          <StarfinderSheetForm
            data={sheetData as unknown as StarfinderSheetData}
            onChange={(data) => setSheetData(data as unknown as Record<string, unknown>)}
          />
        )}
      </Drawer>

      <Modal
        open={createOpen}
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
        <S.ModalFields>
          <div>
            <S.FieldLabel type="secondary">Character name</S.FieldLabel>
            <Input
              placeholder="Ex: Alis Landale"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onPressEnter={() => void doCreate()}
            />
          </div>

          <div>
            <S.FieldLabelWide type="secondary">System</S.FieldLabelWide>
            <S.SystemChoiceRow>
              <Button type={newType === 'starfinder' ? 'primary' : 'default'} onClick={() => setNewType('starfinder')}>
                <IconLabel icon="star">Starfinder</IconLabel>
              </Button>
              <Button type={newType === 'gurps' ? 'primary' : 'default'} onClick={() => setNewType('gurps')}>
                <IconLabel icon="sheet">GURPS</IconLabel>
              </Button>
            </S.SystemChoiceRow>
          </div>
        </S.ModalFields>
      </Modal>
    </>
  );
};

export default GmSheetsPage;
