import { shadeColor } from '@app/utils/utils';
import { graphic } from 'echarts';
import { BASE_COLORS } from '../constants';
import { ITheme } from '../types';

/** Dezolis Dark — aurora / gelo / noite polar */
const chartColors = {
  chartTooltipLabel: '#AAB6D6',
  chartColor1: '#00D7E9', // Arctic Cyan (primária)
  chartColor1Tint: '#5BE9F0',
  chartColor2: '#8E7CFF', // Aurora Violet
  chartColor2Tint: '#C3B8FF',
  chartColor3: '#6DE2C3', // Frost Mint
  chartColor3Tint: '#A9F5E2',
  chartColor4: '#7AE0FF', // Ice Blue
  chartColor4Tint: '#BEEFFF',
  chartColor5: '#FF4D6D', // Cold Red (erro/acento)
  chartColor5Tint: '#FF9BB0',

  chartPrimaryGradient: new graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: 'rgba(0, 215, 233, 0.40)' },
    { offset: 1, color: 'rgba(0, 215, 233, 0.00)' },
  ]),
  chartSecondaryGradient: new graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: 'rgba(142, 124, 255, 0.35)' },
    { offset: 1, color: 'rgba(142, 124, 255, 0.00)' },
  ]),
  chartSecondaryGradientSpecular: new graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: 'rgba(255, 255, 255, 0.00)' },
    { offset: 1, color: 'rgba(255, 77, 109, 0.45)' },
  ]),
};

export const darkColorsTheme: ITheme = {
  primary: '#00D7E9',
  primary1: '#8E7CFF', // acento secundário (links/realces)
  primaryGradient: 'linear-gradient(211.49deg, #00D7E9 15.89%, #8E7CFF 48.97%)',
  light: '#5A6B86',
  secondary: '#6DE2C3',
  error: '#FF4D6D',
  warning: '#FFC857',
  success: '#35E38A',

  // Fundos
  background: '#0B1020',
  secondaryBackground: '#0F1A33',
  secondaryBackgroundSelected: shadeColor('#0F1A33', -5),
  additionalBackground: '#0A1326',
  collapseBackground: '#0A1326',
  timelineBackground: '#0E162C',
  siderBackground: '#0A0F1C',

  // UI misc
  spinnerBase: '#00D7E9',
  scroll: '#3C4B6B',
  border: '#2A3758',
  borderNft: '#5A6B86',

  // Tipografia
  textMain: '#E6F1FF',
  textLight: '#A2A9C6',
  textSuperLight: '#6E7797',
  textSecondary: BASE_COLORS.white,
  textDark: '#C9DEF7',
  textNftLight: '#9BA6C7',
  textSiderPrimary: '#6DE2C3',
  textSiderSecondary: '#9BA6C7',
  subText: '#A2A9C6',

  // Sombras
  shadow: 'rgba(0, 0, 0, 0.55)',
  boxShadow: 'none',
  boxShadowHover: '0 0 0 1px rgba(110, 243, 255, 0.08)',
  boxShadowNft: '0px 16px 24px rgba(0, 0, 0, 0.30), 0px 2px 6px rgba(0, 0, 0, 0.20), 0px 0px 1px rgba(0, 0, 0, 0.15)',
  boxShadowNftSecondary:
    '0px 10px 20px rgba(0, 0, 0, 0.25), 0px 2px 6px rgba(0, 0, 0, 0.18), 0px 0px 1px rgba(0, 0, 0, 0.12)',

  // Map/dashboard
  dashboardMapBackground: '#0F1830',
  dashboardMapCircleColor: '#7EA6FF',
  dashboardMapControlDisabledBackground: '#3E4560',

  // Notificações (tinted escuro p/ dark)
  notificationSuccess: '#113A2E',
  notificationPrimary: '#0E2638',
  notificationWarning: '#3A2D12',
  notificationError: '#3A1118',

  // Layout
  heading: BASE_COLORS.white,
  borderBase: '#283454',
  disable: '#5A6B86',
  disabledBg: '#121A2F',
  layoutBodyBg: '#0B1020',
  layoutHeaderBg: '#0B1020',

  // Sider com aurora de Dezolis
  layoutSiderBg: 'linear-gradient(228deg, #0B1020 -20%, #0E1B33 55%, #174C63 120%)',

  // Inputs/itens
  inputPlaceholder: 'rgba(230, 241, 255, 0.55)',
  itemHoverBg: '#151D33',
  backgroundColorBase: '#0F1A33',
  avatarBg: '#202B44',

  // Ícones/breadcrumb/alertas
  alertTextColor: '#E6F1FF',
  breadcrumb: '#A2A9C6',
  icon: '#9BA6C7',
  iconHover: '#EAF6FF',

  ...chartColors,
};

export const antDarkColorsTheme = {
  // Mantém contraste no dark: fundo escuro com borda saturada
  successBg: '#113A2E',
  successBorder: '#1F6F52',
};
