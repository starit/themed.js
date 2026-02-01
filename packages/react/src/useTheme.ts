import { useContext, useCallback } from 'react';
import type { Theme, ThemeInput } from '@themed.js/core';
import { ThemeContext } from './context';

/**
 * useTheme hook return type
 */
export interface UseThemeReturn {
  /** Current active theme */
  theme: Theme | null;
  /** All registered themes */
  themes: Theme[];
  /** Whether the theme manager is initialized */
  initialized: boolean;
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
}

/**
 * Hook to access theme state and actions
 *
 * @example
 * ```tsx
 * function ThemeSwitcher() {
 *   const { theme, themes, apply } = useTheme();
 *
 *   return (
 *     <div>
 *       <p>Current: {theme?.name}</p>
 *       {themes.map(t => (
 *         <button key={t.id} onClick={() => apply(t.id)}>
 *           {t.name}
 *         </button>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useTheme(): UseThemeReturn {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  const { manager, theme, themes, initialized } = context;

  const apply = useCallback(
    async (themeId: string) => {
      await manager.apply(themeId);
    },
    [manager]
  );

  const register = useCallback(
    (themeData: Theme | ThemeInput) => {
      manager.register(themeData);
    },
    [manager]
  );

  const unregister = useCallback(
    (themeId: string) => {
      return manager.unregister(themeId);
    },
    [manager]
  );

  const has = useCallback(
    (themeId: string) => {
      return manager.has(themeId);
    },
    [manager]
  );

  const get = useCallback(
    (themeId: string) => {
      return manager.get(themeId);
    },
    [manager]
  );

  return {
    theme,
    themes,
    initialized,
    apply,
    register,
    unregister,
    has,
    get,
  };
}
