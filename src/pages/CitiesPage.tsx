/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Divider, Drawer, Empty, Modal, Popconfirm, Space, Switch, Tabs, Tag, Typography, message } from 'antd';
import type { TabsProps } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  LeftOutlined,
  RightOutlined,
  FullscreenOutlined,
} from '@ant-design/icons';

import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { Table } from '@app/components/common/Table/Table';
import { Input } from '@app/components/common/inputs/Input/Input';
import { TextArea } from '@app/components/common/inputs/Input/Input';
import { Button } from '@app/components/common/buttons/Button/Button';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { IconLabel } from '@app/components/common/AppIcon/AppIcon';
import { useResponsive } from '@app/hooks/useResponsive';

import type { City } from '@app/types/rpg';
import { CitiesApi } from '@app/api/rpg.api';
import type { Lore } from '@app/api/lore.api';
import type { Quest } from '@app/api/quests.api';
import { listLoresByCityId, listQuestsByCityId } from '@app/api/cityLinks.api';
import { CityAdminDrawer } from '@app/components/rpg/City/CityAdminDrawer';
import { resolveApiUrl } from '@app/api/http.api';
import { resolvedImages } from '@app/api/cities.api';
import { apiErrorMessage } from '../utils/api-error';
import {
  m0,
  w100,
  textSm,
  textMd,
  bold700,
  bold800,
  spaceBetween,
  dividerSm,
  dividerMd,
  tableWrap,
  cardGrid2,
  imgThumbTop,
  preWrap,
  carouselNavBtnLeft,
  carouselNavBtnRight,
  carouselNavBtnLeftLg,
  carouselNavBtnRightLg,
  carouselZoomBtn,
  carouselCounterCenter,
  carouselCounterCenterLg,
} from '@app/styles/styleUtils';
import * as S from './CitiesPage.styles';

const GM_KEY_STORAGE = 'gm_api_key';

type ViewMode = 'players' | 'gm';

function isCityVisible(c: City) {
  return (c.visible ?? true) === true;
}

function parseCoordinates(s?: string | null): { u: number; v: number } | null {
  if (!s) return null;
  const parts = s.split(',').map((x) => Number(x.trim()));
  if (parts.length !== 2 || parts.some((n) => !Number.isFinite(n))) return null;
  const [u, v] = parts;
  if (u < 0 || u > 1 || v < 0 || v > 1) return null;
  return { u, v };
}

function isCityMapped(c: City) {
  const coords = (c as any).coordinates as string | null | undefined;
  return Boolean(parseCoordinates(coords));
}

function formatDate(v?: string | null) {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString();
}

function CityImageCarousel({ city }: { city: any }) {
  const imgs = resolvedImages(city);
  const fallback = city.imageUrl
    ? [{ id: -1, src: resolveApiUrl(city.imageUrl) ?? city.imageUrl, alt: city.imageAlt ?? city.name }]
    : [];
  const all = (imgs.length > 0 ? imgs : fallback).map((img) => ({ ...img, src: img.src ?? '' }));

  const [index, setIndex] = React.useState(0);
  const [lightbox, setLightbox] = React.useState(false);

  if (!city.discovered || all.length === 0) return null;

  const current = all[Math.min(index, all.length - 1)];
  const prev = () => setIndex((i) => (i - 1 + all.length) % all.length);
  const next = () => setIndex((i) => (i + 1) % all.length);

  return (
    <>
      <div style={S.carouselFrame}>
        <img src={current.src} alt={current.alt} style={S.carouselImage} />

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
          {all.map((img, i) => (
            <img
              key={img.id}
              src={img.src}
              alt={img.alt}
              onClick={() => setIndex(i)}
              style={S.carouselThumb(i === index)}
            />
          ))}
        </div>
      )}

      <Modal
        open={lightbox}
        onCancel={() => setLightbox(false)}
        footer={null}
        centered
        width="92vw"
        styles={{
          body: S.carouselLightboxBody,
        }}
        destroyOnHidden={false}
      >
        <img src={current.src} alt={current.alt} style={S.carouselLightboxImage} />
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
  const [cityLores, setCityLores] = React.useState<Lore[]>([]);
  const [cityQuests, setCityQuests] = React.useState<Quest[]>([]);
  const [linksLoading, setLinksLoading] = React.useState(false);

  const { mobileOnly } = useResponsive();

  const [items, setItems] = React.useState<City[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const [creating, setCreating] = React.useState<boolean>(false);
  const [name, setName] = React.useState<string>('');
  const [desc, setDesc] = React.useState<string>('');

  const [search, setSearch] = React.useState('');
  const [filterVis, setFilterVis] = React.useState<'all' | 'visible' | 'hidden'>('all');
  const [openCityId, setOpenCityId] = React.useState<number | null>(null);

  const [isGM, setIsGM] = React.useState<boolean>(() => Boolean(localStorage.getItem(GM_KEY_STORAGE)));
  const [viewMode, setViewMode] = React.useState<ViewMode>(() =>
    Boolean(localStorage.getItem(GM_KEY_STORAGE)) ? 'gm' : 'players',
  );

  const [adminOpen, setAdminOpen] = React.useState(false);
  const [adminCityId, setAdminCityId] = React.useState<number | null>(null);
  const adminCity = React.useMemo(() => items.find((x) => x.id === adminCityId) ?? null, [items, adminCityId]);

  function openAdmin(c: City) {
    setAdminCityId(c.id);
    setAdminOpen(true);
  }

  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === GM_KEY_STORAGE) {
        const gm = Boolean(e.newValue);
        setIsGM(gm);
        setViewMode(gm ? 'gm' : 'players');
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await CitiesApi.list();
      setItems(data);
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to load cities'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const openCity = React.useMemo(() => items.find((x) => x.id === openCityId) ?? null, [items, openCityId]);

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
        message.error('Failed to load city lores/quests.');
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
  }, [openCity?.id, openCity?.discovered]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = search.trim().toLowerCase();

  const playerItems = React.useMemo(
    () =>
      items
        .filter((c) => isCityVisible(c))
        .filter((c) => (q ? c.name.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q) : true))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [items, q],
  );

  const gmItems = React.useMemo(
    () =>
      items
        .filter((c) => {
          if (filterVis === 'visible' && !isCityVisible(c)) return false;
          if (filterVis === 'hidden' && isCityVisible(c)) return false;
          return q ? c.name.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q) : true;
        })
        .sort((a, b) => a.id - b.id),
    [items, q, filterVis],
  );

  const stats = React.useMemo(() => {
    const total = items.length;
    const visible = items.filter((c) => isCityVisible(c)).length;
    const hidden = total - visible;
    const discovered = items.filter((c) => c.discovered).length;
    const undiscovered = total - discovered;
    const mapped = items.filter((c) => isCityMapped(c)).length;
    return { total, visible, hidden, discovered, undiscovered, mapped };
  }, [items]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim();
    const d = desc.trim();

    if (!n) return message.warning('Name is required');

    try {
      await CitiesApi.create({ name: n, description: d || null });
      setCreating(false);
      setName('');
      setDesc('');
      await load();
      message.success('City created');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to create city (GM key?)'));
    }
  }

  async function deleteCity(id: number) {
    try {
      await CitiesApi.remove(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      message.success('City deleted');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to delete city'));
    }
  }

  async function toggleVisible(c: City) {
    const next = !isCityVisible(c);
    setItems((prev) => prev.map((x) => (x.id === c.id ? { ...x, visible: next } : x)));

    try {
      await CitiesApi.setVisible(c.id, next);
      message.success(next ? 'City visible to players' : 'City hidden');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to change visibility (GM key?)'));
      await load();
    }
  }

  async function toggleDiscovered(c: City) {
    const next = !c.discovered;
    setItems((prev) => prev.map((x) => (x.id === c.id ? { ...x, discovered: next } : x)));

    try {
      await CitiesApi.setDiscovered(c.id, next);
      message.success(next ? 'City marked as discovered' : 'City marked as undiscovered');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to change discovered status (GM key?)'));
      await load();
    }
  }

  const Header = (
    <Card density="dense" className="rpg-page-header-card">
      <Space orientation="vertical" size={10} style={w100}>
        <Space style={spaceBetween} size={8}>
          <div>
            <Typography.Title level={4} style={m0}>
              {viewMode === 'gm' ? (
                <IconLabel icon="gm">GM Panel - Cities</IconLabel>
              ) : (
                <IconLabel icon="location">Cities</IconLabel>
              )}
            </Typography.Title>
            <Typography.Text type="secondary" style={textMd}>
              {viewMode === 'gm'
                ? 'Control visibility, discovery and city content.'
                : 'Visible cities — details appear when the GM marks as discovered.'}
            </Typography.Text>
          </div>

          <Space size={8} wrap>
            {isGM && (
              <Space size={4}>
                <Button
                  size="small"
                  type={viewMode === 'players' ? 'primary' : 'default'}
                  onClick={() => setViewMode('players')}
                >
                  <IconLabel icon="read">Cities</IconLabel>
                </Button>
                <Button size="small" type={viewMode === 'gm' ? 'primary' : 'default'} onClick={() => setViewMode('gm')}>
                  <IconLabel icon="gm">GM Panel</IconLabel>
                </Button>
              </Space>
            )}

            {isGM && viewMode === 'gm' && (
              <Button type="primary" size="small" onClick={() => setCreating((v) => !v)}>
                {creating ? 'Close' : '+ New City'}
              </Button>
            )}
          </Space>
        </Space>

        <Space wrap size={8}>
          <Tag>{stats.total} cities</Tag>
          {isGM && <Tag color="green">{stats.visible} visible</Tag>}
          {isGM && <Tag color="red">{stats.hidden} hidden</Tag>}
          {isGM && <Tag color="gold">{stats.discovered} discovered</Tag>}
          {isGM && <Tag>{stats.undiscovered} undiscovered</Tag>}
          {isGM && <Tag color="cyan">{stats.mapped} mapped</Tag>}
        </Space>

        <Space wrap size={8} style={w100}>
          <Input
            allowClear
            placeholder="Search city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={S.searchField}
          />

          {isGM && viewMode === 'gm' && (
            <Space size={4}>
              {(['all', 'visible', 'hidden'] as const).map((v) => (
                <Button
                  key={v}
                  size="small"
                  type={filterVis === v ? 'primary' : 'default'}
                  onClick={() => setFilterVis(v)}
                >
                  {v === 'all' ? 'All' : v === 'visible' ? 'Visible' : 'Hidden'}
                </Button>
              ))}
            </Space>
          )}
        </Space>

        {isGM && viewMode === 'gm' && creating && (
          <>
            <Divider style={dividerSm} />
            <form onSubmit={(e) => void onCreate(e)} style={S.createForm}>
              <Typography.Text strong>New City</Typography.Text>
              <Input placeholder="City name *" value={name} onChange={(e) => setName(e.target.value)} required />
              <TextArea
                placeholder="Description (optional)"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={3}
              />
              <Space>
                <Button type="primary" htmlType="submit">
                  Create City
                </Button>
                <Button onClick={() => setCreating(false)}>Cancel</Button>
              </Space>
            </form>
          </>
        )}
      </Space>
    </Card>
  );

  function CityCards({ data, mode }: { data: City[]; mode: ViewMode }) {
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
        {data.map((c) => {
          const region = ((c as any).region as string | null | undefined) ?? null;
          const vis = isCityVisible(c);
          const playerCanRead = c.discovered === true;

          return (
            <Card
              key={c.id}
              density={mode === 'players' ? 'comfy' : 'dense'}
              title={
                <Space size={8} wrap>
                  <span style={bold700}>{c.name}</span>
                  {region ? <Tag>{region}</Tag> : null}
                  {mode === 'gm' && (
                    <>
                      <Tag color={vis ? 'green' : 'red'}>{vis ? 'Visible' : 'Hidden'}</Tag>
                      <Tag color={c.discovered ? 'gold' : 'default'}>
                        {c.discovered ? 'Discovered' : 'Not discovered'}
                      </Tag>
                      {isCityMapped(c) ? <Tag color="cyan">Mapped</Tag> : <Tag>Not mapped</Tag>}
                    </>
                  )}
                </Space>
              }
              extra={
                mode === 'gm' ? (
                  <Button size="small" onClick={() => openAdmin(c)}>
                    Admin
                  </Button>
                ) : (
                  <Button size="small" onClick={() => setOpenCityId(c.id)}>
                    View
                  </Button>
                )
              }
            >
              {mode === 'players' &&
                playerCanRead &&
                (() => {
                  const imgs = resolvedImages(c as any);
                  const cover =
                    imgs[0] ??
                    ((c as any).imageUrl
                      ? { id: -1, src: resolveApiUrl((c as any).imageUrl), alt: (c as any).imageAlt ?? c.name }
                      : null);

                  return cover ? (
                    <div style={imgThumbTop}>
                      <img src={cover.src} alt={cover.alt} style={S.cityCoverImage} />
                    </div>
                  ) : null;
                })()}

              <Typography.Paragraph style={m0} ellipsis={{ rows: 3 }}>
                {mode === 'players'
                  ? playerCanRead
                    ? c.description?.trim() || 'No description yet.'
                    : 'Information unavailable.'
                  : c.description?.trim() || '—'}
              </Typography.Paragraph>

              {mode === 'gm' && (
                <>
                  <Divider style={dividerMd} />
                  <Space wrap size={16}>
                    <Space size={8}>
                      <span className="rpg-text-sm rpg-muted">Visible:</span>
                      <Switch
                        size="small"
                        checked={vis}
                        onChange={() => void toggleVisible(c)}
                        checkedChildren={<EyeOutlined />}
                        unCheckedChildren={<EyeInvisibleOutlined />}
                      />
                    </Space>

                    <Space size={8}>
                      <span className="rpg-text-sm rpg-muted">Discovered:</span>
                      <Switch size="small" checked={c.discovered} onChange={() => void toggleDiscovered(c)} />
                    </Space>
                  </Space>
                </>
              )}
            </Card>
          );
        })}
      </div>
    );
  }

  const DesktopAdminTable = (
    <Card density="dense" title="Manage Cities">
      <div style={tableWrap}>
        <Table
          rowKey="id"
          dataSource={gmItems}
          loading={loading}
          style={S.adminTable}
          scroll={{ x: 960 }}
          columns={[
            {
              title: '#',
              dataIndex: 'id',
              key: 'id',
              width: 60,
              render: (v: number) => <Tag style={m0}>#{v}</Tag>,
            },
            {
              title: 'Visible',
              key: 'visible',
              width: 90,
              render: (_: any, c: City) => (
                <Switch
                  size="small"
                  checked={isCityVisible(c)}
                  onChange={() => void toggleVisible(c)}
                  checkedChildren={<EyeOutlined />}
                  unCheckedChildren={<EyeInvisibleOutlined />}
                />
              ),
            },
            {
              title: 'Discovered',
              key: 'discovered',
              width: 110,
              render: (_: any, c: City) => (
                <Switch size="small" checked={c.discovered} onChange={() => void toggleDiscovered(c)} />
              ),
            },
            {
              title: 'City',
              key: 'name',
              ellipsis: true,
              render: (_: any, c: City) => (
                <Space orientation="vertical" size={2} style={w100}>
                  <Space size={6} wrap>
                    <Typography.Text strong>{c.name}</Typography.Text>
                    {!isCityVisible(c) ? <Tag color="red">Hidden</Tag> : <Tag color="green">Visible</Tag>}
                    {c.discovered ? <Tag color="gold">Discovered</Tag> : <Tag>Not discovered</Tag>}
                    {isCityMapped(c) ? <Tag color="cyan">Mapped</Tag> : null}
                  </Space>

                  <Typography.Text type="secondary" style={S.tableDescription}>
                    {c.description?.trim() || '—'}
                  </Typography.Text>
                </Space>
              ),
            },
            {
              title: 'Created at',
              dataIndex: 'createdAt',
              key: 'createdAt',
              width: 160,
              render: (v: string) => (
                <Typography.Text type="secondary" style={textSm}>
                  {formatDate(v)}
                </Typography.Text>
              ),
            },
            {
              title: 'Actions',
              key: 'actions',
              width: 90,
              render: (_: any, c: City) => (
                <Space size={4}>
                  <Button size="small" icon={<EditOutlined />} onClick={() => openAdmin(c)} />
                  <Popconfirm
                    title={`Delete "${c.name}" permanently?`}
                    okText="Delete"
                    cancelText="Cancel"
                    onConfirm={() => void deleteCity(c.id)}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
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
              <CityImageCarousel city={openCity as any} />
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
              {cityLores.map((l) => (
                <Card key={l.id} density="comfy" title={l.title}>
                  {l.category ? <Tag>{l.category}</Tag> : null}
                  <Typography.Paragraph style={S.linkedParagraph}>{l.content?.trim() || '—'}</Typography.Paragraph>
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
              {cityQuests.map((qst) => (
                <Card key={qst.id} density="comfy" title={qst.title}>
                  {qst.status ? <Tag>{qst.status}</Tag> : null}
                  {qst.reward ? <Tag color="gold">Reward</Tag> : null}
                  <Typography.Paragraph style={S.linkedParagraph}>
                    {qst.description?.trim() || '—'}
                  </Typography.Paragraph>
                  {qst.reward ? (
                    <Typography.Text type="secondary" style={S.rewardText}>
                      Reward: {qst.reward}
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
                    <Space orientation="vertical" size={12} style={w100}>
                      <Space style={spaceBetween}>
                        <div>
                          <Typography.Text>Visible to players</Typography.Text>
                          <br />
                          <Typography.Text type="secondary" style={textSm}>
                            Hidden cities do not appear in the list.
                          </Typography.Text>
                        </div>
                        <Switch
                          checked={isCityVisible(openCity)}
                          onChange={() => void toggleVisible(openCity)}
                          checkedChildren={<EyeOutlined />}
                          unCheckedChildren={<EyeInvisibleOutlined />}
                        />
                      </Space>

                      <Space style={spaceBetween}>
                        <div>
                          <Typography.Text>Marked as discovered</Typography.Text>
                          <br />
                          <Typography.Text type="secondary" style={textSm}>
                            Unlocks description, lores and quests for players.
                          </Typography.Text>
                        </div>
                        <Switch checked={openCity.discovered} onChange={() => void toggleDiscovered(openCity)} />
                      </Space>

                      <Divider style={dividerSm} />

                      <Typography.Text type="secondary" style={textSm}>
                        Created: {formatDate((openCity as any).createdAt)}
                        {'  ·  '}
                        Updated: {formatDate((openCity as any).updatedAt)}
                      </Typography.Text>
                    </Space>
                  </Card>
                ),
              },
            ]
          : []),
      ]
    : [];

  const CityDrawer = openCity ? (
    <Drawer
      open={!!openCity}
      onClose={() => setOpenCityId(null)}
      size={mobileOnly ? '100%' : 560}
      title={
        <Space wrap size={8}>
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

  return (
    <>
      <PageTitle>Cities</PageTitle>

      {Header}

      {viewMode === 'gm' && isGM ? (
        <>
          {loading ? <Spinner /> : mobileOnly ? <CityCards data={gmItems} mode="gm" /> : DesktopAdminTable}
          <CityAdminDrawer
            open={adminOpen}
            city={adminCity}
            isGM={isGM}
            onClose={() => {
              setAdminOpen(false);
              setAdminCityId(null);
            }}
            onChanged={load}
          />
        </>
      ) : (
        <>
          {loading ? <Spinner /> : <CityCards data={playerItems} mode="players" />}
          {CityDrawer}
        </>
      )}
    </>
  );
};

export default CitiesPage;
