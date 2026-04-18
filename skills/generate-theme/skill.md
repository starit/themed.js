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
