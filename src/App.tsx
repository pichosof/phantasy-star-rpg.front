import React from 'react';
import { ConfigProvider, theme as antTheme } from 'antd';
import GlobalStyle from './styles/GlobalStyle';
import 'typeface-montserrat';
import 'typeface-lato';
import { AppRouter } from './components/router/AppRouter';
import { useAutoNightMode } from './hooks/useAutoNightMode';
import { usePWA } from './hooks/usePWA';
import { useThemeWatcher } from './hooks/useThemeWatcher';
import { useAppSelector } from './hooks/reduxHooks';
import { themeObject } from './styles/themes/themeVariables';

const App: React.FC = () => {
  const theme = useAppSelector((state) => state.theme.theme);
  const colors = themeObject[theme];

  usePWA();
  useAutoNightMode();
  useThemeWatcher();

  const antdTheme = {
    algorithm: theme === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    token: {
      colorPrimary: colors.primary,
      colorInfo: colors.primary,
      colorSuccess: colors.success,
      colorWarning: colors.warning,
      colorError: colors.error,
      colorTextBase: colors.textMain,
      colorBgBase: colors.background,
      colorBorder: colors.border,
      borderRadius: 7,
      fontFamily: "'Montserrat', sans-serif",
      fontSize: 16,
      controlHeight: 50,
      controlHeightSM: 32,
      controlHeightLG: 64,
    },
  };

  return (
    <>
      <meta name="theme-color" content={colors.primary} />
      <GlobalStyle />
      <ConfigProvider theme={antdTheme}>
        <AppRouter />
      </ConfigProvider>
    </>
  );
};

export default App;
