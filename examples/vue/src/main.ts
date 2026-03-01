import { createApp } from 'vue';
import { themedPlugin } from '@themed.js/vue';
import App from './App.vue';
import './styles.css';

// No API key in build - users enter their own key in the demo UI (safe for GitHub Pages)
const app = createApp(App);

app.use(themedPlugin, {
  defaultTheme: 'light',
});

app.mount('#app');
