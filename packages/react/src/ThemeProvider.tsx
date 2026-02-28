import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  ThemeManager,
  type Theme,
  type ThemeChangedPayload,
  type AIOptions,
  type StorageOptions,
  type CSSOptions,
  builtinThemes,
} from '@themed.js/core';
import { ThemeContext, AIThemeContext, type ThemeContextValue, type AIThemeContextValue } from './context';

/**
 * ThemeProvider props
 */
export interface ThemeProviderProps {
  children: React.ReactNode;
  /** Default theme to apply */
  defaultTheme?: string;
  /** Initial themes to register */
  themes?: Theme[];
  /** AI configuration */
  ai?: AIOptions;
  /** Storage configuration */
  storage?: StorageOptions;
  /** CSS injection configuration */
  css?: CSSOptions;
  /** Enable debug logging */
  debug?: boolean;
  /** Callback when theme changes */
  onThemeChange?: (theme: Theme, previousTheme: Theme | null) => void;
}

/**
 * ThemeProvider component
 */
export function ThemeProvider({
  children,
  defaultTheme = 'light',
  themes = [],
  ai,
  storage,
  css,
  debug,
  onThemeChange,
}: ThemeProviderProps): JSX.Element {
  // Create manager ref to persist across renders
  const managerRef = useRef<ThemeManager | null>(null);

  // Initialize manager once
  if (!managerRef.current) {
    managerRef.current = new ThemeManager({
      themes: [...builtinThemes, ...themes],
      defaultTheme,
      ai,
      storage,
      css,
      debug,
    });
  }

  const manager = managerRef.current;

  // State
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [allThemes, setAllThemes] = useState<Theme[]>(() => manager.getAll());
  const [initialized, setInitialized] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<Error | null>(null);

  // Initialize manager
  useEffect(() => {
    const initManager = async () => {
      await manager.init();
      setCurrentTheme(manager.getActive());
      setAllThemes(manager.getAll());
      setInitialized(true);
    };

    initManager();

    // Subscribe to events
    const unsubChanged = manager.on('theme:changed', ({ theme, previousTheme }: ThemeChangedPayload) => {
      setCurrentTheme(theme);
      onThemeChange?.(theme, previousTheme);
    });

    const unsubRegistered = manager.on('theme:registered', () => {
      setAllThemes(manager.getAll());
    });

    const unsubUnregistered = manager.on('theme:unregistered', () => {
      setAllThemes(manager.getAll());
    });

    return () => {
      unsubChanged();
      unsubRegistered();
      unsubUnregistered();
    };
  }, [manager, onThemeChange]);

  // AI functions
  const generate = useCallback(
    async (prompt: string): Promise<Theme> => {
      setIsGenerating(true);
      setAiError(null);

      try {
        const theme = await manager.generate(prompt);
        setAllThemes(manager.getAll());
        return theme;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setAiError(err);
        throw err;
      } finally {
        setIsGenerating(false);
      }
    },
    [manager]
  );

  const adjust = useCallback(
    async (instruction: string): Promise<Theme> => {
      const activeTheme = manager.getActive();
      if (!activeTheme) {
        throw new Error('No active theme to adjust');
      }

      setIsGenerating(true);
      setAiError(null);

      try {
        const theme = await manager.generate(instruction, {
          baseTheme: activeTheme,
        });
        setAllThemes(manager.getAll());
        return theme;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setAiError(err);
        throw err;
      } finally {
        setIsGenerating(false);
      }
    },
    [manager]
  );

  // Context values
  const themeContextValue = useMemo<ThemeContextValue>(
    () => ({
      manager,
      theme: currentTheme,
      themes: allThemes,
      initialized,
    }),
    [manager, currentTheme, allThemes, initialized]
  );

  const aiContextValue = useMemo<AIThemeContextValue>(
    () => ({
      generate,
      adjust,
      isGenerating,
      error: aiError,
      isConfigured: manager.getAIOrchestrator() !== null,
      modelInfo: manager.getAIConfig(),
    }),
    [generate, adjust, isGenerating, aiError, manager]
  );

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <AIThemeContext.Provider value={aiContextValue}>
        {children}
      </AIThemeContext.Provider>
    </ThemeContext.Provider>
  );
}
