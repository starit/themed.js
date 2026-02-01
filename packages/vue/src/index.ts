// @themed.js/vue - Vue bindings

export { themedPlugin } from './plugin';
export { useTheme } from './composables/useTheme';
export { useAITheme } from './composables/useAITheme';
export { THEMED_INJECTION_KEY } from './keys';

// Re-export core types for convenience
export type {
  Theme,
  ThemeTokens,
  ColorTokens,
  TypographyTokens,
  AIProviderConfig,
} from '@themed.js/core';
