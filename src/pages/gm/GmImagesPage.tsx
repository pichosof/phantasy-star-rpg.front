import React from 'react';
import { Button, Modal, Space, Tag, Typography, message } from 'antd';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';

import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import { useResponsive } from '@app/hooks/useResponsive';
import { type GmImage, deleteGmImage, listGmImages, resolveGmImageUrl, uploadGmImage } from '@app/api/gm-images.api';
import { apiErrorMessage } from '../../utils/api-error';
import { m0, hiddenInput } from '@app/styles/styleUtils';
import * as S from './GmImagesPage.styles';

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
        <S.HeaderRow>
          <Typography.Title level={4} style={m0}>
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
            style={hiddenInput}
            onChange={onFileChange}
          />
        </S.HeaderRow>

        {images.length === 0 ? (
          <S.EmptyState>
            <Typography.Text type="secondary">No images yet. Upload the first one!</Typography.Text>
          </S.EmptyState>
        ) : (
          <S.ImageGrid $mobileOnly={mobileOnly}>
            {images.map((img) => (
              <S.ImageCard key={img.id}>
                <S.ImageFrame>
                  <S.ImageThumb src={resolveGmImageUrl(img.url)} alt={img.alt ?? img.filename} />
                </S.ImageFrame>
                <S.CardBody>
                  <Typography.Text style={S.fileName} ellipsis>
                    {img.filename}
                  </Typography.Text>
                  <Space size={4} wrap style={S.tagsRow}>
                    <Tag style={S.metaTag}>{img.mime.split('/')[1]?.toUpperCase()}</Tag>
                    <Tag style={S.metaTag}>{fmtSize(img.size)}</Tag>
                  </Space>
                  <div style={S.actionsRow}>
                    <Button
                      size="small"
                      style={S.copyButton}
                      onClick={() => {
                        navigator.clipboard.writeText(resolveGmImageUrl(img.url) ?? '');
                        message.success('URL copied');
                      }}
                    >
                      Copy URL
                    </Button>
                    <Button size="small" danger icon={<DeleteOutlined />} onClick={() => confirmDelete(img)} />
                  </div>
                </S.CardBody>
              </S.ImageCard>
            ))}
          </S.ImageGrid>
        )}
      </Card>
    </>
  );
};

export default GmImagesPage;
