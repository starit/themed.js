import type { Theme } from '../types/theme';
import type { StorageOptions, StorageType } from '../types/options';
import { LocalStorageAdapter } from './LocalStorageAdapter';
import { IndexedDBAdapter } from './IndexedDBAdapter';

/**
 * Unified storage manager that wraps different storage adapters
 */
export class StorageManager {
  private localStorage: LocalStorageAdapter | null = null;
  private indexedDB: IndexedDBAdapter | null = null;
  private options: Required<Pick<StorageOptions, 'type' | 'prefix' | 'autoSave' | 'autoLoad'>>;
  private initialized = false;

  constructor(options: StorageOptions = {}) {
    this.options = {
      type: options.type ?? 'localStorage',
      prefix: options.prefix ?? 'themed',
      autoSave: options.autoSave ?? true,
      autoLoad: options.autoLoad ?? true,
    };

    // Initialize adapters based on type
    if (this.options.type === 'localStorage' || this.options.type === 'indexedDB') {
      this.localStorage = new LocalStorageAdapter(this.options.prefix);
    }

    if (this.options.type === 'indexedDB') {
      this.indexedDB = new IndexedDBAdapter(options.dbName ?? 'themed-js');
    }
  }

  /**
   * Initialize storage (required for IndexedDB)
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    if (this.indexedDB) {
      await this.indexedDB.init();
    }

    this.initialized = true;
  }

  /**
   * Get the active theme ID
   */
  async getActiveThemeId(): Promise<string | null> {
    await this.init();

    // Always use localStorage for active theme ID (faster)
    if (this.localStorage) {
      return this.localStorage.getActiveThemeId();
    }

    return null;
  }

  /**
   * Set the active theme ID
   */
  async setActiveThemeId(themeId: string): Promise<void> {
    await this.init();

    if (this.localStorage) {
      this.localStorage.setActiveThemeId(themeId);
    }
  }

  /**
   * Get all saved themes
   */
  async getThemes(): Promise<Theme[]> {
    await this.init();

    // Prefer IndexedDB for full theme data
    if (this.indexedDB) {
      return this.indexedDB.getThemes();
    }

    if (this.localStorage) {
      return this.localStorage.getThemes();
    }

    return [];
  }

  /**
   * Save a theme
   */
  async saveTheme(theme: Theme): Promise<void> {
    await this.init();

    // Save to IndexedDB for full data
    if (this.indexedDB) {
      await this.indexedDB.saveTheme(theme);
    } else if (this.localStorage) {
      // Fall back to localStorage
      this.localStorage.saveTheme(theme);
    }
  }

  /**
   * Save multiple themes
   */
  async saveThemes(themes: Theme[]): Promise<void> {
    for (const theme of themes) {
      await this.saveTheme(theme);
    }
  }

  /**
   * Remove a theme
   */
  async removeTheme(themeId: string): Promise<void> {
    await this.init();

    if (this.indexedDB) {
      await this.indexedDB.removeTheme(themeId);
    } else if (this.localStorage) {
      this.localStorage.removeTheme(themeId);
    }
  }

  /**
   * Get a specific theme by ID
   */
  async getTheme(themeId: string): Promise<Theme | null> {
    await this.init();

    if (this.indexedDB) {
      return this.indexedDB.getTheme(themeId);
    }

    if (this.localStorage) {
      return this.localStorage.getTheme(themeId);
    }

    return null;
  }

  /**
   * Check if a theme exists
   */
  async hasTheme(themeId: string): Promise<boolean> {
    const theme = await this.getTheme(themeId);
    return theme !== null;
  }

  /**
   * Clear all stored data
   */
  async clear(): Promise<void> {
    await this.init();

    if (this.indexedDB) {
      await this.indexedDB.clear();
    }

    if (this.localStorage) {
      this.localStorage.clear();
    }
  }

  /**
   * Get the storage type being used
   */
  getType(): StorageType {
    return this.options.type;
  }

  /**
   * Export all data
   */
  async export(): Promise<{ activeThemeId: string | null; themes: Theme[] }> {
    const [activeThemeId, themes] = await Promise.all([
      this.getActiveThemeId(),
      this.getThemes(),
    ]);

    return { activeThemeId, themes };
  }

  /**
   * Import data
   */
  async import(data: { activeThemeId?: string | null; themes?: Theme[] }): Promise<void> {
    if (data.themes) {
      await this.saveThemes(data.themes);
    }

    if (data.activeThemeId) {
      await this.setActiveThemeId(data.activeThemeId);
    }
  }

  /**
   * Destroy and clean up
   */
  destroy(): void {
    if (this.indexedDB) {
      this.indexedDB.close();
    }
  }
}
