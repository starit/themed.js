import { getSSRStyles, builtinThemes } from '@themed.js/core';
import type { Theme, CSSOptions } from '@themed.js/core';

export interface ThemeScriptProps {
  /** Theme ID to pre-render. Should match the defaultTheme in ThemeProvider. */
  defaultTheme?: string;
  /** Themes to look up. Defaults to builtinThemes. Pass your custom themes if you've added any. */
  themes?: Theme[];
  /** CSS options — must match the css prop on your ThemeProvider. */
  css?: CSSOptions;
}

/**
 * Renders a <style> tag with the initial theme CSS variables.
 * Place this in the <head> of your SSR document to prevent a flash of
 * unstyled content (FOUC) before the client-side ThemeProvider initialises.
 *
 * The style element uses id="themed-js-styles" so the client-side CSSInjector
 * finds and updates it in place — no duplicate tags, no flicker.
 *
 * @example Next.js App Router (app/layout.tsx)
 * ```tsx
 * import { ThemeScript } from '@themed.js/react';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <head>
 *         <ThemeScript defaultTheme="light" />
 *       </head>
 *       <body>
 *         <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 *
 * @example Next.js Pages Router (pages/_document.tsx)
 * ```tsx
 * import { Html, Head, Main, NextScript } from 'next/document';
 * import { ThemeScript } from '@themed.js/react';
 *
 * export default function Document() {
 *   return (
 *     <Html>
 *       <Head>
 *         <ThemeScript defaultTheme="light" />
 *       </Head>
 *       <body><Main /><NextScript /></body>
 *     </Html>
 *   );
 * }
 * ```
 */
export function ThemeScript({ defaultTheme = 'light', themes = builtinThemes, css }: ThemeScriptProps) {
  const theme = themes.find((t) => t.id === defaultTheme) ?? themes[0];
  if (!theme) return null;

  const styles = getSSRStyles(theme.id, [theme], css);

  return (
    <style
      id="themed-js-styles"
      data-themed="true"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: intentional — server-generated CSS, not user input
      dangerouslySetInnerHTML={{ __html: styles }}
    />
  );
}
