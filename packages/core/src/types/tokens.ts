/**
 * Color tokens for theming
 */
export interface ColorTokens {
  // Semantic colors
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  error: string;
  warning: string;
  success: string;
  info: string;

  // Text colors
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  textInverse: string;

  // Border colors
  border: string;
  borderLight: string;
  borderDark: string;
}

/**
 * Typography tokens for theming
 */
export interface TypographyTokens {
  fontFamily: {
    sans: string;
    serif: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

/**
 * Combined theme tokens
 */
export interface ThemeTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
}

/**
 * Partial theme tokens for updates
 */
export interface PartialThemeTokens {
  colors?: Partial<ColorTokens>;
  typography?: Partial<TypographyTokens>;
}

/**
 * Default typography tokens
 */
export const defaultTypographyTokens: TypographyTokens = {
  fontFamily: {
    sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};
