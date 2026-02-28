import { describe, it, expect } from 'vitest';
import { TokenResolver } from './TokenResolver';
import { lightTheme } from './themes';

describe('TokenResolver', () => {
  const resolver = new TokenResolver({ prefix: '--themed' });

  describe('flatten', () => {
    it('flattens colors with kebab-case keys', () => {
      const flat = resolver.flatten(lightTheme.tokens);
      expect(flat['color-primary']).toBe(lightTheme.tokens.colors.primary);
      expect(flat['color-text-primary']).toBe(lightTheme.tokens.colors.textPrimary);
    });

    it('flattens typography', () => {
      const flat = resolver.flatten(lightTheme.tokens);
      expect(flat['font-family-sans']).toBe(lightTheme.tokens.typography.fontFamily.sans);
      expect(flat['font-size-base']).toBe(lightTheme.tokens.typography.fontSize.base);
      expect(flat['font-weight-bold']).toBe(lightTheme.tokens.typography.fontWeight.bold);
      expect(flat['line-height-normal']).toBe(lightTheme.tokens.typography.lineHeight.normal);
    });
  });

  describe('toCSSVariables', () => {
    it('prepends prefix to keys', () => {
      const vars = resolver.toCSSVariables(lightTheme.tokens);
      expect(vars['--themed-color-primary']).toBe(lightTheme.tokens.colors.primary);
      expect(Object.keys(vars).every((k) => k.startsWith('--themed-'))).toBe(true);
    });
  });

  describe('toCSSString', () => {
    it('returns valid CSS with :root by default', () => {
      const css = resolver.toCSSString(lightTheme.tokens);
      expect(css).toMatch(/^:root \{\n/);
      expect(css).toContain('--themed-color-primary:');
      expect(css).toContain(';');
      expect(css).toMatch(/\n\}$/);
    });

    it('uses custom selector when provided', () => {
      const css = resolver.toCSSString(lightTheme.tokens, '.app');
      expect(css).toMatch(/^\.app \{\n/);
    });
  });

  describe('getToken', () => {
    it('returns color by path', () => {
      expect(resolver.getToken(lightTheme.tokens, 'colors.primary')).toBe(
        lightTheme.tokens.colors.primary
      );
    });

    it('returns typography by path', () => {
      expect(resolver.getToken(lightTheme.tokens, 'typography.fontFamily.sans')).toBe(
        lightTheme.tokens.typography.fontFamily.sans
      );
    });

    it('returns undefined for invalid path', () => {
      expect(resolver.getToken(lightTheme.tokens, 'colors.nonexistent' as any)).toBeUndefined();
    });
  });

  describe('getVariableName', () => {
    it('returns CSS variable name for color path', () => {
      expect(resolver.getVariableName('colors.primary')).toBe('--themed-color-primary');
    });
  });

  describe('var', () => {
    it('returns var() reference without fallback', () => {
      expect(resolver.var('colors.primary')).toBe('var(--themed-color-primary)');
    });

    it('returns var() with fallback when provided', () => {
      expect(resolver.var('colors.primary', '#000')).toBe(
        'var(--themed-color-primary, #000)'
      );
    });
  });

  describe('custom prefix', () => {
    it('uses custom prefix when provided', () => {
      const custom = new TokenResolver({ prefix: '--app' });
      const vars = custom.toCSSVariables(lightTheme.tokens);
      expect(vars['--app-color-primary']).toBe(lightTheme.tokens.colors.primary);
    });
  });
});
