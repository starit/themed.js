import type { AIOptions } from '../types/options';
import type { AIProvider, AIProviderConfig } from './providers/base';
import { OpenAIProvider } from './providers/openai';
import { ClaudeProvider } from './providers/claude';
import { GeminiProvider } from './providers/gemini';
import { GroqProvider } from './providers/groq';
import { MoonshotProvider } from './providers/moonshot';
import { DeepSeekProvider } from './providers/deepseek';
import { CustomProvider, type CustomProviderConfig } from './providers/custom';
import { ExtensionProvider } from './providers/extension';

/**
 * Create an AI provider from options.
 * Centralizes provider instantiation so ThemeManager and AIOrchestrator
 * do not depend on concrete provider classes.
 */
export function createAIProvider(options: AIOptions): AIProvider {
  // Extension provider: delegates to window.ThemedLLM, no API key needed.
  if (options.provider === 'extension') {
    return new ExtensionProvider();
  }

  // Custom AIProvider instance passed directly (duck-typed).
  if (typeof options.provider === 'object') {
    return options.provider;
  }

  // All remaining providers are API-key-based; options is AIKeyBasedOptions here.
  const config: AIProviderConfig = {
    apiKey: options.apiKey ?? '',
    model: options.model,
    baseURL: options.baseURL,
    timeout: options.timeout,
    maxRetries: options.maxRetries,
  };

  switch (options.provider) {
    case 'openai':
      return new OpenAIProvider(config);
    case 'claude':
      return new ClaudeProvider(config);
    case 'gemini':
      return new GeminiProvider(config);
    case 'groq':
      return new GroqProvider(config);
    case 'moonshot':
      return new MoonshotProvider(config);
    case 'deepseek':
      return new DeepSeekProvider(config);
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
