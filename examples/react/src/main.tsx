import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@themed.js/react';
import App from './App';
import './styles.css';

// Vite loads env vars prefixed with VITE_ from .env; access via import.meta.env
const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider
      defaultTheme="light"
      {...(apiKey && {
        ai: {
          provider: 'openai',
          apiKey,
          model: 'gpt-4o-mini',
          timeout: 60000,
        },
      })}
    >
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
