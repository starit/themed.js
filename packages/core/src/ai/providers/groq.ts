import { BaseAIProvider, type AIProviderConfig, type Message } from './base';

/**
 * Groq API response structure (OpenAI-compatible format)
 */
interface GroqResponse {
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
 * Groq provider for AI theme generation
 * Uses Llama models accelerated by Groq (OpenAI-compatible API)
 *
 * @see https://console.groq.com/docs
 */
export class GroqProvider extends BaseAIProvider {
  readonly name = 'groq';
  private baseURL: string;
  private model: string;

  constructor(config: AIProviderConfig) {
    super(config);
    this.baseURL = config.baseURL ?? 'https://api.groq.com/openai/v1';
    this.model = config.model ?? 'llama-3.3-70b-versatile';
  }

  /**
   * Send a completion request to Groq
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
            temperature: 0.7,
            max_tokens: 2000,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${error}`);
      }

      const data: GroqResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Groq returned empty response');
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
          temperature: 0.7,
          max_tokens: 2000,
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${error}`);
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
