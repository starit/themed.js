# @themed.js/react

React bindings for Themed.js — hooks and context provider for theme management.

## Installation

```bash
pnpm add @themed.js/core @themed.js/react
```

## Usage

### Setup Provider

```tsx
import { ThemeProvider } from '@themed.js/react';

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
```

### useTheme Hook

```tsx
import { useTheme } from '@themed.js/react';

function ThemeSwitcher() {
  const { theme, themes, apply } = useTheme();

  return (
    <div>
      <p>Current: {theme?.name}</p>
      {themes.map(t => (
        <button key={t.id} onClick={() => apply(t.id)}>
          {t.name}
        </button>
      ))}
    </div>
  );
}
```

### useAITheme Hook

```tsx
import { useAITheme } from '@themed.js/react';

function AIGenerator() {
  const { generate, isGenerating, error } = useAITheme();

  return (
    <button
      onClick={() => generate('A warm autumn theme')}
      disabled={isGenerating}
    >
      {isGenerating ? 'Generating...' : 'Generate'}
    </button>
  );
}
```

### Custom Structured Data

Attach arbitrary JSON data to any theme, or co-generate it with AI.

#### Attach custom data to the active theme

```tsx
import { useTheme } from '@themed.js/react';

function CustomDataEditor() {
  const { theme, updateThemeCustom, apply } = useTheme();

  const handleAttach = () => {
    updateThemeCustom(theme.id, { brandName: 'Acme', tone: 'professional' });
    apply(theme.id); // triggers re-render with updated theme
  };

  return (
    <>
      {theme?.custom && (
        <pre>{JSON.stringify(theme.custom, null, 2)}</pre>
      )}
      <button onClick={handleAttach}>Attach custom data</button>
    </>
  );
}
```

#### Co-generate custom data with AI

Pass `customSchema` to describe what custom data you want alongside the theme tokens. It can be a natural-language description or a JSON skeleton with placeholder values.

```tsx
import { useAITheme } from '@themed.js/react';

function AIGeneratorWithCustom() {
  const { generate, isGenerating } = useAITheme();
  const [customSchema, setCustomSchema] = useState('');

  const handleGenerate = () => {
    generate('A corporate blue theme', {
      customSchema: customSchema || undefined,
      // e.g. "Brand guidelines with name, tone, and target audience"
      // or   '{ "brandName": "...", "tone": "...", "audience": "..." }'
    });
  };

  return (
    <>
      <textarea
        value={customSchema}
        onChange={e => setCustomSchema(e.target.value)}
        placeholder='Describe custom data, e.g. "brand guide with name and tone"'
      />
      <button onClick={handleGenerate} disabled={isGenerating}>
        Generate
      </button>
    </>
  );
}
```

The generated `theme.custom` will contain the AI-populated data.

## API

### ThemeProvider Props

| Prop | Type | Description |
|------|------|-------------|
| `defaultTheme` | `string` | Default theme ID to apply on mount |
| `themes` | `Theme[]` | Additional themes to register |
| `ai` | `AIOptions` | AI configuration (provider, apiKey, model) |
| `storage` | `StorageOptions` | Storage configuration (`localStorage` \| `indexedDB` \| `none`) |
| `css` | `CSSOptions` | CSS variable options (e.g. custom prefix) |
| `debug` | `boolean` | Enable event debug logging |
| `onThemeChange` | `(theme: Theme) => void` | Called whenever the active theme changes |

### useTheme Returns

| Field | Type | Description |
|-------|------|-------------|
| `theme` | `Theme \| null` | Currently active theme |
| `themes` | `Theme[]` | All registered themes |
| `apply` | `(themeId: string) => Promise<void>` | Apply a theme by ID |
| `register` | `(theme: Theme) => void` | Register a new theme |
| `updateThemeCustom` | `(themeId: string, custom: Record<string, unknown>) => void` | Set custom data on a theme. Call `apply(themeId)` afterwards to propagate the change. |

### useAITheme Returns

| Field | Type | Description |
|-------|------|-------------|
| `generate` | `(prompt: string, options?: GenerateOptions) => Promise<Theme>` | Generate a theme from a text prompt |
| `adjust` | `(instruction: string, options?: GenerateOptions) => Promise<Theme>` | Adjust the active theme based on an instruction |
| `configureAI` | `(options: AIOptions) => void` | Configure the AI provider at runtime |
| `isGenerating` | `boolean` | Whether AI generation is in progress |
| `error` | `Error \| null` | Last error from AI generation |
| `isConfigured` | `boolean` | Whether an AI provider is configured |
| `modelInfo` | `{ provider: string; model?: string } \| null` | Current provider and model for display |

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
