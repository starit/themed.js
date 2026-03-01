import type { AIOptions } from '../types/options';
import type { Theme } from '../types/theme';
import type { ThemeTokens } from '../types/tokens';
import type { AIProvider } from './providers/base';
import { createAIProvider } from './createAIProvider';
import { PromptEngine } from './PromptEngine';

/**
 * AI orchestrator for managing theme generation.
 * Uses the shared provider factory so provider list lives in one place.
 */
export class AIOrchestrator {
  private provider: AIProvider;
  private promptEngine: PromptEngine;

  constructor(options: AIOptions) {
    this.provider = createAIProvider(options);
    this.promptEngine = new PromptEngine();
  }

  /**
   * Set a new provider
   */
  setProvider(provider: AIProvider): void {
    this.provider = provider;
  }

  /**
   * Get the current provider
   */
  getProvider(): AIProvider {
    return this.provider;
  }

  /**
   * Generate a new theme from a prompt
   */
  async generateTheme(prompt: string): Promise<ThemeTokens> {
    const messages = this.promptEngine.buildGeneratePrompt(prompt);
    const response = await this.provider.complete(messages);
    return this.promptEngine.parseResponse(response);
  }

  /**
   * Adjust an existing theme based on instructions
   */
  async adjustTheme(theme: Theme, instruction: string): Promise<ThemeTokens> {
    const messages = this.promptEngine.buildAdjustPrompt(theme, instruction);
    const response = await this.provider.complete(messages);
    return this.promptEngine.parseResponse(response);
  }

  /**
   * Generate theme with streaming (if supported)
   */
  async *generateThemeStream(
    prompt: string
  ): AsyncIterable<{ partial: string; complete: boolean }> {
    if (!this.provider.stream) {
      // Fall back to non-streaming
      const tokens = await this.generateTheme(prompt);
      yield { partial: JSON.stringify(tokens), complete: true };
      return;
    }

    const messages = this.promptEngine.buildGeneratePrompt(prompt);
    let accumulated = '';

    for await (const chunk of this.provider.stream(messages)) {
      accumulated += chunk;
      yield { partial: accumulated, complete: false };
    }

    yield { partial: accumulated, complete: true };
  }
}
