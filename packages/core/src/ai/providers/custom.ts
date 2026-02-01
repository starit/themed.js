import { BaseAIProvider, type AIProviderConfig, type Message } from './base';

/**
 * Custom provider configuration
 */
export interface CustomProviderConfig extends AIProviderConfig {
  /** Custom endpoint URL */
  endpoint: string;
  /** Custom headers */
  headers?: Record<string, string>;
  /** Request body transformer */
  transformRequest?: (messages: Message[]) => unknown;
  /** Response content extractor */
  extractContent?: (response: unknown) => string;
}

/**
 * Custom provider for self-hosted or alternative AI services
 */
export class CustomProvider extends BaseAIProvider {
  readonly name = 'custom';
  private endpoint: string;
  private customHeaders: Record<string, string>;
  private transformRequest: (messages: Message[]) => unknown;
  private extractContent: (response: unknown) => string;

  constructor(config: CustomProviderConfig) {
    super(config);
    this.endpoint = config.endpoint;
    this.customHeaders = config.headers ?? {};

    // Default request transformer (OpenAI-compatible format)
    this.transformRequest =
      config.transformRequest ??
      ((messages) => ({
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: 0.7,
        max_tokens: 2000,
      }));

    // Default content extractor (OpenAI-compatible format)
    this.extractContent =
      config.extractContent ??
      ((response: unknown) => {
        const r = response as {
          choices?: Array<{ message?: { content?: string } }>;
          content?: Array<{ text?: string }>;
          text?: string;
          output?: string;
        };

        // Try common response formats
        if (r.choices?.[0]?.message?.content) {
          return r.choices[0].message.content;
        }
        if (r.content?.[0]?.text) {
          return r.content[0].text;
        }
        if (typeof r.text === 'string') {
          return r.text;
        }
        if (typeof r.output === 'string') {
          return r.output;
        }

        throw new Error('Could not extract content from response');
      });
  }

  /**
   * Send a completion request to custom endpoint
   */
  async complete(messages: Message[]): Promise<string> {
    return this.retry(async () => {
      const body = this.transformRequest(messages);

      const response = await this.fetchWithTimeout(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey
            ? { Authorization: `Bearer ${this.config.apiKey}` }
            : {}),
          ...this.customHeaders,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Custom API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      return this.extractContent(data);
    });
  }
}
