import React from 'react';
import { Alert, Button, Image, Input, Popconfirm, Select, Space, Spin, Tag, Tooltip, Typography, message } from 'antd';
import { DeleteOutlined, ReloadOutlined, SettingOutlined, ThunderboltOutlined } from '@ant-design/icons';

import { resolveApiUrl } from '@app/api/http.api';
import { thumbUrl } from '@app/api/images.api';
import { PortraitApi, STYLE_PROFILE, type PortraitJob, type PortraitProfile } from '@app/api/portraits.api';
import type { Npc } from '@app/types/rpg';
import { apiErrorMessage } from '@app/utils/api-error';

import { PortraitProfilesModal, ReferenceStrip } from './PortraitProfilesModal';

/** Fotor normally notifies within a minute; after this, offer the GM an explicit check. */
const STALE_MS = 10 * 60_000;
const POLL_MS = 4000;

const elapsed = (iso: string) => Date.now() - new Date(iso).getTime();

/**
 * Portrait generation for one NPC (GM): drafted prompt the GM can edit, reference images that
 * can be skipped, and the history of generated pictures.
 */
export const NpcPortraitGenerator: React.FC<{ npc: Npc; onChanged: () => Promise<void> }> = ({ npc, onChanged }) => {
  const [enabled, setEnabled] = React.useState<boolean | null>(null);
  const [profiles, setProfiles] = React.useState<PortraitProfile[]>([]);
  const [jobs, setJobs] = React.useState<PortraitJob[]>([]);
  const [profile, setProfile] = React.useState<string | null>(npc.race ?? null);
  const [prompt, setPrompt] = React.useState('');
  const [refs, setRefs] = React.useState<string[]>([]);
  const [skipped, setSkipped] = React.useState<string[]>([]);
  const [draftError, setDraftError] = React.useState<string | null>(null);
  const [drafting, setDrafting] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [busyJob, setBusyJob] = React.useState<number | null>(null);
  const [profilesOpen, setProfilesOpen] = React.useState(false);

  const loadProfiles = React.useCallback(async () => setProfiles(await PortraitApi.profiles()), []);
  const loadJobs = React.useCallback(async () => setJobs(await PortraitApi.jobs(npc.id)), [npc.id]);

  React.useEffect(() => {
    let alive = true;
    PortraitApi.status()
      .then(async ({ enabled: on }) => {
        if (!alive) return;
        setEnabled(on);
        if (on) await Promise.all([loadProfiles(), loadJobs()]);
      })
      .catch((e) => message.error(apiErrorMessage(e, 'Could not load the portrait tools.')));
    return () => {
      alive = false;
    };
  }, [loadProfiles, loadJobs]);

  const draft = React.useCallback(async () => {
    if (!profile) return;
    setDrafting(true);
    setDraftError(null);
    try {
      const d = await PortraitApi.draft(npc.id, profile);
      setPrompt(d.prompt);
      setRefs(d.references);
      setSkipped([]);
    } catch (e) {
      setPrompt('');
      setRefs([]);
      setDraftError(apiErrorMessage(e, 'Could not draft the prompt.'));
    } finally {
      setDrafting(false);
    }
  }, [npc.id, profile]);

  React.useEffect(() => {
    if (enabled) void draft();
  }, [enabled, draft, profiles]);

  // While a picture is being generated, follow it (the webhook completes it on the server).
  const pending = jobs.some((j) => j.status === 'pending');
  React.useEffect(() => {
    if (!pending) return;
    const timer = window.setInterval(() => {
      PortraitApi.jobs(npc.id)
        .then(async (next) => {
          const finished = next.some(
            (j) => j.status === 'done' && jobs.find((o) => o.id === j.id)?.status === 'pending',
          );
          setJobs(next);
          if (finished) await onChanged();
        })
        .catch((e) => message.error(apiErrorMessage(e, 'Could not refresh the portraits.')));
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [pending, jobs, npc.id, onChanged]);

  const generate = async () => {
    setGenerating(true);
    try {
      await PortraitApi.generate(npc.id, {
        profile,
        prompt,
        references: refs.filter((r) => !skipped.includes(r)),
      });
      await loadJobs();
      message.success('Generating… it usually takes under a minute.');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Could not start the generation.'));
    } finally {
      setGenerating(false);
    }
  };

  const onJob = async (job: PortraitJob, action: 'check' | 'apply' | 'remove') => {
    setBusyJob(job.id);
    try {
      if (action === 'check') {
        const updated = await PortraitApi.check(job.id);
        if (updated.status === 'pending') message.info('Fotor is still working on it.');
      } else if (action === 'apply') await PortraitApi.apply(job.id);
      else await PortraitApi.remove(job.id);
      await loadJobs();
      if (action !== 'remove') await onChanged();
    } catch (e) {
      message.error(apiErrorMessage(e, 'The action failed.'));
    } finally {
      setBusyJob(null);
    }
  };

  if (enabled === null) return <Spin />;
  if (!enabled)
    return <Alert type="info" showIcon message="Portrait generation is off (FOTOR_API_KEY is not configured)." />;

  const raceProfiles = profiles.filter((p) => p.key !== STYLE_PROFILE);
  const hasStyle = profiles.some((p) => p.key === STYLE_PROFILE);

  return (
    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
      <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
        <Space wrap>
          <Typography.Text strong>Race profile</Typography.Text>
          <Select
            value={profile ?? undefined}
            onChange={(v) => setProfile(v ?? null)}
            placeholder="Pick…"
            style={{ minWidth: 180 }}
            options={raceProfiles.map((p) => ({ value: p.key, label: p.key }))}
          />
          {npc.race && npc.race !== profile && <Tag>NPC race: {npc.race}</Tag>}
        </Space>
        <Button icon={<SettingOutlined />} onClick={() => setProfilesOpen(true)}>
          Profiles
        </Button>
      </Space>

      {!hasStyle && <Alert type="warning" showIcon message='Set up the "style" profile first (Profiles).' />}
      {draftError && <Alert type="error" showIcon message={draftError} />}

      {drafting ? (
        <Spin />
      ) : (
        prompt && (
          <>
            <Input.TextArea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              autoSize={{ minRows: 8, maxRows: 20 }}
              maxLength={4000}
              showCount
            />
            {refs.length > 0 && (
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  References (click to skip one, e.g. the other sex&apos;s sheet)
                </Typography.Text>
                <ReferenceStrip
                  urls={refs}
                  dimmed={(u) => skipped.includes(u)}
                  onToggle={(u) => setSkipped(skipped.includes(u) ? skipped.filter((s) => s !== u) : [...skipped, u])}
                />
              </div>
            )}
            <Space wrap>
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                loading={generating}
                disabled={pending || !prompt.trim()}
                onClick={() => void generate()}
              >
                Generate portrait
              </Button>
              <Button icon={<ReloadOutlined />} onClick={() => void draft()}>
                Redraft
              </Button>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Seedream 4.0 · 5 Fotor credits
              </Typography.Text>
            </Space>
          </>
        )
      )}

      {jobs.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
          {jobs.map((job) => {
            const current = job.imageUrl !== null && job.imageUrl === npc.imageUrl;
            const stale = job.status === 'pending' && elapsed(job.createdAt) > STALE_MS;
            return (
              <div
                key={job.id}
                style={{
                  border: `1px solid ${current ? 'var(--primary-color)' : 'var(--border-base-color)'}`,
                  borderRadius: 8,
                  padding: 6,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                {job.status === 'done' && job.imageUrl ? (
                  <Image
                    src={resolveApiUrl(thumbUrl(job.imageUrl, 320))}
                    preview={{ src: resolveApiUrl(job.imageUrl) }}
                    style={{ width: '100%', aspectRatio: '3 / 4', objectFit: 'cover', borderRadius: 6 }}
                  />
                ) : (
                  <div
                    style={{
                      aspectRatio: '3 / 4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      padding: 8,
                      borderRadius: 6,
                      background: 'var(--background-base-color, rgba(0,0,0,0.04))',
                    }}
                  >
                    {job.status === 'pending' ? (
                      stale ? (
                        <Typography.Text type="warning" style={{ fontSize: 12 }}>
                          Fotor has not notified us yet.
                        </Typography.Text>
                      ) : (
                        <Spin tip="Generating…" />
                      )
                    ) : (
                      <Typography.Text type="danger" style={{ fontSize: 12 }}>
                        {job.error}
                      </Typography.Text>
                    )}
                  </div>
                )}
                <Space size={4} wrap>
                  {current && <Tag color="blue">Current</Tag>}
                  {job.status === 'done' && !current && (
                    <Button size="small" loading={busyJob === job.id} onClick={() => void onJob(job, 'apply')}>
                      Use
                    </Button>
                  )}
                  {(stale || job.status === 'failed') && (
                    <Tooltip title="Ask Fotor how this task went (free)">
                      <Button size="small" loading={busyJob === job.id} onClick={() => void onJob(job, 'check')}>
                        Check
                      </Button>
                    </Tooltip>
                  )}
                  {job.status !== 'pending' && !current && (
                    <Popconfirm title="Discard this picture?" onConfirm={() => void onJob(job, 'remove')}>
                      <Button size="small" danger icon={<DeleteOutlined />} aria-label="Discard" />
                    </Popconfirm>
                  )}
                </Space>
              </div>
            );
          })}
        </div>
      )}

      <PortraitProfilesModal
        open={profilesOpen}
        profiles={profiles}
        onClose={() => setProfilesOpen(false)}
        onChanged={loadProfiles}
      />
    </Space>
  );
};
