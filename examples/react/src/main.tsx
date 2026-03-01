import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@themed.js/react';
import App from './App';
import './styles.css';

// No API key in build - users enter their own key in the demo UI (safe for GitHub Pages)
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light">
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
