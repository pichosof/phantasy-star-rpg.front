import React from 'react';
import { AimOutlined } from '@ant-design/icons';
import { message } from 'antd';
import styled from 'styled-components';
import { saveImageFocus, thumbUrl, useImageFocus } from '@app/api/images.api';
import ExpandableImage from '@app/components/common/ExpandableImage/ExpandableImage';

/**
 * Shows the whole picture — never cropped — over a blurred, darkened copy of itself that
 * fills the frame, so portraits, squares and panoramas all look intentional.
 * Loads the 1280px thumbnail; the fullscreen button opens the original.
 * With `editableFocus`, the GM can click the main point of the image (face, creature…);
 * cards then use it as their crop centre.
 */

const Frame = styled.div<{ $height: number }>`
  position: relative;
  height: ${({ $height }) => `${$height}px`};
  overflow: hidden;
  border-radius: 8px;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Backdrop = styled.img`
  position: absolute;
  inset: -24px;
  width: calc(100% + 48px);
  height: calc(100% + 48px);
  object-fit: cover;
  filter: blur(22px) brightness(0.55) saturate(1.2);
  pointer-events: none;
`;

const Picture = styled.img<{ $picking: boolean }>`
  position: relative;
  display: block;
  max-width: 100%;
  max-height: 100%;
  cursor: ${({ $picking }) => ($picking ? 'crosshair' : 'default')};
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.45);
`;

const Marker = styled.span<{ $x: number; $y: number }>`
  position: absolute;
  left: ${({ $x }) => `${$x}%`};
  top: ${({ $y }) => `${$y}%`};
  width: 22px;
  height: 22px;
  margin: -11px 0 0 -11px;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow:
    0 0 0 2px rgba(24, 144, 255, 0.9),
    0 2px 8px rgba(0, 0, 0, 0.6);
  pointer-events: none;
`;

const PictureWrap = styled.span`
  position: relative;
  display: inline-flex;
  max-width: 100%;
  max-height: 100%;
`;

const FocusButton = styled.button<{ $active: boolean }>`
  position: absolute;
  left: 8px;
  bottom: 8px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 9px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  color: #fff;
  cursor: pointer;
  background: ${({ $active }) => ($active ? 'rgba(24, 144, 255, 0.95)' : 'rgba(0, 0, 0, 0.55)')};
`;

export interface ContainedImageProps {
  /** Original upload URL (the lightbox opens it). */
  src?: string | null;
  alt?: string;
  height?: number;
  /** GM: lets the user click the image to set its focal point. */
  editableFocus?: boolean;
  /** Overlays (e.g. carousel arrows, delete button). */
  children?: React.ReactNode;
}

export const ContainedImage: React.FC<ContainedImageProps> = ({
  src,
  alt = '',
  height = 320,
  editableFocus = false,
  children,
}) => {
  const focus = useImageFocus(src);
  const [picking, setPicking] = React.useState(false);
  if (!src) return null;

  const display = thumbUrl(src, 1280);
  const backdrop = thumbUrl(src, 320);

  async function pick(e: React.MouseEvent<HTMLImageElement>) {
    if (!picking || !src) return;
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    try {
      await saveImageFocus(src, { x, y });
      message.success('Focus saved — cards now center on this point.');
      setPicking(false);
    } catch {
      message.error('Could not save the focus.');
    }
  }

  return (
    <ExpandableImage alt={alt} src={src}>
      <Frame $height={height}>
        <Backdrop alt="" aria-hidden src={backdrop} />
        <PictureWrap>
          <Picture
            $picking={picking}
            alt={alt}
            onClick={pick}
            src={display}
            title={picking ? 'Click the main point of the image' : undefined}
          />
          {(picking || editableFocus) && focus && <Marker $x={focus.x} $y={focus.y} />}
        </PictureWrap>
        {editableFocus && (
          <FocusButton
            $active={picking}
            onClick={(e) => {
              e.stopPropagation();
              setPicking((v) => !v);
            }}
            type="button"
          >
            <AimOutlined /> {picking ? 'Click the main point…' : 'Set focus'}
          </FocusButton>
        )}
        {children}
      </Frame>
    </ExpandableImage>
  );
};

export default ContainedImage;
