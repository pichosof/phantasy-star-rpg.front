import { shadeColor } from '@app/utils/utils';
import { graphic } from 'echarts';
import type { ThemeTokens } from '../contract';

/** Motavia Light — deserto abrasador / areia quente / sol de Algol */
const chartColors = {
  chartTooltipLabel: '#7A5E38',
  chartColor1: '#D45A08', // Desert Ember — sol de Motavia (primária)
  chartColor1Tint: '#F09050',
  chartColor2: '#B88C18', // Algol Gold — ouro do deserto
  chartColor2Tint: '#E8C850',
  chartColor3: '#A02850', // Zema Crimson — sangue de Zio
  chartColor3Tint: '#D87090',
  chartColor4: '#1E9EA8', // Oasis Teal — azul do oásis
  chartColor4Tint: '#68C8D4',
  chartColor5: '#C01E2E', // Danger Red — alerta do deserto
  chartColor5Tint: '#E87888',

  chartPrimaryGradient: new graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: 'rgba(212, 90, 8, 0.55)' },
    { offset: 1, color: 'rgba(212, 90, 8, 0.00)' },
  ]),
  chartSecondaryGradient: new graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: 'rgba(184, 140, 24, 0.50)' },
    { offset: 1, color: 'rgba(184, 140, 24, 0.00)' },
  ]),
  chartSecondaryGradientSpecular: new graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: 'rgba(255, 255, 255, 0.00)' },
    { offset: 1, color: 'rgba(192, 30, 46, 0.50)' },
  ]),
};

/** Motavia owns every value below; nothing is inherited from another theme. */
export const motaviaTokens: ThemeTokens = {
  // Núcleo
  primary: '#A44707', // Desert Ember — 4.6:1 as text on every Motavia surface
  primary1: '#FFF0DC', // Areia clara — fundo de hover/badge
  primaryGradient: 'linear-gradient(211.49deg, #D45A08 15.89%, #B88C18 48.97%)',
  light: '#C0A070', // Areia seca
  secondary: '#7D5F10', // Algol Gold — deepened for text use (4.5:1)

  // Estados
  error: '#B81E2A',
  warning: '#955407',
  success: '#17704B',

  // Fundos — pergaminho quente de Motavia
  background: '#F8EDD8',
  secondaryBackground: '#F0E2C0',
  secondaryBackgroundSelected: shadeColor('#F0E2C0', -5),
  additionalBackground: '#FFFFFF',
  collapseBackground: '#1E0A04', // Noite do deserto (para collapse escuro)
  timelineBackground: '#F4E6C8',
  siderBackground: '#1A0804',

  // UI misc
  spinnerBase: '#D45A08',
  scroll: '#C0A070',
  border: '#DDD0A8',
  borderNft: '#9A8055',

  // Tipografia
  textMain: '#2A1608', // Terra queimada profunda
  textLight: '#7A5E38',
  textSuperLight: '#756140',
  textOnColor: '#ffffff',
  textMuted: '#7A5E38', // 5.2:1 on parchment
  textDark: '#180C04',
  textNftLight: '#9A7A50',
  textSiderPrimary: '#FF6B1A', // Fogo — destaque no sider
  textSiderSecondary: '#F4DDB0', // Areia pálida
  subText: 'rgba(42, 22, 8, 0.65)',

  // Sombras
  shadow: 'rgba(60, 30, 5, 0.12)',
  boxShadow: '0 2px 8px 0 rgba(60, 30, 5, 0.10)',
  boxShadowHover: '0 4px 16px 0 rgba(200, 90, 8, 0.28)',
  boxShadowNft: '0px 16px 24px rgba(60, 30, 5, 0.10), 0px 2px 6px rgba(0, 0, 0, 0.05), 0px 0px 1px rgba(0, 0, 0, 0.04)',
  boxShadowNftSecondary:
    '0px 10px 20px rgba(60, 30, 5, 0.08), 0px 2px 6px rgba(0, 0, 0, 0.04), 0px 0px 1px rgba(0, 0, 0, 0.04)',

  // Map/dashboard
  dashboardMapBackground: '#EDE0BE',
  dashboardMapCircleColor: '#C0A070',
  dashboardMapControlDisabledBackground: '#D4C4A0',

  // Notificações
  notificationSuccess: '#E4F8EE',
  notificationPrimary: '#FFF3E4',
  notificationWarning: '#FFF2DC',
  notificationError: '#FFE8E8',

  // Layout
  heading: '#3A1804', // Sienna queimado — headings dramáticos
  borderBase: '#D8C8A4',
  disable: 'rgba(0, 0, 0, 0.46)',
  disabledBg: '#D4C4A0',
  layoutBodyBg: '#F8EDD8',
  layoutHeaderBg: 'transparent',

  // Sider: noite do deserto a dunas de areia ao amanhecer de Algol
  layoutSiderBg: 'linear-gradient(228deg, #1A0804 -20%, #3C1A08 45%, #6A300A 110%)',

  // Inputs/itens
  inputPlaceholder: '#7A5E38',
  itemHoverBg: '#EEE0C0',
  backgroundColorBase: '#EDE0BE',
  avatarBg: '#C8B080',

  // Ícones/breadcrumb
  alertTextColor: '#ffffff',
  breadcrumb: 'rgba(42, 22, 8, 0.65)',
  icon: '#9A7A50',
  iconHover: 'rgba(42, 22, 8, 0.80)',

  // Black ink on parchment
  ink: {
    faint: 'rgba(0, 0, 0, 0.03)',
    soft: 'rgba(0, 0, 0, 0.06)',
    line: 'rgba(0, 0, 0, 0.10)',
    muted: 'rgba(0, 0, 0, 0.22)',
    subtle: 'rgba(0, 0, 0, 0.50)',
    text: 'rgba(0, 0, 0, 0.75)',
    strong: 'rgba(0, 0, 0, 0.87)',
  },
  domainTintSoft: '13%',
  domainTintStrong: '21%',
  shadowElevated: 'rgba(0, 0, 0, 0.24)',
  siderInk: {
    faint: 'rgba(255, 255, 255, 0.04)',
    soft: 'rgba(255, 255, 255, 0.08)',
    line: 'rgba(255, 255, 255, 0.08)',
    strong: '#ffffff',
    shadow: 'rgba(0, 0, 0, 0.24)',
  },

  ...chartColors,
};
