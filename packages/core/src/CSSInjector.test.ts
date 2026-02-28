import { describe, it, expect, beforeEach } from 'vitest';
import { CSSInjector } from './CSSInjector';
import { lightTheme } from './themes';

describe('CSSInjector', () => {
  let injector: CSSInjector;

  beforeEach(() => {
    injector = new CSSInjector({ prefix: '--themed' });
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  describe('toCSSString', () => {
    it('returns CSS string with :root and variables', () => {
      const css = injector.toCSSString(lightTheme.tokens);
      expect(css).toMatch(/^:root \{\n/);
      expect(css).toContain('--themed-color-primary');
      expect(css).toContain(lightTheme.tokens.colors.primary);
    });

    it('uses custom selector when useRoot is false and target set', () => {
      const el = document.createElement('div');
      el.id = 'app';
      document.body.appendChild(el);
      const inj = new CSSInjector({ useRoot: false, target: el });
      const css = inj.toCSSString(lightTheme.tokens);
      expect(css).toMatch(/^#app \{\n/);
    });
  });

  describe('inject and clear', () => {
    it('injects style element into document.head', () => {
      injector.inject(lightTheme.tokens);

      const style = document.getElementById('themed-js-styles');
      expect(style).toBeInstanceOf(HTMLStyleElement);
      expect(style?.getAttribute('data-themed')).toBe('true');
      expect(style?.textContent).toContain('--themed-color-primary');
    });

    it('clear removes injected style', () => {
      injector.inject(lightTheme.tokens);
      expect(document.getElementById('themed-js-styles')).toBeTruthy();

      injector.clear();
      expect(document.getElementById('themed-js-styles')).toBeNull();
    });
  });

  describe('getResolver', () => {
    it('returns TokenResolver instance', () => {
      const resolver = injector.getResolver();
      expect(resolver).toBeDefined();
      expect(resolver.flatten(lightTheme.tokens)['color-primary']).toBe(
        lightTheme.tokens.colors.primary
      );
    });
  });
});
