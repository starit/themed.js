import { createThemed, type Theme } from '@themed.js/core';

// Vite loads env vars prefixed with VITE_ from .env; access via import.meta.env
const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;

const themed = createThemed({
  defaultTheme: 'light',
  // Enable AI generation when VITE_OPENAI_API_KEY is set in .env
  ...(apiKey && {
    ai: {
      provider: 'openai' as const,
      apiKey,
      model: 'gpt-4o-mini',
      timeout: 60000,
    },
  }),
});

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

  // Setup AI generation
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

// Setup AI generation
function setupAIGeneration() {
  const input = document.getElementById('ai-prompt') as HTMLInputElement;
  const button = document.getElementById('ai-generate') as HTMLButtonElement;
  const status = document.getElementById('status')!;
  const modelBadge = document.getElementById('model-badge')!;

  // Display model info
  const aiConfig = themed.getAIConfig();
  if (aiConfig) {
    const providerName = formatProviderName(aiConfig.provider);
    modelBadge.innerHTML = aiConfig.model
      ? `${providerName} <span class="model-name">· ${aiConfig.model}</span>`
      : providerName;
    modelBadge.style.display = '';
  } else {
    modelBadge.style.display = 'none';
  }

  // Check if AI is configured
  const isAIConfigured = themed.getAIOrchestrator() !== null;

  if (!isAIConfigured) {
    button.disabled = true;
    status.textContent = 'AI not configured. Add your API key to enable.';
    status.className = '';
    return;
  }

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
      button.disabled = false;
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
