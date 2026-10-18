import React from 'react';
import { Divider, Drawer, Space, Switch, Tabs, Tag, Typography } from 'antd';
import type { TabsProps } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { Switch as AdmSwitch } from 'antd-mobile';
import styled from 'styled-components';
import { MobileCard, MobileEntitySheet, MobileTabs } from '@app/components/common/mobile';
import { Card } from '@app/components/common/Card/Card';
import ContainedImage from '@app/components/common/ContainedImage/ContainedImage';
import RichText from '@app/components/common/RichText/RichText';
import { useResponsive } from '@app/hooks/useResponsive';
import { bold800, dividerSm, spaceBetween, textSm, w100 } from '@app/styles/styleUtils';

/**
 * Common detail drawer for every domain, modelled on the Cities drawer.
 * Pages describe *what* they have; the drawer always lays it out the same way:
 *
 *   title + status tags (GM view)
 *   ├─ Overview tab   image · meta row · one titled Markdown card per section
 *   ├─ related tabs   "Lores (3)", "Quests (1)" …
 *   ├─ GM Actions     Controls card (switches + created/updated)   — GM view only
 *   └─ GM tabs        e.g. Edit                                    — GM view only
 *
 * On phones the same description renders as the full-screen MobileEntitySheet with
 * MobileTabs: Overview · related · "GM" (Controls card + each GM tab's mobile content).
 */

export const DRAWER_WIDTH = 560;

export interface DrawerSection {
  title: string;
  text?: string | null;
  fallback?: string;
}

export interface DrawerControl {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: () => void;
  /** Eye icons, used for the visibility switch. */
  eye?: boolean;
}

export interface DrawerTab {
  key: string;
  label: React.ReactNode;
  /** Appended to the label as "(n)". */
  count?: number;
  children: React.ReactNode;
  /** Phone version (touch forms); falls back to `children`. */
  mobileChildren?: React.ReactNode;
}

export interface EntityDrawerProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  extra?: React.ReactNode;
  destroyOnHidden?: boolean;
  /** For drawers opened above other overlays (e.g. the map). */
  zIndex?: number;

  /** GM panel view: shows status tags, the GM Actions tab and gmTabs. */
  gmView?: boolean;
  status?: { visible?: boolean; discovered?: boolean | null };

  overview?: {
    /** Tab key, default "overview" (pages with a controlled activeKey may need their own). */
    key?: string;
    label?: React.ReactNode;
    /** An image (src/alt) or any custom node, e.g. a carousel. */
    image?: { src?: string | null; alt?: string } | React.ReactNode;
    /** Tags / small facts shown under the image. */
    meta?: React.ReactNode;
    sections?: DrawerSection[];
    /** Replaces the sections (e.g. "Information unavailable." for undiscovered entities). */
    unavailable?: string | null;
    /** Extra content after the sections. */
    children?: React.ReactNode;
  };

  /** Related-content tabs, shown after Overview. */
  tabs?: DrawerTab[];

  /** GM Actions tab. */
  controls?: DrawerControl[];
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  /** Extra content inside the Controls card. */
  controlsExtra?: React.ReactNode;

  /** Additional GM-only tabs (e.g. Edit), shown last. */
  gmTabs?: DrawerTab[];

  activeKey?: string;
  onTabChange?: (key: string) => void;

  // ── Phone sheet ──
  /** Line under the title in the phone sheet (date, region…). */
  subtitle?: React.ReactNode;
  /** Sticky footer of the phone sheet (e.g. Save bar on the GM tab). */
  mobileFooter?: React.ReactNode;
  /** Phone tab keys: "overview", related keys, "gm". */
  mobileActiveKey?: string;
  onMobileTabChange?: (key: string) => void;
}

function isImageSpec(x: unknown): x is { src?: string | null; alt?: string } {
  return typeof x === 'object' && x !== null && !React.isValidElement(x) && 'src' in x;
}

const toTabItem = (t: DrawerTab) => ({
  key: t.key,
  label:
    t.count === undefined ? (
      t.label
    ) : (
      <>
        {t.label} ({t.count})
      </>
    ),
  children: t.children,
});

export const EntityDrawer: React.FC<EntityDrawerProps> = ({
  open,
  onClose,
  title,
  extra,
  destroyOnHidden,
  zIndex,
  gmView,
  status,
  overview,
  tabs = [],
  controls,
  createdAt,
  updatedAt,
  controlsExtra,
  gmTabs = [],
  activeKey,
  onTabChange,
  subtitle,
  mobileFooter,
  mobileActiveKey,
  onMobileTabChange,
}) => {
  const { mobileOnly } = useResponsive();

  if (mobileOnly) {
    const mobileItems = [
      ...(overview
        ? [
            {
              key: 'overview',
              title: overview.label ?? 'Overview',
              children: <MobileOverview {...overview} gmView={gmView} />,
            },
          ]
        : []),
      ...tabs.map((t) => ({ key: t.key, title: toTabItem(t).label, children: t.mobileChildren ?? t.children })),
      ...(gmView && (controls?.length || gmTabs.length)
        ? [
            {
              key: 'gm',
              title: 'GM',
              children: (
                <MobileStack>
                  {controls?.length ? (
                    <MobileControlsCard controls={controls} createdAt={createdAt} updatedAt={updatedAt}>
                      {controlsExtra}
                    </MobileControlsCard>
                  ) : null}
                  {gmTabs.map((t) => (
                    <React.Fragment key={t.key}>{t.mobileChildren ?? t.children}</React.Fragment>
                  ))}
                </MobileStack>
              ),
            },
          ]
        : []),
    ];
    return (
      <MobileEntitySheet
        description={gmView && status ? <EntityStatusTags {...status} /> : undefined}
        extra={extra}
        footer={mobileFooter}
        onClose={onClose}
        subtitle={subtitle}
        title={title}
        visible={open}
      >
        {mobileItems.length > 1 ? (
          <MobileTabs activeKey={mobileActiveKey} items={mobileItems} onChange={onMobileTabChange} />
        ) : (
          mobileItems[0]?.children
        )}
      </MobileEntitySheet>
    );
  }

  const items: TabsProps['items'] = [];
  if (overview) {
    const image = isImageSpec(overview.image) ? (
      <DrawerImage alt={overview.image.alt} editableFocus={gmView} src={overview.image.src} />
    ) : (
      (overview.image as React.ReactNode)
    );
    items.push({
      key: overview.key ?? 'overview',
      label: overview.label ?? 'Description',
      children: (
        <>
          {image}
          {overview.meta && <DrawerMeta>{overview.meta}</DrawerMeta>}
          <Space orientation="vertical" size={12} style={w100}>
            {overview.unavailable ? (
              <Card density="comfy">
                <Typography.Text type="secondary">{overview.unavailable}</Typography.Text>
              </Card>
            ) : (
              overview.sections?.map((s) => <DrawerTextCard key={s.title} {...s} />)
            )}
            {overview.children}
          </Space>
        </>
      ),
    });
  }
  items.push(...tabs.map(toTabItem));
  if (gmView && controls?.length) {
    items.push({
      key: 'gm',
      label: 'GM Actions',
      children: (
        <DrawerControlsCard controls={controls} createdAt={createdAt} updatedAt={updatedAt}>
          {controlsExtra}
        </DrawerControlsCard>
      ),
    });
  }
  if (gmView) items.push(...gmTabs.map(toTabItem));

  return (
    <Drawer
      destroyOnHidden={destroyOnHidden}
      extra={extra}
      onClose={onClose}
      open={open}
      size={mobileOnly ? '100%' : DRAWER_WIDTH}
      zIndex={zIndex}
      title={
        <Space size={8} wrap>
          <span style={bold800}>{title}</span>
          {gmView && status && <EntityStatusTags {...status} />}
        </Space>
      }
    >
      <Tabs
        activeKey={activeKey}
        defaultActiveKey={items[0]?.key as string | undefined}
        items={items}
        onChange={onTabChange}
      />
    </Drawer>
  );
};

// ── Phone building blocks ────────────────────────────────────────────────────

const MobileStack = styled.div`
  display: grid;
  gap: 12px;
  padding: 12px 0;
`;
const MobileRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 0;
`;
const MobileHint = styled.div`
  color: var(--text-muted-color);
  font-size: 12px;
`;

const MobileOverview: React.FC<NonNullable<EntityDrawerProps['overview']> & { gmView?: boolean }> = ({
  gmView,
  image,
  meta,
  sections,
  unavailable,
  children,
}) => (
  <MobileStack>
    {isImageSpec(image) ? (
      image.src ? (
        <MobileCard compact>
          <DrawerImage alt={image.alt} editableFocus={gmView} height={260} src={image.src} />
        </MobileCard>
      ) : null
    ) : image ? (
      <MobileCard compact>{image as React.ReactNode}</MobileCard>
    ) : null}
    {meta && (
      <MobileCard compact>
        <Space size={6} wrap>
          {meta}
        </Space>
      </MobileCard>
    )}
    {unavailable ? (
      <MobileCard compact>
        <MobileHint>{unavailable}</MobileHint>
      </MobileCard>
    ) : (
      sections?.map((s) => (
        <MobileCard compact key={s.title} title={s.title}>
          <RichText fallback={<MobileHint>{s.fallback ?? 'No description yet.'}</MobileHint>}>{s.text}</RichText>
        </MobileCard>
      ))
    )}
    {children}
  </MobileStack>
);

const MobileControlsCard: React.FC<{
  controls: DrawerControl[];
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  children?: React.ReactNode;
}> = ({ controls, createdAt, updatedAt, children }) => (
  <MobileCard compact title="Controls">
    {controls.map((c) => (
      <MobileRow key={c.label}>
        <div>
          <div>{c.label}</div>
          {c.hint && <MobileHint>{c.hint}</MobileHint>}
        </div>
        <AdmSwitch checked={c.checked} onChange={c.onChange} />
      </MobileRow>
    ))}
    {children}
    {(createdAt || updatedAt) && (
      <MobileHint style={{ marginTop: 8 }}>
        Created: {formatStamp(createdAt)} · Updated: {formatStamp(updatedAt)}
      </MobileHint>
    )}
  </MobileCard>
);

// ── Building blocks (also usable on their own) ───────────────────────────────

/** Visible / Hidden (+ Discovered) tags. */
export const EntityStatusTags: React.FC<{ visible?: boolean; discovered?: boolean | null }> = ({
  visible,
  discovered,
}) => (
  <>
    {visible !== undefined && <Tag color={visible ? 'green' : 'red'}>{visible ? 'Visible' : 'Hidden'}</Tag>}
    {discovered !== undefined &&
      discovered !== null &&
      (discovered ? <Tag color="gold">Discovered</Tag> : <Tag>Not discovered</Tag>)}
  </>
);

/** Cover image of a drawer: whole picture over a blurred fill, with the GM focus picker. */
export const DrawerImage: React.FC<{ src?: string | null; alt?: string; editableFocus?: boolean; height?: number }> = ({
  src,
  alt = '',
  editableFocus,
  height = 320,
}) =>
  src ? (
    <div style={{ marginBottom: 12 }}>
      <ContainedImage alt={alt} editableFocus={editableFocus} height={height} src={src} />
    </div>
  ) : null;

export const DrawerMeta: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Space size={8} style={{ marginBottom: 12 }} wrap>
    {children}
  </Space>
);

/** A titled card holding a Markdown text field. */
export const DrawerTextCard: React.FC<DrawerSection> = ({ title, text, fallback = 'No description yet.' }) => (
  <Card density="comfy" title={title}>
    <RichText fallback={<Typography.Text type="secondary">{fallback}</Typography.Text>}>{text}</RichText>
  </Card>
);

function formatStamp(value?: string | Date | null) {
  if (!value) return '-';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleString();
}

/** The "GM Actions → Controls" card. */
export const DrawerControlsCard: React.FC<{
  controls: DrawerControl[];
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  children?: React.ReactNode;
}> = ({ controls, createdAt, updatedAt, children }) => (
  <Card density="dense" title="Controls">
    <Space orientation="vertical" size={12} style={w100}>
      {controls.map((c) => (
        <Space key={c.label} style={spaceBetween}>
          <div>
            <Typography.Text>{c.label}</Typography.Text>
            {c.hint && (
              <>
                <br />
                <Typography.Text style={textSm} type="secondary">
                  {c.hint}
                </Typography.Text>
              </>
            )}
          </div>
          <Switch
            checked={c.checked}
            checkedChildren={c.eye ? <EyeOutlined /> : undefined}
            onChange={c.onChange}
            unCheckedChildren={c.eye ? <EyeInvisibleOutlined /> : undefined}
          />
        </Space>
      ))}
      {children}
      {(createdAt || updatedAt) && (
        <>
          <Divider style={dividerSm} />
          <Typography.Text style={textSm} type="secondary">
            Created: {formatStamp(createdAt)}
            {'  ·  '}
            Updated: {formatStamp(updatedAt)}
          </Typography.Text>
        </>
      )}
    </Space>
  </Card>
);

/** Shared "visible to players" control. */
export const visibilityControl = (checked: boolean, onChange: () => void, what = 'items'): DrawerControl => ({
  label: 'Visible to players',
  hint: `Hidden ${what} do not appear for players.`,
  checked,
  onChange,
  eye: true,
});

/** Shared "discovered" control. */
export const discoveredControl = (checked: boolean, onChange: () => void, unlocks = 'details'): DrawerControl => ({
  label: 'Marked as discovered',
  hint: `Unlocks ${unlocks} for players.`,
  checked,
  onChange,
});

/**
 * For pages whose state only knows "view" vs "edit" (shared with their mobile sheet):
 * keeps which non-edit tab (Overview, related, GM Actions) is open, and resets it
 * when another entity is opened.
 */
export function useEditableDrawerTab<T extends string>(
  tab: T,
  setTab: (t: T) => void,
  keys: { view: T; edit: T },
  resetKey?: unknown,
) {
  const [other, setOther] = React.useState<string>(keys.view);
  React.useEffect(() => setOther(keys.view), [resetKey, keys.view]);
  return {
    overviewKey: keys.view as string,
    activeKey: tab === keys.edit ? (keys.edit as string) : other,
    onTabChange: (k: string) => {
      if (k === keys.edit) {
        setTab(keys.edit);
      } else {
        setTab(keys.view);
        setOther(k);
      }
    },
  };
}

export default EntityDrawer;
