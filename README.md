# Themed.js

[![npm version](https://img.shields.io/npm/v/@themed.js/core.svg)](https://www.npmjs.com/package/@themed.js/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**[Demo →](https://starit.me/themed.js)**

**AI-generated themes for modern frontends.**

Themed.js lets users generate personalized frontend themes from natural language prompts.

## Features

- **Framework Agnostic** — vanilla JS, React, Vue
- **AI Generation** — describe a theme in plain text; supports OpenAI, Claude, Gemini, Groq, DeepSeek, Moonshot, and a Chrome extension proxy
- **Custom Structured Data** — attach arbitrary JSON to any theme; AI can generate it alongside tokens
- **CSS Variables** — all tokens injected as `--themed-*` custom properties
- **Built-in Themes** — 8 themes included
- **TypeScript** — full type definitions across all packages
- **Persistent** — localStorage and IndexedDB, configurable
- **WCAG** — color contrast utilities

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
pnpm add @themed.js/core

# With React
pnpm add @themed.js/core @themed.js/react

# With Vue
pnpm add @themed.js/core @themed.js/vue
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
const theme2 = await themed.generate('A corporate blue theme', {
  customSchema: 'Brand guidelines with name, tone of voice, and target audience',
});
// theme2.custom → { "brandName": "...", "tone": "...", "audience": "..." }
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

Themes have an optional `custom` field — an arbitrary JSON object persisted through storage, export/import, and AI generation.

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

## Theme Export / Import

### Export

```typescript
// Single theme → JSON string
const json = themed.exportTheme('midnight-ocean');

// Multiple themes → bundle JSON ({ version, exportedAt, themes })
const bundle = themed.exportThemes(['light', 'dark', 'midnight-ocean']);

// All registered themes
const all = themed.exportThemes();
```

In the browser you can trigger a file download:

```typescript
const blob = new Blob([themed.exportTheme('midnight-ocean')], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = Object.assign(document.createElement('a'), { href: url, download: 'midnight-ocean.json' });
a.click();
URL.revokeObjectURL(url);
```

### Import

```typescript
// Single theme from a JSON string (or file contents)
const theme = themed.importTheme(json);

// Bundle produced by exportThemes(), or a plain JSON array of themes
const themes = themed.importThemes(bundleJson);

// File input example
input.addEventListener('change', async () => {
  const text = await input.files[0].text();
  themed.importThemes(text);
});
```

`importTheme` / `importThemes` validate the structure before registering and throw a descriptive error if the data is invalid or malformed.

---

## Server-Side Rendering (SSR)

CSS injection is a no-op on the server (no `document`). Use the SSR utilities to inject initial styles into the HTML response and prevent a flash of unstyled content (FOUC).

### React — `ThemeScript`

```tsx
// app/layout.tsx (Next.js App Router)
import { ThemeScript, ThemeProvider } from '@themed.js/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <ThemeScript defaultTheme="light" />
      </head>
      <body>
        <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

### Vue / Nuxt — `getSSRStyles`

```typescript
// plugins/themed.server.ts
import { getSSRStyles, builtinThemes } from '@themed.js/vue';

export default defineNuxtPlugin(() => {
  useHead({
    style: [{ id: 'themed-js-styles', innerHTML: getSSRStyles('light', builtinThemes) }],
  });
});
```

### Vanilla SSR

```typescript
import { getSSRStyles, builtinThemes } from '@themed.js/core';

const css = getSSRStyles('light', builtinThemes);
// inject into <style id="themed-js-styles"> in your HTML template
```

> The `id="themed-js-styles"` is required — the client-side injector finds and updates this element on hydration, preventing duplicate tags.

## Built-in Themes

Light · Dark · Ocean · Forest · Sunset · Midnight · Rose · Cyberpunk

## AI Providers

```typescript
// OpenAI (default: gpt-5.6-luna)
ai: {
  provider: 'openai',
  apiKey: 'sk-xxx',
  model: 'gpt-5.6-luna', // optional: gpt-5.6-terra, gpt-5.6-sol
}

// Claude (default: claude-sonnet-5)
ai: {
  provider: 'claude',
  apiKey: 'sk-xxx',
  model: 'claude-sonnet-5', // optional: claude-opus-5, claude-haiku-4-5
}

// Google Gemini (default: gemini-3.6-flash)
ai: {
  provider: 'gemini',
  apiKey: 'xxx', // from Google AI Studio
  model: 'gemini-3.6-flash', // optional: gemini-3.5-flash, gemini-3.5-flash-lite
}

// Groq (default: openai/gpt-oss-120b)
ai: {
  provider: 'groq',
  apiKey: 'gsk_xxx', // from console.groq.com
  model: 'openai/gpt-oss-120b', // optional: openai/gpt-oss-20b
}

// Moonshot/Kimi (default: kimi-k3)
ai: {
  provider: 'moonshot',
  apiKey: 'xxx', // from platform.kimi.ai
  model: 'kimi-k3', // optional: kimi-k2.6, kimi-k2.7-code
  baseURL: 'https://api.moonshot.cn/v1', // optional: use .cn for China
}

// DeepSeek (default: deepseek-v4-flash)
ai: {
  provider: 'deepseek',
  apiKey: 'xxx', // from platform.deepseek.com
  model: 'deepseek-v4-flash', // optional: deepseek-v4-pro
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
  defaultTheme: 'light',
  ai: {
    provider: 'extension',
  },
});

await themed.init();
const theme = await themed.generate('A warm sunset theme');
// All LLM traffic goes through the extension — no key in this page.
```

If the extension isn't detected when `generate()` is called:

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
themed.unregister(themeId);          // Remove a theme → returns boolean (false if not found)
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

// Export / Import
themed.exportTheme(themeId)           // → JSON string (single theme)
themed.exportThemes(themeIds?)        // → JSON string ({ version, exportedAt, themes })
themed.importTheme(json)              // parse + validate + register, returns Theme
themed.importThemes(json)             // accepts bundle or plain array, returns Theme[]

// Runtime configuration
themed.configureAI(aiOptions);       // Configure AI at runtime (e.g. after user enters API key)
themed.configureStorage(opts);       // Reconfigure storage
themed.configureCSS(opts);           // Reconfigure CSS variable injection

// Events
themed.on('theme:changed',      ({ theme, previousTheme }) => {});
themed.on('theme:registered',   ({ theme }) => {});
themed.on('theme:unregistered', ({ themeId }) => {});
themed.on('theme:generating',   ({ prompt }) => {});
themed.on('theme:generated',    ({ theme, prompt, duration }) => {});
themed.on('theme:error',        ({ error, context }) => {});
themed.on('storage:saved',      ({ key }) => {});
themed.on('storage:loaded',     ({ key, value }) => {});
themed.off(event, handler);
```

### Theme Type

```typescript
interface Theme {
  id: string;
  name: string;
  description?: string;
  tokens: ThemeTokens;
  custom?: Record<string, unknown>;  // arbitrary JSON attached to this theme
  meta: {
    version: string;
    createdAt: number;
    updatedAt?: number;
    source: 'builtin' | 'user' | 'ai';
    aiPrompt?: string;
    aiModel?: string;
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
    fontSize:   { xs: string; sm: string; base: string; lg: string; xl: string; '2xl': string; '3xl': string };
    fontWeight: { light: number; normal: number; medium: number; semibold: number; bold: number };
    lineHeight: { tight: number; normal: number; relaxed: number };
  };
  spacing?: {
    none: string; xs: string; sm: string; md: string; lg: string; xl: string; '2xl': string;
  };
  radius?: {
    none: string; sm: string; md: string; lg: string; full: string;
  };
  shadow?: {
    none: string; sm: string; md: string; lg: string;
  };
  transition?: {
    fast: string; normal: string; slow: string;
  };
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

### ThemeManagerOptions

Full options for `createThemed()`:

```typescript
interface ThemeManagerOptions {
  defaultTheme?: string;      // default: 'light'
  themes?: Theme[];           // additional themes to register alongside builtins
  ai?: AIOptions;             // AI provider config
  storage?: StorageOptions;
  css?: CSSOptions;
  debug?: boolean;            // log events to console
}

interface StorageOptions {
  type?: 'localStorage' | 'indexedDB' | 'none';  // default: 'localStorage'
  prefix?: string;            // key prefix, default: 'themed'
  dbName?: string;            // IndexedDB database name
  autoSave?: boolean;         // persist on apply(), default: true
  autoLoad?: boolean;         // restore last theme on init(), default: true
}

interface CSSOptions {
  prefix?: string;            // variable prefix, default: '--themed'
  target?: HTMLElement | null; // injection target, default: document.documentElement
  useRoot?: boolean;          // inject on :root, default: true
}
```

Example — use IndexedDB and a custom variable prefix:

```typescript
const themed = createThemed({
  defaultTheme: 'dark',
  storage: { type: 'indexedDB', dbName: 'my-app-themes' },
  css: { prefix: '--app' },
});
```

### React Hooks

#### `useTheme()`

```typescript
const {
  theme,          // Theme | null — active theme
  themes,         // Theme[]    — all registered themes
  initialized,    // boolean
  apply,          // (themeId: string) => Promise<void>
  register,       // (theme: Theme | ThemeInput) => void
  unregister,     // (themeId: string) => boolean
  has,            // (themeId: string) => boolean
  get,            // (themeId: string) => Theme | undefined
  updateThemeCustom, // (themeId: string, custom: Record<string, unknown>) => void
  exportTheme,    // (themeId: string) => string
  importTheme,    // (json: string) => Theme
} = useTheme();
```

#### `useAITheme()`

```typescript
const {
  generate,       // (prompt: string, opts?: { customSchema?: string }) => Promise<Theme>
  adjust,         // (instruction: string, opts?: { customSchema?: string }) => Promise<Theme>
                  //   adjusts the currently active theme based on instruction
  configureAI,    // (options: AIOptions) => void — set API key at runtime
  isGenerating,   // boolean
  isConfigured,   // boolean
  error,          // Error | null
  modelInfo,      // { provider: string; model?: string } | null
} = useAITheme();
```

### Vue Composables

Same shape as React hooks, but reactive values are wrapped in `ComputedRef`:

```typescript
const { theme, themes, initialized } = useTheme();
// theme      → ComputedRef<Theme | null>
// themes     → ComputedRef<Theme[]>
// initialized → ComputedRef<boolean>

const { isGenerating, isConfigured, error, modelInfo } = useAITheme();
// all four   → ComputedRef<...>
```

`apply`, `generate`, `adjust`, `configureAI`, `register`, `unregister`, `updateThemeCustom`, `exportTheme`, `importTheme` are plain functions (not refs).

---

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
cd examples/next && pnpm dev    # Port 3003
```

### Next.js example (server-side AI proxy)

The `examples/next` app demonstrates generating themes via a Next.js API route so the LLM API key stays on the server and is never sent to the browser. Set `AI_PROVIDER` and `AI_API_KEY` in `examples/next/.env.local` before running. See [examples/next/README.md](examples/next/README.md) for details.

## Publishing (maintainers)

Publishing is managed with **Changesets**.

- Create a changeset in your PR: `pnpm changeset`
- Apply version bumps + changelogs: `pnpm changeset:version`
- Publish (runs tests + builds first): `pnpm release`

For the full PR-driven + GitHub Actions workflow, see [docs/RELEASE.md](docs/RELEASE.md).

**Note:** You must be authenticated to npm (`npm login`) and have publish access to the `@themed.js` scope.

## AI Agent Skills

Two skills for Claude Code and compatible agent frameworks:

| Skill | Version | Description |
|-------|---------|-------------|
| `integrate-themed` | 1.1.0 | Install and wire up themed.js in a vanilla, React, or Vue project |
| `generate-theme` | 1.0.0 | Generate a `Theme` object from a text description; outputs TypeScript, no running app needed |

Skills are in [`skills/`](./skills/). Discovery via [`skills/index.json`](./skills/index.json).

**Claude Code** — invoke inside any project:

```
/integrate-themed   — set up themed.js in the current project
/generate-theme     — generate a Theme object from a description
```

## License

MIT
