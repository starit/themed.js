import { useState, useEffect } from 'react';
import { useTheme, useAITheme } from '@themed.js/react';

const AI_CONFIG_STORAGE_KEY = 'themed-demo-ai-config';

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI', model: 'gpt-4o-mini' },
  { value: 'claude', label: 'Claude', model: 'claude-sonnet-4-6' },
  { value: 'gemini', label: 'Gemini', model: 'gemini-2.5-flash' },
  { value: 'groq', label: 'Groq', model: 'llama-3.3-70b-versatile' },
  { value: 'moonshot', label: 'Moonshot', model: 'kimi-k2-turbo-preview' },
  { value: 'deepseek', label: 'DeepSeek', model: 'deepseek-chat' },
] as const;

function App() {
  return (
    <div className="container">
      <Header />
      <ThemeSelector />
      <AIConfigPanel />
      <AIGenerator />
      <ColorPreview />
      <StyleDemo />
    </div>
  );
}

function AIConfigPanel() {
  const { configureAI, isConfigured, modelInfo } = useAITheme();
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<typeof PROVIDERS[number]['value']>('openai');
  const [remember, setRemember] = useState(false);
  const [expanded, setExpanded] = useState(!isConfigured);

  // Load saved config on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
      if (saved) {
        const { apiKey: key, provider: p, model } = JSON.parse(saved);
        if (key) {
          setApiKey(key);
          setProvider(p || 'openai');
          setRemember(true);
          configureAI({
            provider: p || 'openai',
            apiKey: key,
            model: model || PROVIDERS.find((x) => x.value === p)?.model,
            timeout: 60000,
          });
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) return;
    const p = PROVIDERS.find((x) => x.value === provider);
    configureAI({
      provider,
      apiKey: apiKey.trim(),
      model: p?.model,
      timeout: 60000,
    });
    if (remember) {
      localStorage.setItem(
        AI_CONFIG_STORAGE_KEY,
        JSON.stringify({ apiKey: apiKey.trim(), provider, model: p?.model })
      );
    } else {
      localStorage.removeItem(AI_CONFIG_STORAGE_KEY);
    }
    setApiKey('');
    setExpanded(false);
  };

  const handleClear = () => {
    localStorage.removeItem(AI_CONFIG_STORAGE_KEY);
    window.location.reload();
  };

  return (
    <div className="ai-config-section">
      <button
        type="button"
        className="ai-config-toggle"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? '▼' : '▶'} API Key {isConfigured ? `(${modelInfo?.provider ?? 'configured'})` : '(not set)'}
      </button>
      {expanded && (
        <div className="ai-config-form">
          <p className="ai-config-hint">
            Your API key is stored only on your device and is never sent to our servers or collected. It is used only to call the AI provider you choose.
          </p>
          <p className="ai-config-security">
            We never collect or log your key. For stronger security, uncheck Remember so the key is not saved to disk (session only).
          </p>
          <div className="ai-config-row">
            <select
              className="ai-config-select"
              value={provider}
              onChange={(e) => setProvider(e.target.value as typeof provider)}
            >
              {PROVIDERS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              autoComplete="off"
              className="ai-config-input ai-config-key-input"
              placeholder="API Key"
              spellCheck={false}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
          <div className="ai-config-actions">
            <label className="ai-config-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember (localStorage)
            </label>
            <div className="ai-config-buttons">
              {isConfigured && (
                <button type="button" className="ai-config-btn secondary" onClick={handleClear}>
                  Clear
                </button>
              )}
              <button
                type="button"
                className="ai-config-btn"
                onClick={handleSave}
                disabled={!apiKey.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Header() {
  return (
    <>
      <h1>Themed.js React Demo</h1>
      <p>
        A powerful theme management library with AI-powered theme generation.
        Click the buttons below to switch themes, or describe a theme to generate with AI.
      </p>
    </>
  );
}

function ThemeSelector() {
  const { themes, theme, apply } = useTheme();

  return (
    <div className="theme-selector">
      {themes.map((t) => (
        <button
          key={t.id}
          className={`theme-btn ${t.id === theme?.id ? 'active' : ''}`}
          onClick={() => apply(t.id)}
        >
          {t.name}
        </button>
      ))}
    </div>
  );
}

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

function AIGenerator() {
  const { generate, isGenerating, error, isConfigured, modelInfo } = useAITheme();
  const [prompt, setPrompt] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
      await generate(prompt);
      setPrompt('');
    } catch {
      // Error shown via useAITheme().error; do not log to avoid leaking any sensitive data
    }
  };

  return (
    <div className="ai-section">
      <div className="ai-section-header">
        <h2>AI Theme Generator</h2>
        {modelInfo && (
          <span className="model-badge">
            {formatProviderName(modelInfo.provider)}
            {modelInfo.model && <span className="model-name"> · {modelInfo.model}</span>}
          </span>
        )}
      </div>
      <div className="ai-input-group">
        <input
          type="text"
          className="ai-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
          placeholder="Describe your theme (e.g., 'A warm autumn sunset theme')"
          disabled={!isConfigured || isGenerating}
        />
        <button
          className="ai-btn"
          onClick={handleGenerate}
          disabled={!isConfigured || isGenerating || !prompt.trim()}
        >
          {isGenerating ? 'Generating...' : 'Generate'}
        </button>
      </div>
      {!isConfigured && (
        <div className="status">AI not configured. Add your API key to enable.</div>
      )}
      {error && <div className="status error">Error: {error.message}</div>}
    </div>
  );
}

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

function downloadThemeColors(theme: { name: string; id: string }, colors: Record<string, string>) {
  const data = {
    theme: { name: theme.name, id: theme.id },
    colors,
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

function ColorPreview() {
  const { theme } = useTheme();

  if (!theme) {
    return <div className="card">No theme selected</div>;
  }

  const colors = Object.entries(theme.tokens.colors);

  return (
    <div className="card">
      <div className="card-header">
        <h3>Current Theme: {theme.name}</h3>
        <button
          type="button"
          className="download-btn"
          onClick={() => downloadThemeColors(theme, theme.tokens.colors)}
        >
          Download JSON
        </button>
      </div>
      <div className="color-preview">
        {colors.map(([name, value]) => (
          <div key={name} className="color-swatch">
            <div className="swatch" style={{ backgroundColor: value }} />
            <span className="label">{formatColorName(name)}</span>
            <span className="hex">{toHexDisplay(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatColorName(name: string): string {
  return name.replace(/([A-Z])/g, ' $1').trim();
}

function StyleDemo() {
  return (
    <div className="card style-demo">
      <h3 className="style-demo-title">Style Demo</h3>
      <p className="style-demo-desc">
        Theme tokens in use: hierarchy (primary vs secondary), state colors, text levels, spacing & radius, and typography.
      </p>

      {/* Primary level: main CTA */}
      <section className="style-demo-section">
        <h4 className="style-demo-section-title">Primary (main action)</h4>
        <button type="button" className="style-demo-btn style-demo-btn-primary">
          Primary action
        </button>
      </section>

      {/* Secondary level: supporting actions */}
      <section className="style-demo-section">
        <h4 className="style-demo-section-title">Secondary (supporting)</h4>
        <div className="style-demo-actions">
          <button type="button" className="style-demo-btn style-demo-btn-secondary">
            Secondary
          </button>
          <button type="button" className="style-demo-btn style-demo-btn-outline">
            Outline
          </button>
          <span className="style-demo-accent-badge">Accent</span>
        </div>
      </section>

      {/* State alerts with context */}
      <section className="style-demo-section">
        <h4 className="style-demo-section-title">State (alerts)</h4>
        <div className="style-demo-alerts">
          <div className="style-demo-alert style-demo-error">
            <strong>Error</strong>
            <span>Something went wrong. Please try again.</span>
          </div>
          <div className="style-demo-alert style-demo-warning">
            <strong>Warning</strong>
            <span>Your session will expire in 5 minutes.</span>
          </div>
          <div className="style-demo-alert style-demo-success">
            <strong>Success</strong>
            <span>Your changes have been saved.</span>
          </div>
          <div className="style-demo-alert style-demo-info">
            <strong>Info</strong>
            <span>New features are available in settings.</span>
          </div>
        </div>
      </section>

      {/* Text hierarchy */}
      <section className="style-demo-section">
        <h4 className="style-demo-section-title">Text hierarchy</h4>
        <div className="style-demo-text-block">
          <div className="style-demo-heading">Heading (primary color)</div>
          <p className="style-demo-body">Body text uses text primary for readability.</p>
          <p className="style-demo-caption">Caption or secondary label uses text secondary.</p>
          <p className="style-demo-disabled">Disabled or muted uses text disabled.</p>
        </div>
      </section>

      {/* Spacing & radius from theme */}
      <section className="style-demo-section">
        <h4 className="style-demo-section-title">Spacing & radius</h4>
        <div className="style-demo-tokens">
          <div className="style-demo-spacing-dots">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
          <div className="style-demo-radius-samples">
            <span className="radius-box radius-sm">sm</span>
            <span className="radius-box radius-md">md</span>
            <span className="radius-box radius-lg">lg</span>
          </div>
        </div>
      </section>

      {/* Shadow & transition */}
      <section className="style-demo-section">
        <h4 className="style-demo-section-title">Shadow & transition</h4>
        <div className="style-demo-tokens">
          <div className="style-demo-shadow-samples">
            <span className="shadow-box shadow-none">none</span>
            <span className="shadow-box shadow-sm">sm</span>
            <span className="shadow-box shadow-md">md</span>
            <span className="shadow-box shadow-lg">lg</span>
          </div>
          <div className="style-demo-transition-samples">
            <span className="transition-dot transition-fast" title="fast">fast</span>
            <span className="transition-dot transition-normal" title="normal">normal</span>
            <span className="transition-dot transition-slow" title="slow">slow</span>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="style-demo-section">
        <h4 className="style-demo-section-title">Typography</h4>
        <div className="style-demo-typo">
          <div className="style-demo-font-sans">Sans: The quick brown fox</div>
          <div className="style-demo-font-serif">Serif: The quick brown fox</div>
          <div className="style-demo-font-mono">Mono: The quick brown fox</div>
          <div className="style-demo-sizes">
            <span className="style-demo-size-xs">xs</span>
            <span className="style-demo-size-sm">sm</span>
            <span className="style-demo-size-base">base</span>
            <span className="style-demo-size-lg">lg</span>
            <span className="style-demo-size-xl">xl</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
