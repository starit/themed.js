import type { Metadata } from 'next';
import { getSSRStyles, builtinThemes } from '@themed.js/core';
import './globals.css';

export const metadata: Metadata = {
  title: 'Themed.js — Next.js Demo',
  description: 'AI theme generation via a server-side API proxy — API key never reaches the browser',
};

// Inject initial light-theme CSS at server render time to prevent FOUC.
// The client-side ThemeProvider will update this <style> element after hydration.
const ssrStyles = getSSRStyles('light', builtinThemes);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style
          id="themed-js-styles"
          data-themed="true"
          dangerouslySetInnerHTML={{ __html: ssrStyles }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
