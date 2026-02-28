import { inject, computed, ref, type ComputedRef } from 'vue';
import type { Theme } from '@themed.js/core';
import { THEMED_INJECTION_KEY } from '../keys';

/**
 * useAITheme composable return type
 */
export interface UseAIThemeReturn {
  /** Generate a new theme from a text prompt */
  generate: (prompt: string) => Promise<Theme>;
  /** Adjust the current theme based on instructions */
  adjust: (instruction: string) => Promise<Theme>;
  /** Whether the AI is currently generating a theme */
  isGenerating: ComputedRef<boolean>;
  /** Last error from AI generation */
  error: ComputedRef<Error | null>;
  /** Whether AI is configured */
  isConfigured: ComputedRef<boolean>;
  /** Current AI provider and model info for display */
  modelInfo: ComputedRef<{ provider: string; model?: string } | null>;
}

/**
 * Composable to access AI theme generation
 *
 * @example
 * ```vue
 * <script setup>
 * import { ref } from 'vue';
 * import { useAITheme } from '@themed.js/vue';
 *
 * const { generate, isGenerating, error } = useAITheme();
 * const prompt = ref('');
 *
 * const handleGenerate = async () => {
 *   try {
 *     await generate(prompt.value);
 *   } catch (e) {
 *     console.error('Failed to generate:', e);
 *   }
 * };
 * </script>
 *
 * <template>
 *   <div>
 *     <input v-model="prompt" placeholder="Describe your theme..." />
 *     <button @click="handleGenerate" :disabled="isGenerating">
 *       {{ isGenerating ? 'Generating...' : 'Generate Theme' }}
 *     </button>
 *     <p v-if="error">Error: {{ error.message }}</p>
 *   </div>
 * </template>
 * ```
 */
export function useAITheme(): UseAIThemeReturn {
  const injection = inject(THEMED_INJECTION_KEY);

  if (!injection) {
    throw new Error('useAITheme must be used within a Vue app that has installed themedPlugin');
  }

  const { manager } = injection;

  // Local state for tracking generation
  const localIsGenerating = ref(false);
  const localError = ref<Error | null>(null);

  const isGenerating = computed(() => injection.isGenerating || localIsGenerating.value);
  const error = computed(() => injection.aiError || localError.value);
  const isConfigured = computed(() => injection.isAIConfigured);
  const modelInfo = computed(() => injection.modelInfo);

  const generate = async (prompt: string): Promise<Theme> => {
    localIsGenerating.value = true;
    localError.value = null;

    try {
      const theme = await manager.generate(prompt);
      return theme;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      localError.value = err;
      throw err;
    } finally {
      localIsGenerating.value = false;
    }
  };

  const adjust = async (instruction: string): Promise<Theme> => {
    const activeTheme = manager.getActive();
    if (!activeTheme) {
      throw new Error('No active theme to adjust');
    }

    localIsGenerating.value = true;
    localError.value = null;

    try {
      const theme = await manager.generate(instruction, {
        baseTheme: activeTheme,
      });
      return theme;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      localError.value = err;
      throw err;
    } finally {
      localIsGenerating.value = false;
    }
  };

  return {
    generate,
    adjust,
    isGenerating,
    error,
    isConfigured,
    modelInfo,
  };
}
