// @themed.js/react - React bindings

export { ThemeProvider } from './ThemeProvider';
export { useTheme } from './useTheme';
export { useAITheme } from './useAITheme';
export { ThemeContext } from './context';

// Re-export core types for convenience
export type {
  Theme,
  ThemeTokens,
  ColorTokens,
  TypographyTokens,
  AIProviderConfig,
} from '@themed.js/core';
