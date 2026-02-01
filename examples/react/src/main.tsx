import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@themed.js/react';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider
      defaultTheme="light"
      // Uncomment and add your API key to enable AI generation
      // ai={{
      //   provider: 'openai',
      //   apiKey: 'sk-xxx',
      // }}
    >
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
