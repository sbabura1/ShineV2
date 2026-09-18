import React from 'react';
import { createRoot } from 'react-dom/client';
import './auth/cognito';
import App from './App';
import './styles.css';
import './mock-theme.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
