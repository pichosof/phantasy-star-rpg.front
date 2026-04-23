import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import 'antd/dist/reset.css';
import 'antd-mobile/es/global';
import App from './App';
import { store } from '@app/store/store';
import '@app/config/config';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
