import { useContext } from 'react';
import type { Theme } from '@themed.js/core';
import { AIThemeContext } from './context';

/**
 * useAITheme hook return type
 */
export interface UseAIThemeReturn {
  /** Generate a new theme from a text prompt */
  generate: (prompt: string) => Promise<Theme>;
  /** Adjust the current theme based on instructions */
  adjust: (instruction: string) => Promise<Theme>;
  /** Configure AI at runtime (e.g. when user enters API key) */
  configureAI: (options: import('@themed.js/core').AIOptions) => void;
  /** Whether the AI is currently generating a theme */
  isGenerating: boolean;
  /** Last error from AI generation */
  error: Error | null;
  /** Whether AI is configured */
  isConfigured: boolean;
  /** Current AI provider and model info for display */
  modelInfo: { provider: string; model?: string } | null;
}

/**
 * Hook to access AI theme generation
 *
 * @example
 * ```tsx
 * function AIThemeGenerator() {
 *   const { generate, isGenerating, error } = useAITheme();
 *   const [prompt, setPrompt] = useState('');
 *
 *   const handleGenerate = async () => {
 *     try {
 *       await generate(prompt);
 *     } catch (e) {
 *       console.error('Failed to generate:', e);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <input
 *         value={prompt}
 *         onChange={e => setPrompt(e.target.value)}
 *         placeholder="Describe your theme..."
 *       />
 *       <button onClick={handleGenerate} disabled={isGenerating}>
 *         {isGenerating ? 'Generating...' : 'Generate Theme'}
 *       </button>
 *       {error && <p>Error: {error.message}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAITheme(): UseAIThemeReturn {
  const context = useContext(AIThemeContext);

  if (!context) {
    throw new Error('useAITheme must be used within a ThemeProvider');
  }

  return context;
}
