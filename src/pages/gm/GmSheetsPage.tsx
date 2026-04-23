import React from 'react';
import { Button, Drawer, Input, Modal, Space, Tag, Typography, message } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button as AdmMobileButton, Input as AdmMobileInput, Tag as AdmMobileTag } from 'antd-mobile';
import { AddOutline, DeleteOutline, EditSOutline, FilterOutline } from 'antd-mobile-icons';

import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { IconLabel } from '@app/components/common/AppIcon/AppIcon';
import {
  MobileActionBar,
  MobileCard,
  MobileDialog,
  MobileEntitySheet,
  MobileFilterSheet,
  MobileForm,
  MobilePageScaffold,
  MobileSearchBar,
  MobileSelector,
} from '@app/components/common/mobile';
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
  const [search, setSearch] = React.useState('');
  const [filterSheetOpen, setFilterSheetOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<CharacterSheet | null>(null);

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

  const filtered = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return sheets.filter((sheet) => {
      if (typeFilter !== 'all' && sheet.type !== typeFilter) return false;
      if (!query) return true;
      return sheet.name.toLowerCase().includes(query) || sheet.type.toLowerCase().includes(query);
    });
  }, [sheets, search, typeFilter]);

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
    if (mobileOnly) {
      setDeleteTarget(sheet);
      return;
    }

    Modal.confirm({
      title: `Delete sheet "${sheet.name}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await removeSheet(sheet);
        } catch (error) {
          message.error(apiErrorMessage(error, 'Failed to remove'));
        }
      },
    });
  }

  async function removeSheet(sheet: CharacterSheet) {
    try {
      await deleteCharacterSheet(sheet.id);
      if (activeSheet?.id === sheet.id) {
        setDrawerOpen(false);
        setActiveSheet(null);
      }
      setDeleteTarget(null);
      await load();
      message.success('Sheet removed');
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to remove'));
    }
  }

  if (loading) return <Spinner />;

  const mobileTypeOptions: Array<{ label: string; value: SheetType | 'all' }> = [
    { label: 'All systems', value: 'all' },
    { label: 'GURPS', value: 'gurps' },
    { label: 'Starfinder', value: 'starfinder' },
  ];

  const mobileMeta = (
    <S.MobileMetaTags>
      <AdmMobileTag fill="outline" round>
        {filtered.length} sheets
      </AdmMobileTag>
      <AdmMobileTag color="warning" fill="outline" round>
        {sheets.filter((sheet) => sheet.type === 'gurps').length} GURPS
      </AdmMobileTag>
      <AdmMobileTag color="primary" fill="outline" round>
        {sheets.filter((sheet) => sheet.type === 'starfinder').length} Starfinder
      </AdmMobileTag>
    </S.MobileMetaTags>
  );

  const mobileFilters = (
    <>
      <MobileSearchBar inset={false} onChange={setSearch} placeholder="Search character sheets..." value={search} />
      <S.MobileFilterRow>
        <AdmMobileButton fill="outline" onClick={() => setFilterSheetOpen(true)} size="small">
          <FilterOutline fontSize={16} /> System
        </AdmMobileButton>
        <AdmMobileButton color="primary" onClick={() => setCreateOpen(true)} size="small">
          <AddOutline fontSize={16} /> New sheet
        </AdmMobileButton>
      </S.MobileFilterRow>
    </>
  );

  if (mobileOnly) {
    return (
      <>
        <PageTitle>GM - Sheets</PageTitle>

        <MobilePageScaffold
          filters={mobileFilters}
          meta={mobileMeta}
          subtitle="Manage heavy character sheets with mobile-first sections and quick GM actions."
          title={<IconLabel icon="sheet">GM Sheets</IconLabel>}
        >
          {filtered.length === 0 ? (
            <MobileCard compact>
              <S.MobileEmptyState>No sheets found. Create one to begin.</S.MobileEmptyState>
            </MobileCard>
          ) : (
            <S.MobileSheetsList>
              {filtered.map((sheet) => (
                <MobileCard compact key={sheet.id}>
                  <S.MobileSheetBody>
                    <S.MobileMetaTags>
                      <AdmMobileTag color={sheet.type === 'gurps' ? 'warning' : 'primary'} fill="outline" round>
                        {sheet.type === 'gurps' ? 'GURPS' : 'Starfinder'}
                      </AdmMobileTag>
                      <AdmMobileTag fill="outline" round>
                        #{sheet.id}
                      </AdmMobileTag>
                    </S.MobileMetaTags>
                    <S.MobileSheetTitle>{sheet.name}</S.MobileSheetTitle>
                    <S.MobileSheetMeta>
                      Updated: {sheet.updatedAt ? new Date(sheet.updatedAt).toLocaleString() : '-'}
                    </S.MobileSheetMeta>
                    <S.MobileSheetActions>
                      <AdmMobileButton block color="primary" onClick={() => void openSheet(sheet)}>
                        <EditSOutline fontSize={17} /> Open
                      </AdmMobileButton>
                      <AdmMobileButton block color="danger" fill="outline" onClick={() => confirmDelete(sheet)}>
                        <DeleteOutline fontSize={17} /> Delete
                      </AdmMobileButton>
                    </S.MobileSheetActions>
                  </S.MobileSheetBody>
                </MobileCard>
              ))}
            </S.MobileSheetsList>
          )}
        </MobilePageScaffold>

        <MobileFilterSheet
          description="Show one rules system at a time."
          footer={
            <MobileActionBar
              primary={
                <AdmMobileButton block color="primary" onClick={() => setFilterSheetOpen(false)}>
                  Apply
                </AdmMobileButton>
              }
              secondary={
                <AdmMobileButton
                  block
                  fill="outline"
                  onClick={() => {
                    setTypeFilter('all');
                    setFilterSheetOpen(false);
                  }}
                >
                  Reset
                </AdmMobileButton>
              }
              sticky={false}
            />
          }
          onClose={() => setFilterSheetOpen(false)}
          title="Sheet filters"
          visible={filterSheetOpen}
        >
          <MobileSelector<SheetType | 'all'>
            columns={1}
            inset={false}
            onChange={(values) => setTypeFilter(values[0] ?? 'all')}
            options={mobileTypeOptions}
            value={[typeFilter]}
          />
        </MobileFilterSheet>

        <MobileEntitySheet
          description="Pick a system and character name. The new sheet opens immediately after creation."
          footer={
            <MobileActionBar
              primary={
                <AdmMobileButton block color="primary" loading={creating} onClick={() => void doCreate()}>
                  Create
                </AdmMobileButton>
              }
              secondary={
                <AdmMobileButton block fill="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </AdmMobileButton>
              }
              sticky={false}
            />
          }
          onClose={() => setCreateOpen(false)}
          subtitle="GM only"
          title="New Character Sheet"
          visible={createOpen}
        >
          <MobileCard compact title="Sheet details">
            <MobileForm>
              <MobileForm.Item label="Character name">
                <AdmMobileInput clearable onChange={setNewName} placeholder="Ex: Alis Landale" value={newName} />
              </MobileForm.Item>
              <MobileForm.Item label="System">
                <MobileSelector<SheetType>
                  columns={1}
                  inset={false}
                  onChange={(values) => setNewType(values[0] ?? 'starfinder')}
                  options={[
                    { label: 'Starfinder', value: 'starfinder' },
                    { label: 'GURPS', value: 'gurps' },
                  ]}
                  value={[newType]}
                />
              </MobileForm.Item>
            </MobileForm>
          </MobileCard>
        </MobileEntitySheet>

        <MobileEntitySheet
          description={
            activeSheet ? `${activeSheet.type === 'gurps' ? 'GURPS' : 'Starfinder'} character sheet.` : undefined
          }
          footer={
            <MobileActionBar
              primary={
                <AdmMobileButton block color="primary" loading={savingSheet} onClick={() => void saveSheet()}>
                  Save sheet
                </AdmMobileButton>
              }
              secondary={
                <AdmMobileButton block fill="outline" onClick={() => setDrawerOpen(false)}>
                  Close
                </AdmMobileButton>
              }
              sticky={false}
            />
          }
          onClose={() => setDrawerOpen(false)}
          subtitle="Mobile editor"
          title={
            activeSheet ? (
              <IconLabel icon={activeSheet.type === 'gurps' ? 'sheet' : 'star'}>
                {sheetName || activeSheet.name}
              </IconLabel>
            ) : (
              'Sheet'
            )
          }
          visible={drawerOpen}
        >
          {activeSheet ? (
            <>
              <MobileCard compact title="Character name">
                <MobileForm>
                  <MobileForm.Item label="Name">
                    <AdmMobileInput clearable onChange={setSheetName} placeholder="Character name" value={sheetName} />
                  </MobileForm.Item>
                </MobileForm>
              </MobileCard>
              {activeSheet.type === 'gurps' && (
                <GurpsSheetForm
                  data={sheetData as unknown as GurpsSheetData}
                  onChange={(data) => setSheetData(data as unknown as Record<string, unknown>)}
                />
              )}
              {activeSheet.type === 'starfinder' && (
                <StarfinderSheetForm
                  data={sheetData as unknown as StarfinderSheetData}
                  onChange={(data) => setSheetData(data as unknown as Record<string, unknown>)}
                />
              )}
            </>
          ) : null}
        </MobileEntitySheet>

        <MobileDialog
          actions={[
            {
              key: 'cancel',
              text: 'Cancel',
              onClick: () => setDeleteTarget(null),
            },
            {
              key: 'delete',
              text: 'Delete sheet',
              bold: true,
              danger: true,
              onClick: () => {
                if (deleteTarget) {
                  return removeSheet(deleteTarget);
                }
              },
            },
          ]}
          content={deleteTarget ? `Delete "${deleteTarget.name}" permanently?` : ''}
          onClose={() => setDeleteTarget(null)}
          title="Delete sheet?"
          visible={Boolean(deleteTarget)}
        />
      </>
    );
  }

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
