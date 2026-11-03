import React from 'react';
import { createRoot } from 'react-dom/client';
import './auth/cognito';
import App from './App';
import './styles.css';
import './app-shell.css';
import './prototype/scalaris-prototype.css';
import './prototype/theme.css';
import './prototype/remote.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
