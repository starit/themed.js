# AGENTS.md — themed.js

Guidelines for AI agents working in this repository.

## Repo layout

```
packages/
  core/      @themed.js/core   — zero-dep TS library (ThemeManager, CSSInjector, AI, storage)
  react/     @themed.js/react  — React 18 bindings
  vue/       @themed.js/vue    — Vue 3 bindings
examples/    vanilla / react / vue demo apps
skills/      AI agent skill definitions
```

## Commands

```bash
pnpm install          # install all workspaces
pnpm build            # build all packages
pnpm test:run         # run all tests (Vitest)
pnpm --filter @themed.js/core build   # build a single package
```

Always run `pnpm test:run` before marking a task complete.

## Key exports

### `@themed.js/core`

| Export | Purpose |
|--------|---------|
| `createThemed(options)` | Factory — returns a `ThemeManager` |
| `ThemeManager` | Core class (apply, register, generate, events, SSR) |
| `getSSRStyles(themeId, themes, cssOptions?)` | Server-side CSS generation (no DOM) |
| `builtinThemes` | Array of 7 pre-built themes |
| `createTheme(input)` | Helper to build a `Theme` object |
| `createAIProvider(options)` | Instantiate an AI provider directly |

### `@themed.js/react`

| Export | Purpose |
|--------|---------|
| `ThemeProvider` | Context provider — wraps the app |
| `ThemeScript` | SSR `<style>` tag — place in `<head>` |
| `useTheme()` | `{ theme, themes, apply, register, … }` |
| `useAITheme()` | `{ generate, adjust, isGenerating, error, … }` |

### `@themed.js/vue`

| Export | Purpose |
|--------|---------|
| `themedPlugin` | Vue plugin — `app.use(themedPlugin, options)` |
| `useTheme()` | `{ theme, themes, apply, register, … }` (ComputedRefs) |
| `useAITheme()` | `{ generate, adjust, isGenerating, error, … }` |
| `getSSRStyles` | Re-exported from core for single-import convenience |

## CSS variable naming

`TokenResolver` flattens tokens to kebab-case CSS variables:

| Token path | CSS variable |
|-----------|-------------|
| `colors.primary` | `--themed-color-primary` |
| `colors.textPrimary` | `--themed-color-text-primary` |
| `colors.borderLight` | `--themed-color-border-light` |
| `typography.fontFamily.sans` | `--themed-font-family-sans` |
| `typography.fontSize.base` | `--themed-font-size-base` |
| `typography.fontWeight.bold` | `--themed-font-weight-bold` |
| `typography.lineHeight.normal` | `--themed-line-height-normal` |
| `spacing.md` | `--themed-spacing-md` |
| `radius.lg` | `--themed-radius-lg` |
| `shadow.sm` | `--themed-shadow-sm` |
| `transition.fast` | `--themed-transition-fast` |

Rules: `colors` → `color` (singular); `typography` group is dropped; camelCase → kebab-case.

The client-side injector creates/updates `<style id="themed-js-styles">`. SSR utilities must use the same id so hydration finds and updates the element without creating a duplicate.

## AI providers

`provider` accepts: `'openai'` | `'claude'` | `'gemini'` | `'groq'` | `'moonshot'` | `'deepseek'` | `'custom'` | `'extension'` | any object implementing `AIProvider`.

- `'custom'` — OpenAI-compatible endpoint; supports `endpoint`, `headers`, `transformRequest`, `extractContent`
- `'extension'` — Chrome extension proxy; no API key in page code
- Custom instance — implement `{ name: string; complete(messages): Promise<string>; stream?() }`

## SSR

Core is SSR-safe: `CSSInjector.inject()` guards on `typeof document`, `LocalStorageAdapter.isAvailable()` uses try-catch.

To prevent FOUC, inject the initial CSS server-side:

- **React**: `<ThemeScript defaultTheme="light" />` in `<head>`
- **Vue/Nuxt**: `getSSRStyles('light', builtinThemes)` via `useHead`
- **Vanilla**: write the string into a `<style id="themed-js-styles">` tag

## Conventions

- **No test mocks for storage or DOM** — tests run under `happy-dom` which provides real implementations
- **Single source of truth for skill content**: `skills/integrate-themed/skill.md`; `.claude/commands/integrate-themed.md` is a thin pointer
- **Version bumps**: update `packages/*/package.json` individually; skill version in `skills/integrate-themed/manifest.json`, `skill.md` frontmatter, and `skills/index.json` are independent
- **Biome** is the linter/formatter — run `pnpm biome check` before committing if linting is required
