# Changelog

All notable changes to this project are documented here.

Format: `[version] — date` · packages: `@themed.js/core`, `@themed.js/react`, `@themed.js/vue`

---

## [Unreleased]

### Added
- **Export / Import API** — `exportTheme`, `exportThemes`, `importTheme`, `importThemes` on `ThemeManager`; React `useTheme` and Vue composable expose the same API
- **SSR support** — `getSSRStyles` utility prevents flash of unstyled content in Next.js / Nuxt; React `ThemeScript` component for App Router; `id="themed-js-styles"` hydration contract
- **Chrome extension proxy** — `provider: 'extension'` delegates all LLM calls to the Themed LLM Secure Proxy extension so API keys never appear in page code
- **Cyberpunk theme** — new built-in theme with high-contrast neon-on-dark aesthetic (9 built-in themes total)
- **Skills** — `integrate-themed` (v1.1.0) and `generate-theme` (v1.0.0) skill bundles for Claude Code and compatible agent frameworks
- **Mobile responsive examples** — all three demo apps (vanilla, React, Vue) now stack the AI input row and config row vertically on narrow viewports

### Changed
- Example demos wired to the new export/import API (View JSON, Download JSON, Import JSON buttons)

### Security
- Hardened CSS variable injection: only `--themed-*` prefixed variables accepted, values validated and sanitised before injection
- Storage validation: theme data is structurally validated on read to prevent stored XSS

---

## [0.1.1] — 2026-03-02

### Added
- **Custom structured data** — every theme can carry an optional `custom` field (arbitrary JSON object) that persists through storage, export/import, and AI generation (`customSchema` option in `generate`)
- **Transition tokens** — `transition` token group (`fast`, `normal`, `slow`) added to the default token schema and CSS variable output
- **API key UI in demos** — all three example apps now have a collapsible AI Config panel so users can enter their own API key without modifying source code; safe for public deployment on GitHub Pages
- **More AI providers** — Groq, Moonshot/Kimi, and DeepSeek added alongside OpenAI and Claude

### Changed
- "Remember API key" checkbox defaults to **off** — opt-in rather than opt-out for localStorage persistence
- GitHub Pages deployment workflow fixed to correctly build and serve all three demo apps

---

## [0.0.1] — 2026-02-28

Initial public release.

### Added
- **Core** (`@themed.js/core`) — `createThemed`, `ThemeManager`, built-in themes (Light, Dark, Ocean, Forest, Sunset, Midnight, Rose), CSS variable injection, localStorage / IndexedDB persistence, event system
- **React** (`@themed.js/react`) — `ThemeProvider`, `useTheme`, `useAITheme` hooks
- **Vue** (`@themed.js/vue`) — `themedPlugin`, `useTheme`, `useAITheme` composables
- **AI generation** — OpenAI and Claude providers; `generate(prompt, options?)` API
- **WCAG utilities** — contrast ratio checker and accessible color helpers
- **TypeScript** — full type definitions across all packages; ESM + CJS dual output
- **Unit tests** — Vitest test suite for core theme logic and token validation
- **Demo apps** — vanilla, React, and Vue example apps deployed to GitHub Pages
