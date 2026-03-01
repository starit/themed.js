import type { Theme } from '../types/theme';
import type { ThemeTokens } from '../types/tokens';

/**
 * Result of AI theme generation: tokens plus optional custom structured data.
 */
export interface AIGenerateResult {
  tokens: ThemeTokens;
  custom?: Record<string, unknown>;
}

/**
 * Interface for AI-powered theme generation.
 * ThemeManager depends only on this interface; concrete implementation is created by the AI factory.
 */
export interface IAIThemeGenerator {
  generateTheme(prompt: string, customSchema?: string): Promise<AIGenerateResult>;
  adjustTheme(theme: Theme, instruction: string, customSchema?: string): Promise<AIGenerateResult>;
}
