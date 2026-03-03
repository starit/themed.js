# @themed.js/vue

Vue 3 bindings for Themed.js — composables and plugin for theme management.

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
  <p v-if="error">Error: {{ error.message }}</p>
</template>
```

### Custom Structured Data

Attach arbitrary JSON data to any theme, or co-generate it with AI.

#### Attach custom data to the active theme

```vue
<script setup>
import { useTheme } from '@themed.js/vue';

const { theme, updateThemeCustom, apply } = useTheme();

function handleAttach(customData) {
  updateThemeCustom(theme.value.id, customData);
  apply(theme.value.id); // triggers re-render with updated theme
}
</script>

<template>
  <pre v-if="theme?.custom">{{ JSON.stringify(theme.custom, null, 2) }}</pre>
  <button @click="handleAttach({ brandName: 'Acme', tone: 'professional' })">
    Attach custom data
  </button>
</template>
```

#### Co-generate custom data with AI

Pass `customSchema` to describe what custom data you want alongside the theme tokens. It can be a natural-language description or a JSON skeleton with placeholder values.

```vue
<script setup>
import { ref } from 'vue';
import { useAITheme } from '@themed.js/vue';

const { generate, isGenerating } = useAITheme();
const customSchema = ref('');

const handleGenerate = () => {
  generate('A corporate blue theme', {
    customSchema: customSchema.value || undefined,
    // e.g. "Brand guidelines with name, tone, and target audience"
    // or   '{ "brandName": "...", "tone": "...", "audience": "..." }'
  });
};
</script>

<template>
  <textarea
    v-model="customSchema"
    placeholder='Describe custom data, e.g. "brand guide with name and tone"'
  />
  <button @click="handleGenerate" :disabled="isGenerating">Generate</button>
</template>
```

The generated `theme.custom` will contain the AI-populated data.

## API

### Plugin Options

| Option | Type | Description |
|--------|------|-------------|
| `defaultTheme` | `string` | Default theme ID to apply on mount |
| `themes` | `Theme[]` | Additional themes to register |
| `ai` | `AIOptions` | AI configuration (provider, apiKey, model) |
| `storage` | `StorageOptions` | Storage configuration (`localStorage` \| `indexedDB` \| `none`) |
| `css` | `CSSOptions` | CSS variable options (e.g. custom prefix) |
| `debug` | `boolean` | Enable event debug logging |

### useTheme Returns

| Field | Type | Description |
|-------|------|-------------|
| `theme` | `ComputedRef<Theme \| null>` | Currently active theme |
| `themes` | `ComputedRef<Theme[]>` | All registered themes |
| `apply` | `(themeId: string) => Promise<void>` | Apply a theme by ID |
| `register` | `(theme: Theme) => void` | Register a new theme |
| `updateThemeCustom` | `(themeId: string, custom: Record<string, unknown>) => void` | Set custom data on a theme. Call `apply(themeId)` afterwards to propagate the change. |

### useAITheme Returns

| Field | Type | Description |
|-------|------|-------------|
| `generate` | `(prompt: string, options?: GenerateOptions) => Promise<Theme>` | Generate a theme from a text prompt |
| `adjust` | `(instruction: string, options?: GenerateOptions) => Promise<Theme>` | Adjust the active theme based on an instruction |
| `configureAI` | `(options: AIOptions) => void` | Configure the AI provider at runtime |
| `isGenerating` | `ComputedRef<boolean>` | Whether AI generation is in progress |
| `error` | `ComputedRef<Error \| null>` | Last error from AI generation |
| `isConfigured` | `ComputedRef<boolean>` | Whether an AI provider is configured |
| `modelInfo` | `ComputedRef<{ provider: string; model?: string } \| null>` | Current provider and model for display |

### GenerateOptions

```typescript
interface GenerateOptions {
  autoApply?: boolean;    // Auto-apply after generation (default: true)
  autoSave?: boolean;     // Auto-save to storage (default: true)
  baseTheme?: Theme;      // Adjust this theme instead of generating from scratch
  customSchema?: string;  // Natural language or JSON skeleton for custom data to co-generate
}
```

## License

MIT
