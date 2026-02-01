# Themed.js

A powerful, framework-agnostic theme management library with AI-powered theme generation.

## Features

- **Framework Agnostic** - Works with vanilla JS, React, Vue, or any framework
- **AI-Powered Theme Generation** - Generate beautiful themes from text descriptions using OpenAI, Claude, or custom AI providers
- **CSS Variables** - Non-invasive styling using CSS Custom Properties
- **Built-in Themes** - 7 beautiful pre-designed themes out of the box
- **Type-Safe** - Full TypeScript support with comprehensive type definitions
- **Persistent** - Built-in localStorage and IndexedDB support for theme persistence
- **WCAG Compliance** - Utilities for checking color contrast and accessibility

## Packages

| Package | Description |
|---------|-------------|
| `@themed.js/core` | Core library with theme management, AI integration, and storage |
| `@themed.js/react` | React bindings with hooks and context provider |
| `@themed.js/vue` | Vue 3 bindings with composables and plugin |

## Quick Start

### Installation

```bash
# Core only (vanilla JS)
npm install @themed.js/core

# With React
npm install @themed.js/core @themed.js/react

# With Vue
npm install @themed.js/core @themed.js/vue
```

### Vanilla JavaScript

```typescript
import { createThemed } from '@themed.js/core';

const themed = createThemed({
  defaultTheme: 'light',
  ai: {
    provider: 'openai',
    apiKey: 'sk-xxx',
  },
});

await themed.init();

// Switch themes
themed.apply('dark');

// Generate AI theme
const theme = await themed.generate('A warm autumn sunset theme');
```

### React

```tsx
import { ThemeProvider, useTheme, useAITheme } from '@themed.js/react';

function App() {
  return (
    <ThemeProvider
      defaultTheme="light"
      ai={{ provider: 'openai', apiKey: 'sk-xxx' }}
    >
      <MyApp />
    </ThemeProvider>
  );
}

function ThemeSwitcher() {
  const { themes, apply } = useTheme();
  const { generate, isGenerating } = useAITheme();

  return (
    <div>
      {themes.map(t => (
        <button key={t.id} onClick={() => apply(t.id)}>
          {t.name}
        </button>
      ))}
      <button onClick={() => generate('Ocean sunset')}>
        AI Generate
      </button>
    </div>
  );
}
```

### Vue 3

```vue
<script setup>
import { useTheme, useAITheme } from '@themed.js/vue';

const { themes, apply } = useTheme();
const { generate, isGenerating } = useAITheme();
</script>

<template>
  <button
    v-for="t in themes"
    :key="t.id"
    @click="apply(t.id)"
  >
    {{ t.name }}
  </button>
</template>
```

```typescript
// main.ts
import { createApp } from 'vue';
import { themedPlugin } from '@themed.js/vue';

const app = createApp(App);
app.use(themedPlugin, {
  defaultTheme: 'light',
  ai: { provider: 'openai', apiKey: 'sk-xxx' },
});
```

## Using CSS Variables

Themed.js injects CSS variables that you can use in your stylesheets:

```css
.button {
  background-color: var(--themed-color-primary);
  color: var(--themed-color-text-inverse);
  font-family: var(--themed-font-family-sans);
  font-size: var(--themed-font-size-base);
}

.card {
  background-color: var(--themed-color-surface);
  border: 1px solid var(--themed-color-border);
}
```

## Built-in Themes

- **Light** - Clean, modern light theme
- **Dark** - Comfortable dark theme
- **Ocean** - Calm blue tones
- **Forest** - Natural green tones
- **Sunset** - Warm gradient colors
- **Midnight** - Deep dark with purple accents
- **Rose** - Soft pink tones

## AI Providers

Themed.js supports multiple AI providers:

```typescript
// OpenAI
ai: {
  provider: 'openai',
  apiKey: 'sk-xxx',
  model: 'gpt-4o-mini', // optional
}

// Claude
ai: {
  provider: 'claude',
  apiKey: 'sk-xxx',
  model: 'claude-3-5-sonnet-20241022', // optional
}

// Custom endpoint
ai: {
  provider: 'custom',
  endpoint: 'https://your-api.com/generate',
  apiKey: 'xxx', // optional
}
```

## API Reference

### ThemeManager

```typescript
const themed = createThemed(options);

// Initialize
await themed.init();

// Theme management
themed.register(theme);      // Register a theme
themed.apply('dark');        // Apply a theme
themed.getActive();          // Get current theme
themed.getAll();             // Get all themes

// AI generation
const theme = await themed.generate('Description');

// Events
themed.on('theme:changed', ({ theme }) => {});
```

### Design Tokens

```typescript
interface ThemeTokens {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    error: string;
    warning: string;
    success: string;
    info: string;
    textPrimary: string;
    textSecondary: string;
    textDisabled: string;
    textInverse: string;
    border: string;
    borderLight: string;
    borderDark: string;
  };
  typography: {
    fontFamily: { sans, serif, mono };
    fontSize: { xs, sm, base, lg, xl, 2xl, 3xl };
    fontWeight: { light, normal, medium, semibold, bold };
    lineHeight: { tight, normal, relaxed };
  };
}
```

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Start example apps
cd examples/vanilla && pnpm dev  # Port 3000
cd examples/react && pnpm dev    # Port 3001
cd examples/vue && pnpm dev      # Port 3002
```

## License

MIT
