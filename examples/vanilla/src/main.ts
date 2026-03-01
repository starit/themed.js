import { createThemed, createTheme, type ThemeInput } from '@themed.js/core';

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

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
/** Parse the first font name from a CSS font-family value */
function getFirstFontName(stack: string): string {
  const first = stack.split(',')[0].trim();
  return first.replace(/^['"]|['"]$/g, '') || first;
}

function getThemeExportData() {
  const theme = themed.getActive();
  if (!theme) return null;
  return {
    theme: { name: theme.name, id: theme.id },
    tokens: theme.tokens,
    custom: theme.custom,
    exportedAt: new Date().toISOString(),
  };
}

// Download theme tokens as JSON
function downloadThemeTokens() {
  const data = getThemeExportData();
  if (!data) return;
  const theme = themed.getActive()!;
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${theme.name.replace(/\s+/g, '-')}-tokens.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Parse JSON string into theme input. Supports export format { theme, tokens, custom? } or { id, name, tokens, custom? }. */
function parseThemeFromJson(json: string): { id: string; name: string; tokens: object; custom?: Record<string, unknown> } {
  const data = JSON.parse(json) as Record<string, unknown>;
  if (!data || typeof data !== 'object') throw new Error('Invalid JSON');
  const tokens = data.tokens as Record<string, unknown> | undefined;
  if (!tokens || typeof tokens !== 'object' || !tokens.colors || !tokens.typography) {
    throw new Error('JSON must contain theme.tokens with colors and typography');
  }
  const custom =
    data.custom !== undefined && typeof data.custom === 'object' && data.custom !== null && !Array.isArray(data.custom)
      ? (data.custom as Record<string, unknown>)
      : undefined;
  const themeObj = data.theme as { id?: string; name?: string } | undefined;
  if (themeObj && typeof themeObj.id === 'string' && typeof themeObj.name === 'string') {
    return { id: themeObj.id, name: themeObj.name, tokens, custom };
  }
  if (typeof data.id === 'string' && typeof data.name === 'string') {
    return { id: data.id, name: data.name, tokens, custom };
  }
  throw new Error('JSON must contain theme.id/theme.name or top-level id/name');
}

function showViewJsonModal() {
  const data = getThemeExportData();
  if (!data) return;
  const overlay = document.createElement('div');
  overlay.className = 'json-modal-overlay';
  const modal = document.createElement('div');
  modal.className = 'json-modal';
  modal.innerHTML = `
    <div class="json-modal-header">
      <h4>Theme JSON</h4>
      <button type="button" class="json-modal-close">Close</button>
    </div>
    <pre class="json-modal-body">${escapeHtml(JSON.stringify(data, null, 2))}</pre>
  `;
  overlay.appendChild(modal);
  const close = () => {
    overlay.remove();
  };
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  modal.querySelector('.json-modal-close')!.addEventListener('click', close);
  document.body.appendChild(overlay);
}

function showImportJsonModal() {
  const overlay = document.createElement('div');
  overlay.className = 'json-modal-overlay';
  const modal = document.createElement('div');
  modal.className = 'json-modal json-modal-import';
  const textarea = document.createElement('textarea');
  textarea.className = 'json-import-textarea';
  textarea.placeholder = 'Paste JSON or use "Choose file". Format: { "theme": { "id", "name" }, "tokens": { ... } }';
  textarea.rows = 10;
  const errorEl = document.createElement('p');
  errorEl.className = 'json-import-error';
  errorEl.style.display = 'none';
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json,application/json';
  fileInput.className = 'json-import-file';
  fileInput.style.display = 'none';
  modal.innerHTML = `
    <div class="json-modal-header">
      <h4>Import theme from JSON</h4>
      <button type="button" class="json-modal-close">Close</button>
    </div>
    <div class="json-modal-body">
      <label class="json-import-file-label">Choose file</label>
      <div style="display:contents"></div>
    </div>
  `;
  const body = modal.querySelector('.json-modal-body')!;
  const label = body.querySelector('label')!;
  label.appendChild(fileInput);
  body.appendChild(textarea);
  body.appendChild(errorEl);
  const submitBtn = document.createElement('button');
  submitBtn.type = 'button';
  submitBtn.className = 'json-import-submit';
  submitBtn.textContent = 'Import and apply';
  body.appendChild(submitBtn);
  overlay.appendChild(modal);

  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      textarea.value = String(reader.result);
      errorEl.style.display = 'none';
      errorEl.textContent = '';
    };
    reader.readAsText(file);
    fileInput.value = '';
  });

  const close = () => overlay.remove();
  const doImport = () => {
    const text = textarea.value.trim();
    if (!text) return;
    errorEl.style.display = 'none';
    errorEl.textContent = '';
    try {
      const input = parseThemeFromJson(text) as ThemeInput;
      const next = createTheme(input);
      themed.register(next);
      themed.apply(next.id);
      close();
    } catch (e) {
      errorEl.textContent = e instanceof Error ? e.message : 'Invalid theme JSON';
      errorEl.style.display = 'block';
    }
  };

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  modal.querySelector('.json-modal-close')!.addEventListener('click', close);
  submitBtn.addEventListener('click', doImport);
  label.addEventListener('click', (e) => e.stopPropagation());
  document.body.appendChild(overlay);
}

function renderPills(entries: [string, string | number][]): string {
  if (entries.length === 0) return '';
  return `
    <div class="theme-token-pills">
      ${entries
        .map(
          ([key, value]) => `
        <span class="theme-token-pill" title="${String(value).replace(/"/g, '&quot;')}">
          <span class="theme-token-pill-key">${key}</span>
          <span class="theme-token-pill-value">${String(value).length > 12 ? String(value).slice(0, 12) + '…' : String(value)}</span>
        </span>`
        )
        .join('')}
    </div>`;
}

// Render theme preview (colors + typography + spacing + radius + shadow + transition)
function renderColorPreview() {
  const container = document.getElementById('theme-preview')!;
  const cardHeader = document.getElementById('color-card-header')!;
  const actionsEl = document.getElementById('current-theme-actions')!;
  const theme = themed.getActive();

  if (!theme) {
    container.innerHTML = '<p>No theme selected</p>';
    (cardHeader.querySelector('h3') as HTMLElement).textContent = 'Current Theme';
    (actionsEl as HTMLElement).style.display = 'none';
    const customStructureEl = document.getElementById('custom-structure-section');
    if (customStructureEl) (customStructureEl as HTMLElement).style.display = 'none';
    return;
  }

  const { tokens } = theme;
  const colorEntries = Object.entries(tokens.colors);
  const spacingEntries = tokens.spacing ? (Object.entries(tokens.spacing) as [string, string][]) : [];
  const radiusEntries = tokens.radius ? (Object.entries(tokens.radius) as [string, string][]) : [];
  const shadowEntries = tokens.shadow ? Object.entries(tokens.shadow) : [];
  const transitionEntries = tokens.transition
    ? (Object.entries(tokens.transition) as [string, string][])
    : [];

  const ff = tokens.typography?.fontFamily;
  const typographyHtml =
    ff && (ff.sans ?? ff.serif ?? ff.mono)
      ? `
    <div class="theme-tokens-section">
      <h4 class="theme-tokens-section-title">Typography</h4>
      <div class="theme-typography-preview">
        ${ff.sans ? `<div class="theme-font-sample" style="font-family: ${ff.sans}"><span class="theme-font-label">Sans</span><span class="theme-font-first">Primary: ${escapeHtml(getFirstFontName(ff.sans))}</span><span class="theme-font-value">The quick brown fox</span></div>` : ''}
        ${ff.serif ? `<div class="theme-font-sample" style="font-family: ${ff.serif}"><span class="theme-font-label">Serif</span><span class="theme-font-first">Primary: ${escapeHtml(getFirstFontName(ff.serif))}</span><span class="theme-font-value">The quick brown fox</span></div>` : ''}
        ${ff.mono ? `<div class="theme-font-sample" style="font-family: ${ff.mono}"><span class="theme-font-label">Mono</span><span class="theme-font-first">Primary: ${escapeHtml(getFirstFontName(ff.mono))}</span><span class="theme-font-value">The quick brown fox</span></div>` : ''}
      </div>
    </div>`
      : '';

  const colorsHtml = `
    <div class="theme-tokens-block">
      <h4 class="theme-tokens-section-title">Colors</h4>
      <div class="color-preview">
        ${colorEntries
          .map(
            ([name, value]) => `
          <div class="color-swatch">
            <div class="swatch" style="background-color: ${value}"></div>
            <span class="label">${formatColorName(name)}</span>
            <span class="hex">${toHexDisplay(value)}</span>
          </div>`
          )
          .join('')}
      </div>
    </div>`;

  let row1 = '';
  if (spacingEntries.length > 0 || radiusEntries.length > 0) {
    row1 = `
    <div class="theme-tokens-row">
      ${spacingEntries.length > 0 ? `<div class="theme-tokens-section"><h4 class="theme-tokens-section-title">Spacing</h4>${renderPills(spacingEntries)}</div>` : ''}
      ${radiusEntries.length > 0 ? `<div class="theme-tokens-section"><h4 class="theme-tokens-section-title">Radius</h4>${renderPills(radiusEntries)}</div>` : ''}
    </div>`;
  }

  let row2 = '';
  if (transitionEntries.length > 0 || shadowEntries.length > 0) {
    const shadowHtml =
      shadowEntries.length > 0
        ? `<div class="theme-tokens-section">
        <h4 class="theme-tokens-section-title">Shadow</h4>
        <div class="theme-shadow-preview">
          ${shadowEntries
            .map(
              ([key, value]) => `
            <div class="theme-shadow-swatch" style="box-shadow: ${value}" title="${String(value).replace(/"/g, '&quot;')}">
              <span class="theme-shadow-label">${key}</span>
            </div>`
            )
            .join('')}
        </div>
      </div>`
        : '';
    row2 = `
    <div class="theme-tokens-row">
      ${transitionEntries.length > 0 ? `<div class="theme-tokens-section"><h4 class="theme-tokens-section-title">Transition</h4>${renderPills(transitionEntries)}</div>` : ''}
      ${shadowHtml}
    </div>`;
  }

  (cardHeader.querySelector('h3') as HTMLElement).textContent = `Current Theme: ${theme.name}`;
  (actionsEl as HTMLElement).style.display = '';

  const customDataHtml =
    theme.custom != null && typeof theme.custom === 'object' && !Array.isArray(theme.custom) && Object.keys(theme.custom).length > 0
      ? `
    <div class="theme-tokens-section custom-data-section">
      <h4 class="theme-tokens-section-title">Custom data</h4>
      <pre class="custom-data-pre">${escapeHtml(JSON.stringify(theme.custom, null, 2))}</pre>
    </div>`
      : '';

  const customStructureEl = document.getElementById('custom-structure-section');
  if (customStructureEl) (customStructureEl as HTMLElement).style.display = '';

  const textarea = document.getElementById('custom-structure-textarea') as HTMLTextAreaElement | null;
  const errorEl = document.getElementById('custom-structure-error') as HTMLElement | null;
  if (textarea) {
    const c = theme.custom;
    if (c != null && typeof c === 'object' && !Array.isArray(c) && Object.keys(c).length > 0) {
      textarea.value = JSON.stringify(c, null, 2);
    } else {
      textarea.value = '';
    }
  }
  if (errorEl) { errorEl.textContent = ''; errorEl.style.display = 'none'; }

  container.innerHTML = [colorsHtml, typographyHtml, row1, row2, customDataHtml].filter(Boolean).join('');
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
  const clearBtn = document.getElementById('ai-config-clear') as HTMLButtonElement | null;

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

  if (clearBtn) {
    clearBtn.style.display = isConfigured ? '' : 'none';
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
  const toggleBtn = document.getElementById('ai-custom-schema-toggle') as HTMLButtonElement;
  const schemaPanel = document.getElementById('ai-custom-schema-panel') as HTMLDivElement;
  const schemaTextarea = document.getElementById('ai-custom-schema') as HTMLTextAreaElement;

  // Toggle custom schema panel
  toggleBtn.addEventListener('click', () => {
    const isOpen = schemaPanel.classList.toggle('open');
    toggleBtn.childNodes[0].textContent = isOpen ? '▲ ' : '▼ ';
  });

  updateAIGenerationUI();

  button.addEventListener('click', async () => {
    const prompt = input.value.trim();
    if (!prompt) {
      status.textContent = 'Please enter a description';
      status.className = 'error';
      return;
    }

    const customSchema = schemaTextarea.value.trim();

    button.disabled = true;
    button.textContent = 'Generating...';
    status.textContent = 'Generating theme...';
    status.className = '';

    try {
      const theme = await themed.generate(prompt, customSchema ? { customSchema } : undefined);
      status.textContent = `Generated theme: ${theme.name}`;
      status.className = '';
      renderThemeButtons();
      input.value = '';
      // Preserve customSchema so user can reuse the same structure
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

function handleAttachCustom() {
  const textarea = document.getElementById('custom-structure-textarea') as HTMLTextAreaElement;
  const errorEl = document.getElementById('custom-structure-error')!;
  const theme = themed.getActive();
  if (!theme) return;
  errorEl.textContent = '';
  errorEl.style.display = 'none';
  try {
    const parsed = JSON.parse(textarea.value.trim());
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      errorEl.textContent = 'Root must be a plain object';
      errorEl.style.display = 'block';
      return;
    }
    themed.updateThemeCustom(theme.id, parsed as Record<string, unknown>);
    themed.apply(theme.id);
  } catch {
    errorEl.textContent = 'Invalid JSON';
    errorEl.style.display = 'block';
  }
}

// Setup Current Theme action buttons (after DOM ready; ids set in index.html)
document.getElementById('view-json')!.addEventListener('click', showViewJsonModal);
document.getElementById('download-colors')!.addEventListener('click', downloadThemeTokens);
document.getElementById('import-json')!.addEventListener('click', showImportJsonModal);
document.getElementById('attach-custom-btn')!.addEventListener('click', handleAttachCustom);

// Start the app
init();
