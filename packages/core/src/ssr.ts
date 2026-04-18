import { CSSInjector } from './CSSInjector';
import type { Theme } from './types/theme';
import type { CSSOptions } from './types/options';

/**
 * Generate CSS variable declarations for a theme without touching the DOM.
 * Use this on the server to inject initial styles into the HTML response,
 * preventing a flash of unstyled content (FOUC) on first paint.
 *
 * The returned string is a complete CSS block (e.g. `:root { --themed-... }`)
 * ready to drop into a <style> tag. Use an element with id="themed-js-styles"
 * so the client-side CSSInjector can find and update it without creating a duplicate.
 *
 * @example Next.js App Router (layout.tsx)
 * ```tsx
 * import { getSSRStyles, builtinThemes } from '@themed.js/core';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <head>
 *         <style
 *           id="themed-js-styles"
 *           data-themed="true"
 *           dangerouslySetInnerHTML={{ __html: getSSRStyles('light', builtinThemes) }}
 *         />
 *       </head>
 *       <body>{children}</body>
 *     </html>
 *   );
 * }
 * ```
 *
 * @example Nuxt 3 (plugins/themed.server.ts)
 * ```ts
 * import { getSSRStyles, builtinThemes } from '@themed.js/core';
 *
 * export default defineNuxtPlugin(() => {
 *   useHead({
 *     style: [{ id: 'themed-js-styles', innerHTML: getSSRStyles('light', builtinThemes) }],
 *   });
 * });
 * ```
 */
export function getSSRStyles(
  themeId: string,
  themes: Theme[],
  cssOptions?: CSSOptions
): string {
  const theme = themes.find((t) => t.id === themeId);
  if (!theme) {
    console.warn(`[themed.js] getSSRStyles: theme "${themeId}" not found`);
    return '';
  }
  const injector = new CSSInjector(cssOptions);
  return injector.toCSSString(theme.tokens);
}
