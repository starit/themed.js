<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTheme, useAITheme } from '@themed.js/vue';
import { createTheme } from '@themed.js/core';

const AI_CONFIG_STORAGE_KEY = 'themed-demo-ai-config';

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI', model: 'gpt-4o-mini' },
  { value: 'claude', label: 'Claude', model: 'claude-sonnet-4-6' },
  { value: 'gemini', label: 'Gemini', model: 'gemini-2.5-flash' },
  { value: 'groq', label: 'Groq', model: 'llama-3.3-70b-versatile' },
  { value: 'moonshot', label: 'Moonshot', model: 'kimi-k2-turbo-preview' },
  { value: 'deepseek', label: 'DeepSeek', model: 'deepseek-chat' },
] as const;

const { theme, themes, apply, register } = useTheme();
const { generate, isGenerating, error, isConfigured, modelInfo, configureAI } = useAITheme();

const apiKey = ref('');
const provider = ref<(typeof PROVIDERS)[number]['value']>('openai');
const remember = ref(false);
const configExpanded = ref(true);

onMounted(() => {
  try {
    const saved = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
    if (saved) {
      const { apiKey: key, provider: p, model } = JSON.parse(saved);
      if (key) {
        apiKey.value = key;
        provider.value = p || 'openai';
        remember.value = true;
        const prov = PROVIDERS.find((x) => x.value === (p || 'openai'));
        configureAI({
          provider: p || 'openai',
          apiKey: key,
          model: model || prov?.model,
          timeout: 60000,
        });
        configExpanded.value = false;
        return;
      }
    }
  } catch {
    // Ignore
  }
  configExpanded.value = true;
});

const handleSaveConfig = () => {
  if (!apiKey.value.trim()) return;
  const prov = PROVIDERS.find((x) => x.value === provider.value);
  configureAI({
    provider: provider.value,
    apiKey: apiKey.value.trim(),
    model: prov?.model,
    timeout: 60000,
  });
  if (remember.value) {
    localStorage.setItem(
      AI_CONFIG_STORAGE_KEY,
      JSON.stringify({
        apiKey: apiKey.value.trim(),
        provider: provider.value,
        model: prov?.model,
      })
    );
  } else {
    localStorage.removeItem(AI_CONFIG_STORAGE_KEY);
  }
  apiKey.value = '';
  configExpanded.value = false;
};

const handleClearConfig = () => {
  localStorage.removeItem(AI_CONFIG_STORAGE_KEY);
  window.location.reload();
};

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
  } catch {
    // Error shown via useAITheme().error; do not log to avoid leaking any sensitive data
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

const getThemeExportData = () => {
  if (!theme.value) return null;
  return {
    theme: { name: theme.value.name, id: theme.value.id },
    tokens: theme.value.tokens,
    exportedAt: new Date().toISOString(),
  };
};

const downloadThemeTokens = () => {
  const data = getThemeExportData();
  if (!data) return;
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${theme.value.name.replace(/\s+/g, '-')}-tokens.json`;
  a.click();
  URL.revokeObjectURL(url);
};

/** Parse JSON string into theme input. Supports export format { theme, tokens } or { id, name, tokens }. */
function parseThemeFromJson(json: string): { id: string; name: string; tokens: object } {
  const data = JSON.parse(json) as Record<string, unknown>;
  if (!data || typeof data !== 'object') throw new Error('Invalid JSON');
  const tokens = data.tokens as Record<string, unknown> | undefined;
  if (!tokens || typeof tokens !== 'object' || !tokens.colors || !tokens.typography) {
    throw new Error('JSON must contain theme.tokens with colors and typography');
  }
  const themeObj = data.theme as { id?: string; name?: string } | undefined;
  if (themeObj && typeof themeObj.id === 'string' && typeof themeObj.name === 'string') {
    return { id: themeObj.id, name: themeObj.name, tokens };
  }
  if (typeof data.id === 'string' && typeof data.name === 'string') {
    return { id: data.id, name: data.name, tokens };
  }
  throw new Error('JSON must contain theme.id/theme.name or top-level id/name');
}

/** Parse the first font name from a CSS font-family value */
function getFirstFontName(stack: string): string {
  const first = stack.split(',')[0].trim();
  return first.replace(/^['"]|['"]$/g, '') || first;
}

const showViewJson = ref(false);
const showImportJson = ref(false);
const importText = ref('');
const importError = ref('');

const handleImport = () => {
  importError.value = '';
  try {
    const input = parseThemeFromJson(importText.value);
    const next = createTheme(input);
    register(next);
    apply(next.id);
    showImportJson.value = false;
    importText.value = '';
  } catch (e) {
    importError.value = e instanceof Error ? e.message : 'Invalid theme JSON';
  }
};

const handleImportFile = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    importText.value = String(reader.result);
    importError.value = '';
  };
  reader.readAsText(file);
  target.value = '';
};

const spacingEntries = () =>
  theme.value?.tokens.spacing ? Object.entries(theme.value.tokens.spacing) : [];
const radiusEntries = () =>
  theme.value?.tokens.radius ? Object.entries(theme.value.tokens.radius) : [];
const shadowEntries = () =>
  theme.value?.tokens.shadow ? Object.entries(theme.value.tokens.shadow) : [];
const transitionEntries = () =>
  theme.value?.tokens.transition ? Object.entries(theme.value.tokens.transition) : [];
</script>

<template>
  <div class="container">
    <h1>Themed.js Vue Demo</h1>
    <p>
      A powerful theme management library with AI-powered theme generation.
      Click the buttons below to switch themes, or describe a theme to generate with AI.
    </p>

    <!-- API Key Config -->
    <div class="ai-config-section">
      <button
        type="button"
        class="ai-config-toggle"
        @click="configExpanded = !configExpanded"
      >
        {{ configExpanded ? '▼' : '▶' }} API Key
        {{ isConfigured ? `(${modelInfo?.provider ?? 'configured'})` : '(not set)' }}
      </button>
      <div v-show="configExpanded" class="ai-config-form">
        <p class="ai-config-hint">
          Your API key is stored only on your device and is never sent to our servers or collected. It is used only to call the AI provider you choose.
        </p>
        <p class="ai-config-security">
          We never collect or log your key. For stronger security, uncheck Remember so the key is not saved to disk (session only).
        </p>
        <div class="ai-config-row">
          <select v-model="provider" class="ai-config-select">
            <option
              v-for="p in PROVIDERS"
              :key="p.value"
              :value="p.value"
            >
              {{ p.label }}
            </option>
          </select>
          <input
            v-model="apiKey"
            type="text"
            autocomplete="off"
            spellcheck="false"
            class="ai-config-input ai-config-key-input"
            placeholder="API Key"
            @keydown.enter="handleSaveConfig"
          />
        </div>
        <div class="ai-config-actions">
          <label class="ai-config-remember">
            <input v-model="remember" type="checkbox" />
            Remember (localStorage)
          </label>
          <div class="ai-config-buttons">
            <button
              v-if="isConfigured"
              type="button"
              class="ai-config-btn secondary"
              @click="handleClearConfig"
            >
              Clear
            </button>
            <button
              type="button"
              class="ai-config-btn"
              :disabled="!apiKey.trim()"
              @click="handleSaveConfig"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>

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

    <!-- Current Theme (all tokens) -->
    <div class="card theme-current-card">
      <div class="card-header">
        <h3>Current Theme: {{ theme?.name ?? 'None' }}</h3>
        <div v-if="theme" class="card-actions">
          <button type="button" class="download-btn" @click="showViewJson = true">
            View JSON
          </button>
          <button type="button" class="download-btn" @click="downloadThemeTokens">
            Download JSON
          </button>
          <button
            type="button"
            class="download-btn"
            @click="showImportJson = true; importText = ''; importError = ''"
          >
            Import JSON
          </button>
        </div>
      </div>

      <template v-if="theme">
        <div v-if="showViewJson" class="json-modal-overlay" @click="showViewJson = false">
          <div class="json-modal" @click.stop>
            <div class="json-modal-header">
              <h4>Theme JSON</h4>
              <button type="button" class="json-modal-close" @click="showViewJson = false">Close</button>
            </div>
            <pre class="json-modal-body">{{ getThemeExportData() ? JSON.stringify(getThemeExportData(), null, 2) : '' }}</pre>
          </div>
        </div>

        <div v-if="showImportJson" class="json-modal-overlay" @click="showImportJson = false">
          <div class="json-modal json-modal-import" @click.stop>
            <div class="json-modal-header">
              <h4>Import theme from JSON</h4>
              <button type="button" class="json-modal-close" @click="showImportJson = false">Close</button>
            </div>
            <div class="json-modal-body">
              <label class="json-import-file-label">
                <input type="file" accept=".json,application/json" class="json-import-file" @change="handleImportFile" />
                Choose file
              </label>
              <textarea
                v-model="importText"
                class="json-import-textarea"
                placeholder='Paste JSON or use "Choose file". Format: { "theme": { "id", "name" }, "tokens": { ... } }'
                rows="10"
                @input="importError = ''"
              />
              <p v-if="importError" class="json-import-error">{{ importError }}</p>
              <button type="button" class="json-import-submit" :disabled="!importText.trim()" @click="handleImport">
                Import and apply
              </button>
            </div>
          </div>
        </div>
        <div class="theme-tokens-block">
          <h4 class="theme-tokens-section-title">Colors</h4>
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

        <div
          v-if="theme.tokens.typography?.fontFamily"
          class="theme-tokens-section"
        >
          <h4 class="theme-tokens-section-title">Typography</h4>
          <div class="theme-typography-preview">
            <div
              class="theme-font-sample"
              :style="{ fontFamily: theme.tokens.typography.fontFamily.sans }"
            >
              <span class="theme-font-label">Sans</span>
              <span class="theme-font-first">Primary: {{ getFirstFontName(theme.tokens.typography.fontFamily.sans) }}</span>
              <span class="theme-font-value">The quick brown fox</span>
            </div>
            <div
              class="theme-font-sample"
              :style="{ fontFamily: theme.tokens.typography.fontFamily.serif }"
            >
              <span class="theme-font-label">Serif</span>
              <span class="theme-font-first">Primary: {{ getFirstFontName(theme.tokens.typography.fontFamily.serif) }}</span>
              <span class="theme-font-value">The quick brown fox</span>
            </div>
            <div
              class="theme-font-sample"
              :style="{ fontFamily: theme.tokens.typography.fontFamily.mono }"
            >
              <span class="theme-font-label">Mono</span>
              <span class="theme-font-first">Primary: {{ getFirstFontName(theme.tokens.typography.fontFamily.mono) }}</span>
              <span class="theme-font-value">The quick brown fox</span>
            </div>
          </div>
        </div>

        <div class="theme-tokens-row">
          <div v-if="spacingEntries().length" class="theme-tokens-section">
            <h4 class="theme-tokens-section-title">Spacing</h4>
            <div class="theme-token-pills">
              <span
                v-for="[key, value] in spacingEntries()"
                :key="key"
                class="theme-token-pill"
                :title="value"
              >
                <span class="theme-token-pill-key">{{ key }}</span>
                <span class="theme-token-pill-value">{{ value }}</span>
              </span>
            </div>
          </div>
          <div v-if="radiusEntries().length" class="theme-tokens-section">
            <h4 class="theme-tokens-section-title">Radius</h4>
            <div class="theme-token-pills">
              <span
                v-for="[key, value] in radiusEntries()"
                :key="key"
                class="theme-token-pill"
                :title="value"
              >
                <span class="theme-token-pill-key">{{ key }}</span>
                <span class="theme-token-pill-value">{{ value }}</span>
              </span>
            </div>
          </div>
        </div>

        <div class="theme-tokens-row">
          <div v-if="transitionEntries().length" class="theme-tokens-section">
            <h4 class="theme-tokens-section-title">Transition</h4>
            <div class="theme-token-pills">
              <span
                v-for="[key, value] in transitionEntries()"
                :key="key"
                class="theme-token-pill"
                :title="value"
              >
                <span class="theme-token-pill-key">{{ key }}</span>
                <span class="theme-token-pill-value">{{ value }}</span>
              </span>
            </div>
          </div>
          <div v-if="shadowEntries().length" class="theme-tokens-section">
            <h4 class="theme-tokens-section-title">Shadow</h4>
            <div class="theme-shadow-preview">
              <div
                v-for="[key, value] in shadowEntries()"
                :key="key"
                class="theme-shadow-swatch"
                :style="{ boxShadow: value }"
                :title="value"
              >
                <span class="theme-shadow-label">{{ key }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Style Demo -->
    <div class="card style-demo">
      <h3 class="style-demo-title">Style Demo</h3>
      <p class="style-demo-desc">
        Theme tokens in use: hierarchy (primary vs secondary), state colors, text levels, spacing & radius, and typography.
      </p>

      <section class="style-demo-section">
        <h4 class="style-demo-section-title">Primary (main action)</h4>
        <button type="button" class="style-demo-btn style-demo-btn-primary">Primary action</button>
      </section>

      <section class="style-demo-section">
        <h4 class="style-demo-section-title">Secondary (supporting)</h4>
        <div class="style-demo-actions">
          <button type="button" class="style-demo-btn style-demo-btn-secondary">Secondary</button>
          <button type="button" class="style-demo-btn style-demo-btn-outline">Outline</button>
          <span class="style-demo-accent-badge">Accent</span>
        </div>
      </section>

      <section class="style-demo-section">
        <h4 class="style-demo-section-title">State (alerts)</h4>
        <div class="style-demo-alerts">
          <div class="style-demo-alert style-demo-error">
            <strong>Error</strong>
            <span>Something went wrong. Please try again.</span>
          </div>
          <div class="style-demo-alert style-demo-warning">
            <strong>Warning</strong>
            <span>Your session will expire in 5 minutes.</span>
          </div>
          <div class="style-demo-alert style-demo-success">
            <strong>Success</strong>
            <span>Your changes have been saved.</span>
          </div>
          <div class="style-demo-alert style-demo-info">
            <strong>Info</strong>
            <span>New features are available in settings.</span>
          </div>
        </div>
      </section>

      <section class="style-demo-section">
        <h4 class="style-demo-section-title">Text hierarchy</h4>
        <div class="style-demo-text-block">
          <div class="style-demo-heading">Heading (primary color)</div>
          <p class="style-demo-body">Body text uses text primary for readability.</p>
          <p class="style-demo-caption">Caption or secondary label uses text secondary.</p>
          <p class="style-demo-disabled">Disabled or muted uses text disabled.</p>
        </div>
      </section>

      <section class="style-demo-section">
        <h4 class="style-demo-section-title">Spacing & radius</h4>
        <div class="style-demo-tokens">
          <div class="style-demo-spacing-dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
          <div class="style-demo-radius-samples">
            <span class="radius-box radius-sm">sm</span>
            <span class="radius-box radius-md">md</span>
            <span class="radius-box radius-lg">lg</span>
          </div>
        </div>
      </section>

      <section class="style-demo-section">
        <h4 class="style-demo-section-title">Shadow & transition</h4>
        <div class="style-demo-tokens">
          <div class="style-demo-shadow-samples">
            <span class="shadow-box shadow-none">none</span>
            <span class="shadow-box shadow-sm">sm</span>
            <span class="shadow-box shadow-md">md</span>
            <span class="shadow-box shadow-lg">lg</span>
          </div>
          <div class="style-demo-transition-samples">
            <span class="transition-dot transition-fast" title="fast">fast</span>
            <span class="transition-dot transition-normal" title="normal">normal</span>
            <span class="transition-dot transition-slow" title="slow">slow</span>
          </div>
        </div>
      </section>

      <section class="style-demo-section">
        <h4 class="style-demo-section-title">Typography</h4>
        <div class="style-demo-typo">
          <div class="style-demo-font-sans">Sans: The quick brown fox</div>
          <div class="style-demo-font-serif">Serif: The quick brown fox</div>
          <div class="style-demo-font-mono">Mono: The quick brown fox</div>
          <div class="style-demo-sizes">
            <span class="style-demo-size-xs">xs</span>
            <span class="style-demo-size-sm">sm</span>
            <span class="style-demo-size-base">base</span>
            <span class="style-demo-size-lg">lg</span>
            <span class="style-demo-size-xl">xl</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
