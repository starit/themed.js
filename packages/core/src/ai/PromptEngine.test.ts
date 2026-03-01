import { describe, it, expect } from 'vitest';
import { PromptEngine } from './PromptEngine';
import { lightTheme } from '../themes';

describe('PromptEngine', () => {
  const engine = new PromptEngine();

  describe('buildGeneratePrompt', () => {
    it('returns array with system and user messages', () => {
      const messages = engine.buildGeneratePrompt('a cozy theme');
      expect(messages).toHaveLength(2);
      expect(messages[0].role).toBe('system');
      expect(messages[0].content).toContain('JSON');
      expect(messages[1].role).toBe('user');
      expect(messages[1].content).toContain('a cozy theme');
    });

    it('does not add custom schema addendum when customSchema is absent', () => {
      const messages = engine.buildGeneratePrompt('a cozy theme');
      expect(messages[0].content).not.toContain('"custom"');
      expect(messages[1].content).not.toContain('Custom structure');
    });

    it('appends custom schema addendum to system prompt and user message when customSchema provided', () => {
      const messages = engine.buildGeneratePrompt('a cozy theme', 'brand guide with name and tone');
      expect(messages[0].content).toContain('"custom"');
      expect(messages[1].content).toContain('Custom structure');
      expect(messages[1].content).toContain('brand guide with name and tone');
    });

    it('treats JSON skeleton customSchema the same as natural language (passes it through)', () => {
      const skeleton = '{ "brandName": "...", "tone": "..." }';
      const messages = engine.buildGeneratePrompt('dark theme', skeleton);
      expect(messages[1].content).toContain(skeleton);
    });
  });

  describe('buildAdjustPrompt', () => {
    it('includes current theme JSON and instruction', () => {
      const messages = engine.buildAdjustPrompt(lightTheme, 'make it darker');
      expect(messages).toHaveLength(2);
      expect(messages[1].content).toContain('make it darker');
      expect(messages[1].content).toContain(lightTheme.tokens.colors.primary);
    });

    it('appends custom schema when provided', () => {
      const messages = engine.buildAdjustPrompt(lightTheme, 'make it darker', 'brand tone and name');
      expect(messages[0].content).toContain('"custom"');
      expect(messages[1].content).toContain('brand tone and name');
    });
  });

  describe('parseResponse', () => {
    it('parses valid JSON theme', () => {
      const json = JSON.stringify(lightTheme.tokens);
      const tokens = engine.parseResponse(json);
      expect(tokens.colors.primary).toBe(lightTheme.tokens.colors.primary);
      expect(tokens.typography.fontSize.base).toBe(lightTheme.tokens.typography.fontSize.base);
    });

    it('strips markdown code block and parses', () => {
      const wrapped = '```json\n' + JSON.stringify(lightTheme.tokens) + '\n```';
      const tokens = engine.parseResponse(wrapped);
      expect(tokens.colors.primary).toBe(lightTheme.tokens.colors.primary);
    });

    it('extracts JSON from surrounding text', () => {
      const text = 'Here is the theme:\n' + JSON.stringify(lightTheme.tokens) + '\nHope you like it.';
      const tokens = engine.parseResponse(text);
      expect(tokens.colors.primary).toBe(lightTheme.tokens.colors.primary);
    });

    it('throws on invalid JSON', () => {
      expect(() => engine.parseResponse('not json at all')).toThrow('Failed to parse');
      expect(() => engine.parseResponse('{ invalid }')).toThrow('Failed to parse');
    });

    it('throws when colors missing', () => {
      expect(() => engine.parseResponse('{"typography":{}}')).toThrow('missing or invalid colors');
    });

    it('uses default typography when typography missing', () => {
      const colorsOnly = JSON.stringify({ colors: lightTheme.tokens.colors });
      const tokens = engine.parseResponse(colorsOnly);
      expect(tokens.colors.primary).toBe(lightTheme.tokens.colors.primary);
      expect(tokens.typography.fontSize.base).toBeDefined();
    });

    it('uses default radius and shadow when omitted', () => {
      const colorsOnly = JSON.stringify({ colors: lightTheme.tokens.colors });
      const tokens = engine.parseResponse(colorsOnly);
      expect(tokens.radius?.md).toBeDefined();
      expect(tokens.shadow?.md).toBeDefined();
    });

    it('uses AI radius and shadow when provided and valid', () => {
      const withRadiusAndShadow = JSON.stringify({
        colors: lightTheme.tokens.colors,
        radius: { none: '0', sm: '0.5rem', md: '1rem', lg: '1.5rem', full: '9999px' },
        shadow: {
          none: 'none',
          sm: '0 2px 4px rgb(0 0 0 / 0.1)',
          md: '0 8px 16px rgb(0 0 0 / 0.15)',
          lg: '0 16px 32px rgb(0 0 0 / 0.2)',
        },
      });
      const tokens = engine.parseResponse(withRadiusAndShadow);
      expect(tokens.radius?.md).toBe('1rem');
      expect(tokens.shadow?.md).toBe('0 8px 16px rgb(0 0 0 / 0.15)');
    });
  });

  describe('parseFullResponse', () => {
    it('returns tokens without custom when no custom field in response', () => {
      const result = engine.parseFullResponse(JSON.stringify(lightTheme.tokens));
      expect(result.tokens.colors.primary).toBe(lightTheme.tokens.colors.primary);
      expect(result.custom).toBeUndefined();
    });

    it('extracts custom plain object alongside tokens', () => {
      const payload = {
        ...lightTheme.tokens,
        custom: { brandName: 'Acme', tone: 'professional' },
      };
      const result = engine.parseFullResponse(JSON.stringify(payload));
      expect(result.tokens.colors.primary).toBe(lightTheme.tokens.colors.primary);
      expect(result.custom).toEqual({ brandName: 'Acme', tone: 'professional' });
    });

    it('does not include custom keys inside the returned tokens', () => {
      const payload = {
        ...lightTheme.tokens,
        custom: { extra: true },
      };
      const result = engine.parseFullResponse(JSON.stringify(payload));
      expect((result.tokens as Record<string, unknown>).custom).toBeUndefined();
    });

    it('ignores custom when it is an array (not a plain object)', () => {
      const payload = { ...lightTheme.tokens, custom: [1, 2, 3] };
      const result = engine.parseFullResponse(JSON.stringify(payload));
      expect(result.custom).toBeUndefined();
    });

    it('ignores custom when it is a primitive', () => {
      const payload = { ...lightTheme.tokens, custom: 'string' };
      const result = engine.parseFullResponse(JSON.stringify(payload));
      expect(result.custom).toBeUndefined();
    });

    it('backward-compatible: parseResponse returns only tokens', () => {
      const payload = { ...lightTheme.tokens, custom: { key: 'val' } };
      const tokens = engine.parseResponse(JSON.stringify(payload));
      expect(tokens.colors.primary).toBe(lightTheme.tokens.colors.primary);
      expect((tokens as Record<string, unknown>).custom).toBeUndefined();
    });
  });
});
