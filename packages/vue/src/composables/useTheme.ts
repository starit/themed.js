import { inject, computed, type ComputedRef } from 'vue';
import type { Theme, ThemeInput } from '@themed.js/core';
import { THEMED_INJECTION_KEY } from '../keys';

/**
 * useTheme composable return type
 */
export interface UseThemeReturn {
  /** Current active theme */
  theme: ComputedRef<Theme | null>;
  /** All registered themes */
  themes: ComputedRef<Theme[]>;
  /** Whether the theme manager is initialized */
  initialized: ComputedRef<boolean>;
  /** Apply a theme by ID */
  apply: (themeId: string) => Promise<void>;
  /** Register a new theme */
  register: (theme: Theme | ThemeInput) => void;
  /** Unregister a theme */
  unregister: (themeId: string) => boolean;
  /** Check if a theme exists */
  has: (themeId: string) => boolean;
  /** Get a theme by ID */
  get: (themeId: string) => Theme | undefined;
  /** Update a theme's custom data */
  updateThemeCustom: (themeId: string, custom: Record<string, unknown>) => void;
}

/**
 * Composable to access theme state and actions
 *
 * @example
 * ```vue
 * <script setup>
 * import { useTheme } from '@themed.js/vue';
 *
 * const { theme, themes, apply } = useTheme();
 * </script>
 *
 * <template>
 *   <div>
 *     <p>Current: {{ theme?.name }}</p>
 *     <button
 *       v-for="t in themes"
 *       :key="t.id"
 *       @click="apply(t.id)"
 *     >
 *       {{ t.name }}
 *     </button>
 *   </div>
 * </template>
 * ```
 */
export function useTheme(): UseThemeReturn {
  const injection = inject(THEMED_INJECTION_KEY);

  if (!injection) {
    throw new Error('useTheme must be used within a Vue app that has installed themedPlugin');
  }

  const { manager } = injection;

  const theme = computed(() => injection.theme);
  const themes = computed(() => injection.themes);
  const initialized = computed(() => injection.initialized);

  const apply = async (themeId: string) => {
    await manager.apply(themeId);
  };

  const register = (themeData: Theme | ThemeInput) => {
    manager.register(themeData);
  };

  const unregister = (themeId: string) => {
    return manager.unregister(themeId);
  };

  const has = (themeId: string) => {
    return manager.has(themeId);
  };

  const get = (themeId: string) => {
    return manager.get(themeId);
  };

  const updateThemeCustom = (themeId: string, custom: Record<string, unknown>) => {
    manager.updateThemeCustom(themeId, custom);
  };

  return {
    theme,
    themes,
    initialized,
    apply,
    register,
    unregister,
    has,
    get,
    updateThemeCustom,
  };
}
