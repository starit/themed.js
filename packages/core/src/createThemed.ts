import { ThemeManager } from './ThemeManager';
import type { ThemeManagerOptions } from './types/options';
import { builtinThemes } from './themes';

/**
 * Create a configured ThemeManager instance
 *
 * @example
 * ```ts
 * // Basic usage
 * const themed = createThemed();
 * await themed.init();
 * themed.apply('light');
 *
 * // With AI configuration
 * const themed = createThemed({
 *   ai: {
 *     provider: 'openai',
 *     apiKey: 'sk-xxx',
 *   },
 * });
 *
 * // Generate a theme
 * const theme = await themed.generate('A warm autumn theme');
 * ```
 */
export function createThemed(options: ThemeManagerOptions = {}): ThemeManager {
  // Include built-in themes by default
  const themes = [...builtinThemes, ...(options.themes ?? [])];

  // Set default theme if not specified
  const defaultTheme = options.defaultTheme ?? 'light';

  const manager = new ThemeManager({
    ...options,
    themes,
    defaultTheme,
  });

  return manager;
}

/**
 * Create and initialize a ThemeManager instance
 */
export async function createThemedAsync(
  options: ThemeManagerOptions = {}
): Promise<ThemeManager> {
  const manager = createThemed(options);
  await manager.init();
  return manager;
}
