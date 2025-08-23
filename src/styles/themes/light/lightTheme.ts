import { shadeColor } from '@app/utils/utils';
import { graphic } from 'echarts';
import { BASE_COLORS } from '../constants';
import { ITheme } from '../types';

/** Paleta PSIV */
const chartColors = {
  chartTooltipLabel: '#6C5A5A', // pedra/areia de Motávia
  chartColor1: '#00C2D7',       // Elsydeon Teal (primária)
  chartColor1Tint: '#5BE9F0',
  chartColor2: '#6B2CF5',       // Zio Violet
  chartColor2Tint: '#B79CFA',
  chartColor3: '#E6B744',       // Algol Gold
  chartColor3Tint: '#FFD482',
  chartColor4: '#FF4D8A',       // Rika Magenta
  chartColor4Tint: '#FFA6C1',
  chartColor5: '#D7263D',       // Space Red (erro/alerta forte)
  chartColor5Tint: '#FFB3C1',

  chartPrimaryGradient: new graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: 'rgba(10, 213, 225, 0.50)' },  // teal neon
    { offset: 1, color: 'rgba(255, 255, 255, 0.00)' },
  ]),
  chartSecondaryGradient: new graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: 'rgba(107, 44, 245, 0.45)' },  // roxo
    { offset: 1, color: 'rgba(255, 255, 255, 0.00)' },
  ]),
  chartSecondaryGradientSpecular: new graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: 'rgba(255, 255, 255, 0.00)' },
    { offset: 1, color: 'rgba(255, 77, 138, 0.45)' }, // magenta
  ]),
};

export const lightColorsTheme: ITheme = {
  // Núcleo de identidade
  primary: '#00C2D7', // Elsydeon Teal
  primary1: '#F1ECE4', // base clara “pergaminho”
  primaryGradient: 'linear-gradient(211.49deg, #0AD5E1 15.89%, #6B2CF5 48.97%)',
  light: '#D6CFBE',   // areia de Motávia
  secondary: '#E6B744', // Algol Gold

  // Estados
  error: '#E0446D',
  warning: '#FFC857',
  success: '#2ECC71',

  // Fundos
  background: '#FAF7EE',
  secondaryBackground: '#F7F1E3',
  secondaryBackgroundSelected: shadeColor('#F7F1E3', -5),
  additionalBackground: '#FFFFFF',
  collapseBackground: '#0D1328',   // navy/space
  timelineBackground: '#F9F1E0',
  siderBackground: '#FFFFFF',

  // UI misc
  spinnerBase: '#E6B744',
  scroll: '#CBBF9E',
  border: '#E2D9C8',
  borderNft: '#8E8AA8',

  // Tipografia
  textMain: '#2A2A2A',
  textLight: '#7F7A70',
  textSuperLight: '#B2AA98',
  textSecondary: BASE_COLORS.white,
  textDark: '#1C1A17',
  textNftLight: '#8E8AA8',
  textSiderPrimary: '#E6B744',
  textSiderSecondary: '#FFFFFF',
  subText: 'rgba(0, 0, 0, 0.45)',

  // Sombras
  shadow: 'rgba(0, 0, 0, 0.07)',
  boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.07)',
  boxShadowHover: '0 4px 16px 0 rgba(0, 0, 0, 0.2)',
  boxShadowNft:
    '0px 16px 24px rgba(0, 0, 0, 0.06), 0px 2px 6px rgba(0, 0, 0, 0.04), 0px 0px 1px rgba(0, 0, 0, 0.04)',
  boxShadowNftSecondary:
    '0px 10px 20px rgba(0, 0, 0, 0.04), 0px 2px 6px rgba(0, 0, 0, 0.04), 0px 0px 1px rgba(0, 0, 0, 0.04)',

  // Map/dashboard
  dashboardMapBackground: '#F1E9D2',
  dashboardMapCircleColor: '#CBBF9E',
  dashboardMapControlDisabledBackground: '#D6CFBE',

  // Notificações
  notificationSuccess: '#EAFBF3',
  notificationPrimary: '#EAF7FF',
  notificationWarning: '#FFF6E5',
  notificationError: '#FFE8EE',

  // Layout
  heading: '#261447', // roxo profundo
  borderBase: '#D9CFBA',
  disable: 'rgba(0, 0, 0, 0.25)',
  disabledBg: '#D6CFBE',
  layoutBodyBg: '#FAF7EE',
  layoutHeaderBg: 'transparent',
layoutSiderBg: 'linear-gradient(228deg, #2F2819 -20%, #7A6234 60%, #00B7C8 150%)',

  // Inputs/itens
  inputPlaceholder: '#5C5C5C',
  itemHoverBg: '#F1EDE2',
  backgroundColorBase: '#F3EEE2',
  avatarBg: '#C9BBA4',

  // Ícones/breadcrumb
  alertTextColor: BASE_COLORS.white,
  breadcrumb: 'rgba(0, 0, 0, 0.45)',
  icon: '#8B7DA8',
  iconHover: 'rgba(0, 0, 0, 0.75)',

  ...chartColors,
};
