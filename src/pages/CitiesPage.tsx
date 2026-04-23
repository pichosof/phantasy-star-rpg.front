/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Divider, Drawer, Empty, Modal, Popconfirm, Space, Switch, Tabs, Tag, Typography, message } from 'antd';
import type { TabsProps } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  FullscreenOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import {
  Button as AdmMobileButton,
  SpinLoading,
  Switch as AdmMobileSwitch,
  Tag as AdmMobileTag,
  TextArea as AdmMobileTextArea,
  Input as AdmMobileInput,
} from 'antd-mobile';
import { AddOutline, FilterOutline, SetOutline } from 'antd-mobile-icons';

import { listLoresByCityId, listQuestsByCityId } from '@app/api/cityLinks.api';
import { resolvedImages } from '@app/api/cities.api';
import type { Lore } from '@app/api/lore.api';
import type { Quest } from '@app/api/quests.api';
import { CitiesApi } from '@app/api/rpg.api';
import { resolveApiUrl } from '@app/api/http.api';
import { Card } from '@app/components/common/Card/Card';
import { IconLabel } from '@app/components/common/AppIcon/AppIcon';
import {
  MobileActionBar,
  MobileCard,
  MobileEntitySheet,
  MobileFilterSheet,
  MobileList,
  MobilePageScaffold,
  MobileSearchBar,
  MobileSelector,
  MobileTabs,
} from '@app/components/common/mobile';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Input, TextArea } from '@app/components/common/inputs/Input/Input';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { Table } from '@app/components/common/Table/Table';
import { CityAdminDrawer } from '@app/components/rpg/City/CityAdminDrawer';
import { useGMMode } from '@app/hooks/useGMMode';
import { useResponsive } from '@app/hooks/useResponsive';
import type { City } from '@app/types/rpg';
import {
  bold700,
  bold800,
  cardGrid2,
  carouselCounterCenter,
  carouselCounterCenterLg,
  carouselNavBtnLeft,
  carouselNavBtnLeftLg,
  carouselNavBtnRight,
  carouselNavBtnRightLg,
  carouselZoomBtn,
  dividerMd,
  dividerSm,
  imgThumbTop,
  m0,
  preWrap,
  spaceBetween,
  tableWrap,
  textMd,
  textSm,
  w100,
} from '@app/styles/styleUtils';
import { apiErrorMessage } from '../utils/api-error';
import * as S from './CitiesPage.styles';

type ViewMode = 'players' | 'gm';
type VisibilityFilter = 'all' | 'visible' | 'hidden';
type CitySheetTab = 'overview' | 'lores' | 'quests' | 'gm';

function isCityVisible(city: City) {
  return (city.visible ?? true) === true;
}

function parseCoordinates(value?: string | null): { u: number; v: number } | null {
  if (!value) return null;
  const parts = value.split(',').map((entry) => Number(entry.trim()));
  if (parts.length !== 2 || parts.some((entry) => !Number.isFinite(entry))) return null;

  const [u, v] = parts;
  if (u < 0 || u > 1 || v < 0 || v > 1) return null;

  return { u, v };
}

function isCityMapped(city: City) {
  const coordinates = (city as any).coordinates as string | null | undefined;
  return Boolean(parseCoordinates(coordinates));
}

function formatDate(value?: string | null) {
  if (!value) return '-';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleString();
}

function getCityCover(city: City) {
  const images = resolvedImages(city as any);
  if (images[0]) {
    return images[0];
  }

  if ((city as any).imageUrl) {
    const src = resolveApiUrl((city as any).imageUrl) ?? (city as any).imageUrl;
    return { id: -1, src, alt: (city as any).imageAlt ?? city.name };
  }

  return null;
}

function getCitySummary(city: City, mode: ViewMode) {
  if (mode === 'players' && !city.discovered) {
    return 'Information unavailable until the city is discovered.';
  }

  const description = city.description?.trim();
  if (!description) {
    return mode === 'players' ? 'No description yet.' : 'No description added yet.';
  }

  return description.length > 160 ? `${description.slice(0, 157)}...` : description;
}

function CityImageCarousel({ city }: { city: City }) {
  const images = resolvedImages(city as any);
  const fallback = city.imageUrl
    ? [{ id: -1, src: resolveApiUrl(city.imageUrl) ?? city.imageUrl, alt: city.imageAlt ?? city.name }]
    : [];
  const all = (images.length > 0 ? images : fallback).map((image) => ({ ...image, src: image.src ?? '' }));

  const [index, setIndex] = React.useState(0);
  const [lightbox, setLightbox] = React.useState(false);

  if (!city.discovered || all.length === 0) return null;

  const current = all[Math.min(index, all.length - 1)];
  const prev = () => setIndex((value) => (value - 1 + all.length) % all.length);
  const next = () => setIndex((value) => (value + 1) % all.length);

  return (
    <>
      <div style={S.carouselFrame}>
        <img alt={current.alt} src={current.src} style={S.carouselImage} />

        <button onClick={() => setLightbox(true)} style={carouselZoomBtn}>
          <FullscreenOutlined />
        </button>

        {all.length > 1 && (
          <>
            <button onClick={prev} style={carouselNavBtnLeft}>
              <LeftOutlined />
            </button>
            <button onClick={next} style={carouselNavBtnRight}>
              <RightOutlined />
            </button>
            <div style={carouselCounterCenter}>
              {index + 1} / {all.length}
            </div>
          </>
        )}
      </div>

      {all.length > 1 && (
        <div style={S.carouselThumbStrip}>
          {all.map((image, imageIndex) => (
            <img
              key={image.id}
              alt={image.alt}
              onClick={() => setIndex(imageIndex)}
              src={image.src}
              style={S.carouselThumb(imageIndex === index)}
            />
          ))}
        </div>
      )}

      <Modal
        centered
        destroyOnHidden={false}
        footer={null}
        onCancel={() => setLightbox(false)}
        open={lightbox}
        styles={{ body: S.carouselLightboxBody }}
        width="92vw"
      >
        <img alt={current.alt} src={current.src} style={S.carouselLightboxImage} />
        {all.length > 1 && (
          <>
            <button onClick={prev} style={carouselNavBtnLeftLg}>
              <LeftOutlined />
            </button>
            <button onClick={next} style={carouselNavBtnRightLg}>
              <RightOutlined />
            </button>
            <div style={carouselCounterCenterLg}>
              {index + 1} / {all.length}
            </div>
          </>
        )}
      </Modal>
    </>
  );
}

export const CitiesPage: React.FC = () => {
  const { mobileOnly } = useResponsive();
  const isGM = useGMMode();

  const [cityLores, setCityLores] = React.useState<Lore[]>([]);
  const [cityQuests, setCityQuests] = React.useState<Quest[]>([]);
  const [linksLoading, setLinksLoading] = React.useState(false);

  const [items, setItems] = React.useState<City[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [creating, setCreating] = React.useState(false);
  const [creatingCity, setCreatingCity] = React.useState(false);
  const [name, setName] = React.useState('');
  const [desc, setDesc] = React.useState('');

  const [search, setSearch] = React.useState('');
  const [filterVis, setFilterVis] = React.useState<VisibilityFilter>('all');
  const [filterSheetOpen, setFilterSheetOpen] = React.useState(false);
  const [openCityId, setOpenCityId] = React.useState<number | null>(null);
  const [citySheetTab, setCitySheetTab] = React.useState<CitySheetTab>('overview');

  const [viewMode, setViewMode] = React.useState<ViewMode>('players');

  const [adminOpen, setAdminOpen] = React.useState(false);
  const [adminCityId, setAdminCityId] = React.useState<number | null>(null);
  const adminCity = React.useMemo(() => items.find((entry) => entry.id === adminCityId) ?? null, [items, adminCityId]);

  React.useEffect(() => {
    if (!isGM) {
      setViewMode('players');
      setFilterVis('all');
      setCreating(false);
      if (citySheetTab === 'gm') {
        setCitySheetTab('overview');
      }
    }
  }, [citySheetTab, isGM]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await CitiesApi.list();
      setItems(data);
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to load cities'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const openCity = React.useMemo(() => items.find((entry) => entry.id === openCityId) ?? null, [items, openCityId]);

  React.useEffect(() => {
    if (!openCity) return;

    if (!openCity.discovered) {
      setCityLores([]);
      setCityQuests([]);
      return;
    }

    let alive = true;
    setLinksLoading(true);

    Promise.all([listLoresByCityId(openCity.id), listQuestsByCityId(openCity.id)])
      .then(([lores, quests]) => {
        if (!alive) return;
        setCityLores(lores);
        setCityQuests(quests);
      })
      .catch(() => {
        if (!alive) return;
        message.error('Failed to load city lores and quests.');
        setCityLores([]);
        setCityQuests([]);
      })
      .finally(() => {
        if (!alive) return;
        setLinksLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [openCity]);

  function openAdmin(city: City) {
    setAdminCityId(city.id);
    setAdminOpen(true);
  }

  function openCitySheet(city: City, tab: CitySheetTab = 'overview') {
    setOpenCityId(city.id);
    setCitySheetTab(isGM ? tab : 'overview');
  }

  function closeCitySheet() {
    setOpenCityId(null);
    setCitySheetTab('overview');
  }

  const q = search.trim().toLowerCase();
  const playerItems = React.useMemo(
    () =>
      items
        .filter((city) => isCityVisible(city))
        .filter((city) =>
          q ? city.name.toLowerCase().includes(q) || (city.description ?? '').toLowerCase().includes(q) : true,
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    [items, q],
  );

  const gmItems = React.useMemo(
    () =>
      items
        .filter((city) => {
          if (filterVis === 'visible' && !isCityVisible(city)) return false;
          if (filterVis === 'hidden' && isCityVisible(city)) return false;
          return q ? city.name.toLowerCase().includes(q) || (city.description ?? '').toLowerCase().includes(q) : true;
        })
        .sort((a, b) => a.id - b.id),
    [filterVis, items, q],
  );

  const stats = React.useMemo(() => {
    const total = items.length;
    const visible = items.filter((city) => isCityVisible(city)).length;
    const hidden = total - visible;
    const discovered = items.filter((city) => city.discovered).length;
    const undiscovered = total - discovered;
    const mapped = items.filter((city) => isCityMapped(city)).length;
    return { total, visible, hidden, discovered, undiscovered, mapped };
  }, [items]);

  async function handleCreateCity() {
    const trimmedName = name.trim();
    const trimmedDesc = desc.trim();

    if (!trimmedName) {
      message.warning('Name is required.');
      return;
    }

    setCreatingCity(true);
    try {
      const created = await CitiesApi.create({ name: trimmedName, description: trimmedDesc || null });
      setCreating(false);
      setName('');
      setDesc('');
      await load();
      message.success('City created.');

      if (mobileOnly) {
        setOpenCityId(created.id);
        setCitySheetTab(isGM ? 'gm' : 'overview');
      }
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to create city'));
    } finally {
      setCreatingCity(false);
    }
  }

  async function deleteCity(id: number) {
    try {
      await CitiesApi.remove(id);
      setItems((prev) => prev.filter((entry) => entry.id !== id));
      if (openCityId === id) {
        closeCitySheet();
      }
      message.success('City deleted.');
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to delete city'));
    }
  }

  async function toggleVisible(city: City) {
    const nextVisible = !isCityVisible(city);
    setItems((prev) => prev.map((entry) => (entry.id === city.id ? { ...entry, visible: nextVisible } : entry)));

    try {
      await CitiesApi.setVisible(city.id, nextVisible);
      message.success(nextVisible ? 'City visible to players' : 'City hidden');
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to change visibility'));
      await load();
    }
  }

  async function toggleDiscovered(city: City) {
    const nextDiscovered = !city.discovered;
    setItems((prev) => prev.map((entry) => (entry.id === city.id ? { ...entry, discovered: nextDiscovered } : entry)));

    try {
      await CitiesApi.setDiscovered(city.id, nextDiscovered);
      message.success(nextDiscovered ? 'City marked as discovered' : 'City marked as undiscovered');
    } catch (error) {
      message.error(apiErrorMessage(error, 'Failed to change discovered status'));
      await load();
    }
  }

  const desktopHeader = (
    <Card className="rpg-page-header-card" density="dense">
      <Space direction="vertical" size={10} style={w100}>
        <Space size={8} style={spaceBetween}>
          <div>
            <Typography.Title level={4} style={m0}>
              {viewMode === 'gm' ? (
                <IconLabel icon="gm">GM Panel - Cities</IconLabel>
              ) : (
                <IconLabel icon="location">Cities</IconLabel>
              )}
            </Typography.Title>
            <Typography.Text style={textMd} type="secondary">
              {viewMode === 'gm'
                ? 'Control visibility, discovery and city content.'
                : 'Visible cities. Details unlock when the GM marks a city as discovered.'}
            </Typography.Text>
          </div>

          <Space size={8} wrap>
            {isGM && (
              <Space size={4}>
                <Button
                  onClick={() => setViewMode('players')}
                  size="small"
                  type={viewMode === 'players' ? 'primary' : 'default'}
                >
                  <IconLabel icon="read">Cities</IconLabel>
                </Button>
                <Button onClick={() => setViewMode('gm')} size="small" type={viewMode === 'gm' ? 'primary' : 'default'}>
                  <IconLabel icon="gm">GM Panel</IconLabel>
                </Button>
              </Space>
            )}

            {isGM && viewMode === 'gm' && (
              <Button onClick={() => setCreating((current) => !current)} size="small" type="primary">
                {creating ? 'Close' : '+ New City'}
              </Button>
            )}
          </Space>
        </Space>

        <Space size={8} wrap>
          <Tag>{stats.total} cities</Tag>
          {isGM && <Tag color="green">{stats.visible} visible</Tag>}
          {isGM && <Tag color="red">{stats.hidden} hidden</Tag>}
          {isGM && <Tag color="gold">{stats.discovered} discovered</Tag>}
          {isGM && <Tag>{stats.undiscovered} undiscovered</Tag>}
          {isGM && <Tag color="cyan">{stats.mapped} mapped</Tag>}
        </Space>

        <Space size={8} style={w100} wrap>
          <Input
            allowClear
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search city..."
            style={S.searchField}
            value={search}
          />

          {isGM && viewMode === 'gm' && (
            <Space size={4}>
              {(['all', 'visible', 'hidden'] as const).map((value) => (
                <Button
                  key={value}
                  onClick={() => setFilterVis(value)}
                  size="small"
                  type={filterVis === value ? 'primary' : 'default'}
                >
                  {value === 'all' ? 'All' : value === 'visible' ? 'Visible' : 'Hidden'}
                </Button>
              ))}
            </Space>
          )}
        </Space>

        {isGM && viewMode === 'gm' && creating && (
          <>
            <Divider style={dividerSm} />
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleCreateCity();
              }}
              style={S.createForm}
            >
              <Typography.Text strong>New City</Typography.Text>
              <Input
                onChange={(event) => setName(event.target.value)}
                placeholder="City name *"
                required
                value={name}
              />
              <TextArea
                onChange={(event) => setDesc(event.target.value)}
                placeholder="Description (optional)"
                rows={3}
                value={desc}
              />
              <Space>
                <Button htmlType="submit" loading={creatingCity} type="primary">
                  Create City
                </Button>
                <Button
                  onClick={() => {
                    setCreating(false);
                    setName('');
                    setDesc('');
                  }}
                >
                  Cancel
                </Button>
              </Space>
            </form>
          </>
        )}
      </Space>
    </Card>
  );

  const desktopCityCards = ({ data, mode }: { data: City[]; mode: ViewMode }) => {
    if (loading) return <Spinner />;

    if (!data.length) {
      return (
        <Card density="comfy">
          <Empty description={mode === 'players' ? 'No cities visible to players yet.' : 'No cities found.'} />
        </Card>
      );
    }

    return (
      <div style={cardGrid2(mobileOnly)}>
        {data.map((city) => {
          const region = ((city as any).region as string | null | undefined) ?? null;
          const visible = isCityVisible(city);
          const playerCanRead = city.discovered === true;
          const cover = getCityCover(city);

          return (
            <Card
              density={mode === 'players' ? 'comfy' : 'dense'}
              extra={
                mode === 'gm' ? (
                  <Button onClick={() => openAdmin(city)} size="small">
                    Admin
                  </Button>
                ) : (
                  <Button onClick={() => setOpenCityId(city.id)} size="small">
                    View
                  </Button>
                )
              }
              key={city.id}
              title={
                <Space size={8} wrap>
                  <span style={bold700}>{city.name}</span>
                  {region ? <Tag>{region}</Tag> : null}
                  {mode === 'gm' && (
                    <>
                      <Tag color={visible ? 'green' : 'red'}>{visible ? 'Visible' : 'Hidden'}</Tag>
                      <Tag color={city.discovered ? 'gold' : 'default'}>
                        {city.discovered ? 'Discovered' : 'Not discovered'}
                      </Tag>
                      {isCityMapped(city) ? <Tag color="cyan">Mapped</Tag> : <Tag>Not mapped</Tag>}
                    </>
                  )}
                </Space>
              }
            >
              {mode === 'players' && playerCanRead && cover ? (
                <div style={imgThumbTop}>
                  <img alt={cover.alt} src={cover.src} style={S.cityCoverImage} />
                </div>
              ) : null}

              <Typography.Paragraph ellipsis={{ rows: 3 }} style={m0}>
                {mode === 'players'
                  ? playerCanRead
                    ? city.description?.trim() || 'No description yet.'
                    : 'Information unavailable.'
                  : city.description?.trim() || '-'}
              </Typography.Paragraph>

              {mode === 'gm' && (
                <>
                  <Divider style={dividerMd} />
                  <Space size={16} wrap>
                    <Space size={8}>
                      <span className="rpg-text-sm rpg-muted">Visible:</span>
                      <Switch
                        checked={visible}
                        checkedChildren={<EyeOutlined />}
                        onChange={() => void toggleVisible(city)}
                        size="small"
                        unCheckedChildren={<EyeInvisibleOutlined />}
                      />
                    </Space>

                    <Space size={8}>
                      <span className="rpg-text-sm rpg-muted">Discovered:</span>
                      <Switch checked={city.discovered} onChange={() => void toggleDiscovered(city)} size="small" />
                    </Space>
                  </Space>
                </>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  const desktopAdminTable = (
    <Card density="dense" title="Manage Cities">
      <div style={tableWrap}>
        <Table
          columns={[
            {
              title: '#',
              dataIndex: 'id',
              key: 'id',
              width: 60,
              render: (value: number) => <Tag style={m0}>#{value}</Tag>,
            },
            {
              title: 'Visible',
              key: 'visible',
              width: 90,
              render: (_: any, city: City) => (
                <Switch
                  checked={isCityVisible(city)}
                  checkedChildren={<EyeOutlined />}
                  onChange={() => void toggleVisible(city)}
                  size="small"
                  unCheckedChildren={<EyeInvisibleOutlined />}
                />
              ),
            },
            {
              title: 'Discovered',
              key: 'discovered',
              width: 110,
              render: (_: any, city: City) => (
                <Switch checked={city.discovered} onChange={() => void toggleDiscovered(city)} size="small" />
              ),
            },
            {
              title: 'City',
              key: 'name',
              ellipsis: true,
              render: (_: any, city: City) => (
                <Space direction="vertical" size={2} style={w100}>
                  <Space size={6} wrap>
                    <Typography.Text strong>{city.name}</Typography.Text>
                    {!isCityVisible(city) ? <Tag color="red">Hidden</Tag> : <Tag color="green">Visible</Tag>}
                    {city.discovered ? <Tag color="gold">Discovered</Tag> : <Tag>Not discovered</Tag>}
                    {isCityMapped(city) ? <Tag color="cyan">Mapped</Tag> : null}
                  </Space>

                  <Typography.Text style={S.tableDescription} type="secondary">
                    {city.description?.trim() || '-'}
                  </Typography.Text>
                </Space>
              ),
            },
            {
              title: 'Created at',
              dataIndex: 'createdAt',
              key: 'createdAt',
              width: 160,
              render: (value: string) => (
                <Typography.Text style={textSm} type="secondary">
                  {formatDate(value)}
                </Typography.Text>
              ),
            },
            {
              title: 'Actions',
              key: 'actions',
              width: 90,
              render: (_: any, city: City) => (
                <Space size={4}>
                  <Button icon={<EditOutlined />} onClick={() => openAdmin(city)} size="small" />
                  <Popconfirm
                    cancelText="Cancel"
                    okText="Delete"
                    onConfirm={() => void deleteCity(city.id)}
                    title={`Delete "${city.name}" permanently?`}
                  >
                    <Button danger icon={<DeleteOutlined />} size="small" />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          dataSource={gmItems}
          loading={loading}
          rowKey="id"
          scroll={{ x: 960 }}
          style={S.adminTable}
        />
      </div>

      {!gmItems.length && !loading && <Empty description="No cities found." style={S.emptyWithTopSpacing} />}
    </Card>
  );

  const cityDrawerTabItems: TabsProps['items'] = openCity
    ? [
        {
          key: 'desc',
          label: 'Description',
          children: (
            <>
              <CityImageCarousel city={openCity} />
              <Card density="comfy" title="Description">
                <Typography.Paragraph style={preWrap}>
                  {viewMode === 'players'
                    ? openCity.discovered === true
                      ? openCity.description?.trim() || 'No description yet.'
                      : 'Information unavailable.'
                    : openCity.description?.trim() || 'No description.'}
                </Typography.Paragraph>
              </Card>
            </>
          ),
        },
        {
          key: 'lores',
          label: `Lores (${cityLores.length})`,
          children: !openCity.discovered ? (
            <Card density="comfy">
              <Typography.Text type="secondary">Content unavailable until the city is discovered.</Typography.Text>
            </Card>
          ) : linksLoading ? (
            <Spinner />
          ) : !cityLores.length ? (
            <Card density="comfy">
              <Empty description="No lores linked to this city." />
            </Card>
          ) : (
            <div style={S.linkedCardsGrid}>
              {cityLores.map((lore) => (
                <Card density="comfy" key={lore.id} title={lore.title}>
                  {lore.category ? <Tag>{lore.category}</Tag> : null}
                  <Typography.Paragraph style={S.linkedParagraph}>{lore.content?.trim() || '-'}</Typography.Paragraph>
                </Card>
              ))}
            </div>
          ),
        },
        {
          key: 'quests',
          label: `Quests (${cityQuests.length})`,
          children: !openCity.discovered ? (
            <Card density="comfy">
              <Typography.Text type="secondary">Content unavailable until the city is discovered.</Typography.Text>
            </Card>
          ) : linksLoading ? (
            <Spinner />
          ) : !cityQuests.length ? (
            <Card density="comfy">
              <Empty description="No quests linked to this city." />
            </Card>
          ) : (
            <div style={S.linkedCardsGrid}>
              {cityQuests.map((quest) => (
                <Card density="comfy" key={quest.id} title={quest.title}>
                  {quest.status ? <Tag>{quest.status}</Tag> : null}
                  {quest.reward ? <Tag color="gold">Reward</Tag> : null}
                  <Typography.Paragraph style={S.linkedParagraph}>
                    {quest.description?.trim() || '-'}
                  </Typography.Paragraph>
                  {quest.reward ? (
                    <Typography.Text style={S.rewardText} type="secondary">
                      Reward: {quest.reward}
                    </Typography.Text>
                  ) : null}
                </Card>
              ))}
            </div>
          ),
        },
        ...(isGM && viewMode === 'gm'
          ? [
              {
                key: 'gm',
                label: 'GM Actions',
                children: (
                  <Card density="dense" title="Controls">
                    <Space direction="vertical" size={12} style={w100}>
                      <Space style={spaceBetween}>
                        <div>
                          <Typography.Text>Visible to players</Typography.Text>
                          <br />
                          <Typography.Text style={textSm} type="secondary">
                            Hidden cities do not appear in the list.
                          </Typography.Text>
                        </div>
                        <Switch
                          checked={isCityVisible(openCity)}
                          checkedChildren={<EyeOutlined />}
                          onChange={() => void toggleVisible(openCity)}
                          unCheckedChildren={<EyeInvisibleOutlined />}
                        />
                      </Space>

                      <Space style={spaceBetween}>
                        <div>
                          <Typography.Text>Marked as discovered</Typography.Text>
                          <br />
                          <Typography.Text style={textSm} type="secondary">
                            Unlocks description, lores and quests for players.
                          </Typography.Text>
                        </div>
                        <Switch checked={openCity.discovered} onChange={() => void toggleDiscovered(openCity)} />
                      </Space>

                      <Divider style={dividerSm} />

                      <Typography.Text style={textSm} type="secondary">
                        Created: {formatDate((openCity as any).createdAt)} {'  ·  '} Updated:{' '}
                        {formatDate((openCity as any).updatedAt)}
                      </Typography.Text>
                    </Space>
                  </Card>
                ),
              },
            ]
          : []),
      ]
    : [];

  const cityDrawer = openCity ? (
    <Drawer
      onClose={() => setOpenCityId(null)}
      open={Boolean(openCity)}
      size={mobileOnly ? '100%' : 560}
      title={
        <Space size={8} wrap>
          <span style={bold800}>{openCity.name}</span>
          {isGM && viewMode === 'gm' && (
            <>
              <Tag color={isCityVisible(openCity) ? 'green' : 'red'}>
                {isCityVisible(openCity) ? 'Visible' : 'Hidden'}
              </Tag>
              {openCity.discovered ? <Tag color="gold">Discovered</Tag> : <Tag>Not discovered</Tag>}
            </>
          )}
        </Space>
      }
    >
      <Tabs defaultActiveKey="desc" items={cityDrawerTabItems} />
    </Drawer>
  ) : null;

  const mobileMeta = (
    <div style={S.mobileMetaTags}>
      <AdmMobileTag fill="outline" round>
        {stats.total} cities
      </AdmMobileTag>
      {isGM && (
        <AdmMobileTag color="success" fill="outline" round>
          {stats.visible} visible
        </AdmMobileTag>
      )}
      {isGM && (
        <AdmMobileTag color="warning" fill="outline" round>
          {stats.hidden} hidden
        </AdmMobileTag>
      )}
      {isGM && (
        <AdmMobileTag color="primary" fill="outline" round>
          {stats.discovered} discovered
        </AdmMobileTag>
      )}
    </div>
  );

  const mobileFilters = (
    <>
      <MobileSearchBar inset={false} onChange={setSearch} placeholder="Search city..." value={search} />
      {isGM && (
        <div style={S.mobileActionRow}>
          <AdmMobileButton fill="outline" onClick={() => setFilterSheetOpen(true)} size="small">
            <FilterOutline fontSize={17} /> Filters
          </AdmMobileButton>
          {viewMode === 'gm' && (
            <AdmMobileButton color="primary" onClick={() => setCreating(true)} size="small">
              <AddOutline fontSize={17} /> New city
            </AdmMobileButton>
          )}
        </div>
      )}
    </>
  );

  const mobileOverview = openCity ? (
    <div style={S.mobileSectionStack}>
      <CityImageCarousel city={openCity} />

      <MobileCard compact title="Description">
        <Typography.Paragraph style={preWrap}>
          {viewMode === 'players'
            ? openCity.discovered
              ? openCity.description?.trim() || 'No description yet.'
              : 'Information unavailable until this city is discovered.'
            : openCity.description?.trim() || 'No description yet.'}
        </Typography.Paragraph>
      </MobileCard>

      <MobileCard compact title="Details">
        <dl style={S.mobileDetailGrid}>
          <div style={S.mobileDetailItem}>
            <dt style={S.mobileDetailLabel}>City ID</dt>
            <dd style={S.mobileDetailValue}>#{openCity.id}</dd>
          </div>
          <div style={S.mobileDetailItem}>
            <dt style={S.mobileDetailLabel}>Region</dt>
            <dd style={S.mobileDetailValue}>{((openCity as any).region as string | null | undefined) ?? '-'}</dd>
          </div>
          <div style={S.mobileDetailItem}>
            <dt style={S.mobileDetailLabel}>Status</dt>
            <dd style={S.mobileDetailValue}>{openCity.discovered ? 'Discovered' : 'Undiscovered'}</dd>
          </div>
          <div style={S.mobileDetailItem}>
            <dt style={S.mobileDetailLabel}>Map</dt>
            <dd style={S.mobileDetailValue}>{isCityMapped(openCity) ? 'Mapped' : 'Not mapped'}</dd>
          </div>
          <div style={S.mobileDetailItem}>
            <dt style={S.mobileDetailLabel}>Created</dt>
            <dd style={S.mobileDetailValue}>{formatDate((openCity as any).createdAt)}</dd>
          </div>
          <div style={S.mobileDetailItem}>
            <dt style={S.mobileDetailLabel}>Updated</dt>
            <dd style={S.mobileDetailValue}>{formatDate((openCity as any).updatedAt)}</dd>
          </div>
        </dl>
      </MobileCard>
    </div>
  ) : null;

  const mobileLores = openCity ? (
    !openCity.discovered ? (
      <MobileCard compact>
        <Typography.Text type="secondary">Content unavailable until the city is discovered.</Typography.Text>
      </MobileCard>
    ) : linksLoading ? (
      <MobileCard compact>
        <div style={S.mobileLoadingState}>
          <SpinLoading color="primary" />
        </div>
      </MobileCard>
    ) : !cityLores.length ? (
      <MobileCard compact>
        <Empty description="No lores linked to this city." />
      </MobileCard>
    ) : (
      <MobileList>
        {cityLores.map((lore) => (
          <MobileList.Item
            description={lore.content?.trim() || 'No lore summary yet.'}
            extra={
              lore.category ? (
                <AdmMobileTag fill="outline" round>
                  {lore.category}
                </AdmMobileTag>
              ) : null
            }
            key={lore.id}
          >
            {lore.title}
          </MobileList.Item>
        ))}
      </MobileList>
    )
  ) : null;

  const mobileQuests = openCity ? (
    !openCity.discovered ? (
      <MobileCard compact>
        <Typography.Text type="secondary">Content unavailable until the city is discovered.</Typography.Text>
      </MobileCard>
    ) : linksLoading ? (
      <MobileCard compact>
        <div style={S.mobileLoadingState}>
          <SpinLoading color="primary" />
        </div>
      </MobileCard>
    ) : !cityQuests.length ? (
      <MobileCard compact>
        <Empty description="No quests linked to this city." />
      </MobileCard>
    ) : (
      <MobileList>
        {cityQuests.map((quest) => (
          <MobileList.Item
            description={quest.description?.trim() || 'No quest summary yet.'}
            extra={
              <div style={S.mobileMetaTags}>
                {quest.status ? (
                  <AdmMobileTag fill="outline" round>
                    {quest.status}
                  </AdmMobileTag>
                ) : null}
                {quest.reward ? (
                  <AdmMobileTag color="warning" fill="outline" round>
                    Reward
                  </AdmMobileTag>
                ) : null}
              </div>
            }
            key={quest.id}
          >
            {quest.title}
          </MobileList.Item>
        ))}
      </MobileList>
    )
  ) : null;

  const mobileGM = openCity ? (
    <div style={S.mobileSectionStack}>
      <MobileCard compact title="Controls">
        <div style={S.mobileSectionStack}>
          <div style={S.mobileStatusRow}>
            <span style={S.mobileInlineLabel}>Visible to players</span>
            <AdmMobileSwitch checked={isCityVisible(openCity)} onChange={() => void toggleVisible(openCity)} />
          </div>
          <div style={S.mobileStatusRow}>
            <span style={S.mobileInlineLabel}>Marked as discovered</span>
            <AdmMobileSwitch checked={Boolean(openCity.discovered)} onChange={() => void toggleDiscovered(openCity)} />
          </div>
        </div>
      </MobileCard>

      <MobileCard compact title="Metadata">
        <dl style={S.mobileDetailGrid}>
          <div style={S.mobileDetailItem}>
            <dt style={S.mobileDetailLabel}>Visible</dt>
            <dd style={S.mobileDetailValue}>{isCityVisible(openCity) ? 'Yes' : 'No'}</dd>
          </div>
          <div style={S.mobileDetailItem}>
            <dt style={S.mobileDetailLabel}>Discovered</dt>
            <dd style={S.mobileDetailValue}>{openCity.discovered ? 'Yes' : 'No'}</dd>
          </div>
          <div style={S.mobileDetailItem}>
            <dt style={S.mobileDetailLabel}>Mapped</dt>
            <dd style={S.mobileDetailValue}>{isCityMapped(openCity) ? 'Yes' : 'No'}</dd>
          </div>
          <div style={S.mobileDetailItem}>
            <dt style={S.mobileDetailLabel}>Region</dt>
            <dd style={S.mobileDetailValue}>{((openCity as any).region as string | null | undefined) ?? '-'}</dd>
          </div>
        </dl>
      </MobileCard>

      <MobileCard compact title="Admin Editor">
        <Typography.Paragraph style={S.linkedParagraph}>
          Use the full editor to manage city details, tags, images, lores, quests and world links.
        </Typography.Paragraph>
        <AdmMobileButton
          block
          color="primary"
          onClick={() => {
            closeCitySheet();
            openAdmin(openCity);
          }}
        >
          <SetOutline fontSize={17} /> Open full editor
        </AdmMobileButton>
      </MobileCard>
    </div>
  ) : null;

  if (mobileOnly) {
    const mobileItems = viewMode === 'gm' && isGM ? gmItems : playerItems;

    return (
      <>
        <PageTitle>Cities</PageTitle>

        <MobilePageScaffold
          actions={
            isGM ? (
              <div style={S.mobileActionRow}>
                <AdmMobileButton
                  fill={viewMode === 'players' ? 'solid' : 'outline'}
                  onClick={() => setViewMode('players')}
                  size="small"
                >
                  Cities
                </AdmMobileButton>
                <AdmMobileButton
                  color="primary"
                  fill={viewMode === 'gm' ? 'solid' : 'outline'}
                  onClick={() => setViewMode('gm')}
                  size="small"
                >
                  <SetOutline fontSize={16} /> GM
                </AdmMobileButton>
              </div>
            ) : null
          }
          filters={mobileFilters}
          meta={mobileMeta}
          subtitle={
            viewMode === 'gm'
              ? 'Control visibility, discovery and city content with mobile-first access.'
              : 'Visible cities and their lore open up as the campaign discovers them.'
          }
          title={
            viewMode === 'gm' ? (
              <IconLabel icon="gm">GM Panel - Cities</IconLabel>
            ) : (
              <IconLabel icon="location">Cities</IconLabel>
            )
          }
        >
          {loading ? (
            <MobileCard compact>
              <div style={S.mobileLoadingState}>
                <SpinLoading color="primary" />
              </div>
            </MobileCard>
          ) : !mobileItems.length ? (
            <MobileCard compact>
              <Empty description={viewMode === 'players' ? 'No cities visible to players yet.' : 'No cities found.'} />
            </MobileCard>
          ) : (
            <div style={S.mobileCitiesGrid}>
              {mobileItems.map((city) => {
                const cover = getCityCover(city);
                const region = ((city as any).region as string | null | undefined) ?? null;

                return (
                  <MobileCard compact key={city.id}>
                    <div style={S.mobileCityCardBody}>
                      <div style={S.mobileCityMedia}>
                        {cover ? (
                          <img alt={cover.alt} src={cover.src} style={S.mobileCityImage} />
                        ) : (
                          <div style={S.mobileImageFallback}>
                            <IconLabel icon="location">City</IconLabel>
                          </div>
                        )}
                      </div>

                      <div style={S.mobileCityTitleRow}>
                        <div style={S.mobileCityIdentity}>
                          <div style={S.mobileCityName}>{city.name}</div>
                          <div style={S.mobileMetaTags}>
                            {region ? (
                              <AdmMobileTag fill="outline" round>
                                {region}
                              </AdmMobileTag>
                            ) : null}
                            {isGM && viewMode === 'gm' ? (
                              <>
                                <AdmMobileTag color={isCityVisible(city) ? 'success' : 'warning'} fill="outline" round>
                                  {isCityVisible(city) ? 'Visible' : 'Hidden'}
                                </AdmMobileTag>
                                <AdmMobileTag color={city.discovered ? 'primary' : 'default'} fill="outline" round>
                                  {city.discovered ? 'Discovered' : 'Undiscovered'}
                                </AdmMobileTag>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <p style={S.mobileCitySummary}>
                        {getCitySummary(city, viewMode === 'gm' && isGM ? 'gm' : 'players')}
                      </p>

                      <div style={S.mobileCityButtons}>
                        <AdmMobileButton block color="primary" onClick={() => openCitySheet(city, 'overview')}>
                          Open city
                        </AdmMobileButton>
                        {isGM && viewMode === 'gm' ? (
                          <AdmMobileButton block fill="outline" onClick={() => openCitySheet(city, 'gm')}>
                            GM controls
                          </AdmMobileButton>
                        ) : (
                          <AdmMobileButton block fill="outline" onClick={() => openCitySheet(city, 'quests')}>
                            Related content
                          </AdmMobileButton>
                        )}
                      </div>
                    </div>
                  </MobileCard>
                );
              })}
            </div>
          )}
        </MobilePageScaffold>

        {isGM && (
          <MobileFilterSheet
            description="Switch between the public city list and GM controls, and filter visibility."
            footer={
              <MobileActionBar sticky={false}>
                <AdmMobileButton block color="primary" onClick={() => setFilterSheetOpen(false)}>
                  Done
                </AdmMobileButton>
              </MobileActionBar>
            }
            onClose={() => setFilterSheetOpen(false)}
            title="City filters"
            visible={filterSheetOpen}
          >
            <div style={S.mobileCreateFields}>
              <div style={S.mobileCreateField}>
                <label style={S.mobileFieldLabel}>Panel</label>
                <MobileSelector
                  columns={2}
                  inset={false}
                  onChange={(values) => setViewMode((values[0] as ViewMode | undefined) ?? 'players')}
                  options={[
                    { label: 'Cities', value: 'players' },
                    { label: 'GM panel', value: 'gm' },
                  ]}
                  value={[viewMode]}
                />
              </div>

              <div style={S.mobileCreateField}>
                <label style={S.mobileFieldLabel}>Visibility</label>
                <MobileSelector
                  columns={3}
                  inset={false}
                  onChange={(values) => setFilterVis((values[0] as VisibilityFilter | undefined) ?? 'all')}
                  options={[
                    { label: 'All', value: 'all' },
                    { label: 'Visible', value: 'visible' },
                    { label: 'Hidden', value: 'hidden' },
                  ]}
                  value={[filterVis]}
                />
              </div>
            </div>
          </MobileFilterSheet>
        )}

        <MobileEntitySheet
          description={
            openCity
              ? isGM
                ? 'Overview, linked lore, quests and GM controls for this city.'
                : 'Description and linked campaign content for this city.'
              : undefined
          }
          onClose={closeCitySheet}
          subtitle={
            openCity && ((openCity as any).region as string | null | undefined)
              ? `Region: ${(openCity as any).region}`
              : undefined
          }
          title={openCity?.name ?? 'City'}
          visible={Boolean(openCity)}
        >
          {openCity && isGM ? (
            <MobileTabs
              activeKey={citySheetTab}
              items={[
                { key: 'overview', title: 'Overview', children: mobileOverview },
                { key: 'lores', title: `Lores (${cityLores.length})`, children: mobileLores },
                { key: 'quests', title: `Quests (${cityQuests.length})`, children: mobileQuests },
                { key: 'gm', title: 'GM', children: mobileGM },
              ]}
              onChange={(key) => setCitySheetTab(key as CitySheetTab)}
            />
          ) : (
            <div style={S.mobileSectionStack}>
              {mobileOverview}
              {mobileLores}
              {mobileQuests}
            </div>
          )}
        </MobileEntitySheet>

        <MobileEntitySheet
          description="Create a city from mobile first, then refine details and links in the admin editor."
          footer={
            <MobileActionBar
              primary={
                <AdmMobileButton block color="primary" loading={creatingCity} onClick={() => void handleCreateCity()}>
                  Create city
                </AdmMobileButton>
              }
              secondary={
                <AdmMobileButton
                  block
                  fill="outline"
                  onClick={() => {
                    setCreating(false);
                    setName('');
                    setDesc('');
                  }}
                >
                  Cancel
                </AdmMobileButton>
              }
              sticky={false}
            />
          }
          onClose={() => {
            setCreating(false);
            setName('');
            setDesc('');
          }}
          subtitle="GM only"
          title="New city"
          visible={creating && isGM && viewMode === 'gm'}
        >
          <MobileCard compact title="City details">
            <div style={S.mobileCreateFields}>
              <div style={S.mobileCreateField}>
                <label htmlFor="city-name-mobile" style={S.mobileFieldLabel}>
                  Name *
                </label>
                <AdmMobileInput
                  clearable
                  id="city-name-mobile"
                  onChange={setName}
                  placeholder="City name"
                  value={name}
                />
              </div>
              <div style={S.mobileCreateField}>
                <label htmlFor="city-desc-mobile" style={S.mobileFieldLabel}>
                  Description
                </label>
                <AdmMobileTextArea
                  autoSize={{ minRows: 5, maxRows: 8 }}
                  id="city-desc-mobile"
                  onChange={setDesc}
                  placeholder="Description or campaign hook"
                  value={desc}
                />
              </div>
            </div>
          </MobileCard>
        </MobileEntitySheet>

        <CityAdminDrawer
          city={adminCity}
          isGM={isGM}
          onChanged={load}
          onClose={() => {
            setAdminOpen(false);
            setAdminCityId(null);
          }}
          open={adminOpen}
        />
      </>
    );
  }

  return (
    <>
      <PageTitle>Cities</PageTitle>

      {desktopHeader}

      {viewMode === 'gm' && isGM ? (
        <>
          {loading ? <Spinner /> : desktopAdminTable}
          <CityAdminDrawer
            city={adminCity}
            isGM={isGM}
            onChanged={load}
            onClose={() => {
              setAdminOpen(false);
              setAdminCityId(null);
            }}
            open={adminOpen}
          />
        </>
      ) : (
        <>
          {loading ? <Spinner /> : desktopCityCards({ data: playerItems, mode: 'players' })}
          {!mobileOnly ? cityDrawer : null}
        </>
      )}
    </>
  );
};

export default CitiesPage;
