---
name: integrate-themed
description: Guides an AI agent through integrating themed.js into any project — vanilla, React, or Vue — including AI theme generation and CSS variable wiring.
license: MIT
metadata:
  version: 1.1.0
  updated: 2026-04-18
  themed_js_version: ">=0.1.1"
  github: https://github.com/starit/themed.js
---

# Integrate themed.js

You are an expert in themed.js — a framework-agnostic theme management library with AI-powered theme generation. When this skill is invoked, help the user integrate themed.js into their project by following the steps and patterns below.

Source: [github.com/starit/themed.js](https://github.com/starit/themed.js)

## What themed.js provides

- Design-token-based themes injected as CSS custom properties (`--themed-*`)
- 7 built-in themes: `light`, `dark`, `ocean`, `forest`, `sunset`, `midnight`, `rose`
- AI theme generation via OpenAI, Claude, Gemini, Groq, DeepSeek, Moonshot, Chrome extension proxy, custom OpenAI-compatible endpoints, or any fully custom `AIProvider` implementation
- localStorage / IndexedDB persistence (automatic by default)
- Type-safe event bus
- Works standalone in vanilla JS, or with React and Vue 3 framework bindings

---

## Installation

```bash
# Core only (vanilla JS / any framework)
npm install @themed.js/core

# React
npm install @themed.js/core @themed.js/react

# Vue 3
npm install @themed.js/core @themed.js/vue
```

---

## Core API — quick start

```typescript
import { createThemed, builtinThemes } from '@themed.js/core';

const themed = createThemed({
  themes: builtinThemes,          // register all 7 built-in themes
  defaultTheme: 'light',          // applied on init if no saved state
  ai: {                           // optional — omit if no AI needed
    provider: 'openai',           // 'openai' | 'claude' | 'gemini' | 'groq' | 'moonshot' | 'deepseek' | 'custom' | 'extension'
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini',         // optional, each provider has a sensible default
  },
  storage: {                      // optional — defaults shown
    type: 'localStorage',         // 'localStorage' | 'indexedDB' | 'none'
    autoSave: true,
    autoLoad: true,
  },
  css: {                          // optional — defaults shown
    prefix: '--themed',           // CSS variable prefix
    useRoot: true,                // inject on :root
  },
});

await themed.init();              // loads saved state, applies default theme
```

### Key methods on `ThemeManager`

| Method | Signature | Description |
|--------|-----------|-------------|
| `init` | `(): Promise<void>` | Load storage, apply default/saved theme |
| `apply` | `(themeId: string): Promise<void>` | Switch to a registered theme |
| `register` | `(theme: Theme \| ThemeInput): void` | Add a theme at runtime |
| `registerMany` | `(themes: (Theme \| ThemeInput)[]): void` | Bulk register |
| `unregister` | `(themeId: string): boolean` | Remove a theme |
| `generate` | `(prompt: string, opts?: GenerateOptions): Promise<Theme>` | AI generation |
| `getActive` | `(): Theme \| null` | Currently active theme |
| `getAll` | `(): Theme[]` | All registered themes |
| `get` | `(themeId: string): Theme \| undefined` | Single theme by id |
| `has` | `(themeId: string): boolean` | Check registration |
| `on` | `(event, handler): () => void` | Subscribe to events |
| `off` | `(event, handler): void` | Unsubscribe |
| `configureAI` | `(opts: AIOptions): void` | Swap AI config at runtime |
| `updateThemeCustom` | `(themeId, custom): void` | Update arbitrary custom JSON on a theme |
| `destroy` | `(): void` | Clean up everything |

---

## Events

```typescript
themed.on('theme:changed',      ({ theme, previousTheme }) => { ... });
themed.on('theme:registered',   ({ theme }) => { ... });
themed.on('theme:unregistered', ({ themeId }) => { ... });
themed.on('theme:generating',   ({ prompt }) => { ... });
themed.on('theme:generated',    ({ theme, prompt, duration }) => { ... });
themed.on('theme:error',        ({ error, context }) => { ... });
```

`on()` returns an unsubscribe function. Use `eventBus.once(event, handler)` for one-shot listeners.

---

## AI theme generation

```typescript
// Basic generation — auto-applies and auto-saves by default
const theme = await themed.generate('A warm sunset with amber and coral tones');

// With options
const theme = await themed.generate('Corporate SaaS dashboard', {
  autoApply: true,
  autoSave: true,
  baseTheme: themed.get('light'),   // adjust an existing theme instead of generating from scratch
  customSchema: '{ "brandName": "...", "tone": "...", "tagline": "..." }',
  // customSchema accepts natural language too:
  // customSchema: 'brand guide with name, tone, and 3 use cases'
});

// Generated theme has `theme.custom` populated from customSchema
console.log(theme.custom.brandName);
```

### Secure API key handling — Chrome Extension proxy

```typescript
// No API key in page code — LLM credentials live in the extension
const themed = createThemed({
  ai: { provider: 'extension' },
});
```

---

## Custom AI providers

There are two ways to bring your own AI backend.

### Option A — OpenAI-compatible endpoint (`provider: 'custom'`)

Use this for self-hosted models (Ollama, LM Studio, vLLM, Azure OpenAI, etc.) that speak an OpenAI-like API:

```typescript
const themed = createThemed({
  ai: {
    provider: 'custom',
    endpoint: 'http://localhost:11434/api/chat', // required
    apiKey: 'optional-key',                      // added as Bearer token if provided
    model: 'llama3.2',
    headers: { 'X-Custom-Header': 'value' },     // optional extra headers

    // Override request shape if the endpoint is not OpenAI-compatible
    transformRequest: (messages) => ({
      model: 'llama3.2',
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: false,
    }),

    // Override response parsing if needed
    extractContent: (response) => {
      const r = response as { message?: { content?: string } };
      return r.message?.content ?? '';
    },
  },
});
```

The default `transformRequest` and `extractContent` already handle OpenAI, Anthropic, and plain `text`/`output` response shapes — only override them when your endpoint differs.

### Option B — Fully custom `AIProvider` instance

Implement the `AIProvider` interface and pass the instance directly as `provider`. This gives you full control (streaming, auth, retry logic, etc.):

```typescript
import type { AIProvider, Message } from '@themed.js/core';

class MyProvider implements AIProvider {
  readonly name = 'my-provider';

  async complete(messages: Message[]): Promise<string> {
    const res = await fetch('https://my-llm.internal/v1/complete', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${MY_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    const data = await res.json();
    return data.text;
  }

  // Optional: streaming support
  async *stream(messages: Message[]): AsyncIterable<string> {
    // yield chunks as they arrive
  }
}

const themed = createThemed({
  ai: { provider: new MyProvider() },
});
```

The `Message` type is `{ role: 'system' | 'user' | 'assistant'; content: string }`.

---

## Token structure & CSS variables

Themes expose tokens as CSS variables automatically after `apply()`:

```
colors.primary             → --themed-color-primary
colors.textPrimary         → --themed-color-text-primary    (camelCase → kebab)
colors.borderLight         → --themed-color-border-light
typography.fontFamily.sans → --themed-font-family-sans      ("typography" is dropped)
typography.fontSize.base   → --themed-font-size-base
typography.fontWeight.bold → --themed-font-weight-bold
typography.lineHeight.normal → --themed-line-height-normal
spacing.md                 → --themed-spacing-md
radius.lg                  → --themed-radius-lg
shadow.sm                  → --themed-shadow-sm
transition.normal          → --themed-transition-normal
```

Use them in CSS:

```css
.button {
  background: var(--themed-color-primary);
  color: var(--themed-color-text-inverse);
  border-radius: var(--themed-radius-md);
  padding: var(--themed-spacing-sm) var(--themed-spacing-lg);
  box-shadow: var(--themed-shadow-sm);
  transition: background var(--themed-transition-fast);
  font-family: var(--themed-font-family-sans);
  font-size: var(--themed-font-size-base);
}
```

Full `ColorTokens` keys and their CSS variables:

| Token key | CSS variable |
|-----------|-------------|
| `primary` | `--themed-color-primary` |
| `secondary` | `--themed-color-secondary` |
| `accent` | `--themed-color-accent` |
| `background` | `--themed-color-background` |
| `surface` | `--themed-color-surface` |
| `error` | `--themed-color-error` |
| `warning` | `--themed-color-warning` |
| `success` | `--themed-color-success` |
| `info` | `--themed-color-info` |
| `textPrimary` | `--themed-color-text-primary` |
| `textSecondary` | `--themed-color-text-secondary` |
| `textDisabled` | `--themed-color-text-disabled` |
| `textInverse` | `--themed-color-text-inverse` |
| `border` | `--themed-color-border` |
| `borderLight` | `--themed-color-border-light` |
| `borderDark` | `--themed-color-border-dark` |

---

## React integration

```tsx
import { ThemeProvider, useTheme, useAITheme } from '@themed.js/react';

function App() {
  return (
    <ThemeProvider
      themes={builtinThemes}
      defaultTheme="light"
      ai={{ provider: 'openai', apiKey: import.meta.env.VITE_OPENAI_KEY }}
    >
      <MyApp />
    </ThemeProvider>
  );
}

function ThemeSwitcher() {
  const { theme, themes, apply } = useTheme();
  const { generate, isGenerating } = useAITheme();

  return (
    <>
      {themes.map(t => (
        <button key={t.id} onClick={() => apply(t.id)}>
          {t.name}
        </button>
      ))}
      <button
        disabled={isGenerating}
        onClick={() => generate('Cyberpunk neon city')}
      >
        {isGenerating ? 'Generating…' : 'Generate with AI'}
      </button>
    </>
  );
}
```

---

## Vue 3 integration

```typescript
// main.ts
import { createApp } from 'vue';
import { themedPlugin } from '@themed.js/vue';

const app = createApp(App);
app.use(themedPlugin, {
  themes: builtinThemes,
  defaultTheme: 'light',
  ai: { provider: 'claude', apiKey: import.meta.env.VITE_CLAUDE_KEY },
});
app.mount('#app');
```

```vue
<script setup lang="ts">
import { useTheme, useAITheme } from '@themed.js/vue';

const { themes, apply } = useTheme();
const { generate, isGenerating } = useAITheme();
</script>

<template>
  <button v-for="t in themes" :key="t.id" @click="apply(t.id)">
    {{ t.name }}
  </button>
  <button :disabled="isGenerating" @click="generate('Forest morning mist')">
    {{ isGenerating ? 'Generating…' : 'Generate with AI' }}
  </button>
</template>
```

---

## Custom theme (programmatic)

```typescript
import { createTheme } from '@themed.js/core';

const brandTheme = createTheme({
  id: 'my-brand',
  name: 'My Brand',
  tokens: {
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#ec4899',
      background: '#ffffff',
      surface: '#f8fafc',
      error: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981',
      info: '#3b82f6',
      textPrimary: '#0f172a',
      textSecondary: '#64748b',
      textDisabled: '#cbd5e1',
      textInverse: '#ffffff',
      border: '#e2e8f0',
      borderLight: '#f1f5f9',
      borderDark: '#94a3b8',
    },
    typography: {
      fontFamily: { sans: 'Inter, sans-serif', serif: 'Georgia, serif', mono: 'Fira Code, monospace' },
      fontSize: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem' },
      fontWeight: { light: 300, normal: 400, medium: 500, semibold: 600, bold: 700 },
      lineHeight: { tight: 1.25, normal: 1.5, relaxed: 1.75 },
    },
  },
  custom: { brandColor: '#6366f1', founded: 2024 },
});

themed.register(brandTheme);
await themed.apply('my-brand');
```

---

## Theme export / import

```typescript
// Single theme → JSON string
const json = themed.exportTheme('midnight-ocean');

// All themes (or pass an id array for a subset) → bundle JSON
const bundle = themed.exportThemes();
const subset = themed.exportThemes(['light', 'dark']);

// Import — accepts a single-theme JSON or an exportThemes() bundle or a plain array
const theme  = themed.importTheme(json);
const themes = themed.importThemes(bundle);
```

Both `importTheme` and `importThemes` validate the structure and throw descriptive errors on bad input.
They overwrite any existing theme with the same `id`, so they can also be used to update a theme in place.

Browser download helper:

```typescript
const blob = new Blob([themed.exportTheme('my-theme')], { type: 'application/json' });
const a = Object.assign(document.createElement('a'), {
  href: URL.createObjectURL(blob),
  download: 'my-theme.json',
});
a.click();
```

---

## Server-side rendering (SSR)

CSS injection uses the DOM and is a no-op on the server. To avoid a flash of unstyled content (FOUC), inject the initial CSS into the server-rendered HTML before the client hydrates.

### React — `ThemeScript` (Next.js App Router / Pages Router)

```tsx
// app/layout.tsx  (App Router)
import { ThemeScript } from '@themed.js/react';
import { ThemeProvider } from '@themed.js/react';

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

```tsx
// pages/_document.tsx  (Pages Router)
import { Html, Head, Main, NextScript } from 'next/document';
import { ThemeScript } from '@themed.js/react';

export default function Document() {
  return (
    <Html>
      <Head><ThemeScript defaultTheme="light" /></Head>
      <body><Main /><NextScript /></body>
    </Html>
  );
}
```

Pass custom themes and the same `css` options as your `ThemeProvider`:

```tsx
<ThemeScript defaultTheme="light" themes={[...builtinThemes, myTheme]} css={{ prefix: '--app' }} />
```

### Vue / Nuxt — `getSSRStyles`

```typescript
// plugins/themed.server.ts
import { getSSRStyles, builtinThemes } from '@themed.js/vue';

export default defineNuxtPlugin(() => {
  useHead({
    style: [{
      id: 'themed-js-styles',
      innerHTML: getSSRStyles('light', builtinThemes),
    }],
  });
});
```

### Vanilla SSR (Express, Fastify, etc.)

```typescript
import { getSSRStyles, builtinThemes } from '@themed.js/core';

app.get('/', (req, res) => {
  const css = getSSRStyles('light', builtinThemes);
  res.send(`
    <html>
      <head><style id="themed-js-styles">${css}</style></head>
      <body>...</body>
    </html>
  `);
});
```

The `id="themed-js-styles"` attribute is required — the client-side `CSSInjector` looks up this element by ID on hydration and updates it in place, so there is no duplicate tag and no FOUC.

---

## Integration checklist

1. **Install** the correct package(s) for the target framework
2. **Initialize** with `createThemed()` (or `ThemeProvider` / `themedPlugin` for React/Vue)
3. **Register themes** — include `builtinThemes` and/or custom themes
4. **Call `themed.init()`** to apply the default/saved theme
5. **Wire up CSS variables** — replace hardcoded color/spacing values with `var(--themed-*)` tokens
6. **Add a theme switcher** UI using `getAll()` / `useTheme()`
7. **SSR (optional):** add `ThemeScript` / `getSSRStyles` to prevent FOUC
8. **Optional:** configure AI and add a generation UI
9. **Optional:** subscribe to events for loading states and analytics

---

## Common pitfalls

- **Forget to call `init()`** — no theme is applied until you do
- **AI not configured** — calling `generate()` throws if no `ai` option was provided; check with `getAIConfig()`
- **Custom prefix** — if you change `css.prefix`, update all `var(--themed-*)` references in your CSS and pass the same `css` option to `ThemeScript` / `getSSRStyles`
- **SSR FOUC** — without `ThemeScript` or `getSSRStyles`, CSS variables are absent from the server HTML; see the SSR section above
- **Wrong variable name** — remember `colors` → `color` (singular) and camelCase → kebab: `textPrimary` → `--themed-color-text-primary`
