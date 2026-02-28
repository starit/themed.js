<script setup lang="ts">
import { ref } from 'vue';
import { useTheme, useAITheme } from '@themed.js/vue';

const { theme, themes, apply } = useTheme();
const { generate, isGenerating, error, isConfigured, modelInfo } = useAITheme();

const formatProviderName = (provider: string): string => {
  const names: Record<string, string> = {
    openai: 'OpenAI',
    claude: 'Claude',
    gemini: 'Gemini',
    groq: 'Groq',
    moonshot: 'Moonshot',
    deepseek: 'DeepSeek',
    custom: 'Custom',
  };
  return names[provider] ?? provider;
};

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
  return Object.entries(theme.value.tokens.colors);
};

const toHexDisplay = (value: string): string => {
  const hex = /^#?([a-f\d]{6}|[a-f\d]{3})$/i.exec(value);
  if (hex) return value.startsWith('#') ? value : `#${value}`;
  const rgb = /^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i.exec(value);
  if (rgb) {
    const r = Number(rgb[1]).toString(16).padStart(2, '0');
    const g = Number(rgb[2]).toString(16).padStart(2, '0');
    const b = Number(rgb[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
  return value;
};

const downloadThemeColors = () => {
  if (!theme.value) return;
  const data = {
    theme: { name: theme.value.name, id: theme.value.id },
    colors: theme.value.tokens.colors,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${theme.value.name.replace(/\s+/g, '-')}-colors.json`;
  a.click();
  URL.revokeObjectURL(url);
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
      <div class="ai-section-header">
        <h2>AI Theme Generator</h2>
        <span v-if="modelInfo" class="model-badge">
          {{ formatProviderName(modelInfo.provider) }}
          <span v-if="modelInfo.model" class="model-name"> · {{ modelInfo.model }}</span>
        </span>
      </div>
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
      <div class="card-header">
        <h3>Current Theme: {{ theme?.name ?? 'None' }}</h3>
        <button
          v-if="theme"
          type="button"
          class="download-btn"
          @click="downloadThemeColors"
        >
          Download JSON
        </button>
      </div>
      <div class="color-preview">
        <div
          v-for="[name, value] in displayColors()"
          :key="name"
          class="color-swatch"
        >
          <div class="swatch" :style="{ backgroundColor: value }" />
          <span class="label">{{ formatColorName(name) }}</span>
          <span class="hex">{{ toHexDisplay(value) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
