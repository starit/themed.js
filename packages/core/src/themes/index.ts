import type { Theme } from '../types/theme';
import { defaultTypographyTokens } from '../types/tokens';

/**
 * Light theme - Clean and modern
 */
export const lightTheme: Theme = {
  id: 'light',
  name: 'Light',
  description: 'A clean, modern light theme',
  tokens: {
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#f59e0b',
      background: '#ffffff',
      surface: '#f8fafc',
      error: '#ef4444',
      warning: '#f59e0b',
      success: '#22c55e',
      info: '#3b82f6',
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
      textDisabled: '#9ca3af',
      textInverse: '#ffffff',
      border: '#e5e7eb',
      borderLight: '#f3f4f6',
      borderDark: '#d1d5db',
    },
    typography: defaultTypographyTokens,
  },
  meta: {
    version: '1.0.0',
    createdAt: 0,
    source: 'builtin',
  },
};

/**
 * Dark theme - Easy on the eyes
 */
export const darkTheme: Theme = {
  id: 'dark',
  name: 'Dark',
  description: 'A comfortable dark theme',
  tokens: {
    colors: {
      primary: '#818cf8',
      secondary: '#a78bfa',
      accent: '#fbbf24',
      background: '#111827',
      surface: '#1f2937',
      error: '#f87171',
      warning: '#fbbf24',
      success: '#4ade80',
      info: '#60a5fa',
      textPrimary: '#f9fafb',
      textSecondary: '#d1d5db',
      textDisabled: '#6b7280',
      textInverse: '#1f2937',
      border: '#374151',
      borderLight: '#4b5563',
      borderDark: '#1f2937',
    },
    typography: defaultTypographyTokens,
  },
  meta: {
    version: '1.0.0',
    createdAt: 0,
    source: 'builtin',
  },
};

/**
 * Ocean theme - Calm blue tones
 */
export const oceanTheme: Theme = {
  id: 'ocean',
  name: 'Ocean',
  description: 'Calm and serene ocean-inspired colors',
  tokens: {
    colors: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      accent: '#14b8a6',
      background: '#f0f9ff',
      surface: '#e0f2fe',
      error: '#f43f5e',
      warning: '#fb923c',
      success: '#10b981',
      info: '#0ea5e9',
      textPrimary: '#0c4a6e',
      textSecondary: '#0369a1',
      textDisabled: '#7dd3fc',
      textInverse: '#ffffff',
      border: '#bae6fd',
      borderLight: '#e0f2fe',
      borderDark: '#7dd3fc',
    },
    typography: {
      ...defaultTypographyTokens,
      fontFamily: {
        sans: '"Inter", system-ui, -apple-system, sans-serif',
        serif: '"Merriweather", Georgia, serif',
        mono: '"JetBrains Mono", ui-monospace, monospace',
      },
    },
  },
  meta: {
    version: '1.0.0',
    createdAt: 0,
    source: 'builtin',
  },
};

/**
 * Forest theme - Natural green tones
 */
export const forestTheme: Theme = {
  id: 'forest',
  name: 'Forest',
  description: 'Natural and refreshing forest-inspired colors',
  tokens: {
    colors: {
      primary: '#22c55e',
      secondary: '#16a34a',
      accent: '#84cc16',
      background: '#f0fdf4',
      surface: '#dcfce7',
      error: '#ef4444',
      warning: '#f59e0b',
      success: '#22c55e',
      info: '#3b82f6',
      textPrimary: '#14532d',
      textSecondary: '#166534',
      textDisabled: '#86efac',
      textInverse: '#ffffff',
      border: '#bbf7d0',
      borderLight: '#dcfce7',
      borderDark: '#86efac',
    },
    typography: {
      ...defaultTypographyTokens,
      fontFamily: {
        sans: '"Source Sans 3", system-ui, sans-serif',
        serif: '"Lora", Georgia, serif',
        mono: '"Fira Code", ui-monospace, monospace',
      },
    },
  },
  meta: {
    version: '1.0.0',
    createdAt: 0,
    source: 'builtin',
  },
};

/**
 * Sunset theme - Warm gradient colors
 */
export const sunsetTheme: Theme = {
  id: 'sunset',
  name: 'Sunset',
  description: 'Warm and inviting sunset-inspired colors',
  tokens: {
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#ec4899',
      background: '#fffbeb',
      surface: '#fef3c7',
      error: '#dc2626',
      warning: '#f59e0b',
      success: '#16a34a',
      info: '#0284c7',
      textPrimary: '#7c2d12',
      textSecondary: '#9a3412',
      textDisabled: '#fdba74',
      textInverse: '#ffffff',
      border: '#fed7aa',
      borderLight: '#fef3c7',
      borderDark: '#fdba74',
    },
    typography: {
      ...defaultTypographyTokens,
      fontFamily: {
        sans: '"Nunito", system-ui, sans-serif',
        serif: '"Playfair Display", Georgia, serif',
        mono: '"IBM Plex Mono", ui-monospace, monospace',
      },
    },
  },
  meta: {
    version: '1.0.0',
    createdAt: 0,
    source: 'builtin',
  },
};

/**
 * Midnight theme - Deep dark with purple accents
 */
export const midnightTheme: Theme = {
  id: 'midnight',
  name: 'Midnight',
  description: 'Deep, elegant dark theme with purple accents',
  tokens: {
    colors: {
      primary: '#a855f7',
      secondary: '#8b5cf6',
      accent: '#ec4899',
      background: '#0f0f23',
      surface: '#1a1a2e',
      error: '#f87171',
      warning: '#fbbf24',
      success: '#4ade80',
      info: '#60a5fa',
      textPrimary: '#e2e8f0',
      textSecondary: '#94a3b8',
      textDisabled: '#475569',
      textInverse: '#0f0f23',
      border: '#334155',
      borderLight: '#475569',
      borderDark: '#1e293b',
    },
    typography: {
      ...defaultTypographyTokens,
      fontFamily: {
        sans: '"Space Grotesk", system-ui, sans-serif',
        serif: '"Cormorant Garamond", Georgia, serif',
        mono: '"Cascadia Code", ui-monospace, monospace',
      },
    },
  },
  meta: {
    version: '1.0.0',
    createdAt: 0,
    source: 'builtin',
  },
};

/**
 * Rose theme - Soft pink tones
 */
export const roseTheme: Theme = {
  id: 'rose',
  name: 'Rose',
  description: 'Soft and elegant rose-inspired colors',
  tokens: {
    colors: {
      primary: '#ec4899',
      secondary: '#db2777',
      accent: '#f472b6',
      background: '#fdf2f8',
      surface: '#fce7f3',
      error: '#dc2626',
      warning: '#f59e0b',
      success: '#16a34a',
      info: '#0284c7',
      textPrimary: '#831843',
      textSecondary: '#9d174d',
      textDisabled: '#f9a8d4',
      textInverse: '#ffffff',
      border: '#fbcfe8',
      borderLight: '#fce7f3',
      borderDark: '#f9a8d4',
    },
    typography: {
      ...defaultTypographyTokens,
      fontFamily: {
        sans: '"DM Sans", system-ui, sans-serif',
        serif: '"Crimson Pro", Georgia, serif',
        mono: '"Victor Mono", ui-monospace, monospace',
      },
    },
  },
  meta: {
    version: '1.0.0',
    createdAt: 0,
    source: 'builtin',
  },
};

/**
 * All built-in themes
 */
export const builtinThemes: Theme[] = [
  lightTheme,
  darkTheme,
  oceanTheme,
  forestTheme,
  sunsetTheme,
  midnightTheme,
  roseTheme,
];
