import type { AIOptions } from '../types/options';
import type { IAIThemeGenerator } from './types';
import { AIOrchestrator } from './AIOrchestrator';

/**
 * Create an AI theme generator from options.
 * ThemeManager uses this factory and depends only on IAIThemeGenerator.
 */
export function createAIOrchestrator(options: AIOptions): IAIThemeGenerator {
  return new AIOrchestrator(options);
}
