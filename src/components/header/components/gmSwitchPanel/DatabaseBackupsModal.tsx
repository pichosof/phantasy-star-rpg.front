import React from 'react';
import { Alert, Button, Input, List, Modal, Space, Typography, Upload, message } from 'antd';
import { CloudUploadOutlined, HistoryOutlined, SaveOutlined } from '@ant-design/icons';
import {
  backupNow,
  listBackups,
  restoreBackup,
  restoreFromFile,
  RESTORE_CONFIRM_WORD,
  type DatabaseBackup,
} from '@app/api/database.api';
import { formatBytes } from '@app/api/library.api';

interface DatabaseBackupsModalProps {
  open: boolean;
  onClose: () => void;
}

type RestoreTarget = { kind: 'backup'; backup: DatabaseBackup } | { kind: 'file'; file: File };

const errorMessage = (e: unknown, fallback: string) =>
  (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;

/** GM: list database backups, back up now, and restore a backup or an uploaded .db file. */
export const DatabaseBackupsModal: React.FC<DatabaseBackupsModalProps> = ({ open, onClose }) => {
  const [backups, setBackups] = React.useState<DatabaseBackup[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [backingUp, setBackingUp] = React.useState(false);
  const [target, setTarget] = React.useState<RestoreTarget | null>(null);
  const [confirm, setConfirm] = React.useState('');
  const [restoring, setRestoring] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setBackups(await listBackups());
    } catch (e) {
      setError(errorMessage(e, 'Could not load the backups.'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (open) void load();
  }, [open, load]);

  async function handleBackupNow() {
    setBackingUp(true);
    try {
      const res = await backupNow();
      void message.success(res.status === 'uploaded' ? 'Backup created.' : 'No changes since the latest backup.');
      await load();
    } catch (e) {
      void message.error(errorMessage(e, 'Backup failed.'));
    } finally {
      setBackingUp(false);
    }
  }

  function askRestore(next: RestoreTarget) {
    setConfirm('');
    setTarget(next);
  }

  async function handleRestore() {
    if (!target) return;
    setRestoring(true);
    try {
      const res =
        target.kind === 'backup'
          ? await restoreBackup(target.backup.name, confirm)
          : await restoreFromFile(target.file, confirm);
      Modal.success({
        title: 'Database restored',
        content: `Restored from ${res.restoredFrom}. The previous state was saved as ${res.safetyBackup}. The page will reload.`,
        onOk: () => window.location.reload(),
      });
      setTarget(null);
      onClose();
    } catch (e) {
      void message.error(errorMessage(e, 'Restore failed.'));
    } finally {
      setRestoring(false);
    }
  }

  const targetLabel =
    target?.kind === 'backup' ? new Date(target.backup.createdAt).toLocaleString() : target?.file.name;

  return (
    <>
      <Modal
        destroyOnHidden
        footer={null}
        onCancel={onClose}
        open={open}
        title={
          <Space>
            <HistoryOutlined /> Database backups
          </Space>
        }
        width={560}
      >
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Space wrap>
            <Button icon={<SaveOutlined />} loading={backingUp} onClick={() => void handleBackupNow()}>
              Back up now
            </Button>
            <Upload
              accept=".db,.sqlite,.sqlite3,application/vnd.sqlite3"
              beforeUpload={(file) => {
                askRestore({ kind: 'file', file });
                return false;
              }}
              showUploadList={false}
            >
              <Button icon={<CloudUploadOutlined />}>Restore from file</Button>
            </Upload>
          </Space>
          {error && <Alert showIcon type="error" message={error} />}
          <List
            dataSource={backups}
            loading={loading}
            locale={{ emptyText: 'No backups yet.' }}
            renderItem={(b, i) => (
              <List.Item
                actions={[
                  <Button danger key="restore" onClick={() => askRestore({ kind: 'backup', backup: b })} size="small">
                    Restore
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  description={`${formatBytes(b.size)}${i === 0 ? ' · latest' : ''}`}
                  title={new Date(b.createdAt).toLocaleString()}
                />
              </List.Item>
            )}
            size="small"
          />
        </Space>
      </Modal>

      <Modal
        okButtonProps={{ danger: true, disabled: confirm !== RESTORE_CONFIRM_WORD, loading: restoring }}
        okText="Restore"
        onCancel={() => setTarget(null)}
        onOk={() => void handleRestore()}
        open={Boolean(target)}
        title="Restore database?"
      >
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Typography.Paragraph style={{ margin: 0 }}>
            Every change made after <b>{targetLabel}</b> will be replaced. A backup of the current database is taken
            first, so this can be undone by restoring it.
          </Typography.Paragraph>
          <Input
            autoFocus
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={`Type ${RESTORE_CONFIRM_WORD} to confirm`}
            value={confirm}
          />
        </Space>
      </Modal>
    </>
  );
};
