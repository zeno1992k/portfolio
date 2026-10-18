import React from 'react';
import ReactDOM from 'react-dom/client';
import { CacheProvider, createCache } from '@montage-ui/core';
import '@montage-ui/core/global.css';
import App from './App';
import { AuthProvider } from './lib/AuthProvider';
import { LearningProvider } from './lib/LearningProvider';
import { AppThemeProvider } from './lib/AppThemeProvider';
import './fonts.css';
import './styles.css';

const montageCache = createCache({ key: 'montage', prepend: true });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CacheProvider value={montageCache}>
      <AppThemeProvider>
        <AuthProvider><LearningProvider><App /></LearningProvider></AuthProvider>
      </AppThemeProvider>
    </CacheProvider>
  </React.StrictMode>,
);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      // The app remains usable online if offline registration is unavailable.
    });
  });
}
