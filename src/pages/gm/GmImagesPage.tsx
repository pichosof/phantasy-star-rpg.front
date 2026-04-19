import React from 'react';
import { Button, Modal, Space, Tag, Typography, message } from 'antd';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';

import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { useResponsive } from '@app/hooks/useResponsive';
import { type GmImage, deleteGmImage, listGmImages, resolveGmImageUrl, uploadGmImage } from '@app/api/gm-images.api';
import { apiErrorMessage } from '../../utils/api-error';

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export const GmImagesPage: React.FC = () => {
  const { mobileOnly } = useResponsive();
  const [images, setImages] = React.useState<GmImage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);

  const load = React.useCallback(async () => {
    try {
      setImages(await listGmImages());
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to load images'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploading(true);
    try {
      await uploadGmImage(file);
      await load();
      message.success('Image uploaded');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to upload (GM key?)'));
    } finally {
      setUploading(false);
    }
  }

  function confirmDelete(img: GmImage) {
    Modal.confirm({
      title: `Delete "${img.filename}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteGmImage(img.id);
          await load();
          message.success('Image removed');
        } catch (e) {
          message.error(apiErrorMessage(e, 'Failed to remove'));
        }
      },
    });
  }

  if (loading) return <Spinner />;

  return (
    <>
      <PageTitle>GM — Images</PageTitle>
      <Card density="comfy">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <Typography.Title level={4} style={{ margin: 0 }}>
            GM Gallery · {images.length} images
          </Typography.Title>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            loading={uploading}
            onClick={() => inputRef.current?.click()}
          >
            Upload image
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            style={{ display: 'none' }}
            onChange={onFileChange}
          />
        </div>

        {images.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Typography.Text type="secondary">No images yet. Upload the first one!</Typography.Text>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gap: 12,
              gridTemplateColumns: mobileOnly ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))',
            }}
          >
            {images.map((img) => (
              <div
                key={img.id}
                style={{
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: '1px solid rgba(128,128,128,0.15)',
                  background: 'rgba(128,128,128,0.05)',
                }}
              >
                <div style={{ height: 140, background: '#111', position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={resolveGmImageUrl(img.url)}
                    alt={img.alt ?? img.filename}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
                <div style={{ padding: '8px 10px' }}>
                  <Typography.Text style={{ fontSize: 12, display: 'block' }} ellipsis>
                    {img.filename}
                  </Typography.Text>
                  <Space size={4} wrap style={{ marginTop: 4 }}>
                    <Tag style={{ margin: 0, fontSize: 10 }}>{img.mime.split('/')[1]?.toUpperCase()}</Tag>
                    <Tag style={{ margin: 0, fontSize: 10 }}>{fmtSize(img.size)}</Tag>
                  </Space>
                  <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                    <Button
                      size="small"
                      style={{ flex: 1, fontSize: 11 }}
                      onClick={() => {
                        navigator.clipboard.writeText(resolveGmImageUrl(img.url) ?? '');
                        message.success('URL copied');
                      }}
                    >
                      Copy URL
                    </Button>
                    <Button size="small" danger icon={<DeleteOutlined />} onClick={() => confirmDelete(img)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
};

export default GmImagesPage;
