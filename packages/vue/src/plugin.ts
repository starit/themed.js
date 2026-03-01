import type { App } from 'vue';
import { ref, shallowRef } from 'vue';
import {
  ThemeManager,
  type Theme,
  type ThemeChangedPayload,
  type AIOptions,
  type StorageOptions,
  type CSSOptions,
  builtinThemes,
} from '@themed.js/core';
import { THEMED_INJECTION_KEY, type ThemedInjection } from './keys';

/**
 * Plugin options
 */
export interface ThemedPluginOptions {
  /** Default theme to apply */
  defaultTheme?: string;
  /** Initial themes to register */
  themes?: Theme[];
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
 * Vue plugin for Themed.js
 *
 * @example
 * ```ts
 * import { createApp } from 'vue';
 * import { themedPlugin } from '@themed.js/vue';
 *
 * const app = createApp(App);
 *
 * app.use(themedPlugin, {
 *   defaultTheme: 'light',
 *   ai: {
 *     provider: 'openai',
 *     apiKey: 'sk-xxx',
 *   },
 * });
 *
 * app.mount('#app');
 * ```
 */
export const themedPlugin = {
  install(app: App, options: ThemedPluginOptions = {}) {
    // Create manager
    const manager = new ThemeManager({
      themes: [...builtinThemes, ...(options.themes ?? [])],
      defaultTheme: options.defaultTheme ?? 'light',
      ai: options.ai,
      storage: options.storage,
      css: options.css,
      debug: options.debug,
    });

    // Create reactive state
    const theme = shallowRef<Theme | null>(null);
    const themes = shallowRef<Theme[]>(manager.getAll());
    const initialized = ref(false);
    const isGenerating = ref(false);
    const aiError = shallowRef<Error | null>(null);
    const aiConfigVersion = ref(0);

    // Initialize manager
    manager.init().then(() => {
      theme.value = manager.getActive();
      themes.value = manager.getAll();
      initialized.value = true;
    });

    // Subscribe to events
    manager.on('theme:changed', ({ theme: newTheme }: ThemeChangedPayload) => {
      theme.value = newTheme;
    });

    manager.on('theme:registered', () => {
      themes.value = manager.getAll();
    });

    manager.on('theme:unregistered', () => {
      themes.value = manager.getAll();
    });

    const configureAI = (options: AIOptions) => {
      manager.configureAI(options);
      aiError.value = null;
      aiConfigVersion.value++;
    };

    // Provide injection
    const injection: ThemedInjection = {
      manager,
      get theme() {
        return theme.value;
      },
      get themes() {
        return themes.value;
      },
      get initialized() {
        return initialized.value;
      },
      get isGenerating() {
        return isGenerating.value;
      },
      get aiError() {
        return aiError.value;
      },
      get isAIConfigured() {
        aiConfigVersion.value; // Track for reactivity
        return manager.getAIOrchestrator() !== null;
      },
      get modelInfo() {
        aiConfigVersion.value; // Track for reactivity
        return manager.getAIConfig();
      },
      configureAI,
    };

    app.provide(THEMED_INJECTION_KEY, injection);

    // Make available via globalProperties for Options API
    app.config.globalProperties.$themed = {
      manager,
      apply: (themeId: string) => manager.apply(themeId),
      generate: async (prompt: string) => {
        isGenerating.value = true;
        aiError.value = null;
        try {
          const result = await manager.generate(prompt);
          themes.value = manager.getAll();
          return result;
        } catch (e) {
          aiError.value = e instanceof Error ? e : new Error(String(e));
          throw e;
        } finally {
          isGenerating.value = false;
        }
      },
    };
  },
};

// Type augmentation for globalProperties
declare module 'vue' {
  interface ComponentCustomProperties {
    $themed: {
      manager: ThemeManager;
      apply: (themeId: string) => Promise<void>;
      generate: (prompt: string, options?: { customSchema?: string }) => Promise<Theme>;
    };
  }
}
