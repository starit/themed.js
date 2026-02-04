/**
 * Message role for AI conversations
 */
export type MessageRole = 'system' | 'user' | 'assistant';

/**
 * Message structure for AI providers
 */
export interface Message {
  role: MessageRole;
  content: string;
}

/**
 * AI provider configuration
 */
export interface AIProviderConfig {
  apiKey: string;
  model?: string;
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
}

/**
 * AI provider interface
 */
export interface AIProvider {
  /** Provider name */
  readonly name: string;

  /**
   * Send a completion request
   */
  complete(messages: Message[]): Promise<string>;

  /**
   * Stream a completion request (optional)
   */
  stream?(messages: Message[]): AsyncIterable<string>;
}

/**
 * Base class for AI providers
 */
export abstract class BaseAIProvider implements AIProvider {
  abstract readonly name: string;
  protected config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = {
      timeout: 60000, // 60 seconds for AI generation
      maxRetries: 3,
      ...config,
    };
  }

  abstract complete(messages: Message[]): Promise<string>;

  /**
   * Retry a function with exponential backoff
   */
  protected async retry<T>(fn: () => Promise<T>, maxRetries?: number): Promise<T> {
    const retries = maxRetries ?? this.config.maxRetries ?? 3;
    let lastError: Error | null = null;

    for (let i = 0; i <= retries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (i < retries) {
          // Exponential backoff: 1s, 2s, 4s, ...
          await this.sleep(Math.pow(2, i) * 1000);
        }
      }
    }

    throw lastError;
  }

  /**
   * Sleep for a given duration
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Create a fetch request with timeout
   */
  protected async fetchWithTimeout(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(new Error(`Request timeout after ${this.config.timeout}ms`)),
      this.config.timeout
    );

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.config.timeout}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
