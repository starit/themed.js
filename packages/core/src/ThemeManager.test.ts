import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeManager } from './ThemeManager';
import { lightTheme, darkTheme } from './themes';
import { createTheme } from './types/theme';

describe('ThemeManager', () => {
  let manager: ThemeManager;

  beforeEach(() => {
    manager = new ThemeManager({
      themes: [lightTheme, darkTheme],
      defaultTheme: 'light',
      storage: { type: 'none' },
    });
  });

  describe('register and getAll', () => {
    it('starts with registered themes', () => {
      const all = manager.getAll();
      expect(all).toHaveLength(2);
      expect(all.map((t) => t.id)).toContain('light');
      expect(all.map((t) => t.id)).toContain('dark');
    });

    it('register adds a theme', () => {
      const custom = createTheme({
        id: 'custom',
        name: 'Custom',
        tokens: lightTheme.tokens,
      });
      manager.register(custom);
      expect(manager.getAll()).toHaveLength(3);
      expect(manager.get('custom')).toEqual(expect.objectContaining({ id: 'custom', name: 'Custom' }));
    });
  });

  describe('apply and getActive', () => {
    it('apply sets active theme and injects CSS', async () => {
      await manager.apply('dark');
      expect(manager.getActive()?.id).toBe('dark');
      const style = document.getElementById('themed-js-styles');
      expect(style?.textContent).toContain(darkTheme.tokens.colors.background);
    });

    it('apply switches theme', async () => {
      await manager.apply('light');
      expect(manager.getActive()?.id).toBe('light');
      await manager.apply('dark');
      expect(manager.getActive()?.id).toBe('dark');
    });

    it('throws when applying unknown theme id', async () => {
      await expect(manager.apply('nonexistent')).rejects.toThrow('Theme not found');
    });
  });

  describe('get and has', () => {
    it('get returns theme by id', () => {
      expect(manager.get('light')).toEqual(lightTheme);
      expect(manager.get('dark')).toEqual(darkTheme);
      expect(manager.get('missing')).toBeUndefined();
    });

    it('has returns boolean', () => {
      expect(manager.has('light')).toBe(true);
      expect(manager.has('missing')).toBe(false);
    });
  });

  describe('unregister', () => {
    it('unregister removes theme', () => {
      expect(manager.has('dark')).toBe(true);
      const removed = manager.unregister('dark');
      expect(removed).toBe(true);
      expect(manager.has('dark')).toBe(false);
      expect(manager.getAll()).toHaveLength(1);
    });

    it('unregister returns false for unknown id', () => {
      expect(manager.unregister('missing')).toBe(false);
    });
  });

  describe('destroy', () => {
    it('clears state and DOM', async () => {
      await manager.apply('dark');
      expect(manager.getActive()).toBeTruthy();
      manager.destroy();
      expect(manager.getActive()).toBeNull();
      expect(manager.getAll()).toHaveLength(0);
      expect(document.getElementById('themed-js-styles')).toBeNull();
    });
  });
});
