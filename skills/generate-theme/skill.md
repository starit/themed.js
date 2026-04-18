---
name: generate-theme
description: Generates a complete themed.js Theme object from a natural language description — no running app needed. Outputs valid TypeScript ready to paste into any project.
license: MIT
metadata:
  version: 1.0.0
  updated: 2026-04-19
  themed_js_version: ">=0.1.1"
  github: https://github.com/starit/themed.js
---

# Generate a themed.js Theme

You are a professional UI/UX designer and color theory expert. When this skill is invoked, generate a complete, ready-to-use `Theme` object for [themed.js](https://github.com/starit/themed.js) based on the user's description.

You do NOT need the library installed to run this skill — you output static TypeScript/JSON that the user can paste directly into their project.

---

## Step 1 — Gather the brief

Ask the user for (or infer from context):

1. **Theme name** — what to call it (e.g. "Midnight Ocean", "Warm Brand")
2. **Mood / style** — keywords or a sentence (e.g. "dark, professional, purple accents", "warm sunrise, friendly, rounded")
3. **Light or dark** background
4. **Any brand colors** — hex codes or names to anchor the palette
5. **Custom data (optional)** — any extra non-token fields to include in `theme.custom` (e.g. brand name, tagline, font CDN URL)

If the user already provided enough context in their message, skip straight to generation.

---

## Step 2 — Generate the theme

Apply color theory principles:

- **Harmony**: derive `secondary` and `accent` via analogous, complementary, or triadic relationships from `primary`
- **Contrast**: ensure text colors meet WCAG AA contrast on their backgrounds (≥ 4.5:1 normal text, ≥ 3:1 large text)
- **Semantic states**: `error` → red family, `warning` → amber/orange, `success` → green, `info` → blue
- **Surface hierarchy**: `surface` should be slightly lighter/darker than `background` (not the same value)
- **Borders**: `borderLight` lighter than `border`, `borderDark` darker than `border`
- **Dark themes**: use desaturated or muted primaries to avoid eye strain; keep text colors off-white (e.g. `#f1f5f9` not `#ffffff`)

### Token schema

```
colors:
  primary, secondary, accent
  background, surface
  error, warning, success, info
  textPrimary, textSecondary, textDisabled, textInverse
  border, borderLight, borderDark

typography:
  fontFamily: { sans, serif, mono }   ← suggest Google Fonts pairs matching the mood
  fontSize:   { xs, sm, base, lg, xl, 2xl, 3xl }   ← use rem units
  fontWeight: { light: 300, normal: 400, medium: 500, semibold: 600, bold: 700 }
  lineHeight: { tight: 1.25, normal: 1.5, relaxed: 1.75 }

radius:
  none: "0", sm: "0.25rem", md: "0.5rem", lg: "0.75rem", full: "9999px"
  → adjust for the mood: sharp (0/0.125rem) for technical, generous (0.5rem/1rem) for friendly

shadow:
  none: "none"
  sm, md, lg: CSS box-shadow strings
  → dark themes: use colored glow shadows (rgba of primary); light themes: use neutral drop shadows
```

All color values must be valid CSS hex (`#rrggbb`), `rgb()`, or `hsl()`. All size values must be CSS length strings.

---

## Step 3 — Output

Output the complete theme as a TypeScript `createTheme()` call:

```typescript
import { createTheme } from '@themed.js/core';

export const myTheme = createTheme({
  id: 'my-theme',           // kebab-case, unique
  name: 'My Theme',         // display name
  description: 'One sentence.',
  tokens: {
    colors: {
      primary:       '#...',
      secondary:     '#...',
      accent:        '#...',
      background:    '#...',
      surface:       '#...',
      error:         '#...',
      warning:       '#...',
      success:       '#...',
      info:          '#...',
      textPrimary:   '#...',
      textSecondary: '#...',
      textDisabled:  '#...',
      textInverse:   '#...',
      border:        '#...',
      borderLight:   '#...',
      borderDark:    '#...',
    },
    typography: {
      fontFamily: {
        sans:  '"Font Name", system-ui, sans-serif',
        serif: '"Font Name", Georgia, serif',
        mono:  '"Font Name", ui-monospace, monospace',
      },
      fontSize:   { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem' },
      fontWeight: { light: 300, normal: 400, medium: 500, semibold: 600, bold: 700 },
      lineHeight: { tight: 1.25, normal: 1.5, relaxed: 1.75 },
    },
    radius: {
      none: '0',
      sm:   '0.25rem',
      md:   '0.5rem',
      lg:   '0.75rem',
      full: '9999px',
    },
    shadow: {
      none: 'none',
      sm:   '...',
      md:   '...',
      lg:   '...',
    },
  },
  // Only include `custom` if the user requested extra data
  custom: {
    // e.g. brandColor: '#...', fontCDN: 'https://fonts.googleapis.com/...'
  },
  meta: {
    version:   '1.0.0',
    createdAt: Date.now(),
    source:    'user',
  },
});
```

Then show how to register and use it:

```typescript
import { createThemed, builtinThemes } from '@themed.js/core';
import { myTheme } from './themes/my-theme';

const themed = createThemed({ themes: [...builtinThemes, myTheme], defaultTheme: 'my-theme' });
await themed.init();
```

---

## Example — complete output

> Input: *"A dark theme inspired by deep ocean — navy and teal, calm and professional, rounded, with soft glows"*

```typescript
import { createTheme } from '@themed.js/core';

export const midnightOceanTheme = createTheme({
  id: 'midnight-ocean',
  name: 'Midnight Ocean',
  description: 'Deep navy and teal dark theme — calm, professional, softly glowing.',
  tokens: {
    colors: {
      primary:       '#2dd4bf',   // teal-400
      secondary:     '#0ea5e9',   // sky-500
      accent:        '#818cf8',   // indigo-400
      background:    '#0a1628',   // deep navy
      surface:       '#112240',   // slightly lighter navy
      error:         '#f87171',   // red-400
      warning:       '#fbbf24',   // amber-400
      success:       '#34d399',   // emerald-400
      info:          '#38bdf8',   // sky-400
      textPrimary:   '#e2e8f0',   // slate-200
      textSecondary: '#94a3b8',   // slate-400
      textDisabled:  '#475569',   // slate-600
      textInverse:   '#0a1628',   // same as background
      border:        '#1e3a5f',
      borderLight:   '#1e4976',
      borderDark:    '#0f2340',
    },
    typography: {
      fontFamily: {
        sans:  '"Inter", system-ui, -apple-system, sans-serif',
        serif: '"Merriweather", Georgia, serif',
        mono:  '"JetBrains Mono", ui-monospace, monospace',
      },
      fontSize:   { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem' },
      fontWeight: { light: 300, normal: 400, medium: 500, semibold: 600, bold: 700 },
      lineHeight: { tight: 1.25, normal: 1.5, relaxed: 1.75 },
    },
    radius: {
      none: '0',
      sm:   '0.375rem',
      md:   '0.75rem',
      lg:   '1rem',
      full: '9999px',
    },
    shadow: {
      none: 'none',
      sm:   '0 1px 3px 0 rgba(0, 0, 0, 0.4)',
      md:   '0 4px 12px -2px rgba(0, 0, 0, 0.5), 0 0 8px rgba(45, 212, 191, 0.12)',
      lg:   '0 10px 30px -4px rgba(0, 0, 0, 0.6), 0 0 20px rgba(45, 212, 191, 0.18)',
    },
  },
  meta: { version: '1.0.0', createdAt: Date.now(), source: 'user' },
});
```

**Contrast check:**

| Pair | Ratio | WCAG AA |
|------|-------|---------|
| textPrimary (`#e2e8f0`) on background (`#0a1628`) | 12.4 : 1 | ✅ |
| textPrimary on surface (`#112240`) | 11.1 : 1 | ✅ |
| textSecondary (`#94a3b8`) on background | 5.8 : 1 | ✅ |
| textInverse (`#0a1628`) on primary (`#2dd4bf`) | 9.1 : 1 | ✅ |

**Google Fonts:**

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
```

---

## Step 4 — Contrast check summary

After outputting the code, briefly list the key contrast ratios:

| Pair | Ratio | WCAG AA |
|------|-------|---------|
| textPrimary on background | … | ✅ / ❌ |
| textPrimary on surface | … | ✅ / ❌ |
| textInverse on primary | … | ✅ / ❌ |

If any ratio fails, suggest a corrected value inline.

---

## Step 5 — Optional: Google Fonts snippet

If you suggested custom fonts, offer the `<link>` tag:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=..." rel="stylesheet">
```

---

## Notes

- If the user wants the theme to work with AI generation in their app, suggest they pass it as `baseTheme` to `themed.generate()` so the AI refines from this starting point rather than generating from scratch.
- If the user just wants a JSON object (not TypeScript), output the tokens as plain JSON with no imports.
- If the user asks for multiple variants (light + dark pair), generate both and give them matching IDs like `brand-light` / `brand-dark`.
