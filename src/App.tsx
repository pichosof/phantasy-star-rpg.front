import React from 'react';
import { App as AntdApp, ConfigProvider, Modal, message, notification, theme as antTheme } from 'antd';
import GlobalStyle from './styles/GlobalStyle';
import 'typeface-montserrat';
import 'typeface-lato';
import { AppRouter } from './components/router/AppRouter';
import { useAutoNightMode } from './hooks/useAutoNightMode';
import { usePWA } from './hooks/usePWA';
import { useThemeWatcher } from './hooks/useThemeWatcher';
import { useAppSelector } from './hooks/reduxHooks';
import { themeObject } from './styles/themes/themeVariables';

const AntdFeedbackBridge: React.FC = () => {
  const { message: appMessage, notification: appNotification, modal } = AntdApp.useApp();

  React.useLayoutEffect(() => {
    Object.assign(message, {
      open: appMessage.open,
      success: appMessage.success,
      info: appMessage.info,
      warning: appMessage.warning,
      error: appMessage.error,
      loading: appMessage.loading,
      destroy: appMessage.destroy,
    });

    Object.assign(notification, {
      open: appNotification.open,
      success: appNotification.success,
      info: appNotification.info,
      warning: appNotification.warning,
      error: appNotification.error,
      destroy: appNotification.destroy,
    });

    Object.assign(Modal, {
      confirm: modal.confirm,
      info: modal.info,
      success: modal.success,
      error: modal.error,
      warning: modal.warning,
      warn: modal.warning,
    });
  }, [appMessage, appNotification, modal]);

  return null;
};

const App: React.FC = () => {
  const theme = useAppSelector((state) => state.theme.theme);
  const colors = themeObject[theme];

  usePWA();
  useAutoNightMode();
  useThemeWatcher();

  const antdTheme = React.useMemo(
    () => ({
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
    }),
    [colors, theme],
  );

  return (
    <>
      <meta name="theme-color" content={colors.primary} />
      <GlobalStyle />
      <ConfigProvider theme={antdTheme}>
        <AntdApp style={{ minHeight: '100%' }}>
          <AntdFeedbackBridge />
          <AppRouter />
        </AntdApp>
      </ConfigProvider>
    </>
  );
};

export default App;
