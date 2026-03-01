import type { Message } from './providers/base';
import type { Theme } from '../types/theme';
import type { ThemeTokens, ColorTokens, TypographyTokens } from '../types/tokens';
import {
  defaultTypographyTokens,
  defaultSpacingTokens,
  defaultRadiusTokens,
  defaultShadowTokens,
  defaultTransitionTokens,
} from '../types/tokens';

/**
 * System prompt for theme generation
 */
const SYSTEM_PROMPT = `You are a professional UI/UX designer and color theory expert. Your task is to generate beautiful, harmonious color themes for web applications.

When generating a theme, you MUST respond with ONLY a valid JSON object containing the theme tokens. No explanations, no markdown code blocks, just pure JSON.

The JSON must follow this exact structure:
{
  "colors": {
    "primary": "#hex",      // Main brand color
    "secondary": "#hex",    // Secondary brand color
    "accent": "#hex",       // Accent color for highlights
    "background": "#hex",   // Page background
    "surface": "#hex",      // Card/component background
    "error": "#hex",        // Error state color
    "warning": "#hex",      // Warning state color
    "success": "#hex",      // Success state color
    "info": "#hex",         // Info state color
    "textPrimary": "#hex",  // Main text color
    "textSecondary": "#hex",// Secondary text color
    "textDisabled": "#hex", // Disabled text color
    "textInverse": "#hex",  // Text on dark/light backgrounds
    "border": "#hex",       // Default border color
    "borderLight": "#hex",  // Light border color
    "borderDark": "#hex"    // Dark border color
  },
  "typography": {
    "fontFamily": {
      "sans": "font-family string",
      "serif": "font-family string",
      "mono": "font-family string"
    },
    "fontSize": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem"
    },
    "fontWeight": {
      "light": 300,
      "normal": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    },
    "lineHeight": {
      "tight": 1.25,
      "normal": 1.5,
      "relaxed": 1.75
    }
  }
}

Guidelines for color generation:
1. Ensure sufficient contrast between text and background colors (WCAG AA compliance)
2. Create a cohesive palette with harmonious colors
3. Consider the mood and tone requested by the user
4. Use appropriate colors for semantic states (error=red tones, success=green tones, etc.)
5. Text colors should be readable on their intended backgrounds`;

/**
 * Prompt engine for building AI prompts
 */
export class PromptEngine {
  private systemPrompt: string;

  constructor(customSystemPrompt?: string) {
    this.systemPrompt = customSystemPrompt ?? SYSTEM_PROMPT;
  }

  /**
   * Build messages for generating a new theme
   */
  buildGeneratePrompt(userPrompt: string): Message[] {
    return [
      {
        role: 'system',
        content: this.systemPrompt,
      },
      {
        role: 'user',
        content: `Generate a theme based on this description: "${userPrompt}"

Remember: Respond with ONLY the JSON object, no other text or formatting.`,
      },
    ];
  }

  /**
   * Build messages for adjusting an existing theme
   */
  buildAdjustPrompt(theme: Theme, instruction: string): Message[] {
    return [
      {
        role: 'system',
        content: this.systemPrompt,
      },
      {
        role: 'user',
        content: `Here is the current theme:

${JSON.stringify(theme.tokens, null, 2)}

Please modify this theme according to the following instruction: "${instruction}"

Remember: Respond with ONLY the complete JSON object (including both colors and typography), no other text or formatting.`,
      },
    ];
  }

  /**
   * Parse AI response to ThemeTokens
   */
  parseResponse(response: string): ThemeTokens {
    // Try to extract JSON from the response
    let jsonStr = response.trim();

    // Remove markdown code blocks if present
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }

    // Try to find JSON object in the response
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (error) {
      throw new Error(`Failed to parse AI response as JSON: ${error}`);
    }

    // Validate and normalize the response
    return this.normalizeTokens(parsed);
  }

  /**
   * Normalize and validate parsed tokens
   */
  private normalizeTokens(parsed: unknown): ThemeTokens {
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Invalid theme tokens: expected an object');
    }

    const obj = parsed as Record<string, unknown>;

    // Validate colors
    if (!obj.colors || typeof obj.colors !== 'object') {
      throw new Error('Invalid theme tokens: missing or invalid colors');
    }

    const colors = this.normalizeColors(obj.colors as Record<string, unknown>);

    // Use default typography if not provided or merge with defaults
    let typography: TypographyTokens;
    if (obj.typography && typeof obj.typography === 'object') {
      typography = this.normalizeTypography(obj.typography as Record<string, unknown>);
    } else {
      typography = { ...defaultTypographyTokens };
    }

    // Spacing, radius, shadow, transition: use defaults (AI only generates colors/typography for now)
    const spacing = defaultSpacingTokens;
    const radius = defaultRadiusTokens;
    const shadow = defaultShadowTokens;
    const transition = defaultTransitionTokens;

    return { colors, typography, spacing, radius, shadow, transition };
  }

  /**
   * Normalize color tokens
   */
  private normalizeColors(colors: Record<string, unknown>): ColorTokens {
    const requiredColors: (keyof ColorTokens)[] = [
      'primary',
      'secondary',
      'accent',
      'background',
      'surface',
      'error',
      'warning',
      'success',
      'info',
      'textPrimary',
      'textSecondary',
      'textDisabled',
      'textInverse',
      'border',
      'borderLight',
      'borderDark',
    ];

    const result: Partial<ColorTokens> = {};

    for (const key of requiredColors) {
      const value = colors[key];
      if (typeof value === 'string' && this.isValidColor(value)) {
        result[key] = value;
      } else {
        // Generate fallback colors based on primary/background
        result[key] = this.generateFallbackColor(key, colors);
      }
    }

    return result as ColorTokens;
  }

  /**
   * Normalize typography tokens
   */
  private normalizeTypography(typography: Record<string, unknown>): TypographyTokens {
    return {
      fontFamily: {
        sans:
          (typography.fontFamily as Record<string, string>)?.sans ??
          defaultTypographyTokens.fontFamily.sans,
        serif:
          (typography.fontFamily as Record<string, string>)?.serif ??
          defaultTypographyTokens.fontFamily.serif,
        mono:
          (typography.fontFamily as Record<string, string>)?.mono ??
          defaultTypographyTokens.fontFamily.mono,
      },
      fontSize: {
        xs:
          (typography.fontSize as Record<string, string>)?.xs ??
          defaultTypographyTokens.fontSize.xs,
        sm:
          (typography.fontSize as Record<string, string>)?.sm ??
          defaultTypographyTokens.fontSize.sm,
        base:
          (typography.fontSize as Record<string, string>)?.base ??
          defaultTypographyTokens.fontSize.base,
        lg:
          (typography.fontSize as Record<string, string>)?.lg ??
          defaultTypographyTokens.fontSize.lg,
        xl:
          (typography.fontSize as Record<string, string>)?.xl ??
          defaultTypographyTokens.fontSize.xl,
        '2xl':
          (typography.fontSize as Record<string, string>)?.['2xl'] ??
          defaultTypographyTokens.fontSize['2xl'],
        '3xl':
          (typography.fontSize as Record<string, string>)?.['3xl'] ??
          defaultTypographyTokens.fontSize['3xl'],
      },
      fontWeight: {
        light:
          (typography.fontWeight as Record<string, number>)?.light ??
          defaultTypographyTokens.fontWeight.light,
        normal:
          (typography.fontWeight as Record<string, number>)?.normal ??
          defaultTypographyTokens.fontWeight.normal,
        medium:
          (typography.fontWeight as Record<string, number>)?.medium ??
          defaultTypographyTokens.fontWeight.medium,
        semibold:
          (typography.fontWeight as Record<string, number>)?.semibold ??
          defaultTypographyTokens.fontWeight.semibold,
        bold:
          (typography.fontWeight as Record<string, number>)?.bold ??
          defaultTypographyTokens.fontWeight.bold,
      },
      lineHeight: {
        tight:
          (typography.lineHeight as Record<string, number>)?.tight ??
          defaultTypographyTokens.lineHeight.tight,
        normal:
          (typography.lineHeight as Record<string, number>)?.normal ??
          defaultTypographyTokens.lineHeight.normal,
        relaxed:
          (typography.lineHeight as Record<string, number>)?.relaxed ??
          defaultTypographyTokens.lineHeight.relaxed,
      },
    };
  }

  /**
   * Check if a string is a valid CSS color
   */
  private isValidColor(color: string): boolean {
    // Basic hex color validation
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(color)) {
      return true;
    }
    // RGB/RGBA
    if (/^rgba?\([\d\s,%.]+\)$/.test(color)) {
      return true;
    }
    // HSL/HSLA
    if (/^hsla?\([\d\s,%.]+\)$/.test(color)) {
      return true;
    }
    // Named colors (basic check)
    if (/^[a-zA-Z]+$/.test(color) && color.length <= 20) {
      return true;
    }
    return false;
  }

  /**
   * Generate fallback color for missing tokens
   */
  private generateFallbackColor(
    key: keyof ColorTokens,
    _colors: Record<string, unknown>
  ): string {
    // Fallback color map
    const fallbacks: Record<keyof ColorTokens, string> = {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#f59e0b',
      background: '#ffffff',
      surface: '#f8fafc',
      error: '#ef4444',
      warning: '#f59e0b',
      success: '#22c55e',
      info: '#3b82f6',
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
      textDisabled: '#9ca3af',
      textInverse: '#ffffff',
      border: '#e5e7eb',
      borderLight: '#f3f4f6',
      borderDark: '#d1d5db',
    };

    return fallbacks[key];
  }
}
