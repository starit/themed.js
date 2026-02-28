import type { Theme, ThemeInput } from './types/theme';
import type { ThemeEventType, ThemeEventHandler } from './types/events';
import type {
  ThemeManagerOptions,
  GenerateOptions,
  AIOptions,
  StorageOptions,
  CSSOptions,
} from './types/options';
import { createTheme } from './types/theme';
import { EventBus } from './EventBus';
import { CSSInjector } from './CSSInjector';
import { AIOrchestrator } from './ai/AIOrchestrator';
import { StorageManager } from './storage/StorageManager';

/**
 * Main theme manager class
 */
export class ThemeManager {
  private themes: Map<string, Theme> = new Map();
  private activeTheme: Theme | null = null;
  private eventBus: EventBus;
  private cssInjector: CSSInjector;
  private aiOrchestrator: AIOrchestrator | null = null;
  private storageManager: StorageManager | null = null;
  private options: ThemeManagerOptions;
  private initialized = false;

  constructor(options: ThemeManagerOptions = {}) {
    this.options = options;
    this.eventBus = new EventBus({ debug: options.debug });
    this.cssInjector = new CSSInjector(options.css);

    // Initialize AI orchestrator if configured
    if (options.ai) {
      this.aiOrchestrator = new AIOrchestrator(options.ai);
    }

    // Initialize storage manager if configured
    if (options.storage?.type !== 'none') {
      this.storageManager = new StorageManager(options.storage);
    }

    // Register initial themes
    if (options.themes) {
      this.registerMany(options.themes);
    }
  }

  /**
   * Initialize the theme manager
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    // Load saved theme from storage
    if (this.storageManager && this.options.storage?.autoLoad !== false) {
      const savedThemeId = await this.storageManager.getActiveThemeId();
      const savedThemes = await this.storageManager.getThemes();

      // Register saved themes
      for (const theme of savedThemes) {
        if (!this.themes.has(theme.id)) {
          this.themes.set(theme.id, theme);
        }
      }

      // Apply saved theme if exists
      if (savedThemeId && this.themes.has(savedThemeId)) {
        await this.apply(savedThemeId);
        this.initialized = true;
        return;
      }
    }

    // Apply default theme
    if (this.options.defaultTheme && this.themes.has(this.options.defaultTheme)) {
      await this.apply(this.options.defaultTheme);
    }

    this.initialized = true;
  }

  /**
   * Register a theme
   */
  register(theme: Theme | ThemeInput): void {
    const normalizedTheme = 'meta' in theme ? theme : createTheme(theme);
    this.themes.set(normalizedTheme.id, normalizedTheme);

    this.eventBus.emit('theme:registered', { theme: normalizedTheme });
  }

  /**
   * Register multiple themes
   */
  registerMany(themes: (Theme | ThemeInput)[]): void {
    for (const theme of themes) {
      this.register(theme);
    }
  }

  /**
   * Unregister a theme
   */
  unregister(themeId: string): boolean {
    const exists = this.themes.has(themeId);
    if (exists) {
      this.themes.delete(themeId);
      this.eventBus.emit('theme:unregistered', { themeId });

      // If active theme was unregistered, clear it
      if (this.activeTheme?.id === themeId) {
        this.activeTheme = null;
        this.cssInjector.clear();
      }
    }
    return exists;
  }

  /**
   * Apply a theme by ID
   */
  async apply(themeId: string): Promise<void> {
    const theme = this.themes.get(themeId);
    if (!theme) {
      throw new Error(`Theme not found: ${themeId}`);
    }

    const previousTheme = this.activeTheme;
    this.activeTheme = theme;

    // Inject CSS variables
    this.cssInjector.inject(theme.tokens);

    // Save to storage
    if (this.storageManager && this.options.storage?.autoSave !== false) {
      await this.storageManager.setActiveThemeId(themeId);
    }

    this.eventBus.emit('theme:changed', { theme, previousTheme });
  }

  /**
   * Generate a theme using AI
   */
  async generate(prompt: string, options: GenerateOptions = {}): Promise<Theme> {
    if (!this.aiOrchestrator) {
      throw new Error('AI is not configured. Please provide AI options when creating ThemeManager.');
    }

    this.eventBus.emit('theme:generating', { prompt });

    const startTime = Date.now();

    try {
      const tokens = options.baseTheme
        ? await this.aiOrchestrator.adjustTheme(options.baseTheme, prompt)
        : await this.aiOrchestrator.generateTheme(prompt);

      const theme: Theme = {
        id: `ai-${Date.now()}`,
        name: prompt.slice(0, 50),
        description: `AI generated theme from: "${prompt}"`,
        tokens,
        meta: {
          version: '1.0.0',
          createdAt: Date.now(),
          source: 'ai',
          aiPrompt: prompt,
        },
      };

      // Register the generated theme
      this.register(theme);

      // Auto-apply if requested
      if (options.autoApply !== false) {
        await this.apply(theme.id);
      }

      // Auto-save if requested
      if (options.autoSave !== false && this.storageManager) {
        await this.storageManager.saveTheme(theme);
      }

      const duration = Date.now() - startTime;
      this.eventBus.emit('theme:generated', { theme, prompt, duration });

      return theme;
    } catch (error) {
      this.eventBus.emit('theme:error', {
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'generate',
      });
      throw error;
    }
  }

  /**
   * Get the currently active theme
   */
  getActive(): Theme | null {
    return this.activeTheme;
  }

  /**
   * Get a theme by ID
   */
  get(themeId: string): Theme | undefined {
    return this.themes.get(themeId);
  }

  /**
   * Get all registered themes
   */
  getAll(): Theme[] {
    return Array.from(this.themes.values());
  }

  /**
   * Check if a theme is registered
   */
  has(themeId: string): boolean {
    return this.themes.has(themeId);
  }

  /**
   * Subscribe to an event
   */
  on<T extends ThemeEventType>(event: T, handler: ThemeEventHandler<T>): () => void {
    return this.eventBus.on(event, handler);
  }

  /**
   * Unsubscribe from an event
   */
  off<T extends ThemeEventType>(event: T, handler: ThemeEventHandler<T>): void {
    this.eventBus.off(event, handler);
  }

  /**
   * Get the CSS injector instance
   */
  getCSSInjector(): CSSInjector {
    return this.cssInjector;
  }

  /**
   * Get the AI orchestrator instance
   */
  getAIOrchestrator(): AIOrchestrator | null {
    return this.aiOrchestrator;
  }

  /**
   * Get AI configuration info (provider and model) for display
   */
  getAIConfig(): { provider: string; model?: string } | null {
    const ai = this.options.ai;
    if (!ai) return null;

    const provider =
      typeof ai.provider === 'string' ? ai.provider : ai.provider.name;
    return { provider, model: ai.model };
  }

  /**
   * Get the storage manager instance
   */
  getStorageManager(): StorageManager | null {
    return this.storageManager;
  }

  /**
   * Configure AI options
   */
  configureAI(options: AIOptions): void {
    this.aiOrchestrator = new AIOrchestrator(options);
  }

  /**
   * Configure storage options
   */
  configureStorage(options: StorageOptions): void {
    this.storageManager = new StorageManager(options);
  }

  /**
   * Configure CSS options
   */
  configureCSS(options: CSSOptions): void {
    this.cssInjector = new CSSInjector(options);
    // Re-apply active theme if exists
    if (this.activeTheme) {
      this.cssInjector.inject(this.activeTheme.tokens);
    }
  }

  /**
   * Destroy the theme manager and clean up
   */
  destroy(): void {
    this.cssInjector.clear();
    this.eventBus.clear();
    this.themes.clear();
    this.activeTheme = null;
    this.initialized = false;
  }
}
