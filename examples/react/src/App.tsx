import { useState } from 'react';
import { useTheme, useAITheme } from '@themed.js/react';

function App() {
  return (
    <div className="container">
      <Header />
      <ThemeSelector />
      <AIGenerator />
      <ColorPreview />
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
    } catch (e) {
      console.error('Failed to generate:', e);
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

export default App;
