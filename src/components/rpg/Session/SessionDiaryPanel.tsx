import React from 'react';
import { Alert, Button, Input, Popconfirm, Segmented, Space, Spin, Tooltip, Typography, message } from 'antd';
import { CheckOutlined, LinkOutlined, RobotOutlined } from '@ant-design/icons';
import { getAiStatus, getSessionDiary, saveSessionDiary, summarizeSessionDiary } from '@app/api/links.api';
import RichText from '@app/components/common/RichText/RichText';
import { useLinkIndex } from '@app/hooks/useLinkIndex';
import { apiErrorMessage } from '@app/utils/api-error';
import { formatDiary } from '@app/utils/diary-format';

interface SessionDiaryPanelProps {
  sessionId: number;
  /** Current session summary (to warn before replacing it). */
  currentSummary?: string | null;
  /** Saves the reviewed text as the session summary. */
  onApply: (markdown: string) => Promise<void>;
}

const draftKey = (id: number) => `picho.session-diary.${id}`;
const readDraft = (id: number) => {
  try {
    return localStorage.getItem(draftKey(id));
  } catch {
    return null;
  }
};
const writeDraft = (id: number, v: string | null) => {
  try {
    if (v === null) localStorage.removeItem(draftKey(id));
    else localStorage.setItem(draftKey(id), v);
  } catch {
    // drafts are a convenience only
  }
};

/**
 * GM diary of a session: loose notes → reviewed summary.
 * "Format & link" is free (runs here); "Summarize with AI" calls the API (costs a little).
 */
export const SessionDiaryPanel: React.FC<SessionDiaryPanelProps> = ({ sessionId, currentSummary, onApply }) => {
  const { index } = useLinkIndex();
  const [notes, setNotes] = React.useState<string | null>(null);
  const [savedNotes, setSavedNotes] = React.useState('');
  const [aiEnabled, setAiEnabled] = React.useState(false);
  const [result, setResult] = React.useState('');
  const [view, setView] = React.useState<'edit' | 'preview'>('preview');
  const [busy, setBusy] = React.useState<'ai' | 'apply' | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    setNotes(null);
    setResult('');
    setError(null);
    getSessionDiary(sessionId)
      .then((d) => {
        if (!alive) return;
        const draft = readDraft(sessionId);
        setSavedNotes(d.notes);
        setNotes(draft ?? d.notes);
      })
      .catch((e) => alive && setError(apiErrorMessage(e, 'Could not load the diary.')));
    getAiStatus()
      .then((s) => alive && setAiEnabled(s.enabled))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [sessionId]);

  // Keep a local draft at once and save to the API shortly after typing stops.
  React.useEffect(() => {
    if (notes === null || notes === savedNotes) return undefined;
    writeDraft(sessionId, notes);
    const t = setTimeout(() => {
      saveSessionDiary(sessionId, notes)
        .then(() => {
          setSavedNotes(notes);
          writeDraft(sessionId, null);
        })
        .catch(() => undefined);
    }, 1200);
    return () => clearTimeout(t);
  }, [notes, savedNotes, sessionId]);

  async function summarizeWithAi() {
    if (!notes?.trim()) return;
    setBusy('ai');
    try {
      const { markdown } = await summarizeSessionDiary(sessionId, notes);
      setResult(markdown);
      setView('preview');
    } catch (e) {
      void message.error(apiErrorMessage(e, 'The AI summary failed. Try again in a moment.'));
    } finally {
      setBusy(null);
    }
  }

  async function apply() {
    setBusy('apply');
    try {
      await onApply(result.trim());
      void message.success('Session summary updated.');
    } catch (e) {
      void message.error(apiErrorMessage(e, 'Could not update the summary.'));
    } finally {
      setBusy(null);
    }
  }

  if (error) return <Alert showIcon type="error" message={error} />;
  if (notes === null) return <Spin />;

  const applyButton = (
    <Button icon={<CheckOutlined />} loading={busy === 'apply'} type="primary">
      Use as session summary
    </Button>
  );

  return (
    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
      <Typography.Text type="secondary">
        Jot down what happened, one idea per line. Your notes are saved automatically and only you see them. Type [[ to
        link a name.
      </Typography.Text>
      <Input.TextArea
        autoSize={{ minRows: 6, maxRows: 18 }}
        maxLength={20000}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={
          '- Arrived in Piata at dusk\n- Oren Tal handed over the field reports\n- Ambushed by Skelgra on the road'
        }
        value={notes}
      />
      <Space wrap>
        <Tooltip title="Free: bullets + links to the names it recognizes">
          <Button
            disabled={!notes.trim()}
            icon={<LinkOutlined />}
            onClick={() => {
              setResult(formatDiary(notes, index));
              setView('preview');
            }}
          >
            Format &amp; link
          </Button>
        </Tooltip>
        {aiEnabled && (
          <Tooltip title="Writes a summary from your notes (uses the AI API, about one cent per summary)">
            <Button
              disabled={!notes.trim()}
              icon={<RobotOutlined />}
              loading={busy === 'ai'}
              onClick={() => void summarizeWithAi()}
            >
              Summarize with AI
            </Button>
          </Tooltip>
        )}
      </Space>

      {result && (
        <Space orientation="vertical" size={8} style={{ width: '100%' }}>
          <Space style={{ justifyContent: 'space-between', width: '100%' }} wrap>
            <Typography.Text strong>Review before saving</Typography.Text>
            <Segmented
              onChange={(v) => setView(v as 'edit' | 'preview')}
              options={[
                { label: 'Preview', value: 'preview' },
                { label: 'Edit', value: 'edit' },
              ]}
              size="small"
              value={view}
            />
          </Space>
          {view === 'edit' ? (
            <Input.TextArea
              autoSize={{ minRows: 8, maxRows: 24 }}
              onChange={(e) => setResult(e.target.value)}
              value={result}
            />
          ) : (
            <RichText>{result}</RichText>
          )}
          {currentSummary?.trim() ? (
            <Popconfirm
              description="The current session summary will be replaced."
              okText="Replace"
              onConfirm={() => void apply()}
              title="Replace the summary?"
            >
              {applyButton}
            </Popconfirm>
          ) : (
            React.cloneElement(applyButton, { onClick: () => void apply() })
          )}
        </Space>
      )}
    </Space>
  );
};
