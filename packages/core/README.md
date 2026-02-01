# @themed.js/core

Core library for Themed.js - a powerful theme management system with AI-powered theme generation.

## Installation

```bash
npm install @themed.js/core
```

## Usage

```typescript
import { createThemed } from '@themed.js/core';

// Create instance
const themed = createThemed({
  defaultTheme: 'light',
  ai: {
    provider: 'openai',
    apiKey: 'sk-xxx',
  },
});

// Initialize
await themed.init();

// Apply theme
themed.apply('dark');

// Generate AI theme
const theme = await themed.generate('A cozy winter theme with warm colors');
```

## CSS Variables

Use the injected CSS variables in your styles:

```css
body {
  background-color: var(--themed-color-background);
  color: var(--themed-color-text-primary);
  font-family: var(--themed-font-family-sans);
}
```

## API

### createThemed(options)

Creates a ThemeManager instance.

### ThemeManager

- `init()` - Initialize the manager
- `register(theme)` - Register a theme
- `apply(themeId)` - Apply a theme
- `generate(prompt)` - Generate AI theme
- `getActive()` - Get current theme
- `getAll()` - Get all themes
- `on(event, handler)` - Subscribe to events

## License

MIT
