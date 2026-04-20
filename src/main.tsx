import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// 🛡️ BYPASS TOTAL: Esto anula cualquier error de i18next
(window as any).useTranslation = () => ({
  t: (key: string) => key,
  i18n: { changeLanguage: () => {}, language: 'es' }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
