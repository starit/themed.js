import type { InjectionKey } from 'vue';
import type { ThemeManager, Theme } from '@themed.js/core';

/**
 * Themed injection value
 */
export interface ThemedInjection {
  manager: ThemeManager;
  theme: Theme | null;
  themes: Theme[];
  initialized: boolean;
  isGenerating: boolean;
  aiError: Error | null;
  isAIConfigured: boolean;
  modelInfo: { provider: string; model?: string } | null;
}

/**
 * Injection key for Themed.js
 */
export const THEMED_INJECTION_KEY: InjectionKey<ThemedInjection> = Symbol('themed');
