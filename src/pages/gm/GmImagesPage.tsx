import React from 'react';
import { Button, Modal, Typography, message } from 'antd';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { Button as AdmMobileButton, SpinLoading, Tag as AdmMobileTag } from 'antd-mobile';
import { DeleteOutline, LinkOutline, PictureOutline, UploadOutline } from 'antd-mobile-icons';

import { IconLabel } from '@app/components/common/AppIcon/AppIcon';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Card } from '@app/components/common/Card/Card';
import { Spinner } from '@app/components/common/Spinner/Spinner';
import {
  MobileActionBar,
  MobileCard,
  MobileDialog,
  MobileEntitySheet,
  MobilePageScaffold,
  MobileSearchBar,
} from '@app/components/common/mobile';
import { useResponsive } from '@app/hooks/useResponsive';
import { type GmImage, deleteGmImage, listGmImages, resolveGmImageUrl, uploadGmImage } from '@app/api/gm-images.api';
import { apiErrorMessage } from '../../utils/api-error';
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
  const [search, setSearch] = React.useState('');
  const [activeId, setActiveId] = React.useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<GmImage | null>(null);

  const inputRef = React.useRef<HTMLInputElement>(null);

  const activeImage = React.useMemo(() => images.find((image) => image.id === activeId) ?? null, [activeId, images]);

  const filteredImages = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return images;

    return images.filter((img) => `${img.filename} ${img.alt ?? ''} ${img.mime}`.toLowerCase().includes(query));
  }, [images, search]);

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
    if (mobileOnly) {
      setDeleteTarget(img);
      return;
    }

    Modal.confirm({
      title: `Delete "${img.filename}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        await removeImage(img.id);
      },
    });
  }

  async function removeImage(id: number) {
    try {
      await deleteGmImage(id);
      if (activeId === id) {
        setActiveId(null);
      }
      setDeleteTarget(null);
      await load();
      message.success('Image removed');
    } catch (e) {
      message.error(apiErrorMessage(e, 'Failed to remove'));
    }
  }

  async function copyUrl(img: GmImage) {
    const url = resolveGmImageUrl(img.url);
    if (!url) {
      message.warning('Image URL unavailable');
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      message.success('URL copied');
    } catch {
      message.error('Failed to copy URL');
    }
  }

  if (loading) return <Spinner />;

  const totalSize = images.reduce((sum, img) => sum + img.size, 0);
  const mobileMeta = (
    <S.MobileMetaTags>
      <AdmMobileTag fill="outline" round>
        {images.length} images
      </AdmMobileTag>
      <AdmMobileTag color="primary" fill="outline" round>
        {fmtSize(totalSize)}
      </AdmMobileTag>
      {uploading ? (
        <AdmMobileTag color="warning" fill="outline" round>
          Uploading
        </AdmMobileTag>
      ) : null}
    </S.MobileMetaTags>
  );

  if (mobileOnly) {
    return (
      <>
        <PageTitle>GM - Images</PageTitle>

        <MobilePageScaffold
          actions={
            <AdmMobileButton color="primary" loading={uploading} onClick={() => inputRef.current?.click()} size="small">
              <UploadOutline fontSize={16} /> Upload
            </AdmMobileButton>
          }
          filters={<MobileSearchBar inset={false} onChange={setSearch} placeholder="Search images..." value={search} />}
          meta={mobileMeta}
          subtitle="Private GM media vault for handouts, portraits and reference images."
          title={<IconLabel icon="image">GM Images</IconLabel>}
        >
          <S.HiddenFileInput
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={onFileChange}
            ref={inputRef}
            type="file"
          />

          {uploading ? (
            <MobileCard compact>
              <S.MobileEmptyState>
                <SpinLoading color="primary" />
              </S.MobileEmptyState>
            </MobileCard>
          ) : !filteredImages.length ? (
            <MobileCard compact>
              <S.MobileEmptyState>No images found.</S.MobileEmptyState>
            </MobileCard>
          ) : (
            <S.MobileImagesGrid>
              {filteredImages.map((img) => (
                <MobileCard compact key={img.id}>
                  <S.MobileImageBody>
                    <S.MobileImageFrame>
                      <S.MobileImageThumb src={resolveGmImageUrl(img.url)} alt={img.alt ?? img.filename} />
                    </S.MobileImageFrame>
                    <S.MobileImageTitle>{img.filename}</S.MobileImageTitle>
                    <S.MobileMetaTags>
                      <AdmMobileTag fill="outline" round>
                        {img.mime.split('/')[1]?.toUpperCase() ?? img.mime}
                      </AdmMobileTag>
                      <AdmMobileTag fill="outline" round>
                        {fmtSize(img.size)}
                      </AdmMobileTag>
                    </S.MobileMetaTags>
                    <S.MobileImageActions>
                      <AdmMobileButton block color="primary" onClick={() => setActiveId(img.id)}>
                        <PictureOutline fontSize={17} /> Open
                      </AdmMobileButton>
                      <AdmMobileButton block fill="outline" onClick={() => void copyUrl(img)}>
                        <LinkOutline fontSize={17} /> Copy URL
                      </AdmMobileButton>
                    </S.MobileImageActions>
                  </S.MobileImageBody>
                </MobileCard>
              ))}
            </S.MobileImagesGrid>
          )}
        </MobilePageScaffold>

        <MobileEntitySheet
          description={activeImage ? `${activeImage.mime} - ${fmtSize(activeImage.size)}` : undefined}
          footer={
            activeImage ? (
              <MobileActionBar
                primary={
                  <AdmMobileButton block color="primary" onClick={() => void copyUrl(activeImage)}>
                    <LinkOutline fontSize={17} /> Copy URL
                  </AdmMobileButton>
                }
                secondary={
                  <AdmMobileButton block color="danger" fill="outline" onClick={() => setDeleteTarget(activeImage)}>
                    <DeleteOutline fontSize={17} /> Delete
                  </AdmMobileButton>
                }
                sticky={false}
              />
            ) : undefined
          }
          onClose={() => setActiveId(null)}
          subtitle="GM image"
          title={activeImage?.filename ?? 'Image'}
          visible={Boolean(activeImage)}
        >
          {activeImage ? (
            <>
              <MobileCard compact>
                <S.MobilePreviewFrame>
                  <S.MobilePreviewImage
                    alt={activeImage.alt ?? activeImage.filename}
                    src={resolveGmImageUrl(activeImage.url)}
                  />
                </S.MobilePreviewFrame>
              </MobileCard>

              <MobileCard compact title="Details">
                <S.MobileDetailGrid>
                  <S.MobileDetailItem>
                    <S.MobileDetailLabel>Filename</S.MobileDetailLabel>
                    <S.MobileDetailValue>{activeImage.filename}</S.MobileDetailValue>
                  </S.MobileDetailItem>
                  <S.MobileDetailItem>
                    <S.MobileDetailLabel>Type</S.MobileDetailLabel>
                    <S.MobileDetailValue>{activeImage.mime}</S.MobileDetailValue>
                  </S.MobileDetailItem>
                  <S.MobileDetailItem>
                    <S.MobileDetailLabel>Size</S.MobileDetailLabel>
                    <S.MobileDetailValue>{fmtSize(activeImage.size)}</S.MobileDetailValue>
                  </S.MobileDetailItem>
                </S.MobileDetailGrid>
              </MobileCard>
            </>
          ) : null}
        </MobileEntitySheet>

        <MobileDialog
          actions={[
            {
              key: 'cancel',
              text: 'Cancel',
              onClick: () => setDeleteTarget(null),
            },
            {
              key: 'delete',
              text: 'Delete image',
              bold: true,
              danger: true,
              onClick: () => {
                if (deleteTarget) {
                  return removeImage(deleteTarget.id);
                }
              },
            },
          ]}
          content={deleteTarget ? `Delete "${deleteTarget.filename}" permanently?` : ''}
          onClose={() => setDeleteTarget(null)}
          title="Delete image?"
          visible={Boolean(deleteTarget)}
        />
      </>
    );
  }

  return (
    <>
      <PageTitle>GM - Images</PageTitle>
      <Card density="comfy">
        <S.HeaderRow>
          <S.HeaderTitle level={4}>GM Gallery - {images.length} images</S.HeaderTitle>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            loading={uploading}
            onClick={() => inputRef.current?.click()}
          >
            Upload image
          </Button>
          <S.HiddenFileInput
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
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
                  <S.FileName ellipsis>{img.filename}</S.FileName>
                  <S.TagsRow>
                    <S.MetaTag>{img.mime.split('/')[1]?.toUpperCase()}</S.MetaTag>
                    <S.MetaTag>{fmtSize(img.size)}</S.MetaTag>
                  </S.TagsRow>
                  <S.ActionsRow>
                    <S.CopyButton size="small" onClick={() => void copyUrl(img)}>
                      Copy URL
                    </S.CopyButton>
                    <Button size="small" danger icon={<DeleteOutlined />} onClick={() => confirmDelete(img)} />
                  </S.ActionsRow>
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
