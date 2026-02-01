import { BaseAIProvider, type AIProviderConfig, type Message } from './base';

/**
 * Claude API response structure
 */
interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Claude provider for AI theme generation
 */
export class ClaudeProvider extends BaseAIProvider {
  readonly name = 'claude';
  private baseURL: string;
  private model: string;

  constructor(config: AIProviderConfig) {
    super(config);
    this.baseURL = config.baseURL ?? 'https://api.anthropic.com/v1';
    this.model = config.model ?? 'claude-3-5-sonnet-20241022';
  }

  /**
   * Send a completion request to Claude
   */
  async complete(messages: Message[]): Promise<string> {
    return this.retry(async () => {
      // Extract system message if present
      const systemMessage = messages.find((m) => m.role === 'system');
      const otherMessages = messages.filter((m) => m.role !== 'system');

      const response = await this.fetchWithTimeout(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 2000,
          system: systemMessage?.content,
          messages: otherMessages.map((m) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Claude API error: ${response.status} - ${error}`);
      }

      const data: ClaudeResponse = await response.json();
      const content = data.content[0]?.text;

      if (!content) {
        throw new Error('Claude returned empty response');
      }

      return content;
    });
  }

  /**
   * Stream a completion request
   */
  async *stream(messages: Message[]): AsyncIterable<string> {
    const systemMessage = messages.find((m) => m.role === 'system');
    const otherMessages = messages.filter((m) => m.role !== 'system');

    const response = await this.fetchWithTimeout(`${this.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 2000,
        system: systemMessage?.content,
        messages: otherMessages.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${error}`);
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
          if (!trimmed) continue;

          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              if (json.type === 'content_block_delta' && json.delta?.text) {
                yield json.delta.text;
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
