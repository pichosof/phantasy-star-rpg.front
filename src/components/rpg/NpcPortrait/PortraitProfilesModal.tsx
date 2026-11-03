import React from 'react';
import { AutoComplete, Button, Empty, Input, Modal, Popconfirm, Space, Tabs, Typography, Upload, message } from 'antd';
import { CloseOutlined, DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadRequestOption as RcCustomRequestOptions } from '@rc-component/upload/lib/interface';

import { resolveApiUrl } from '@app/api/http.api';
import { thumbUrl } from '@app/api/images.api';
import { PortraitApi, STYLE_PROFILE, type PortraitProfile } from '@app/api/portraits.api';
import { RACES } from '@app/generators/data/npc';
import { apiErrorMessage } from '@app/utils/api-error';

const MAX_REFERENCES = 8;

/** Thumbnails of reference images, optionally removable. */
export const ReferenceStrip: React.FC<{
  urls: string[];
  onRemove?: (url: string) => void;
  dimmed?: (url: string) => boolean;
  onToggle?: (url: string) => void;
}> = ({ urls, onRemove, dimmed, onToggle }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
    {urls.map((url) => (
      <div
        key={url}
        onClick={onToggle ? () => onToggle(url) : undefined}
        style={{
          position: 'relative',
          width: 72,
          height: 72,
          borderRadius: 6,
          overflow: 'hidden',
          border: '1px solid var(--border-base-color)',
          cursor: onToggle ? 'pointer' : 'default',
          opacity: dimmed?.(url) ? 0.3 : 1,
        }}
        title={onToggle ? `${dimmed?.(url) ? 'Use' : 'Skip'} this reference` : url}
      >
        <img
          src={resolveApiUrl(thumbUrl(url, 320))}
          alt="Reference"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {onRemove && (
          <Button
            size="small"
            shape="circle"
            icon={<CloseOutlined />}
            onClick={() => onRemove(url)}
            style={{ position: 'absolute', top: 2, right: 2 }}
            aria-label="Remove reference"
          />
        )}
      </div>
    ))}
  </div>
);

const ProfileEditor: React.FC<{
  profile: PortraitProfile | null;
  profileKey: string;
  onSaved: () => Promise<void>;
}> = ({ profile, profileKey, onSaved }) => {
  const [prompt, setPrompt] = React.useState(profile?.prompt ?? '');
  const [refs, setRefs] = React.useState<string[]>(profile?.references ?? []);
  const [link, setLink] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const isStyle = profileKey === STYLE_PROFILE;

  const addRef = (url: string) => {
    const u = url.trim();
    if (!u) return;
    if (refs.includes(u)) return void message.info('That reference is already there.');
    if (refs.length >= MAX_REFERENCES) return void message.warning(`At most ${MAX_REFERENCES} references.`);
    setRefs([...refs, u]);
  };

  const save = async () => {
    setSaving(true);
    try {
      await PortraitApi.saveProfile(profileKey, { prompt, references: refs });
      await onSaved();
      message.success(`Profile "${profileKey}" saved.`);
    } catch (e) {
      message.error(apiErrorMessage(e, 'Could not save the profile.'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await PortraitApi.deleteProfile(profileKey);
      await onSaved();
    } catch (e) {
      message.error(apiErrorMessage(e, 'Could not delete the profile.'));
    }
  };

  return (
    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
      <Typography.Text type="secondary">
        {isStyle
          ? 'Art direction for every portrait: medium, light, palette, world rules. Describe what should appear (e.g. "plain pale-yellow sky"): naming something to avoid tends to draw it. References: style images, logo, approved art.'
          : `Anatomy and look of the ${profileKey} race. References: approved species sheets (male and female, colour variants).`}
      </Typography.Text>
      <Input.TextArea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        autoSize={{ minRows: 6, maxRows: 16 }}
        maxLength={4000}
        showCount
        placeholder={isStyle ? 'Painted illustration, warm natural light…' : 'Humanoid avian, curved beak…'}
      />
      <div>
        <Typography.Text strong>References</Typography.Text>{' '}
        <Typography.Text type="secondary">
          ({refs.length}/{MAX_REFERENCES})
        </Typography.Text>
      </div>
      {refs.length > 0 && <ReferenceStrip urls={refs} onRemove={(u) => setRefs(refs.filter((r) => r !== u))} />}
      <Space wrap>
        <Upload
          accept="image/png,image/jpeg,image/webp"
          showUploadList={false}
          customRequest={async (opts: RcCustomRequestOptions) => {
            try {
              addRef(await PortraitApi.uploadReference(opts.file as File));
              opts.onSuccess?.({});
            } catch (e) {
              message.error(apiErrorMessage(e, 'Upload failed.'));
              opts.onError?.(new Error('Upload failed'));
            }
          }}
        >
          <Button icon={<UploadOutlined />}>Upload image</Button>
        </Upload>
        <Space.Compact>
          <Input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="/files/… or https://…"
            style={{ width: 260 }}
          />
          <Button
            icon={<PlusOutlined />}
            onClick={() => {
              addRef(link);
              setLink('');
            }}
          >
            Add
          </Button>
        </Space.Compact>
      </Space>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        Tip: images already on the site (wiki, gallery) can be added by their address, e.g.{' '}
        <code>/files/wiki/images/…png</code>.
      </Typography.Text>
      <Space>
        <Button type="primary" loading={saving} disabled={!prompt.trim()} onClick={() => void save()}>
          Save
        </Button>
        {profile && (
          <Popconfirm title={`Delete the "${profileKey}" profile?`} onConfirm={() => void remove()}>
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        )}
      </Space>
    </Space>
  );
};

/** GM editor for the portrait style and the per-race profiles. */
export const PortraitProfilesModal: React.FC<{
  open: boolean;
  profiles: PortraitProfile[];
  onClose: () => void;
  onChanged: () => Promise<void>;
}> = ({ open, profiles, onClose, onChanged }) => {
  const [adding, setAdding] = React.useState<string[]>([]);
  const [newKey, setNewKey] = React.useState('');
  const [active, setActive] = React.useState<string>(STYLE_PROFILE);

  const keys = React.useMemo(() => {
    const saved = profiles.map((p) => p.key);
    const all = [
      STYLE_PROFILE,
      ...saved.filter((k) => k !== STYLE_PROFILE),
      ...adding.filter((k) => !saved.includes(k)),
    ];
    return Array.from(new Set(all));
  }, [profiles, adding]);

  const add = () => {
    const key = newKey.trim();
    if (!key) return;
    if (!keys.includes(key)) setAdding([...adding, key]);
    setActive(key);
    setNewKey('');
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={760} title="Portrait profiles" destroyOnHidden>
      <Space orientation="vertical" size={12} style={{ width: '100%' }}>
        <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
          A portrait prompt is drafted from the <b>style</b>, the NPC&apos;s <b>race</b> profile and the NPC itself. The
          key of a race profile must match the NPC&apos;s race exactly.
        </Typography.Paragraph>
        <Space.Compact>
          <AutoComplete
            value={newKey}
            onChange={setNewKey}
            options={RACES.filter((r) => !keys.includes(r)).map((r) => ({ value: r }))}
            placeholder="New race profile (e.g. Motaviano)"
            style={{ width: 280 }}
          />
          <Button icon={<PlusOutlined />} onClick={add}>
            Add
          </Button>
        </Space.Compact>
        {keys.length === 0 ? (
          <Empty />
        ) : (
          <Tabs
            activeKey={active}
            onChange={setActive}
            items={keys.map((key) => {
              const profile = profiles.find((p) => p.key === key) ?? null;
              return {
                key,
                label: profile ? key : `${key} (new)`,
                children: (
                  <ProfileEditor
                    key={`${key}-${profile?.updatedAt ?? 'new'}`}
                    profile={profile}
                    profileKey={key}
                    onSaved={async () => {
                      setAdding(adding.filter((k) => k !== key));
                      await onChanged();
                    }}
                  />
                ),
              };
            })}
          />
        )}
      </Space>
    </Modal>
  );
};
