# themed.js — Next.js Example

A Next.js demo that shows how to generate AI themes **server-side**, so your LLM API key never reaches the browser.

## How it works

```
Browser                          Next.js Server
  │                                    │
  │  POST /api/generate-theme          │
  │  { prompt, customSchema? }  ──────▶│
  │                                    │  createThemed({ ai: { provider, apiKey } })
  │                                    │  themed.generate(prompt)
  │                                    │
  │  { theme }              ◀──────────│
  │                                    │
  │  importTheme(theme)                │
  │  apply(theme.id)                   │
```

The API route ([src/app/api/generate-theme/route.ts](src/app/api/generate-theme/route.ts)) reads credentials from environment variables and calls `createThemed` on the server. The generated theme object is returned as JSON; the client imports it into the local `ThemeProvider` with `importTheme`.

## Setup

```bash
# from the repo root
pnpm install

# configure credentials
cp examples/next/.env.example examples/next/.env.local
# edit .env.local and set AI_PROVIDER + AI_API_KEY
```

`.env.local` is server-only — Next.js never bundles it into the client.

**Supported providers:** `openai` · `claude` · `gemini` · `groq` · `moonshot` · `deepseek`

```env
AI_PROVIDER=openai
AI_API_KEY=sk-xxx
# AI_MODEL=              # optional, uses provider default if omitted
# AI_BASE_URL=           # optional, for custom endpoints
```

Common model IDs:

| Provider | Models |
|----------|--------|
| openai   | `gpt-5.6-luna` `gpt-5.6-terra` `gpt-5.6-sol` |
| claude   | `claude-sonnet-5` `claude-opus-5` `claude-haiku-4-5` |
| gemini   | `gemini-3.6-flash` `gemini-3.5-flash` `gemini-3.5-flash-lite` |
| groq     | `openai/gpt-oss-120b` `openai/gpt-oss-20b` |
| moonshot | `kimi-k3` `kimi-k2.6` `kimi-k2.7-code` |
| deepseek | `deepseek-v4-flash` `deepseek-v4-pro` |

## Run

```bash
# from the repo root
pnpm --filter themed-next-example dev
# → http://localhost:3003

# or from this directory
pnpm dev
```

## Project structure

```
examples/next/
├── src/app/
│   ├── api/generate-theme/
│   │   └── route.ts        # POST handler — themed.generate() runs here
│   ├── layout.tsx           # SSR styles injected via getSSRStyles()
│   ├── page.tsx             # client component — ThemeProvider + UI
│   └── globals.css
├── .env.example
└── next.config.ts           # transpilePackages for @themed.js/*
```

## Key points

- **No API key exposure** — `AI_API_KEY` lives in `.env.local`, read only by the server route
- **FOUC prevention** — `getSSRStyles('light', builtinThemes)` injects initial CSS in `<head>` at server render time
- **Import pattern** — after generation, the client calls `importTheme(JSON.stringify(theme))` then `apply(theme.id)` to register and activate the theme locally
