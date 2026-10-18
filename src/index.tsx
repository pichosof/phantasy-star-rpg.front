import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import 'antd/dist/reset.css';
import 'antd-mobile/es/global';
import App from './App';
import { store } from '@app/store/store';
import { applyTheme } from '@app/store/slices/themeSlice';
import { isNightAt } from '@app/hooks/useThemeMode';
import { bootstrapDemoMocks } from '@app/api/http.api';
import '@app/config/config';

// Apply the theme before the first render: no color variables live in :root, so the
// page must never paint without a data-theme.
{
  const { theme, mode, dayTheme, nightTheme } = store.getState().theme;
  const { nightTime } = store.getState().nightMode;
  const now = new Date();
  const t = ((now.getHours() * 60 + now.getMinutes()) * 60 + now.getSeconds()) * 1000;
  const initial =
    mode === 'system' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? nightTheme
        : dayTheme
      : mode === 'schedule'
        ? isNightAt(t, nightTime)
          ? nightTheme
          : dayTheme
        : theme;
  if (initial !== theme) store.dispatch(applyTheme(initial));
  document.documentElement.setAttribute('data-theme', initial);
}

const container = document.getElementById('root');
const root = createRoot(container!);

void bootstrapDemoMocks().finally(() => {
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>,
  );
});
