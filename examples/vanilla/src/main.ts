import { createThemed } from '@themed.js/core';

const AI_CONFIG_STORAGE_KEY = 'themed-demo-ai-config';

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI', model: 'gpt-4o-mini' },
  { value: 'claude', label: 'Claude', model: 'claude-sonnet-4-6' },
  { value: 'gemini', label: 'Gemini', model: 'gemini-2.5-flash' },
  { value: 'groq', label: 'Groq', model: 'llama-3.3-70b-versatile' },
  { value: 'moonshot', label: 'Moonshot', model: 'kimi-k2-turbo-preview' },
  { value: 'deepseek', label: 'DeepSeek', model: 'deepseek-chat' },
] as const;

// No API key in build - users enter their own key in the demo UI (safe for GitHub Pages)
const themed = createThemed({ defaultTheme: 'light' });

// Initialize and render
async function init() {
  await themed.init();

  renderThemeButtons();
  renderColorPreview();

  // Subscribe to theme changes
  themed.on('theme:changed', () => {
    updateActiveButton();
    renderColorPreview();
  });

  // Load saved AI config
  loadAIConfig();

  // Setup AI config panel and generation
  setupAIConfig();
  setupAIGeneration();
}

// Render theme selector buttons
function renderThemeButtons() {
  const container = document.getElementById('theme-selector')!;
  const themes = themed.getAll();

  container.innerHTML = themes
    .map(
      (theme) => `
      <button class="theme-btn" data-theme-id="${theme.id}">
        ${theme.name}
      </button>
    `
    )
    .join('');

  // Add click handlers
  container.querySelectorAll('.theme-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const themeId = (btn as HTMLElement).dataset.themeId!;
      themed.apply(themeId);
    });
  });

  updateActiveButton();
}

// Update active button state
function updateActiveButton() {
  const activeTheme = themed.getActive();
  document.querySelectorAll('.theme-btn').forEach((btn) => {
    const isActive = (btn as HTMLElement).dataset.themeId === activeTheme?.id;
    btn.classList.toggle('active', isActive);
  });
}

// Format color value to hex display (ensure # prefix)
function toHexDisplay(value: string): string {
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
}

// Download theme colors as JSON
function downloadThemeColors() {
  const theme = themed.getActive();
  if (!theme) return;

  const data = {
    theme: { name: theme.name, id: theme.id },
    colors: theme.tokens.colors,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${theme.name.replace(/\s+/g, '-')}-colors.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Render color preview
function renderColorPreview() {
  const container = document.getElementById('color-preview')!;
  const cardHeader = document.getElementById('color-card-header')!;
  const downloadBtn = document.getElementById('download-colors')!;
  const theme = themed.getActive();

  if (!theme) {
    container.innerHTML = '<p>No theme selected</p>';
    (cardHeader.querySelector('h3') as HTMLElement).textContent = 'Current Theme Colors';
    (downloadBtn as HTMLButtonElement).style.display = 'none';
    return;
  }

  const colors = theme.tokens.colors;
  const colorEntries = Object.entries(colors);

  (cardHeader.querySelector('h3') as HTMLElement).textContent = `Current Theme: ${theme.name}`;
  (downloadBtn as HTMLButtonElement).style.display = '';

  container.innerHTML = colorEntries
    .map(
      ([name, value]) => `
      <div class="color-swatch">
        <div class="swatch" style="background-color: ${value}"></div>
        <span class="label">${formatColorName(name)}</span>
        <span class="hex">${toHexDisplay(value)}</span>
      </div>
    `
    )
    .join('');
}

// Format color name for display
function formatColorName(name: string): string {
  return name.replace(/([A-Z])/g, ' $1').trim();
}

// Format provider name for display
function formatProviderName(provider: string): string {
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
}

// Load saved AI config from localStorage
function loadAIConfig() {
  try {
    const saved = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
    if (saved) {
      const { apiKey, provider, model } = JSON.parse(saved);
      if (apiKey) {
        const prov = PROVIDERS.find((p) => p.value === (provider || 'openai'));
        themed.configureAI({
          provider: provider || 'openai',
          apiKey,
          model: model || prov?.model,
          timeout: 60000,
        });
      }
    }
  } catch {
    // Ignore
  }
}

// Setup API key config panel
function setupAIConfig() {
  const toggle = document.getElementById('ai-config-toggle')!;
  const form = document.getElementById('ai-config-form')!;
  const providerSelect = document.getElementById('ai-config-provider') as HTMLSelectElement;
  const apiKeyInput = document.getElementById('ai-config-key') as HTMLInputElement;
  const rememberCheck = document.getElementById('ai-config-remember') as HTMLInputElement;
  const saveBtn = document.getElementById('ai-config-save')!;
  const clearBtn = document.getElementById('ai-config-clear')!;

  let expanded = !themed.getAIOrchestrator();
  form.style.display = expanded ? 'block' : 'none';

  // Load saved values into form (not the key for security, just provider)
  try {
    const saved = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
    if (saved) {
      const { provider } = JSON.parse(saved);
      if (provider) providerSelect.value = provider;
      rememberCheck.checked = true;
    }
  } catch {
    // Ignore
  }

  toggle.addEventListener('click', () => {
    expanded = !expanded;
    form.style.display = expanded ? 'block' : 'none';
    toggle.textContent = `${expanded ? '▼' : '▶'} API Key ${
      themed.getAIOrchestrator() ? `(${themed.getAIConfig()?.provider ?? 'configured'})` : '(not set)'
    }`;
  });

  saveBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) return;
    const provider = providerSelect.value as (typeof PROVIDERS)[number]['value'];
    const prov = PROVIDERS.find((p) => p.value === provider);
    themed.configureAI({
      provider,
      apiKey,
      model: prov?.model,
      timeout: 60000,
    });
    if (rememberCheck.checked) {
      localStorage.setItem(
        AI_CONFIG_STORAGE_KEY,
        JSON.stringify({ apiKey, provider, model: prov?.model })
      );
    } else {
      localStorage.removeItem(AI_CONFIG_STORAGE_KEY);
    }
    expanded = false;
    form.style.display = 'none';
    apiKeyInput.value = '';
    toggle.textContent = `▶ API Key (${provider})`;
    updateAIGenerationUI();
  });

  clearBtn.addEventListener('click', () => {
    localStorage.removeItem(AI_CONFIG_STORAGE_KEY);
    window.location.reload();
  });

  // Update toggle text
  const aiConfig = themed.getAIConfig();
  toggle.textContent = `${expanded ? '▼' : '▶'} API Key ${
    aiConfig ? `(${aiConfig.provider})` : '(not set)'
  }`;
}

function updateAIGenerationUI() {
  const modelBadge = document.getElementById('model-badge')!;
  const button = document.getElementById('ai-generate') as HTMLButtonElement;
  const status = document.getElementById('status')!;

  const aiConfig = themed.getAIConfig();
  const isConfigured = themed.getAIOrchestrator() !== null;

  if (aiConfig) {
    modelBadge.innerHTML = aiConfig.model
      ? `${formatProviderName(aiConfig.provider)} <span class="model-name">· ${aiConfig.model}</span>`
      : formatProviderName(aiConfig.provider);
    modelBadge.style.display = '';
  } else {
    modelBadge.style.display = 'none';
  }

  if (!isConfigured) {
    button.disabled = true;
    status.textContent = 'Enter your API key above to enable AI.';
    status.className = '';
  }
}

// Setup AI generation
function setupAIGeneration() {
  const input = document.getElementById('ai-prompt') as HTMLInputElement;
  const button = document.getElementById('ai-generate') as HTMLButtonElement;
  const status = document.getElementById('status')!;

  updateAIGenerationUI();

  button.addEventListener('click', async () => {
    const prompt = input.value.trim();
    if (!prompt) {
      status.textContent = 'Please enter a description';
      status.className = 'error';
      return;
    }

    button.disabled = true;
    button.textContent = 'Generating...';
    status.textContent = 'Generating theme...';
    status.className = '';

    try {
      const theme = await themed.generate(prompt);
      status.textContent = `Generated theme: ${theme.name}`;
      status.className = '';
      renderThemeButtons();
      input.value = '';
    } catch (error) {
      status.textContent = `Error: ${(error as Error).message}`;
      status.className = 'error';
    } finally {
      button.disabled = !themed.getAIOrchestrator();
      button.textContent = 'Generate';
    }
  });

  // Handle Enter key
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !button.disabled) {
      button.click();
    }
  });
}

// Setup download button
document.getElementById('download-colors')!.addEventListener('click', downloadThemeColors);

// Start the app
init();
