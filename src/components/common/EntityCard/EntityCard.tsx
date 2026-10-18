import React from 'react';
import { Divider, Space, Tag } from 'antd';
import styled from 'styled-components';
import { AppIcon, type AppIconName } from '@app/components/common/AppIcon/AppIcon';
import { type ImageShape, objectPosition, SHAPE_ASPECT, thumbUrl, useImageFocus } from '@app/api/images.api';
import { stripMarkdown } from '@app/components/common/RichText/RichText';
import { useResponsive } from '@app/hooks/useResponsive';
import { COVER_GRADIENTS } from '@app/styles/domain-palette';

/**
 * Common listing card for every domain and screen size, modelled on the Sessions cards:
 *
 *   ┌──────────── cover (image, or palette gradient + icon watermark) ┐
 *   │ LABEL                                           [status tags]  │
 *   │ meta (date, place…)                                            │
 *   │ Title                                                          │
 *   │ summary (Markdown stripped, 3 lines)                           │
 *   │ chips                                                          │
 *   ├────────────────────────────────────────────────────────────────┤
 *   │ footer text                        [GM actions]   Open →       │
 *   └────────────────────────────────────────────────────────────────┘
 */

const GRADIENTS = COVER_GRADIENTS;

export const cardGradient = (seed: number) => GRADIENTS[Math.abs(seed) % GRADIENTS.length];

// ── Styles (moved from SessionsPage.styles) ──────────────────────────────────

const Grid = styled.div<{ $cols: number }>`
  display: grid;
  grid-template-columns: ${({ $cols }) => `repeat(${$cols}, minmax(0, 1fr))`};
  gap: 16px;
  align-items: start;
`;

const Article = styled.article<{ $clickable: boolean; $dimmed: boolean }>`
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  background: var(--additional-background-color);
  box-shadow: var(--box-shadow);
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  opacity: ${({ $dimmed }) => ($dimmed ? 0.72 : 1)};
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    transform: ${({ $clickable }) => ($clickable ? 'translateY(-2px)' : 'none')};
    border-color: rgba(var(--primary-rgb-color), 0.35);
    box-shadow: 0 12px 30px var(--shadow-elevated);
  }
`;

const CoverFrame = styled.div<{ $aspect: string }>`
  position: relative;
  aspect-ratio: ${({ $aspect }) => $aspect};
  overflow: hidden;
  background: #000; /* theme-isolation-ignore: overlay on images/media, dark in every theme */
`;
const CoverImage = styled.img<{ $position: string }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: ${({ $position }) => $position};
  display: block;
`;
const CoverOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    transparent 40%,
    /* theme-isolation-ignore: overlay on images/media, dark in every theme */ rgba(0, 0, 0, 0.65) 100%
  );
`;
const CoverFallback = styled.div<{ $gradient: string; $aspect: string }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: ${({ $aspect }) => $aspect};
  background: ${({ $gradient }) => $gradient};
`;
const CoverWatermark = styled.span`
  color: rgba(255, 255, 255, 0.12); /* theme-isolation-ignore: overlay on images/media, dark in every theme */
  user-select: none;
`;
const CoverBrand = styled.span`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 12px;
  display: flex;
  justify-content: center;
  color: rgba(255, 255, 255, 0.35); /* theme-isolation-ignore: overlay on images/media, dark in every theme */
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 3px;
  text-transform: uppercase;
`;
const CoverBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const AccentStrip = styled.div<{ $color: string }>`
  height: 4px;
  background: ${({ $color }) => $color};
`;

const Body = styled.div`
  display: grid;
  gap: 8px;
  padding: 14px 16px 12px;
  min-width: 0;
`;
const Top = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
`;
const Label = styled.span`
  color: var(--text-muted-color);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
`;
const Meta = styled.div`
  color: var(--text-muted-color);
  font-size: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
`;
const Title = styled.div`
  color: var(--text-main-color);
  font-size: 18px;
  font-weight: 800;
  line-height: 1.3;
  overflow-wrap: anywhere;
`;
const Summary = styled.p<{ $muted: boolean }>`
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: var(--text-muted-color);
  font-size: 13px;
  line-height: 1.55;
  font-style: ${({ $muted }) => ($muted ? 'italic' : 'normal')};
  white-space: pre-wrap;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
`;
const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;
const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
`;
const FooterText = styled.span`
  color: var(--text-muted-color);
  font-size: 11px;
`;
const OpenText = styled.span`
  color: var(--primary-color);
  font-size: 12px;
  font-weight: 700;
`;

// ── Components ───────────────────────────────────────────────────────────────

/**
 * Landscape/text cards: 1 column on phones, 2 from tablet width up.
 * Portrait/square cards are taller, so they get more columns: 2 · 3 · 4.
 */
export const EntityCardGrid: React.FC<{ children: React.ReactNode; columns?: number; shape?: ImageShape }> = ({
  children,
  columns,
  shape,
}) => {
  const { mobileOnly, tabletOnly } = useResponsive();
  const tall = shape === 'portrait' || shape === 'square';
  const cols = columns ?? (tall ? (mobileOnly ? 2 : tabletOnly ? 3 : 4) : mobileOnly ? 1 : 2);
  return <Grid $cols={cols}>{children}</Grid>;
};

export interface EntityCardProps {
  title: React.ReactNode;
  onClick?: () => void;

  /** Cover image; without one, a gradient (seeded by `seed`) with the `icon` watermark. */
  cover?: { src?: string | null; alt?: string } | null;
  icon?: AppIconName;
  seed?: number;
  /** Frame of the cover: portrait 4:5 (people), square 1:1 (creatures), landscape 16:9 (places). */
  shape?: ImageShape;
  /** Tags laid over the cover (e.g. type). */
  coverTags?: React.ReactNode;
  /** Hides the cover entirely (e.g. text-only entities). */
  noCover?: boolean;
  /** Colored strip on top of text-only cards (status, category…). */
  accent?: string;

  /** Small uppercase eyebrow, e.g. "Session #3". */
  label?: React.ReactNode;
  /** GM status tags (render only for the GM). */
  status?: { visible?: boolean; discovered?: boolean | null };
  /** Small facts row: date, place… */
  meta?: React.ReactNode;
  /** Markdown or plain text; stripped and clamped to 3 lines. */
  summary?: string | null;
  summaryFallback?: string;
  /** Replaces the summary, e.g. "Information unavailable." (undiscovered). */
  locked?: string | null;
  chips?: React.ReactNode;

  footer?: React.ReactNode;
  /** GM controls in the footer; clicks don't open the card. */
  actions?: React.ReactNode;
  openText?: string;
}

export const EntityCard: React.FC<EntityCardProps> = ({
  title,
  onClick,
  cover,
  icon = 'star',
  seed = 0,
  shape = 'landscape',
  coverTags,
  noCover,
  accent,
  label,
  status,
  meta,
  summary,
  summaryFallback = 'No description yet.',
  locked,
  chips,
  footer,
  actions,
  openText = 'Open',
}) => {
  const aspect = SHAPE_ASPECT[shape];
  const focus = useImageFocus(cover?.src);
  const text = locked ?? (stripMarkdown(summary) || summaryFallback);

  return (
    <Article $clickable={Boolean(onClick)} $dimmed={Boolean(locked)} onClick={onClick}>
      {noCover && accent && <AccentStrip $color={accent} />}
      {!noCover &&
        (cover?.src ? (
          <CoverFrame $aspect={aspect}>
            <CoverImage
              $position={objectPosition(focus, shape)}
              alt={cover.alt ?? ''}
              decoding="async"
              loading="lazy"
              src={thumbUrl(cover.src, 640)}
            />
            <CoverOverlay />
            {coverTags && <CoverBadge>{coverTags}</CoverBadge>}
          </CoverFrame>
        ) : (
          <CoverFallback $aspect={aspect} $gradient={cardGradient(seed)}>
            <CoverWatermark>
              <AppIcon name={icon} size={64} />
            </CoverWatermark>
            <CoverBrand>Phantasy Star RPG</CoverBrand>
            {coverTags && <CoverBadge>{coverTags}</CoverBadge>}
          </CoverFallback>
        ))}

      <Body>
        {(label || status) && (
          <Top>
            {typeof label === 'string' || typeof label === 'number' ? <Label>{label}</Label> : (label ?? <span />)}
            {status && (
              <Space size={4} wrap>
                {status.visible !== undefined && (
                  <Tag color={status.visible ? 'green' : 'red'} style={{ margin: 0 }}>
                    {status.visible ? 'Visible' : 'Hidden'}
                  </Tag>
                )}
                {status.discovered !== undefined && status.discovered !== null && (
                  <Tag color={status.discovered ? 'gold' : 'default'} style={{ margin: 0 }}>
                    {status.discovered ? 'Discovered' : 'Undiscovered'}
                  </Tag>
                )}
              </Space>
            )}
          </Top>
        )}

        {meta && <Meta>{meta}</Meta>}
        <Title>{title}</Title>
        <Summary $muted={!summary || Boolean(locked)}>{text}</Summary>
        {chips && <Chips>{chips}</Chips>}

        <div style={{ minHeight: 4 }} />
        <Divider style={{ margin: '4px 0' }} />

        <Footer>
          <FooterText>{footer}</FooterText>
          <Space size={6}>
            {actions && (
              <span onClick={(e) => e.stopPropagation()} style={{ display: 'inline-flex', gap: 6 }}>
                {actions}
              </span>
            )}
            {onClick && <OpenText>{openText}</OpenText>}
          </Space>
        </Footer>
      </Body>
    </Article>
  );
};

export default EntityCard;
