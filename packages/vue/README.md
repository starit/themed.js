# @themed.js/vue

Vue 3 bindings for Themed.js - composables and plugin for theme management.

## Installation

```bash
npm install @themed.js/core @themed.js/vue
```

## Usage

### Setup Plugin

```typescript
import { createApp } from 'vue';
import { themedPlugin } from '@themed.js/vue';

const app = createApp(App);

app.use(themedPlugin, {
  defaultTheme: 'light',
  ai: { provider: 'openai', apiKey: 'sk-xxx' },
});

app.mount('#app');
```

### useTheme Composable

```vue
<script setup>
import { useTheme } from '@themed.js/vue';

const { theme, themes, apply } = useTheme();
</script>

<template>
  <p>Current: {{ theme?.name }}</p>
  <button
    v-for="t in themes"
    :key="t.id"
    @click="apply(t.id)"
  >
    {{ t.name }}
  </button>
</template>
```

### useAITheme Composable

```vue
<script setup>
import { ref } from 'vue';
import { useAITheme } from '@themed.js/vue';

const { generate, isGenerating, error } = useAITheme();
const prompt = ref('');

const handleGenerate = async () => {
  await generate(prompt.value);
};
</script>

<template>
  <input v-model="prompt" />
  <button @click="handleGenerate" :disabled="isGenerating">
    {{ isGenerating ? 'Generating...' : 'Generate' }}
  </button>
</template>
```

## API

### Plugin Options

- `defaultTheme` - Default theme ID
- `themes` - Additional themes
- `ai` - AI configuration
- `storage` - Storage configuration

### useTheme Returns

- `theme` - Current theme (computed)
- `themes` - All themes (computed)
- `apply(id)` - Apply theme
- `register(theme)` - Register theme

### useAITheme Returns

- `generate(prompt)` - Generate theme
- `adjust(instruction)` - Adjust theme
- `isGenerating` - Loading state (computed)
- `error` - Error state (computed)

## License

MIT
