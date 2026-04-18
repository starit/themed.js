import { describe, it, expect, vi } from 'vitest';
import { getSSRStyles } from './ssr';
import { ThemeManager } from './ThemeManager';
import { builtinThemes } from './themes';

describe('getSSRStyles', () => {
  it('returns a complete CSS block without touching the DOM', () => {
    const css = getSSRStyles('light', builtinThemes);
    expect(css).toContain(':root');
    expect(css).toContain('--themed');
  });

  it('contains colour tokens for the requested theme', () => {
    const css = getSSRStyles('light', builtinThemes);
    expect(css.length).toBeGreaterThan(100);
  });

  it('produces different output for different themes', () => {
    const light = getSSRStyles('light', builtinThemes);
    const dark = getSSRStyles('dark', builtinThemes);
    expect(light).not.toBe(dark);
  });

  it('returns empty string and warns when themeId is not found', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const css = getSSRStyles('nonexistent', builtinThemes);
    expect(css).toBe('');
    expect(warn).toHaveBeenCalledWith(
      '[themed.js] getSSRStyles: theme "nonexistent" not found'
    );
    warn.mockRestore();
  });

  it('respects a custom CSS prefix via cssOptions', () => {
    const css = getSSRStyles('light', builtinThemes, { prefix: '--my' });
    expect(css).toContain('--my');
    expect(css).not.toContain('--themed');
  });
});

describe('ThemeManager.getSSRStyles', () => {
  it('returns CSS for the default theme without init()', () => {
    const manager = new ThemeManager({
      themes: builtinThemes,
      defaultTheme: 'light',
    });
    const css = manager.getSSRStyles();
    expect(css).toContain(':root');
    expect(css).toContain('--themed');
  });

  it('returns CSS for a specific theme by id', () => {
    const manager = new ThemeManager({ themes: builtinThemes, defaultTheme: 'light' });
    const light = manager.getSSRStyles('light');
    const dark = manager.getSSRStyles('dark');
    expect(light).not.toBe(dark);
  });

  it('returns empty string for an unknown themeId', () => {
    const manager = new ThemeManager({ themes: builtinThemes, defaultTheme: 'light' });
    expect(manager.getSSRStyles('nope')).toBe('');
  });
});
