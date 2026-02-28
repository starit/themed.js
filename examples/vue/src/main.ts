import { createApp } from 'vue';
import { themedPlugin } from '@themed.js/vue';
import App from './App.vue';
import './styles.css';

// Vite loads env vars prefixed with VITE_ from .env; access via import.meta.env
const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;

const app = createApp(App);

app.use(themedPlugin, {
  defaultTheme: 'light',
  ...(apiKey && {
    ai: {
      provider: 'deepseek',
      apiKey,
      model: 'deepseek-chat',
      timeout: 60000,
    },
  }),
});

app.mount('#app');
