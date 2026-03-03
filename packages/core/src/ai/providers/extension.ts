import type { AIProvider, Message } from './base';

/**
 * Shape of the window.ThemedLLM API injected by the Themed LLM Secure Proxy extension.
 * Declared here so the rest of the codebase can type-check against it without
 * depending on Chrome APIs.
 */
export interface ThemedLLMProxy {
  /**
   * Send a chat request through the extension's secure proxy.
   *
   * @param messages  Standard chat messages in OpenAI format.
   * @param options   Reserved for future use (e.g. { contextKeys }).
   */
  chat(
    messages: Array<{ role: string; content: string }>,
    options?: Record<string, unknown>
  ): Promise<string>;

  /**
   * Stream a chat request through the extension's secure proxy.
   * Available for future support — optional on the extension side.
   */
  chatStream?(
    messages: Array<{ role: string; content: string }>,
    options?: Record<string, unknown>
  ): AsyncIterable<string>;

  /**
   * Returns the current configuration of the extension for status display.
   * Called synchronously on page load so the UI can show connection state
   * without waiting for a chat request.
   *
   * @returns provider name (e.g. "openai"), model (e.g. "gpt-4o-mini"), and
   *          whether a valid API key is configured in the extension.
   */
  getInfo?(): {
    provider?: string;
    model?: string;
    isConfigured?: boolean;
  };
}

declare global {
  interface Window {
    /** Injected by the Themed LLM Secure Proxy Chrome extension */
    ThemedLLM?: ThemedLLMProxy;
  }
}

/**
 * AI provider that delegates all LLM calls to the Themed LLM Secure Proxy
 * Chrome extension via `window.ThemedLLM`. No API key is needed in the page —
 * the user configures their provider and key inside the extension.
 *
 * @example
 * ```typescript
 * const themed = createThemed({
 *   defaultTheme: 'zinc',
 *   ai: { provider: 'extension' },
 * });
 * await themed.init();
 * const theme = await themed.generate('A warm sunset theme');
 * ```
 *
 * Requirements:
 * - The "Themed LLM Secure Proxy" Chrome extension must be installed (or loaded unpacked).
 * - The user must configure their provider/model/API key inside the extension options.
 * - `window.ThemedLLM` must be present when `generate()` is called.
 */
export class ExtensionProvider implements AIProvider {
  readonly name = 'extension';

  /**
   * Send a completion request through the extension proxy.
   *
   * The optional `_proxyOptions` parameter is reserved for future extension points
   * such as passing `{ contextKeys }` to the extension for context-aware generation.
   * It is forwarded verbatim to `window.ThemedLLM.chat` so that callers can pass
   * additional metadata without breaking the API.
   */
  async complete(messages: Message[], _proxyOptions?: Record<string, unknown>): Promise<string> {
    if (typeof window === 'undefined') {
      throw new Error(
        "The 'extension' provider is only available in the browser with the " +
          'Themed LLM Secure Proxy extension installed.'
      );
    }

    if (!window.ThemedLLM?.chat) {
      throw new Error(
        'Themed LLM Proxy extension is not detected. ' +
          'Install it or load it unpacked, then refresh the page.'
      );
    }

    const payload = messages.map((m) => ({ role: m.role, content: m.content }));
    const result = await window.ThemedLLM.chat(payload, _proxyOptions);

    if (!result) {
      throw new Error('Themed LLM Proxy extension returned an empty response.');
    }

    return result;
  }

  /**
   * Stream a completion request through the extension proxy.
   * Requires the extension to implement `window.ThemedLLM.chatStream`.
   * Falls back gracefully with a clear error if streaming is not supported.
   */
  async *stream(messages: Message[], _proxyOptions?: Record<string, unknown>): AsyncIterable<string> {
    if (typeof window === 'undefined') {
      throw new Error(
        "The 'extension' provider is only available in the browser with the " +
          'Themed LLM Secure Proxy extension installed.'
      );
    }

    if (!window.ThemedLLM?.chatStream) {
      if (!window.ThemedLLM?.chat) {
        throw new Error(
          'Themed LLM Proxy extension is not detected. ' +
            'Install it or load it unpacked, then refresh the page.'
        );
      }
      // Extension present but streaming not yet supported — fall back to complete()
      const result = await this.complete(messages, _proxyOptions);
      yield result;
      return;
    }

    const payload = messages.map((m) => ({ role: m.role, content: m.content }));
    yield* window.ThemedLLM.chatStream(payload, _proxyOptions);
  }
}
