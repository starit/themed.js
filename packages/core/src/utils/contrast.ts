import { getLuminance, lighten, darken, isLight } from './color';

/**
 * WCAG contrast ratio levels
 */
export type ContrastLevel = 'AA' | 'AAA' | 'AA-large' | 'fail';

/**
 * WCAG contrast requirements
 */
const WCAG_REQUIREMENTS = {
  'AAA': 7,
  'AA': 4.5,
  'AA-large': 3,
} as const;

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 and 21
 */
export function getContrastRatio(foreground: string, background: string): number {
  const lum1 = getLuminance(foreground);
  const lum2 = getLuminance(background);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG requirements
 */
export function meetsContrastRequirement(
  foreground: string,
  background: string,
  level: keyof typeof WCAG_REQUIREMENTS = 'AA'
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return ratio >= WCAG_REQUIREMENTS[level];
}

/**
 * Get the WCAG compliance level for a color pair
 */
export function getContrastLevel(foreground: string, background: string): ContrastLevel {
  const ratio = getContrastRatio(foreground, background);

  if (ratio >= WCAG_REQUIREMENTS['AAA']) return 'AAA';
  if (ratio >= WCAG_REQUIREMENTS['AA']) return 'AA';
  if (ratio >= WCAG_REQUIREMENTS['AA-large']) return 'AA-large';
  return 'fail';
}

/**
 * Find a color that meets contrast requirements against a background
 */
export function findAccessibleColor(
  startColor: string,
  background: string,
  targetRatio = WCAG_REQUIREMENTS['AA'],
  maxIterations = 20
): string {
  let color = startColor;
  let ratio = getContrastRatio(color, background);

  if (ratio >= targetRatio) return color;

  // Determine if we need to lighten or darken
  const backgroundIsLight = isLight(background);
  const adjust = backgroundIsLight ? darken : lighten;

  for (let i = 0; i < maxIterations && ratio < targetRatio; i++) {
    color = adjust(color, 5);
    ratio = getContrastRatio(color, background);
  }

  return color;
}

/**
 * Suggest a readable text color for a given background
 */
export function suggestTextColor(background: string): string {
  const lightText = '#ffffff';
  const darkText = '#1f2937';

  const lightRatio = getContrastRatio(lightText, background);
  const darkRatio = getContrastRatio(darkText, background);

  return lightRatio > darkRatio ? lightText : darkText;
}

/**
 * Check all text colors against backgrounds and report issues
 */
export interface ContrastReport {
  pair: [string, string];
  names: [string, string];
  ratio: number;
  level: ContrastLevel;
  passes: boolean;
}

export function generateContrastReport(
  colors: Record<string, string>,
  textKeys: string[],
  backgroundKeys: string[],
  requiredLevel: keyof typeof WCAG_REQUIREMENTS = 'AA'
): ContrastReport[] {
  const reports: ContrastReport[] = [];

  for (const textKey of textKeys) {
    for (const bgKey of backgroundKeys) {
      const textColor = colors[textKey];
      const bgColor = colors[bgKey];

      if (!textColor || !bgColor) continue;

      const ratio = getContrastRatio(textColor, bgColor);
      const level = getContrastLevel(textColor, bgColor);

      reports.push({
        pair: [textColor, bgColor],
        names: [textKey, bgKey],
        ratio: Math.round(ratio * 100) / 100,
        level,
        passes: ratio >= WCAG_REQUIREMENTS[requiredLevel],
      });
    }
  }

  return reports;
}

/**
 * Format contrast ratio for display
 */
export function formatContrastRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`;
}
