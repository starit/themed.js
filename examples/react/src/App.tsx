import React, { useState } from 'react';
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

function AIGenerator() {
  const { generate, isGenerating, error, isConfigured } = useAITheme();
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
      <h2>AI Theme Generator</h2>
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

function ColorPreview() {
  const { theme } = useTheme();

  if (!theme) {
    return <div className="card">No theme selected</div>;
  }

  const colors = Object.entries(theme.tokens.colors).slice(0, 12);

  return (
    <div className="card">
      <h3>Current Theme: {theme.name}</h3>
      <div className="color-preview">
        {colors.map(([name, value]) => (
          <div key={name} className="color-swatch">
            <div className="swatch" style={{ backgroundColor: value }} />
            <span className="label">{formatColorName(name)}</span>
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
