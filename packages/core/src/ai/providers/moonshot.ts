import { BaseAIProvider, type AIProviderConfig, type Message } from './base';

/**
 * Moonshot/Kimi API response structure (OpenAI-compatible format)
 */
interface MoonshotResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Moonshot (Kimi) provider for AI theme generation
 * Uses Moonshot AI's OpenAI-compatible API
 *
 * @see https://platform.moonshot.ai/docs/api/chat
 */
export class MoonshotProvider extends BaseAIProvider {
  readonly name = 'moonshot';
  private baseURL: string;
  private model: string;

  constructor(config: AIProviderConfig) {
    super(config);
    this.baseURL = config.baseURL ?? 'https://api.moonshot.ai/v1';
    this.model = config.model ?? 'kimi-k2-turbo-preview';
  }

  /**
   * Send a completion request to Moonshot/Kimi
   */
  async complete(messages: Message[]): Promise<string> {
    return this.retry(async () => {
      const response = await this.fetchWithTimeout(
        `${this.baseURL}/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({
            model: this.model,
            messages: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            temperature: 0.6,
            max_completion_tokens: 2000,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Moonshot API error: ${response.status} - ${error}`);
      }

      const data: MoonshotResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Moonshot returned empty response');
      }

      return content;
    });
  }

  /**
   * Stream a completion request
   */
  async *stream(messages: Message[]): AsyncIterable<string> {
    const response = await this.fetchWithTimeout(
      `${this.baseURL}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          temperature: 0.6,
          max_completion_tokens: 2000,
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Moonshot API error: ${response.status} - ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;

          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
