import { describe, it, expect } from 'vitest';
import { createTheme, isValidTheme } from './theme';
import { lightTheme } from '../themes';
import type { ThemeInput } from './theme';
import { defaultTypographyTokens } from './tokens';

describe('createTheme', () => {
  it('creates a theme from input with required fields', () => {
    const input: ThemeInput = {
      id: 'test',
      name: 'Test Theme',
      tokens: lightTheme.tokens,
    };
    const theme = createTheme(input);

    expect(theme.id).toBe('test');
    expect(theme.name).toBe('Test Theme');
    expect(theme.tokens).toEqual(lightTheme.tokens);
    expect(theme.meta.version).toBe('1.0.0');
    expect(theme.meta.source).toBe('user');
    expect(theme.meta.createdAt).toBeGreaterThan(0);
  });

  it('uses provided source and description', () => {
    const input: ThemeInput = {
      id: 'ai-1',
      name: 'AI Theme',
      description: 'Generated',
      tokens: lightTheme.tokens,
      source: 'ai',
    };
    const theme = createTheme(input);

    expect(theme.description).toBe('Generated');
    expect(theme.meta.source).toBe('ai');
  });
});

describe('isValidTheme', () => {
  it('returns true for a valid theme', () => {
    expect(isValidTheme(lightTheme)).toBe(true);
    expect(isValidTheme(createTheme({ id: 'x', name: 'X', tokens: lightTheme.tokens }))).toBe(true);
  });

  it('returns false for null or non-object', () => {
    expect(isValidTheme(null)).toBe(false);
    expect(isValidTheme(undefined)).toBe(false);
    expect(isValidTheme('string')).toBe(false);
    expect(isValidTheme(42)).toBe(false);
  });

  it('returns false when id is missing or empty', () => {
    expect(isValidTheme({ ...lightTheme, id: '' })).toBe(false);
    expect(isValidTheme({ ...lightTheme, id: (null as unknown) as string })).toBe(false);
  });

  it('returns false when name is missing or empty', () => {
    expect(isValidTheme({ ...lightTheme, name: '' })).toBe(false);
  });

  it('returns false when tokens is missing or invalid', () => {
    expect(isValidTheme({ ...lightTheme, tokens: null as unknown as typeof lightTheme.tokens })).toBe(false);
    expect(isValidTheme({ ...lightTheme, tokens: {} as typeof lightTheme.tokens })).toBe(false);
  });

  it('returns false when tokens.colors or tokens.typography is missing', () => {
    expect(
      isValidTheme({
        ...lightTheme,
        tokens: { ...lightTheme.tokens, colors: null as unknown as typeof lightTheme.tokens.colors },
      })
    ).toBe(false);
    expect(
      isValidTheme({
        ...lightTheme,
        tokens: { ...lightTheme.tokens, typography: null as unknown as typeof defaultTypographyTokens },
      })
    ).toBe(false);
  });
});
