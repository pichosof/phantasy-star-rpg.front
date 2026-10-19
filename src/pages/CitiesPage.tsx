/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Divider, Empty, Popconfirm, Space, Switch, Tag, Typography, message } from 'antd';

import {
  DeleteOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import {
  Button as AdmMobileButton,
  SpinLoading,
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
  carouselCounterCenter,
  carouselNavBtnLeft,
  carouselNavBtnRight,
  dividerSm,
  m0,
  spaceBetween,
  tableWrap,
  textMd,
  textSm,
  w100,
} from '@app/styles/styleUtils';
import { apiErrorMessage } from '../utils/api-error';
import * as S from './CitiesPage.styles';
import RichText, { stripMarkdown } from '@app/components/common/RichText/RichText';
import EntityDrawer, { discoveredControl, visibilityControl } from '@app/components/common/EntityDrawer/EntityDrawer';
import EntityCard, { EntityCardGrid } from '@app/components/common/EntityCard/EntityCard';
import { thumbUrl } from '@app/api/images.api';
import ContainedImage from '@app/components/common/ContainedImage/ContainedImage';

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

function CityImageCarousel({ city, editableFocus = false }: { city: City; editableFocus?: boolean }) {
  const images = resolvedImages(city as any);
  const fallback = city.imageUrl
    ? [{ id: -1, src: resolveApiUrl(city.imageUrl) ?? city.imageUrl, alt: city.imageAlt ?? city.name }]
    : [];
  const all = (images.length > 0 ? images : fallback).map((image) => ({ ...image, src: image.src ?? '' }));

  const [index, setIndex] = React.useState(0);

  if (!city.discovered && !editableFocus) return null;
  if (all.length === 0) return null;

  const current = all[Math.min(index, all.length - 1)];
  const prev = () => setIndex((value) => (value - 1 + all.length) % all.length);
  const next = () => setIndex((value) => (value + 1) % all.length);

  return (
    <div style={S.carouselFrame}>
      <ContainedImage alt={current.alt} editableFocus={editableFocus} height={300} src={current.src}>
        {all.length > 1 && (
          <>
            <button onClick={stop(prev)} style={carouselNavBtnLeft} type="button">
              <LeftOutlined />
            </button>
            <button onClick={stop(next)} style={carouselNavBtnRight} type="button">
              <RightOutlined />
            </button>
            <div style={carouselCounterCenter}>
              {index + 1} / {all.length}
            </div>
          </>
        )}
      </ContainedImage>

      {all.length > 1 && (
        <div style={S.carouselThumbStrip}>
          {all.map((image, imageIndex) => (
            <img
              alt={image.alt}
              key={image.id}
              loading="lazy"
              onClick={() => setIndex(imageIndex)}
              src={thumbUrl(image.src, 320)}
              style={S.carouselThumb(imageIndex === index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Carousel arrows sit on top of the zoomable image: don't let them open the lightbox. */
function stop(fn: () => void) {
  return (event: React.MouseEvent) => {
    event.stopPropagation();
    fn();
  };
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
      <Space orientation="vertical" size={10} style={w100}>
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

  const cityCards = ({
    data,
    mode,
    onOpen,
  }: {
    data: City[];
    mode: ViewMode;
    /** Phones: open the sheet on a given tab instead of the desktop drawers. */
    onOpen?: (city: City, tab: CitySheetTab) => void;
  }) => {
    if (loading) return <Spinner />;

    if (!data.length) {
      return (
        <Card density="comfy">
          <Empty description={mode === 'players' ? 'No cities visible to players yet.' : 'No cities found.'} />
        </Card>
      );
    }

    return (
      <EntityCardGrid>
        {data.map((city) => {
          const region = ((city as any).region as string | null | undefined) ?? null;
          const visible = isCityVisible(city);
          const playerCanRead = city.discovered === true;
          const cover = getCityCover(city);
          const showCover = mode === 'gm' || playerCanRead;

          return (
            <EntityCard
              actions={
                mode === 'gm' ? (
                  <>
                    <Switch
                      checked={visible}
                      checkedChildren={<EyeOutlined />}
                      onChange={() => void toggleVisible(city)}
                      size="small"
                      title="Visible to players"
                      unCheckedChildren={<EyeInvisibleOutlined />}
                    />
                    <Switch
                      checked={city.discovered}
                      onChange={() => void toggleDiscovered(city)}
                      size="small"
                      title="Discovered"
                    />
                    <Button onClick={() => (onOpen ? onOpen(city, 'gm') : openAdmin(city))} size="small">
                      Admin
                    </Button>
                  </>
                ) : null
              }
              chips={mode === 'gm' ? isCityMapped(city) ? <Tag color="cyan">Mapped</Tag> : <Tag>Not mapped</Tag> : null}
              cover={showCover && cover ? { src: cover.src, alt: cover.alt } : null}
              footer={formatDate((city as any).createdAt)}
              icon="location"
              key={city.id}
              label={region ?? 'City'}
              locked={mode === 'players' && !playerCanRead ? 'Information unavailable.' : null}
              onClick={() => (onOpen ? onOpen(city, 'overview') : setOpenCityId(city.id))}
              openText="Open city"
              seed={city.id}
              status={mode === 'gm' ? { visible, discovered: Boolean(city.discovered) } : undefined}
              summary={city.description}
              title={city.name}
            />
          );
        })}
      </EntityCardGrid>
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
                <Space orientation="vertical" size={2} style={w100}>
                  <Space size={6} wrap>
                    <Typography.Text strong>{city.name}</Typography.Text>
                    {!isCityVisible(city) ? <Tag color="red">Hidden</Tag> : <Tag color="green">Visible</Tag>}
                    {city.discovered ? <Tag color="gold">Discovered</Tag> : <Tag>Not discovered</Tag>}
                    {isCityMapped(city) ? <Tag color="cyan">Mapped</Tag> : null}
                  </Space>

                  <Typography.Text style={S.tableDescription} type="secondary">
                    {stripMarkdown(city.description) || '-'}
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
            description={stripMarkdown(lore.content) || 'No lore summary yet.'}
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
            description={stripMarkdown(quest.description) || 'No quest summary yet.'}
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

  const cityDrawer = openCity ? (
    <EntityDrawer
      controls={[
        visibilityControl(isCityVisible(openCity), () => void toggleVisible(openCity), 'cities'),
        discoveredControl(
          Boolean(openCity.discovered),
          () => void toggleDiscovered(openCity),
          'description, lores and quests',
        ),
      ]}
      createdAt={(openCity as any).createdAt}
      linkRef={{ type: 'city', id: Number(openCity.id) }}
      gmView={isGM && viewMode === 'gm'}
      onClose={mobileOnly ? closeCitySheet : () => setOpenCityId(null)}
      open={Boolean(openCity)}
      overview={{
        image: <CityImageCarousel city={openCity} editableFocus={isGM && viewMode === 'gm'} />,
        sections: [{ title: 'Description', text: openCity.description }],
        unavailable: viewMode === 'players' && openCity.discovered !== true ? 'Information unavailable.' : null,
      }}
      status={{ visible: isCityVisible(openCity), discovered: Boolean(openCity.discovered) }}
      tabs={[
        {
          key: 'lores',
          label: 'Lores',
          count: cityLores.length,
          mobileChildren: mobileLores,
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
                  <RichText fallback={<Typography.Paragraph style={S.linkedParagraph}>-</Typography.Paragraph>}>
                    {lore.content}
                  </RichText>
                </Card>
              ))}
            </div>
          ),
        },
        {
          key: 'quests',
          label: 'Quests',
          count: cityQuests.length,
          mobileChildren: mobileQuests,
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
                  <RichText fallback={<Typography.Paragraph style={S.linkedParagraph}>-</Typography.Paragraph>}>
                    {quest.description}
                  </RichText>
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
      ]}
      title={openCity.name}
      updatedAt={(openCity as any).updatedAt}
      gmTabs={mobileOnly ? [{ key: 'admin', label: 'Admin', children: null, mobileChildren: mobileGM }] : []}
      mobileActiveKey={citySheetTab}
      onMobileTabChange={(key) => setCitySheetTab(key as CitySheetTab)}
      subtitle={(openCity as any).region ? `Region: ${(openCity as any).region}` : undefined}
    />
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
            cityCards({
              data: mobileItems,
              mode: isGM && viewMode === 'gm' ? 'gm' : 'players',
              onOpen: (city, tab) => openCitySheet(city, tab),
            })
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

        {cityDrawer}

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
          {loading ? <Spinner /> : cityCards({ data: playerItems, mode: 'players' })}
          {!mobileOnly ? cityDrawer : null}
        </>
      )}
    </>
  );
};

export default CitiesPage;
