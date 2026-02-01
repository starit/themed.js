<script setup lang="ts">
import { ref } from 'vue';
import { useTheme, useAITheme } from '@themed.js/vue';

const { theme, themes, apply } = useTheme();
const { generate, isGenerating, error, isConfigured } = useAITheme();

const prompt = ref('');

const handleGenerate = async () => {
  if (!prompt.value.trim()) return;

  try {
    await generate(prompt.value);
    prompt.value = '';
  } catch (e) {
    console.error('Failed to generate:', e);
  }
};

const formatColorName = (name: string): string => {
  return name.replace(/([A-Z])/g, ' $1').trim();
};

const displayColors = () => {
  if (!theme.value) return [];
  return Object.entries(theme.value.tokens.colors).slice(0, 12);
};
</script>

<template>
  <div class="container">
    <h1>Themed.js Vue Demo</h1>
    <p>
      A powerful theme management library with AI-powered theme generation.
      Click the buttons below to switch themes, or describe a theme to generate with AI.
    </p>

    <!-- Theme Selector -->
    <div class="theme-selector">
      <button
        v-for="t in themes"
        :key="t.id"
        :class="['theme-btn', { active: t.id === theme?.id }]"
        @click="apply(t.id)"
      >
        {{ t.name }}
      </button>
    </div>

    <!-- AI Generator -->
    <div class="ai-section">
      <h2>AI Theme Generator</h2>
      <div class="ai-input-group">
        <input
          v-model="prompt"
          type="text"
          class="ai-input"
          placeholder="Describe your theme (e.g., 'A warm autumn sunset theme')"
          :disabled="!isConfigured || isGenerating"
          @keypress.enter="handleGenerate"
        />
        <button
          class="ai-btn"
          :disabled="!isConfigured || isGenerating || !prompt.trim()"
          @click="handleGenerate"
        >
          {{ isGenerating ? 'Generating...' : 'Generate' }}
        </button>
      </div>
      <div v-if="!isConfigured" class="status">
        AI not configured. Add your API key to enable.
      </div>
      <div v-if="error" class="status error">
        Error: {{ error.message }}
      </div>
    </div>

    <!-- Color Preview -->
    <div class="card">
      <h3>Current Theme: {{ theme?.name ?? 'None' }}</h3>
      <div class="color-preview">
        <div
          v-for="[name, value] in displayColors()"
          :key="name"
          class="color-swatch"
        >
          <div class="swatch" :style="{ backgroundColor: value }" />
          <span class="label">{{ formatColorName(name) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
