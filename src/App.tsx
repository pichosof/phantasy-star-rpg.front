import React from 'react';
import { App as AntdApp, ConfigProvider, Modal, message, notification } from 'antd';
import GlobalStyle from './styles/GlobalStyle';
import 'typeface-montserrat';
import 'typeface-lato';
import { AppRouter } from './components/router/AppRouter';
import { useActiveTheme } from './hooks/useActiveTheme';
import { usePWA } from './hooks/usePWA';
import { useThemeWatcher } from './hooks/useThemeWatcher';
import { useThemeMode } from './hooks/useThemeMode';

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
  // Each world theme owns its antd config (algorithm + tokens); see styles/themes/<world>/index.ts
  const activeTheme = useActiveTheme();

  usePWA();
  useThemeMode();
  useThemeWatcher();

  return (
    <>
      <meta name="theme-color" content={activeTheme.tokens.primary} />
      <GlobalStyle />
      <ConfigProvider theme={activeTheme.antd}>
        <AntdApp style={{ minHeight: '100%' }}>
          <AntdFeedbackBridge />
          <AppRouter />
        </AntdApp>
      </ConfigProvider>
    </>
  );
};

export default App;
