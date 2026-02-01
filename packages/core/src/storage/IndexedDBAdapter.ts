import type { Theme } from '../types/theme';

/**
 * IndexedDB adapter for theme persistence
 * Better for storing larger theme data with full metadata
 */
export class IndexedDBAdapter {
  private dbName: string;
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  private static readonly STORES = {
    themes: 'themes',
    settings: 'settings',
  } as const;

  constructor(dbName = 'themed-js') {
    this.dbName = dbName;
  }

  /**
   * Initialize the database
   */
  async init(): Promise<void> {
    if (this.db) return;

    if (typeof indexedDB === 'undefined') {
      throw new Error('IndexedDB is not available');
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create themes store
        if (!db.objectStoreNames.contains(IndexedDBAdapter.STORES.themes)) {
          const themesStore = db.createObjectStore(IndexedDBAdapter.STORES.themes, {
            keyPath: 'id',
          });
          themesStore.createIndex('source', 'meta.source', { unique: false });
          themesStore.createIndex('createdAt', 'meta.createdAt', { unique: false });
        }

        // Create settings store
        if (!db.objectStoreNames.contains(IndexedDBAdapter.STORES.settings)) {
          db.createObjectStore(IndexedDBAdapter.STORES.settings, {
            keyPath: 'key',
          });
        }
      };
    });
  }

  /**
   * Ensure database is initialized
   */
  private async ensureDb(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  /**
   * Get the active theme ID
   */
  async getActiveThemeId(): Promise<string | null> {
    const db = await this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(IndexedDBAdapter.STORES.settings, 'readonly');
      const store = transaction.objectStore(IndexedDBAdapter.STORES.settings);
      const request = store.get('activeTheme');

      request.onerror = () => reject(new Error('Failed to get active theme'));
      request.onsuccess = () => {
        resolve(request.result?.value ?? null);
      };
    });
  }

  /**
   * Set the active theme ID
   */
  async setActiveThemeId(themeId: string): Promise<void> {
    const db = await this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(IndexedDBAdapter.STORES.settings, 'readwrite');
      const store = transaction.objectStore(IndexedDBAdapter.STORES.settings);
      const request = store.put({ key: 'activeTheme', value: themeId });

      request.onerror = () => reject(new Error('Failed to set active theme'));
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get all saved themes
   */
  async getThemes(): Promise<Theme[]> {
    const db = await this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(IndexedDBAdapter.STORES.themes, 'readonly');
      const store = transaction.objectStore(IndexedDBAdapter.STORES.themes);
      const request = store.getAll();

      request.onerror = () => reject(new Error('Failed to get themes'));
      request.onsuccess = () => {
        resolve(request.result ?? []);
      };
    });
  }

  /**
   * Get themes by source
   */
  async getThemesBySource(source: 'builtin' | 'user' | 'ai'): Promise<Theme[]> {
    const db = await this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(IndexedDBAdapter.STORES.themes, 'readonly');
      const store = transaction.objectStore(IndexedDBAdapter.STORES.themes);
      const index = store.index('source');
      const request = index.getAll(source);

      request.onerror = () => reject(new Error('Failed to get themes by source'));
      request.onsuccess = () => {
        resolve(request.result ?? []);
      };
    });
  }

  /**
   * Save a theme
   */
  async saveTheme(theme: Theme): Promise<void> {
    const db = await this.ensureDb();

    const themeToSave: Theme = {
      ...theme,
      meta: {
        ...theme.meta,
        updatedAt: Date.now(),
      },
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(IndexedDBAdapter.STORES.themes, 'readwrite');
      const store = transaction.objectStore(IndexedDBAdapter.STORES.themes);
      const request = store.put(themeToSave);

      request.onerror = () => reject(new Error('Failed to save theme'));
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Remove a theme
   */
  async removeTheme(themeId: string): Promise<void> {
    const db = await this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(IndexedDBAdapter.STORES.themes, 'readwrite');
      const store = transaction.objectStore(IndexedDBAdapter.STORES.themes);
      const request = store.delete(themeId);

      request.onerror = () => reject(new Error('Failed to remove theme'));
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get a specific theme by ID
   */
  async getTheme(themeId: string): Promise<Theme | null> {
    const db = await this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(IndexedDBAdapter.STORES.themes, 'readonly');
      const store = transaction.objectStore(IndexedDBAdapter.STORES.themes);
      const request = store.get(themeId);

      request.onerror = () => reject(new Error('Failed to get theme'));
      request.onsuccess = () => {
        resolve(request.result ?? null);
      };
    });
  }

  /**
   * Clear all stored data
   */
  async clear(): Promise<void> {
    const db = await this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [IndexedDBAdapter.STORES.themes, IndexedDBAdapter.STORES.settings],
        'readwrite'
      );

      transaction.objectStore(IndexedDBAdapter.STORES.themes).clear();
      transaction.objectStore(IndexedDBAdapter.STORES.settings).clear();

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(new Error('Failed to clear database'));
    });
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Delete the entire database
   */
  async delete(): Promise<void> {
    this.close();

    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(this.dbName);
      request.onerror = () => reject(new Error('Failed to delete database'));
      request.onsuccess = () => resolve();
    });
  }
}
