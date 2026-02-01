import { createContext } from 'react';
import type { ThemeManager, Theme } from '@themed.js/core';

/**
 * Theme context value
 */
export interface ThemeContextValue {
  /** The ThemeManager instance */
  manager: ThemeManager;
  /** Current active theme */
  theme: Theme | null;
  /** All registered themes */
  themes: Theme[];
  /** Whether the manager is initialized */
  initialized: boolean;
}

/**
 * AI theme context value
 */
export interface AIThemeContextValue {
  /** Generate a new theme from prompt */
  generate: (prompt: string) => Promise<Theme>;
  /** Adjust the current theme */
  adjust: (instruction: string) => Promise<Theme>;
  /** Whether AI is currently generating */
  isGenerating: boolean;
  /** Last error from AI generation */
  error: Error | null;
  /** Whether AI is configured */
  isConfigured: boolean;
}

/**
 * Theme context
 */
export const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * AI Theme context
 */
export const AIThemeContext = createContext<AIThemeContextValue | null>(null);
