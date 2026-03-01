# Themed.js Event Contract

This document describes the **event contract** for the Themed.js core: event names, payload shapes, when each event is emitted, and recommended usage. Events use a **namespaced** naming scheme (`theme:*`, `storage:*`) to distinguish them from DOM or framework events.

---

## Event naming convention

- **Format**: `namespace:action` (e.g. `theme:changed`, `theme:generated`).
- **Namespaces**:
  - `theme` – theme lifecycle and application.
  - `storage` – persistence (saved/loaded); payload types are defined, emission depends on storage implementation.
- **Why namespaced**: Avoids collisions with DOM/framework events and allows future namespaces (e.g. `ui:*`) without breaking existing listeners.

---

## Theme events (emitted by ThemeManager)

### `theme:changed`

Emitted after a theme is successfully applied (e.g. after `apply(themeId)`).

| Payload field       | Type            | Description                          |
|---------------------|-----------------|--------------------------------------|
| `theme`             | `Theme`         | The theme that is now active.        |
| `previousTheme`     | `Theme \| null` | The previously active theme, or null. |
| `timestamp`         | `number`        | Time when the event was emitted.    |

**Recommended usage**: Sync UI (theme name, theme selector), re-render theme-dependent content, or run analytics when the user switches theme.

---

### `theme:registered`

Emitted when a theme is registered (e.g. after `register(theme)` or when an AI-generated theme is registered).

| Payload field | Type     | Description                    |
|---------------|----------|--------------------------------|
| `theme`       | `Theme`  | The theme that was registered. |
| `timestamp`   | `number` | Time when the event was emitted. |

**Recommended usage**: Update theme lists (e.g. dropdown), enable a “Apply” button for the new theme.

---

### `theme:unregistered`

Emitted when a theme is removed (after `unregister(themeId)`).

| Payload field | Type     | Description                      |
|---------------|----------|----------------------------------|
| `themeId`     | `string` | The id of the unregistered theme. |
| `timestamp`   | `number` | Time when the event was emitted. |

**Recommended usage**: Remove the theme from UI lists; if it was the active theme, the manager clears active state and CSS.

---

### `theme:generating`

Emitted when AI theme generation starts (before the AI request).

| Payload field | Type     | Description        |
|---------------|----------|--------------------|
| `prompt`      | `string` | The user prompt.   |
| `timestamp`   | `number` | Emission time.     |

**Recommended usage**: Show loading state, disable “Generate” or theme switcher.

---

### `theme:generated`

Emitted when AI theme generation completes successfully (theme is registered and optionally applied).

| Payload field | Type     | Description                          |
|---------------|----------|--------------------------------------|
| `theme`       | `Theme`  | The generated theme.                |
| `prompt`      | `string` | The prompt used for generation.      |
| `duration`    | `number` | Generation duration in milliseconds. |
| `timestamp`   | `number` | Emission time.                       |

**Recommended usage**: Hide loading state, refresh theme list, optionally show a “Theme created” message or analytics.

---

### `theme:error`

Emitted when an error occurs during theme generation (or other operations that report via this event).

| Payload field | Type      | Description                    |
|---------------|-----------|--------------------------------|
| `error`       | `Error`   | The error object.              |
| `context`     | `string?` | Optional context (e.g. `'generate'`). |
| `timestamp`   | `number`  | Emission time.                 |

**Recommended usage**: Show an error message in the UI; avoid logging full payload in production if it might contain sensitive data.

---

## Storage events (payload contract)

Payload types are defined in the core; **emission is implementation-dependent** (e.g. by a storage adapter or ThemeManager integration).

### `storage:saved`

| Payload field | Type     | Description        |
|---------------|----------|--------------------|
| `key`         | `string` | Storage key saved. |
| `timestamp`   | `number` | Emission time.     |

### `storage:loaded`

| Payload field | Type     | Description          |
|---------------|----------|----------------------|
| `key`         | `string` | Storage key loaded.  |
| `value`       | `unknown`| Loaded value.        |
| `timestamp`   | `number` | Emission time.       |

---

## Subscribing and unsubscribing

- **Subscribe**: `manager.on(event, handler)`. Returns an **unsubscribe** function.
- **Unsubscribe**: Call the returned function, or use `manager.off(event, handler)`.
- **One-time**: Use the EventBus `once` API if exposed (e.g. for a single “theme:generated” after a user action).

Example:

```ts
const unsub = themed.on('theme:changed', ({ theme, previousTheme }) => {
  console.log(`Switched from ${previousTheme?.name ?? 'none'} to ${theme.name}`);
});

// Later:
unsub();
```

---

## Debug mode

When ThemeManager is created with `debug: true`, the EventBus logs each emitted event and its payload. **Use only in development**: payloads may contain theme data or prompts. Prefer logging only event name and non-sensitive fields (e.g. `themeId`) in production.

---

## Summary table

| Event               | Emitted by        | Typical use                    |
|---------------------|-------------------|--------------------------------|
| `theme:changed`     | `apply()`         | Update UI after theme switch   |
| `theme:registered` | `register()`      | Refresh theme list             |
| `theme:unregistered` | `unregister()`  | Refresh theme list             |
| `theme:generating`  | `generate()` start | Loading state                |
| `theme:generated`   | `generate()` success | Post-generation UI          |
| `theme:error`       | `generate()` (catch) | Error UI                    |
| `storage:saved`     | (storage layer)   | Reserved                       |
| `storage:loaded`    | (storage layer)   | Reserved                       |
