import { NextRequest, NextResponse } from 'next/server';
import { createThemed } from '@themed.js/core';
import type { AIOptions } from '@themed.js/core';

const SUPPORTED_PROVIDERS = [
  'openai',
  'claude',
  'gemini',
  'groq',
  'moonshot',
  'deepseek',
] as const;

type SupportedProvider = (typeof SUPPORTED_PROVIDERS)[number];

function getAIOptions(): AIOptions {
  const provider = (process.env.AI_PROVIDER ?? 'openai') as SupportedProvider;
  const apiKey = process.env.AI_API_KEY ?? '';
  const model = process.env.AI_MODEL || undefined;
  const baseURL = process.env.AI_BASE_URL || undefined;

  if (!(SUPPORTED_PROVIDERS as readonly string[]).includes(provider)) {
    throw new Error(
      `Unsupported AI_PROVIDER: "${provider}". Supported: ${SUPPORTED_PROVIDERS.join(', ')}`
    );
  }
  if (!apiKey) {
    throw new Error('AI_API_KEY is not configured on the server');
  }

  return { provider, apiKey, ...(model && { model }), ...(baseURL && { baseURL }) };
}

export async function POST(req: NextRequest) {
  let prompt: string;
  let customSchema: string | undefined;

  try {
    const body = await req.json();
    prompt = String(body.prompt ?? '').trim();
    customSchema = body.customSchema ? String(body.customSchema).trim() : undefined;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!prompt) {
    return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
  }
  if (prompt.length > 500) {
    return NextResponse.json({ error: 'prompt too long (max 500 chars)' }, { status: 400 });
  }

  let aiOptions: AIOptions;
  try {
    aiOptions = getAIOptions();
  } catch (e) {
    const message = e instanceof Error ? e.message : 'AI not configured';
    return NextResponse.json({ error: message }, { status: 503 });
  }

  try {
    // createThemed registers built-in themes; storage: none disables persistence
    // on the server. CSS injection is a no-op when document is absent.
    const themed = createThemed({
      ai: aiOptions,
      storage: { type: 'none' },
    });

    const theme = await themed.generate(prompt, {
      customSchema: customSchema || undefined,
      autoApply: false,
      autoSave: false,
    });

    return NextResponse.json({ theme });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Generation failed';
    console.error('[generate-theme]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
