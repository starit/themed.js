import type { Theme } from '../types/theme';

/**
 * Storage keys
 */
export interface StorageKeys {
  activeTheme: string;
  themes: string;
}

/**
 * LocalStorage adapter for theme persistence
 */
export class LocalStorageAdapter {
  private keys: StorageKeys;

  constructor(prefix = 'themed') {
    this.keys = {
      activeTheme: `${prefix}:activeTheme`,
      themes: `${prefix}:themes`,
    };
  }

  /**
   * Check if localStorage is available
   */
  isAvailable(): boolean {
    try {
      const test = '__themed_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the active theme ID
   */
  getActiveThemeId(): string | null {
    if (!this.isAvailable()) return null;
    return localStorage.getItem(this.keys.activeTheme);
  }

  /**
   * Set the active theme ID
   */
  setActiveThemeId(themeId: string): void {
    if (!this.isAvailable()) return;
    localStorage.setItem(this.keys.activeTheme, themeId);
  }

  /**
   * Get all saved themes
   */
  getThemes(): Theme[] {
    if (!this.isAvailable()) return [];

    const data = localStorage.getItem(this.keys.themes);
    if (!data) return [];

    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /**
   * Save a theme
   */
  saveTheme(theme: Theme): void {
    if (!this.isAvailable()) return;

    const themes = this.getThemes();
    const existingIndex = themes.findIndex((t) => t.id === theme.id);

    if (existingIndex >= 0) {
      themes[existingIndex] = {
        ...theme,
        meta: { ...theme.meta, updatedAt: Date.now() },
      };
    } else {
      themes.push(theme);
    }

    localStorage.setItem(this.keys.themes, JSON.stringify(themes));
  }

  /**
   * Remove a theme
   */
  removeTheme(themeId: string): void {
    if (!this.isAvailable()) return;

    const themes = this.getThemes();
    const filtered = themes.filter((t) => t.id !== themeId);
    localStorage.setItem(this.keys.themes, JSON.stringify(filtered));
  }

  /**
   * Get a specific theme by ID
   */
  getTheme(themeId: string): Theme | null {
    const themes = this.getThemes();
    return themes.find((t) => t.id === themeId) ?? null;
  }

  /**
   * Clear all stored data
   */
  clear(): void {
    if (!this.isAvailable()) return;

    localStorage.removeItem(this.keys.activeTheme);
    localStorage.removeItem(this.keys.themes);
  }

  /**
   * Get storage usage in bytes
   */
  getUsage(): number {
    if (!this.isAvailable()) return 0;

    let total = 0;
    for (const key of Object.values(this.keys)) {
      const item = localStorage.getItem(key);
      if (item) {
        total += item.length * 2; // UTF-16 encoding
      }
    }
    return total;
  }
}
