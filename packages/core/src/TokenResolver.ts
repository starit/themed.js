import type { ThemeTokens, ColorTokens, TypographyTokens } from './types/tokens';

/**
 * Token path type for nested access
 */
export type TokenPath =
  | `colors.${keyof ColorTokens}`
  | `typography.fontFamily.${keyof TypographyTokens['fontFamily']}`
  | `typography.fontSize.${keyof TypographyTokens['fontSize']}`
  | `typography.fontWeight.${keyof TypographyTokens['fontWeight']}`
  | `typography.lineHeight.${keyof TypographyTokens['lineHeight']}`;

/**
 * Flattened tokens map
 */
export type FlattenedTokens = Record<string, string | number>;

/**
 * Token resolver for converting nested tokens to flat CSS variables
 */
export class TokenResolver {
  private prefix: string;

  constructor(options: { prefix?: string } = {}) {
    this.prefix = options.prefix ?? '--themed';
  }

  /**
   * Flatten nested tokens to a flat map
   */
  flatten(tokens: ThemeTokens): FlattenedTokens {
    const result: FlattenedTokens = {};

    // Flatten colors
    for (const [key, value] of Object.entries(tokens.colors)) {
      result[`color-${this.camelToKebab(key)}`] = value;
    }

    // Flatten typography
    const { typography } = tokens;

    // Font families
    for (const [key, value] of Object.entries(typography.fontFamily)) {
      result[`font-family-${key}`] = value;
    }

    // Font sizes
    for (const [key, value] of Object.entries(typography.fontSize)) {
      result[`font-size-${key}`] = value;
    }

    // Font weights
    for (const [key, value] of Object.entries(typography.fontWeight)) {
      result[`font-weight-${key}`] = value;
    }

    // Line heights
    for (const [key, value] of Object.entries(typography.lineHeight)) {
      result[`line-height-${key}`] = value;
    }

    return result;
  }

  /**
   * Convert flattened tokens to CSS variables
   */
  toCSSVariables(tokens: ThemeTokens): Record<string, string> {
    const flat = this.flatten(tokens);
    const result: Record<string, string> = {};

    for (const [key, value] of Object.entries(flat)) {
      const varName = `${this.prefix}-${key}`;
      result[varName] = String(value);
    }

    return result;
  }

  /**
   * Generate CSS string from tokens
   */
  toCSSString(tokens: ThemeTokens, selector = ':root'): string {
    const variables = this.toCSSVariables(tokens);
    const lines = Object.entries(variables)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n');

    return `${selector} {\n${lines}\n}`;
  }

  /**
   * Get a specific token value by path
   */
  getToken(tokens: ThemeTokens, path: TokenPath): string | number | undefined {
    const parts = path.split('.');
    let current: unknown = tokens;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }

    return current as string | number | undefined;
  }

  /**
   * Get the CSS variable name for a token path
   */
  getVariableName(path: TokenPath): string {
    const parts = path.split('.');

    if (parts[0] === 'colors') {
      return `${this.prefix}-color-${this.camelToKebab(parts[1])}`;
    }

    if (parts[0] === 'typography') {
      return `${this.prefix}-${parts[1].replace(/([A-Z])/g, '-$1').toLowerCase()}-${parts[2]}`;
    }

    return `${this.prefix}-${parts.join('-')}`;
  }

  /**
   * Get CSS var() reference for a token path
   */
  var(path: TokenPath, fallback?: string): string {
    const varName = this.getVariableName(path);
    return fallback ? `var(${varName}, ${fallback})` : `var(${varName})`;
  }

  /**
   * Convert camelCase to kebab-case
   */
  private camelToKebab(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
}
