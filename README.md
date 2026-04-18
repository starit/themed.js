# Themed.js

[![npm version](https://img.shields.io/npm/v/@themed.js/core.svg)](https://www.npmjs.com/package/@themed.js/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A powerful, framework-agnostic theme management library with AI-powered theme generation.

## Features

- **Framework Agnostic** - Works with vanilla JS, React, Vue, or any framework
- **AI-Powered Theme Generation** - Generate beautiful themes from text descriptions using OpenAI, Claude, or custom AI providers
- **Custom Structured Data** - Attach arbitrary JSON data to any theme; AI can generate it alongside tokens
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

// Generate with custom structured data
const themed2 = await themed.generate('A corporate blue theme', {
  customSchema: 'Brand guidelines with name, tone of voice, and target audience',
});
// theme.custom → { "brandName": "...", "tone": "...", "audience": "..." }
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

## Custom Structured Data

Every theme can carry an optional `custom` field — an arbitrary JSON object — that travels with the theme through storage, export/import, and AI generation.

### Attach custom data to an existing theme

```typescript
// Vanilla
themed.updateThemeCustom('my-theme', {
  brandName: 'Acme Corp',
  tone: 'professional',
  audience: 'enterprise',
});
themed.apply('my-theme'); // triggers re-render in reactive frameworks
```

```tsx
// React
const { theme, updateThemeCustom, apply } = useTheme();

updateThemeCustom(theme.id, { brandName: 'Acme', tone: 'friendly' });
apply(theme.id);
```

```vue
<!-- Vue -->
<script setup>
const { theme, updateThemeCustom, apply } = useTheme();

function attach(custom) {
  updateThemeCustom(theme.value.id, custom);
  apply(theme.value.id);
}
</script>
```

### Create a theme with custom data

```typescript
import { createTheme } from '@themed.js/core';

const theme = createTheme({
  id: 'brand',
  name: 'Brand Theme',
  tokens: { /* ... */ },
  custom: {
    brandName: 'Acme Corp',
    primaryUsage: 'Marketing site',
  },
});
```

### Generate custom data with AI

Pass a `customSchema` when generating a theme. It can be a natural-language description or a JSON skeleton with placeholder values:

```typescript
// Natural language
const theme = await themed.generate('A warm startup theme', {
  customSchema: 'Brand guidelines with company name, tagline, tone of voice, and target audience',
});

// JSON skeleton — AI fills in the values to match the theme
const theme2 = await themed.generate('A dark fintech theme', {
  customSchema: '{ "brandName": "...", "tone": "...", "audience": "..." }',
});

console.log(theme.custom);
// { "brandName": "...", "tone": "...", "audience": "...", ... }
```

The `custom` field is included in export/import and persisted to storage automatically.

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
// OpenAI (default: gpt-4o-mini)
ai: {
  provider: 'openai',
  apiKey: 'sk-xxx',
  model: 'gpt-4o-mini', // optional: gpt-4o, gpt-4-turbo, etc.
}

// Claude (default: claude-sonnet-4-6)
ai: {
  provider: 'claude',
  apiKey: 'sk-xxx',
  model: 'claude-sonnet-4-6', // optional: claude-opus-4-6, claude-haiku-4-5
}

// Google Gemini (default: gemini-2.5-flash)
ai: {
  provider: 'gemini',
  apiKey: 'xxx', // from Google AI Studio
  model: 'gemini-2.5-flash', // optional: gemini-2.5-pro, gemini-2.0-flash
}

// Groq - Llama models (default: llama-3.3-70b-versatile)
ai: {
  provider: 'groq',
  apiKey: 'gsk_xxx', // from console.groq.com
  model: 'llama-3.3-70b-versatile',
}

// Moonshot/Kimi (default: kimi-k2-turbo-preview)
ai: {
  provider: 'moonshot',
  apiKey: 'xxx', // from platform.moonshot.ai
  model: 'kimi-k2-turbo-preview',
  baseURL: 'https://api.moonshot.cn/v1', // optional: use .cn for China
}

// DeepSeek (default: deepseek-chat)
ai: {
  provider: 'deepseek',
  apiKey: 'xxx', // from platform.deepseek.com
  model: 'deepseek-chat', // optional: deepseek-reasoner
}

// Custom endpoint
ai: {
  provider: 'custom',
  endpoint: 'https://your-api.com/generate',
  apiKey: 'xxx', // optional
}

// Chrome extension proxy — no API key in the page (see below)
ai: {
  provider: 'extension',
}
```

### Using the Chrome Extension Proxy

The `extension` provider delegates all LLM calls to the **Themed LLM Secure Proxy** Chrome extension via `window.ThemedLLM`. Your API key never appears in page code — it is stored and used only inside the extension.

**Setup:**

1. Install (or load unpacked) the **Themed LLM Secure Proxy** Chrome extension.
2. Open the extension's options page and configure your AI provider, model, and API key.
3. Use `provider: 'extension'` in your app — no `apiKey`, `model`, or `baseURL` needed:

```typescript
import { createThemed } from '@themed.js/core';

const themed = createThemed({
  defaultTheme: 'zinc',
  ai: {
    provider: 'extension',
  },
});

await themed.init();
const theme = await themed.generate('A warm sunset theme');
// All LLM traffic goes through the extension — no key in this page.
```

If the extension is not installed or not active when `generate()` is called, a clear error is thrown:

```
Themed LLM Proxy extension is not detected.
Install it or load it unpacked, then refresh the page.
```

## API Reference

### ThemeManager

```typescript
const themed = createThemed(options);

// Lifecycle
await themed.init();
themed.destroy();

// Theme management
themed.register(theme);               // Register a theme
themed.registerMany([...themes]);     // Register multiple themes
themed.unregister(themeId);          // Remove a theme
themed.apply(themeId);               // Apply a theme by ID
themed.getActive();                  // Get the currently active Theme
themed.get(themeId);                 // Get a theme by ID
themed.getAll();                     // Get all registered themes
themed.has(themeId);                 // Check if a theme is registered

// Custom structured data
themed.updateThemeCustom(themeId, custom);  // Set custom data on a theme
// Note: call apply(themeId) afterwards to trigger reactive updates

// AI generation
await themed.generate(prompt, options?);   // Generate a theme from a text prompt
// options.customSchema  — natural language or JSON skeleton for custom data to co-generate
// options.autoApply    — auto-apply after generation (default: true)
// options.autoSave     — auto-save to storage after generation (default: true)
// options.baseTheme    — adjust an existing theme instead of generating from scratch

// Runtime configuration
themed.configureAI(aiOptions);       // Configure AI at runtime (e.g. after user enters API key)
themed.configureStorage(opts);       // Reconfigure storage
themed.configureCSS(opts);           // Reconfigure CSS variable injection

// Events (see docs/EVENTS.md for the full event contract)
themed.on('theme:changed', ({ theme }) => {});
themed.on('theme:generating', ({ prompt }) => {});
themed.on('theme:generated', ({ theme, prompt, duration }) => {});
themed.on('theme:error', ({ error, context }) => {});
themed.off(event, handler);
```

### Theme Type

```typescript
interface Theme {
  id: string;
  name: string;
  description?: string;
  tokens: ThemeTokens;
  /** Arbitrary JSON data attached to this theme (brand guidelines, metadata, etc.) */
  custom?: Record<string, unknown>;
  meta: {
    version: string;
    createdAt: number;
    source: 'builtin' | 'user' | 'ai';
    aiPrompt?: string;
  };
}
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
    fontFamily: { sans: string; serif: string; mono: string };
    fontSize: { xs, sm, base, lg, xl, '2xl', '3xl': string };
    fontWeight: { light, normal, medium, semibold, bold: number };
    lineHeight: { tight, normal, relaxed: number };
  };
  spacing?: Record<string, string>;  // e.g. { sm: '0.5rem', md: '1rem', ... }
  radius?: Record<string, string>;   // e.g. { sm: '0.25rem', full: '9999px', ... }
  shadow?: Record<string, string>;   // e.g. { sm: '0 1px 2px ...', md: '...', ... }
  transition?: Record<string, string>;
}
```

### GenerateOptions

```typescript
interface GenerateOptions {
  /** Auto-apply the generated theme (default: true) */
  autoApply?: boolean;
  /** Auto-save to storage (default: true) */
  autoSave?: boolean;
  /** Base theme to adjust instead of generating from scratch */
  baseTheme?: Theme;
  /**
   * Describe custom structured data to generate alongside the theme tokens.
   * Accepts natural language or a JSON skeleton with placeholder values.
   *
   * @example "Brand guidelines with name, tone, and target audience"
   * @example '{ "brandName": "...", "tone": "...", "audience": "..." }'
   */
  customSchema?: string;
}
```

## Deploying to GitHub Pages

The repo includes a workflow that builds the React, Vue, and Vanilla examples and deploys them to GitHub Pages.

1. **Enable GitHub Pages**  
   In the repo: **Settings → Pages → Build and deployment**:  
   - Source: **GitHub Actions**.

2. **Push to `main`**  
   The workflow runs on every push to `main` (or trigger it manually via **Actions → Deploy to GitHub Pages → Run workflow**).

3. **Open the site**  
   After deployment, the site is at:  
   **https://\<your-username\>.github.io/themed.js/**  
   - Landing: links to [React](https://starit.github.io/themed.js/react/), [Vue](https://starit.github.io/themed.js/vue/), [Vanilla](https://starit.github.io/themed.js/vanilla/) demos.

API keys are not embedded; users enter their own key in each demo's UI (safe for public hosting).

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test:run

# Start example apps
cd examples/vanilla && pnpm dev  # Port 3000
cd examples/react && pnpm dev   # Port 3001
cd examples/vue && pnpm dev     # Port 3002
```

## Publishing (maintainers)

1. Bump version in each package: `packages/*/package.json` (e.g. `0.1.0` → `0.1.1`).
2. Build and publish all packages:
   ```bash
   pnpm build
   pnpm publish -r --no-git-checks
   ```
3. Or publish a single package: `pnpm --filter @themed.js/core publish --no-git-checks`.

**Note:** Scoped packages (`@themed.js/*`) are public via `publishConfig.access`. Ensure you are logged in to npm (`npm login`) and have access to the `themed.js` scope (create the org at npmjs.com if needed).

## AI Agent Skills

themed.js ships a ready-to-use skill for AI agent frameworks that support the skill protocol (Claude Code, OpenClaw, etc.).

| Skill | Description |
|-------|-------------|
| `integrate-themed` | Guides an agent through installing and integrating themed.js into any project |

**Skills directory:** [`skills/`](./skills/)

Each skill has a `manifest.json` (id, version, tags, compatible agents) and a `skill.md` (full instructions). Agents can discover all available skills via [`skills/index.json`](./skills/index.json).

**Claude Code** — invoke with `/integrate-themed` inside any project that lists this repo as a dependency.

## License

MIT
