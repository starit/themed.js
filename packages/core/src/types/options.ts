import type { AIProvider } from '../ai/providers/base';
import type { Theme } from './theme';

/**
 * AI provider type identifiers
 */
export type AIProviderType =
  | 'openai'
  | 'claude'
  | 'gemini'
  | 'groq'
  | 'moonshot'
  | 'deepseek'
  | 'custom';

/**
 * AI configuration options
 */
export interface AIOptions {
  /** AI provider type or custom provider instance */
  provider: AIProviderType | AIProvider;
  /** API key for the provider */
  apiKey?: string;
  /** Model to use */
  model?: string;
  /** Custom API base URL (for providers that support it, e.g. moonshot .cn) */
  baseURL?: string;
  /** Custom API endpoint (for custom provider) */
  endpoint?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Maximum retries on failure */
  maxRetries?: number;
}

/**
 * Storage type identifiers
 */
export type StorageType = 'localStorage' | 'indexedDB' | 'none';

/**
 * Storage configuration options
 */
export interface StorageOptions {
  /** Storage type to use */
  type?: StorageType;
  /** Storage key prefix */
  prefix?: string;
  /** IndexedDB database name */
  dbName?: string;
  /** Auto-save on theme change */
  autoSave?: boolean;
  /** Auto-load on initialization */
  autoLoad?: boolean;
}

/**
 * CSS injection options
 */
export interface CSSOptions {
  /** CSS variable prefix (default: '--themed') */
  prefix?: string;
  /** Target element for CSS injection (default: document.documentElement) */
  target?: HTMLElement | null;
  /** Whether to use :root or specific element */
  useRoot?: boolean;
}

/**
 * Theme manager options
 */
export interface ThemeManagerOptions {
  /** Initial themes to register */
  themes?: Theme[];
  /** Default theme ID to apply */
  defaultTheme?: string;
  /** AI configuration */
  ai?: AIOptions;
  /** Storage configuration */
  storage?: StorageOptions;
  /** CSS injection configuration */
  css?: CSSOptions;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Theme generation options
 */
export interface GenerateOptions {
  /** Auto-apply the generated theme */
  autoApply?: boolean;
  /** Auto-save the generated theme */
  autoSave?: boolean;
  /** Base theme to modify (for adjustments) */
  baseTheme?: Theme;
  /** Custom temperature for AI generation */
  temperature?: number;
  /**
   * Optional description of custom structured data to generate alongside the theme.
   * Accepts natural language ("brand guide with name, tone, and use cases")
   * or a JSON skeleton with placeholder values ({ "brandName": "...", "tone": "..." }).
   */
  customSchema?: string;
}

/**
 * Default options
 */
export const defaultOptions: Required<
  Pick<ThemeManagerOptions, 'storage' | 'css' | 'debug'>
> = {
  storage: {
    type: 'localStorage',
    prefix: 'themed',
    autoSave: true,
    autoLoad: true,
  },
  css: {
    prefix: '--themed',
    useRoot: true,
  },
  debug: false,
};
