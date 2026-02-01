# @themed.js/react

React bindings for Themed.js - hooks and context provider for theme management.

## Installation

```bash
npm install @themed.js/core @themed.js/react
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

## API

### ThemeProvider Props

- `defaultTheme` - Default theme ID
- `themes` - Additional themes to register
- `ai` - AI configuration
- `storage` - Storage configuration
- `onThemeChange` - Theme change callback

### useTheme Returns

- `theme` - Current theme
- `themes` - All themes
- `apply(id)` - Apply theme
- `register(theme)` - Register theme

### useAITheme Returns

- `generate(prompt)` - Generate theme
- `adjust(instruction)` - Adjust current theme
- `isGenerating` - Loading state
- `error` - Error state

## License

MIT
