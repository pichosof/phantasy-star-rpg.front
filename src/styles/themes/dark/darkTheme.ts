import { shadeColor } from '@app/utils/utils';
import { graphic } from 'echarts';
import { BASE_COLORS } from '../constants';
import { ITheme } from '../types';

/** Dezolis Dark — abismo glacial / noite polar / aurora boreal */
const chartColors = {
  chartTooltipLabel: '#7A94B4',
  chartColor1: '#00C8E8', // Arctic Cyan — gelo bioluminescente
  chartColor1Tint: '#66E4F4',
  chartColor2: '#7722DD', // Crystal Void — violeta profundo
  chartColor2Tint: '#AA77FF',
  chartColor3: '#22EFC8', // Frost Mint — cristal teal
  chartColor3Tint: '#77F8E0',
  chartColor4: '#5599FF', // Icy Sky — horizonte ártico
  chartColor4Tint: '#99BBFF',
  chartColor5: '#FF2244', // Danger Crimson — sinal de perigo
  chartColor5Tint: '#FF7799',

  chartPrimaryGradient: new graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: 'rgba(0, 200, 232, 0.45)' },
    { offset: 1, color: 'rgba(0, 200, 232, 0.00)' },
  ]),
  chartSecondaryGradient: new graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: 'rgba(119, 34, 221, 0.40)' },
    { offset: 1, color: 'rgba(119, 34, 221, 0.00)' },
  ]),
  chartSecondaryGradientSpecular: new graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: 'rgba(255, 255, 255, 0.00)' },
    { offset: 1, color: 'rgba(255, 34, 68, 0.45)' },
  ]),
};

export const darkColorsTheme: ITheme = {
  primary: '#00C8E8', // Arctic Cyan — gelo vivo
  primary1: '#5E1ECC', // Crystal Violet — fundo de hover/badge
  primaryGradient: 'linear-gradient(211.49deg, #00C8E8 15.89%, #7722DD 48.97%)',
  light: '#3A5070',
  secondary: '#22EFC8', // Frost Mint — teal cristalino

  // Estados
  error: '#FF2244',
  warning: '#FFA825',
  success: '#00E898',

  // Fundos — void ártico absoluto
  background: '#040A16',
  secondaryBackground: '#07102A',
  secondaryBackgroundSelected: shadeColor('#07102A', -5),
  additionalBackground: '#060D20',
  collapseBackground: '#040A16',
  timelineBackground: '#070E1E',
  siderBackground: '#040A16',

  // UI misc
  spinnerBase: '#00C8E8',
  scroll: '#203050',
  border: '#142038',
  borderNft: '#2A3E60',

  // Tipografia
  textMain: '#C8E4FF', // Branco gélido azulado
  textLight: '#6A88A8',
  textSuperLight: '#3A5070',
  textSecondary: BASE_COLORS.white,
  textDark: '#AACCEE',
  textNftLight: '#567090',
  textSiderPrimary: '#00C8E8', // Ice cyan no menu
  textSiderSecondary: '#6A88A8',
  subText: '#6A88A8',

  // Sombras
  shadow: 'rgba(0, 0, 0, 0.70)',
  boxShadow: 'none',
  boxShadowHover: '0 0 0 1px rgba(0, 200, 232, 0.15)',
  boxShadowNft: '0px 16px 24px rgba(0, 0, 0, 0.50), 0px 2px 6px rgba(0, 0, 0, 0.30), 0px 0px 1px rgba(0, 0, 0, 0.20)',
  boxShadowNftSecondary:
    '0px 10px 20px rgba(0, 0, 0, 0.40), 0px 2px 6px rgba(0, 0, 0, 0.25), 0px 0px 1px rgba(0, 0, 0, 0.18)',

  // Map/dashboard
  dashboardMapBackground: '#07102A',
  dashboardMapCircleColor: '#2A4472',
  dashboardMapControlDisabledBackground: '#142038',

  // Notificações
  notificationSuccess: '#002818',
  notificationPrimary: '#001A2E',
  notificationWarning: '#251800',
  notificationError: '#280414',

  // Layout
  heading: BASE_COLORS.white,
  borderBase: '#142038',
  disable: '#2A3E60',
  disabledBg: '#07102A',
  layoutBodyBg: '#040A16',
  layoutHeaderBg: '#040A16',

  // Sider: aurora ártica sobre o vazio — assinatura Dezolis
  layoutSiderBg: 'linear-gradient(228deg, #040A16 -20%, #060F24 40%, #091830 80%, #0C2040 120%)',

  // Inputs/itens
  inputPlaceholder: 'rgba(200, 228, 255, 0.40)',
  itemHoverBg: '#0A1530',
  backgroundColorBase: '#07102A',
  avatarBg: '#102240',

  // Ícones/breadcrumb/alertas
  alertTextColor: '#C8E4FF',
  breadcrumb: '#6A88A8',
  icon: '#4A6888',
  iconHover: '#C8E4FF',

  ...chartColors,
};

export const antDarkColorsTheme = {
  successBg: '#002818',
  successBorder: '#005535',
};
