import React from 'react';
import { Modal } from 'antd';
import { FullscreenOutlined } from '@ant-design/icons';
import { carouselZoomBtn } from '@app/styles/styleUtils';

const lightboxBody: React.CSSProperties = {
  padding: 0,
  background: '#000',
  borderRadius: 8,
  overflow: 'hidden',
  textAlign: 'center',
};

const lightboxImage: React.CSSProperties = {
  maxWidth: '100%',
  maxHeight: '85vh',
  objectFit: 'contain',
  display: 'inline-block',
};

interface ExpandableImageProps {
  src?: string | null;
  alt?: string;
  /** The image as already rendered by the page (cropped/cover). */
  children: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * Same pattern as the city drawer carousel: a fullscreen button over the image
 * opens a lightbox showing the original image uncropped.
 */
export const ExpandableImage: React.FC<ExpandableImageProps> = ({ src, alt = '', children, style }) => {
  const [open, setOpen] = React.useState(false);
  if (!src) return <>{children}</>;

  return (
    <div style={{ position: 'relative', ...style }}>
      {children}
      <button
        aria-label="Expand image"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        style={{ ...carouselZoomBtn, zIndex: 2 }}
        type="button"
      >
        <FullscreenOutlined />
      </button>
      <Modal
        centered
        footer={null}
        onCancel={() => setOpen(false)}
        open={open}
        styles={{ body: lightboxBody }}
        width="92vw"
      >
        <img alt={alt} src={src} style={lightboxImage} />
      </Modal>
    </div>
  );
};

export default ExpandableImage;
