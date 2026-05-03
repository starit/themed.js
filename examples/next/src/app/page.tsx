'use client';

import { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@themed.js/react';
import type { Theme } from '@themed.js/core';

export default function Page() {
  return (
    <ThemeProvider defaultTheme="light">
      <App />
    </ThemeProvider>
  );
}

function App() {
  return (
    <div className="container">
      <Header />
      <ThemeSelector />
      <ServerAIGenerator />
      <ColorPreview />
      <StyleDemo />
    </div>
  );
}

function Header() {
  return (
    <>
      <h1>Themed.js Next.js Demo</h1>
      <p>
        Theme generation runs server-side via <code>/api/generate-theme</code> — your AI API key
        is stored in <code>.env.local</code> and never sent to the browser.
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

function ServerAIGenerator() {
  const { importTheme, apply } = useTheme();
  const [prompt, setPrompt] = useState('');
  const [customSchema, setCustomSchema] = useState('');
  const [showCustomSchema, setShowCustomSchema] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastThemeName, setLastThemeName] = useState<string | null>(null);

  const handleGenerate = async () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setLastThemeName(null);

    try {
      const res = await fetch('/api/generate-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: trimmedPrompt,
          customSchema: customSchema.trim() || undefined,
        }),
      });

      const data: { theme?: Theme; error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Server error ${res.status}`);
      if (!data.theme) throw new Error('No theme in response');

      const theme = importTheme(JSON.stringify(data.theme));
      await apply(theme.id);
      setLastThemeName(theme.name);
      setPrompt('');
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Generation failed'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="ai-section">
      <div className="ai-section-header">
        <h2>AI Theme Generator</h2>
        <span className="server-badge">server-side · API key never leaves the server</span>
      </div>
      <div className="ai-input-group">
        <input
          type="text"
          className="ai-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleGenerate()}
          placeholder="Describe your theme (e.g., 'A warm autumn sunset theme')"
          disabled={isGenerating}
        />
        <button
          className="ai-btn"
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
        >
          {isGenerating ? 'Generating...' : 'Generate'}
        </button>
      </div>

      <div className="ai-custom-schema-toggle">
        <button
          type="button"
          className="ai-custom-schema-toggle-btn"
          onClick={() => setShowCustomSchema((v) => !v)}
        >
          {showCustomSchema ? '▲' : '▼'} Custom structure{' '}
          <span className="ai-custom-schema-optional">(optional)</span>
        </button>
      </div>

      {showCustomSchema && (
        <div className="ai-custom-schema-panel">
          <p className="ai-custom-schema-hint">
            Describe custom data to generate alongside the theme — in words or as a JSON skeleton:
          </p>
          <textarea
            className="ai-custom-schema-textarea"
            rows={3}
            value={customSchema}
            onChange={(e) => setCustomSchema(e.target.value)}
            placeholder={`In words: "brand guide with name, tone, and use cases"\nOr as a skeleton: { "brandName": "...", "tone": "..." }`}
            disabled={isGenerating}
          />
        </div>
      )}

      {lastThemeName && !error && (
        <div className="status">Generated: {lastThemeName}</div>
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

function downloadTheme(json: string, name: string) {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name.replace(/\s+/g, '-')}-theme.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function getFirstFontName(stack: string): string {
  const first = stack.split(',')[0].trim();
  return first.replace(/^['"]|['"]$/g, '') || first;
}

function formatColorName(name: string): string {
  return name.replace(/([A-Z])/g, ' $1').trim();
}

function TokenPills({ title, entries }: { title: string; entries: [string, string | number][] }) {
  if (entries.length === 0) return null;
  return (
    <div className="theme-tokens-section">
      <h4 className="theme-tokens-section-title">{title}</h4>
      <div className="theme-token-pills">
        {entries.map(([key, value]) => (
          <span key={key} className="theme-token-pill" title={String(value)}>
            <span className="theme-token-pill-key">{key}</span>
            <span className="theme-token-pill-value">{String(value)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function ColorPreview() {
  const { theme, apply, updateThemeCustom, exportTheme, importTheme } = useTheme();
  const [showViewJson, setShowViewJson] = useState(false);
  const [showImportJson, setShowImportJson] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [customText, setCustomText] = useState('');
  const [customError, setCustomError] = useState('');

  useEffect(() => {
    const c = theme?.custom;
    if (c != null && typeof c === 'object' && !Array.isArray(c) && Object.keys(c).length > 0) {
      setCustomText(JSON.stringify(c, null, 2));
    } else {
      setCustomText('');
    }
    setCustomError('');
  }, [theme?.id]);

  if (!theme) return <div className="card">No theme selected</div>;

  const { tokens } = theme;
  const colors = Object.entries(tokens.colors);
  const ff = tokens.typography.fontFamily;
  const spacingEntries = tokens.spacing ? (Object.entries(tokens.spacing) as [string, string][]) : [];
  const radiusEntries = tokens.radius ? (Object.entries(tokens.radius) as [string, string][]) : [];
  const shadowEntries = tokens.shadow ? (Object.entries(tokens.shadow) as [string, string][]) : [];
  const transitionEntries = tokens.transition
    ? (Object.entries(tokens.transition) as [string, string][])
    : [];

  const handleImport = () => {
    setImportError('');
    try {
      const imported = importTheme(importText);
      apply(imported.id);
      setShowImportJson(false);
      setImportText('');
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Invalid theme JSON');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImportText(String(reader.result));
      setImportError('');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAttachCustom = () => {
    setCustomError('');
    try {
      const parsed = JSON.parse(customText);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        setCustomError('Root must be a plain object');
        return;
      }
      updateThemeCustom(theme.id, parsed as Record<string, unknown>);
      apply(theme.id);
    } catch {
      setCustomError('Invalid JSON');
    }
  };

  return (
    <div className="card theme-current-card">
      <div className="card-header">
        <h3>Current Theme: {theme.name}</h3>
        <div className="card-actions">
          <button type="button" className="download-btn" onClick={() => setShowViewJson(true)}>
            View JSON
          </button>
          <button
            type="button"
            className="download-btn"
            onClick={() => downloadTheme(exportTheme(theme.id), theme.name)}
          >
            Download JSON
          </button>
          <button
            type="button"
            className="download-btn"
            onClick={() => { setShowImportJson(true); setImportText(''); setImportError(''); }}
          >
            Import JSON
          </button>
        </div>
      </div>

      {showViewJson && (
        <div className="json-modal-overlay" onClick={() => setShowViewJson(false)}>
          <div className="json-modal" onClick={(e) => e.stopPropagation()}>
            <div className="json-modal-header">
              <h4>Theme JSON</h4>
              <button type="button" className="json-modal-close" onClick={() => setShowViewJson(false)}>
                Close
              </button>
            </div>
            <pre className="json-modal-body">{exportTheme(theme.id)}</pre>
          </div>
        </div>
      )}

      {showImportJson && (
        <div className="json-modal-overlay" onClick={() => setShowImportJson(false)}>
          <div className="json-modal json-modal-import" onClick={(e) => e.stopPropagation()}>
            <div className="json-modal-header">
              <h4>Import theme from JSON</h4>
              <button
                type="button"
                className="json-modal-close"
                onClick={() => setShowImportJson(false)}
              >
                Close
              </button>
            </div>
            <div className="json-modal-body">
              <label className="json-import-file-label">
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportFile}
                  className="json-import-file"
                />
                Choose file
              </label>
              <textarea
                className="json-import-textarea"
                placeholder='Paste JSON or use "Choose file". Format: { "theme": { "id", "name" }, "tokens": { ... } }'
                value={importText}
                onChange={(e) => { setImportText(e.target.value); setImportError(''); }}
                rows={10}
              />
              {importError && <p className="json-import-error">{importError}</p>}
              <button
                type="button"
                className="json-import-submit"
                onClick={handleImport}
                disabled={!importText.trim()}
              >
                Import and apply
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="theme-tokens-block">
        <h4 className="theme-tokens-section-title">Colors</h4>
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

      <div className="theme-tokens-section">
        <h4 className="theme-tokens-section-title">Typography</h4>
        <div className="theme-typography-preview">
          <div className="theme-font-sample" style={{ fontFamily: ff.sans }}>
            <span className="theme-font-label">Sans</span>
            <span className="theme-font-first">Primary: {getFirstFontName(ff.sans)}</span>
            <span className="theme-font-value">The quick brown fox</span>
          </div>
          <div className="theme-font-sample" style={{ fontFamily: ff.serif }}>
            <span className="theme-font-label">Serif</span>
            <span className="theme-font-first">Primary: {getFirstFontName(ff.serif)}</span>
            <span className="theme-font-value">The quick brown fox</span>
          </div>
          <div className="theme-font-sample" style={{ fontFamily: ff.mono }}>
            <span className="theme-font-label">Mono</span>
            <span className="theme-font-first">Primary: {getFirstFontName(ff.mono)}</span>
            <span className="theme-font-value">The quick brown fox</span>
          </div>
        </div>
      </div>

      <div className="theme-tokens-row">
        <TokenPills title="Spacing" entries={spacingEntries} />
        <TokenPills title="Radius" entries={radiusEntries} />
      </div>

      <div className="theme-tokens-row">
        <TokenPills title="Transition" entries={transitionEntries} />
        {shadowEntries.length > 0 && (
          <div className="theme-tokens-section">
            <h4 className="theme-tokens-section-title">Shadow</h4>
            <div className="theme-shadow-preview">
              {shadowEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="theme-shadow-swatch"
                  style={{ boxShadow: value }}
                  title={String(value)}
                >
                  <span className="theme-shadow-label">{key}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {theme.custom != null &&
        typeof theme.custom === 'object' &&
        !Array.isArray(theme.custom) &&
        Object.keys(theme.custom).length > 0 && (
          <div className="theme-tokens-section custom-data-section">
            <h4 className="theme-tokens-section-title">Custom data</h4>
            <pre className="custom-data-pre">{JSON.stringify(theme.custom, null, 2)}</pre>
          </div>
        )}

      <div className="theme-tokens-section custom-structure-section">
        <h4 className="theme-tokens-section-title">Custom structure</h4>
        <p className="custom-structure-hint">
          Attach a JSON object to the current theme (e.g. {`{ "key": "value" }`}).
        </p>
        <textarea
          className="custom-structure-textarea"
          placeholder='{ "key": "value" }'
          value={customText}
          onChange={(e) => { setCustomText(e.target.value); setCustomError(''); }}
          rows={4}
        />
        {customError && <p className="custom-structure-error">{customError}</p>}
        <button
          type="button"
          className="download-btn custom-structure-attach"
          onClick={handleAttachCustom}
          disabled={!customText.trim()}
        >
          Attach to current theme
        </button>
      </div>
    </div>
  );
}

function StyleDemo() {
  return (
    <div className="card style-demo">
      <h3 className="style-demo-title">Style Demo</h3>
      <p className="style-demo-desc">
        Theme tokens in use: hierarchy (primary vs secondary), state colors, text levels, spacing &
        radius, and typography.
      </p>

      <section className="style-demo-section">
        <h4 className="style-demo-section-title">Primary (main action)</h4>
        <button type="button" className="style-demo-btn style-demo-btn-primary">
          Primary action
        </button>
      </section>

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

      <section className="style-demo-section">
        <h4 className="style-demo-section-title">Text hierarchy</h4>
        <div className="style-demo-text-block">
          <div className="style-demo-heading">Heading (primary color)</div>
          <p className="style-demo-body">Body text uses text primary for readability.</p>
          <p className="style-demo-caption">Caption or secondary label uses text secondary.</p>
          <p className="style-demo-disabled">Disabled or muted uses text disabled.</p>
        </div>
      </section>

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
            <span className="transition-dot transition-fast">fast</span>
            <span className="transition-dot transition-normal">normal</span>
            <span className="transition-dot transition-slow">slow</span>
          </div>
        </div>
      </section>

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
