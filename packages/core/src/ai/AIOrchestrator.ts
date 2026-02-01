import type { AIOptions, AIProviderType } from '../types/options';
import type { Theme } from '../types/theme';
import type { ThemeTokens } from '../types/tokens';
import type { AIProvider, AIProviderConfig } from './providers/base';
import { OpenAIProvider } from './providers/openai';
import { ClaudeProvider } from './providers/claude';
import { CustomProvider, type CustomProviderConfig } from './providers/custom';
import { PromptEngine } from './PromptEngine';

/**
 * AI orchestrator for managing theme generation
 */
export class AIOrchestrator {
  private provider: AIProvider;
  private promptEngine: PromptEngine;

  constructor(options: AIOptions) {
    this.provider = this.createProvider(options);
    this.promptEngine = new PromptEngine();
  }

  /**
   * Create an AI provider from options
   */
  private createProvider(options: AIOptions): AIProvider {
    // If a provider instance is passed directly
    if (typeof options.provider === 'object') {
      return options.provider;
    }

    const config: AIProviderConfig = {
      apiKey: options.apiKey ?? '',
      model: options.model,
      timeout: options.timeout,
      maxRetries: options.maxRetries,
    };

    switch (options.provider) {
      case 'openai':
        return new OpenAIProvider(config);

      case 'claude':
        return new ClaudeProvider(config);

      case 'gemini':
        // Gemini uses OpenAI-compatible API
        return new OpenAIProvider({
          ...config,
          baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
          model: options.model ?? 'gemini-1.5-flash',
        });

      case 'custom':
        if (!options.endpoint) {
          throw new Error('Custom provider requires an endpoint');
        }
        return new CustomProvider({
          ...config,
          endpoint: options.endpoint,
        } as CustomProviderConfig);

      default:
        throw new Error(`Unknown provider: ${options.provider}`);
    }
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
