import type { Theme } from '../types/theme';
import type { ThemeTokens } from '../types/tokens';

/**
 * Interface for AI-powered theme generation.
 * ThemeManager depends only on this interface; concrete implementation is created by the AI factory.
 */
export interface IAIThemeGenerator {
  generateTheme(prompt: string): Promise<ThemeTokens>;
  adjustTheme(theme: Theme, instruction: string): Promise<ThemeTokens>;
}
