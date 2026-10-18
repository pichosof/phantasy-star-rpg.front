/**
 * Domain palette: colors that identify a THING (a die, an NPC role, a lore category…),
 * not the look of a theme. They are the same in every world theme on purpose.
 *
 * How strongly they tint a surface is up to the theme: use `tint(color, 'var(--domain-tint-soft)')`.
 * Theme colors (surfaces, text, borders) never belong here — see styles/themes/<world>/.
 */

/** color-mix() tint of a domain color; `strength` is a % or a CSS variable holding one. */
export const tint = (color: string, strength: string): string =>
  `color-mix(in srgb, ${color} ${strength}, transparent)`;

// ── Dice roller ──────────────────────────────────────────────────────────────

export const DIE_COLORS = {
  2: '#597ef7',
  4: '#36cfc9',
  6: '#73d13d',
  8: '#ffc53d',
  10: '#ff7a45',
  12: '#f759ab',
  16: '#9254de',
  20: '#ff4d4f',
  24: '#13c2c2',
  30: '#52c41a',
  60: '#fa8c16',
  100: '#40a9ff',
} as const;

export const DICE_OUTCOME = {
  /** Edged die (doesn't count). */
  edge: '#faad14',
  edgeDeep: '#d4380d',
  /** Every die at its maximum. */
  max: '#ffc53d',
  /** Natural 1 / total fumble. */
  fumble: '#ff4d4f',
} as const;

/** Numbers printed on solid die faces (always on a saturated color). */
export const DIE_FACE_TEXT = '#fff';
export const DIE_FACE_TEXT_SHADOW = 'rgba(0, 0, 0, 0.8)';
export const DIE_FACE_TEXT_SHADOW_SOFT = 'rgba(0, 0, 0, 0.4)';

// ── Library document reader ──────────────────────────────────────────────────
// The reader imitates paper and has its own Light / Sepia / Dark reading modes,
// independent from the app's world theme.

export const READER = {
  paper: '#ffffff',
  ink: '#000000',
  link: '#0958d9',
  highlight: '#ffd54f',
  tableBorder: '#d9d9d9',
  tableHeader: '#f5f5f5',
  chromeBg: '#fafafa',
  chromeBorder: '#e8e8e8',
  chromeHover: '#f0f0f0',
  chromeText: '#333',
  chromeTextMuted: '#555',
  chromeTextFaint: '#666',
  /** Dark stage behind slides. */
  stage: '#1a1a1a',
  backdrop: 'rgba(0, 0, 0, 0.35)',
  drawerShadow: 'rgba(0, 0, 0, 0.18)',
  pageShadow: 'rgba(0, 0, 0, 0.4)',
} as const;

export const READER_MODES = {
  light: {
    bg: '#ffffff',
    bar: '#fafafa',
    text: '#111',
    toc: '#333',
    tocHover: '#f0f0f0',
    border: '#e8e8e8',
    muted: '#555',
  },
  sepia: {
    bg: '#f4ecd8',
    bar: '#ede3c8',
    text: '#5b4636',
    toc: '#5b4636',
    tocHover: '#f0f0f0',
    border: '#e8e8e8',
    muted: '#555',
  },
  dark: { bg: '#1a1a1a', bar: '#111111', text: '#ddd', toc: '#ccc', tocHover: '#222', border: '#333', muted: '#aaa' },
} as const;

// ── NPC roles ────────────────────────────────────────────────────────────────
// Keys match role text in stored NPCs (any language): first key contained in the role wins.

export const NPC_ROLE_META: Record<string, { color: string; hex: string }> = {
  aliado: { color: 'green', hex: '#52c41a' },
  ally: { color: 'green', hex: '#52c41a' },
  amigo: { color: 'green', hex: '#52c41a' },
  mercador: { color: 'blue', hex: '#1677ff' },
  vendor: { color: 'blue', hex: '#1677ff' },
  comerciante: { color: 'blue', hex: '#1677ff' },
  contratante: { color: 'gold', hex: '#faad14' },
  'quest giver': { color: 'gold', hex: '#faad14' },
  informante: { color: 'purple', hex: '#722ed1' },
  inimigo: { color: 'red', hex: '#f5222d' },
  antagonista: { color: 'red', hex: '#f5222d' },
  enemy: { color: 'red', hex: '#f5222d' },
  líder: { color: 'orange', hex: '#fa8c16' },
  lider: { color: 'orange', hex: '#fa8c16' },
  guia: { color: 'cyan', hex: '#13c2c2' },
  guide: { color: 'cyan', hex: '#13c2c2' },
  guardião: { color: 'geekblue', hex: '#2f54eb' },
  guardiao: { color: 'geekblue', hex: '#2f54eb' },
  curandeiro: { color: 'volcano', hex: '#fa541c' },
  mestre: { color: 'magenta', hex: '#eb2f96' },
  sábio: { color: 'magenta', hex: '#eb2f96' },
  sabio: { color: 'magenta', hex: '#eb2f96' },
  neutro: { color: 'default', hex: '#8c8c8c' },
};

export const NPC_ROLE_FALLBACK = { color: 'default', hex: '#8c8c8c' } as const;

// ── Card covers without an image ─────────────────────────────────────────────

/** Deep-space gradients behind the icon watermark of image-less covers. */
export const COVER_GRADIENTS = [
  'linear-gradient(135deg, #040A18 0%, #0A1C3A 50%, #0E2A58 100%)',
  'linear-gradient(135deg, #08041C 0%, #1E0A50 50%, #2E0E72 100%)',
  'linear-gradient(135deg, #1C0A04 0%, #4A1E08 50%, #7A2E06 100%)',
  'linear-gradient(135deg, #0C0808 0%, #2A0C0C 50%, #180808 100%)',
  'linear-gradient(135deg, #050C1E 0%, #082240 50%, #0A2A58 100%)',
  'linear-gradient(135deg, #0A041C 0%, #1E0840 50%, #0C0428 100%)',
  'linear-gradient(135deg, #04100C 0%, #082820 50%, #0A1E18 100%)',
  'linear-gradient(135deg, #0C0A10 0%, #1A1428 50%, #22183A 100%)',
];

// ── Lore categories / quest status / timeline events ─────────────────────────

export const LORE_CATEGORY_COLORS = {
  history: '#fa8c16',
  culture: '#722ed1',
  tech: '#13c2c2',
  biology: '#52c41a',
  myth: '#faad14',
};

export const QUEST_STATUS_COLORS = {
  active: '#1677ff',
  completed: '#52c41a',
  failed: '#fa541c',
};

/** Algol-system colors cycled through timeline events. */
export const TIMELINE_EVENT_COLORS = ['#00C8E8', '#7722DD', '#FF6B1A', '#FF2244', '#22EFC8', '#C8A020'];
export const TIMELINE_RAIL_GRADIENT =
  'linear-gradient(180deg, transparent 0%, #00C8E8 5%, #7722DD 30%, #FF6B1A 58%, #FF2244 82%, transparent 100%)';

// ── Tags / character sheets / map ────────────────────────────────────────────

/** Default color offered for a new tag. */
export const TAG_DEFAULT_COLOR = '#1677ff';

/** Starfinder sheet: one identity color per computed stat. */
export const SHEET_STAT_COLORS = {
  initiative: '#597ef7',
  eac: '#36cfc9',
  kac: '#73d13d',
  acVsCm: '#ffc53d',
  melee: '#ff4d4f',
  ranged: '#40a9ff',
  thrown: '#ffc53d',
  stamina: '#40a9ff',
  hp: '#73d13d',
  resolve: '#9254de',
} as const;

/** Map markers (drawn on the map image, same in every theme). */
export const MAP_MARKER = {
  picking: 'rgba(255, 70, 70, 0.95)',
  city: 'rgba(255,255,255,0.95)',
  cityUndiscovered: 'rgba(180,180,180,0.95)',
  dungeon: 'rgba(180,100,255,0.95)',
  dungeonUndiscovered: 'rgba(120,60,180,0.8)',
  label: 'rgba(0,0,0,0.6)',
} as const;

/** Glow of an edged die (dice roller animation). */
export const EDGE_GLOW = {
  from: '0 0 8px rgba(250,173,20,0.5), 0 0 16px rgba(212,56,13,0.3)',
  to: '0 0 16px rgba(250,173,20,0.9), 0 0 32px rgba(212,56,13,0.6)',
} as const;
