import { describe, it, expect } from 'vitest';
import {
  getContrastRatio,
  meetsContrastRequirement,
  getContrastLevel,
  suggestTextColor,
  formatContrastRatio,
  generateContrastReport,
} from './contrast';

describe('getContrastRatio', () => {
  it('returns 21 for maximum contrast (black on white)', () => {
    const ratio = getContrastRatio('#000000', '#ffffff');
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('returns 1 for same color', () => {
    expect(getContrastRatio('#6366f1', '#6366f1')).toBe(1);
  });

  it('is symmetric', () => {
    expect(getContrastRatio('#000000', '#ffffff')).toBe(getContrastRatio('#ffffff', '#000000'));
  });
});

describe('meetsContrastRequirement', () => {
  it('black on white meets AAA', () => {
    expect(meetsContrastRequirement('#000000', '#ffffff', 'AAA')).toBe(true);
  });

  it('gray on white may fail AA', () => {
    const gray = '#cccccc';
    expect(meetsContrastRequirement(gray, '#ffffff', 'AA')).toBe(false);
  });
});

describe('getContrastLevel', () => {
  it('returns AAA for very high contrast', () => {
    expect(getContrastLevel('#000000', '#ffffff')).toBe('AAA');
  });

  it('returns fail for very low contrast', () => {
    expect(getContrastLevel('#ffffff', '#fffffe')).toBe('fail');
  });
});

describe('suggestTextColor', () => {
  it('suggests dark text on light background', () => {
    expect(suggestTextColor('#ffffff')).toBe('#1f2937');
    expect(suggestTextColor('#f8fafc')).toBe('#1f2937');
  });

  it('suggests light text on dark background', () => {
    expect(suggestTextColor('#111827')).toBe('#ffffff');
    expect(suggestTextColor('#000000')).toBe('#ffffff');
  });
});

describe('formatContrastRatio', () => {
  it('formats ratio as X.XX:1', () => {
    expect(formatContrastRatio(4.5)).toBe('4.50:1');
    expect(formatContrastRatio(21)).toBe('21.00:1');
  });
});

describe('generateContrastReport', () => {
  it('returns report for text/background pairs', () => {
    const colors = {
      textPrimary: '#1f2937',
      background: '#ffffff',
      surface: '#f8fafc',
    };
    const report = generateContrastReport(
      colors,
      ['textPrimary'],
      ['background', 'surface'],
      'AA'
    );

    expect(report).toHaveLength(2);
    expect(report[0]).toMatchObject({
      names: ['textPrimary', 'background'],
      pair: [colors.textPrimary, colors.background],
      ratio: expect.any(Number),
      level: expect.any(String),
      passes: expect.any(Boolean),
    });
  });

  it('skips missing color keys', () => {
    const colors = { textPrimary: '#1f2937', background: '#ffffff' };
    const report = generateContrastReport(
      colors,
      ['textPrimary', 'missing'],
      ['background'],
      'AA'
    );
    expect(report).toHaveLength(1);
  });
});
