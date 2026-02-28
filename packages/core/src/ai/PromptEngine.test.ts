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
  });

  describe('buildAdjustPrompt', () => {
    it('includes current theme JSON and instruction', () => {
      const messages = engine.buildAdjustPrompt(lightTheme, 'make it darker');
      expect(messages).toHaveLength(2);
      expect(messages[1].content).toContain('make it darker');
      expect(messages[1].content).toContain(lightTheme.tokens.colors.primary);
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
  });
});
