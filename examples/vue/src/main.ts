import { createApp } from 'vue';
import { themedPlugin } from '@themed.js/vue';
import App from './App.vue';
import './styles.css';

const app = createApp(App);

app.use(themedPlugin, {
  defaultTheme: 'light',
  // Uncomment and add your API key to enable AI generation
  // ai: {
  //   provider: 'openai',
  //   apiKey: 'sk-xxx',
  // },
});

app.mount('#app');
