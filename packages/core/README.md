# @themed.js/core

Core library for Themed.js — a powerful theme management system with AI-powered theme generation.

## Installation

```bash
npm install @themed.js/core
```

## Usage

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

// Apply a theme
themed.apply('dark');

// Generate an AI theme
const theme = await themed.generate('A cozy winter theme with warm colors');

// Generate with custom structured data
const themed2 = await themed.generate('A corporate blue theme', {
  customSchema: 'Brand guidelines with name, tone of voice, and target audience',
});
// theme.custom → { "brandName": "...", "tone": "...", "audience": "..." }
```

## CSS Variables

Use the injected CSS variables in your styles:

```css
body {
  background-color: var(--themed-color-background);
  color: var(--themed-color-text-primary);
  font-family: var(--themed-font-family-sans);
}

.button {
  background: var(--themed-color-primary);
  color: var(--themed-color-text-inverse);
  border-radius: var(--themed-radius-md);
}
```

## Custom Structured Data

Every theme can carry an optional `custom` field — an arbitrary JSON object that travels with the theme through storage, export/import, and AI generation.

### Attach custom data manually

```typescript
themed.updateThemeCustom('my-theme', {
  brandName: 'Acme Corp',
  tone: 'professional',
});
// Call apply() to push the update to reactive consumers
await themed.apply('my-theme');
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
themed.register(theme);
```

### Co-generate custom data with AI

```typescript
// Natural language description
const theme = await themed.generate('A warm startup theme', {
  customSchema: 'Brand guidelines with company name, tagline, and tone of voice',
});

// JSON skeleton — AI fills in values that match the generated theme
const theme2 = await themed.generate('A dark fintech theme', {
  customSchema: '{ "brandName": "...", "tone": "...", "targetAudience": "..." }',
});

console.log(theme.custom);
// { "brandName": "...", "tone": "...", ... }
```

## API

### `createThemed(options)`

Creates and returns a configured `ThemeManager` instance. Automatically registers all built-in themes.

```typescript
const themed = createThemed({
  defaultTheme: 'light',       // Theme ID to apply on init
  themes: [...],               // Additional themes to register
  ai: { provider, apiKey },    // AI configuration
  storage: { type },           // 'localStorage' | 'indexedDB' | 'none'
  css: { prefix },             // CSS variable prefix (default: '--themed')
  debug: false,                // Enable event logging
});
```

### ThemeManager

#### Lifecycle

| Method | Description |
|--------|-------------|
| `init()` | Initialize: load persisted state and apply default theme |
| `destroy()` | Clean up CSS, events, and all internal state |

#### Theme management

| Method | Description |
|--------|-------------|
| `register(theme)` | Register a single theme |
| `registerMany(themes)` | Register multiple themes at once |
| `unregister(themeId)` | Remove a theme by ID; returns `true` if found |
| `apply(themeId)` | Apply a theme — injects CSS variables and emits `theme:changed` |
| `get(themeId)` | Get a theme by ID, or `undefined` |
| `getAll()` | Get all registered themes |
| `getActive()` | Get the currently active `Theme`, or `null` |
| `has(themeId)` | Check whether a theme is registered |

#### Custom structured data

| Method | Description |
|--------|-------------|
| `updateThemeCustom(themeId, custom)` | Set (or replace) the `custom` field on a registered theme. Also updates the active-theme reference if the patched theme is currently active. Call `apply(themeId)` afterwards to emit `theme:changed` and trigger reactive updates. |

#### AI generation

| Method | Signature | Description |
|--------|-----------|-------------|
| `generate` | `(prompt, options?) => Promise<Theme>` | Generate a new theme. If `options.baseTheme` is set, adjusts that theme. If `options.customSchema` is set, co-generates `custom` data alongside tokens. |

```typescript
interface GenerateOptions {
  autoApply?: boolean;    // default: true
  autoSave?: boolean;     // default: true
  baseTheme?: Theme;      // adjust an existing theme
  customSchema?: string;  // natural language or JSON skeleton for custom data
}
```

#### Runtime configuration

| Method | Description |
|--------|-------------|
| `configureAI(options)` | Replace the AI provider at runtime |
| `configureStorage(options)` | Replace the storage adapter at runtime |
| `configureCSS(options)` | Replace the CSS injector at runtime (re-applies active theme) |
| `getAIOrchestrator()` | Returns the current `IAIThemeGenerator` instance, or `null` |
| `getAIConfig()` | Returns `{ provider, model? }` for display, or `null` |
| `getStorageManager()` | Returns the current `StorageManager`, or `null` |

#### Events

| Method | Description |
|--------|-------------|
| `on(event, handler)` | Subscribe to a theme event |
| `off(event, handler)` | Unsubscribe |

See [docs/EVENTS.md](../../docs/EVENTS.md) for the full event contract and payloads.

### Theme Type

```typescript
interface Theme {
  id: string;
  name: string;
  description?: string;
  tokens: ThemeTokens;
  /** Arbitrary JSON data attached to this theme */
  custom?: Record<string, unknown>;
  meta: {
    version: string;
    createdAt: number;  // Unix timestamp
    source: 'builtin' | 'user' | 'ai';
    aiPrompt?: string;
  };
}
```

### AIGenerateResult

Returned by `IAIThemeGenerator.generateTheme()` and `.adjustTheme()`:

```typescript
interface AIGenerateResult {
  tokens: ThemeTokens;
  custom?: Record<string, unknown>;  // present when customSchema was provided
}
```

## License

MIT
