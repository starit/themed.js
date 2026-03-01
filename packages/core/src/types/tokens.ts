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
 * Spacing tokens for layout (margin, padding, gap)
 */
export interface SpacingTokens {
  none: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

/**
 * Radius tokens for border-radius (buttons, cards, inputs)
 */
export interface RadiusTokens {
  none: string;
  sm: string;
  md: string;
  lg: string;
  full: string;
}

/**
 * Shadow tokens for elevation (box-shadow)
 */
export interface ShadowTokens {
  none: string;
  sm: string;
  md: string;
  lg: string;
}

/**
 * Transition duration tokens for animations
 */
export interface TransitionTokens {
  fast: string;
  normal: string;
  slow: string;
}

/**
 * Combined theme tokens
 */
export interface ThemeTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing?: SpacingTokens;
  radius?: RadiusTokens;
  shadow?: ShadowTokens;
  transition?: TransitionTokens;
}

/**
 * Partial theme tokens for updates
 */
export interface PartialThemeTokens {
  colors?: Partial<ColorTokens>;
  typography?: Partial<TypographyTokens>;
  spacing?: Partial<SpacingTokens>;
  radius?: Partial<RadiusTokens>;
  shadow?: Partial<ShadowTokens>;
  transition?: Partial<TransitionTokens>;
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

/**
 * Default spacing tokens (rem)
 */
export const defaultSpacingTokens: SpacingTokens = {
  none: '0',
  xs: '0.25rem',
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  '2xl': '2rem',
};

/**
 * Default radius tokens
 */
export const defaultRadiusTokens: RadiusTokens = {
  none: '0',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  full: '9999px',
};

/**
 * Default shadow tokens (neutral, work on light and dark)
 */
export const defaultShadowTokens: ShadowTokens = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
};

/**
 * Default transition duration tokens
 */
export const defaultTransitionTokens: TransitionTokens = {
  fast: '150ms',
  normal: '250ms',
  slow: '400ms',
};
