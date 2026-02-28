import { describe, it, expect } from 'vitest';
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  getLuminance,
  isLight,
  lighten,
  darken,
  mix,
  complement,
} from './color';

describe('hexToRgb', () => {
  it('parses 6-digit hex', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb('#6366f1')).toEqual({ r: 99, g: 102, b: 241 });
  });

  it('parses 3-digit hex', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#000')).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('accepts hex without #', () => {
    expect(hexToRgb('ffffff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('returns null for invalid hex', () => {
    expect(hexToRgb('nothex')).toBeNull();
    expect(hexToRgb('#gggggg')).toBeNull();
    expect(hexToRgb('')).toBeNull();
  });
});

describe('rgbToHex', () => {
  it('converts RGB to hex', () => {
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff');
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
    expect(rgbToHex({ r: 99, g: 102, b: 241 })).toBe('#6366f1');
  });

  it('clamps values to 0-255', () => {
    expect(rgbToHex({ r: 300, g: -1, b: 128 })).toBe('#ff0080');
  });
});

describe('rgbToHsl and hslToRgb', () => {
  it('round-trips RGB -> HSL -> RGB', () => {
    const rgb = { r: 99, g: 102, b: 241 };
    const hsl = rgbToHsl(rgb);
    expect(hsl).toMatchObject({ h: expect.any(Number), s: expect.any(Number), l: expect.any(Number) });
    const back = hslToRgb(hsl);
    expect(Math.abs(back.r - rgb.r)).toBeLessThanOrEqual(1);
    expect(Math.abs(back.g - rgb.g)).toBeLessThanOrEqual(1);
    expect(Math.abs(back.b - rgb.b)).toBeLessThanOrEqual(1);
  });
});

describe('getLuminance', () => {
  it('returns 1 for white', () => {
    expect(getLuminance('#ffffff')).toBe(1);
  });

  it('returns 0 for black', () => {
    expect(getLuminance('#000000')).toBe(0);
  });

  it('returns a value between 0 and 1 for mid colors', () => {
    const lum = getLuminance('#6366f1');
    expect(lum).toBeGreaterThan(0);
    expect(lum).toBeLessThan(1);
  });
});

describe('isLight', () => {
  it('returns true for light colors', () => {
    expect(isLight('#ffffff')).toBe(true);
    expect(isLight('#f8fafc')).toBe(true);
  });

  it('returns false for dark colors', () => {
    expect(isLight('#000000')).toBe(false);
    expect(isLight('#111827')).toBe(false);
  });
});

describe('lighten and darken', () => {
  it('lighten increases lightness', () => {
    const hex = '#6366f1';
    const lighter = lighten(hex, 10);
    expect(getLuminance(lighter)).toBeGreaterThan(getLuminance(hex));
  });

  it('darken decreases lightness', () => {
    const hex = '#6366f1';
    const darker = darken(hex, 10);
    expect(getLuminance(darker)).toBeLessThan(getLuminance(hex));
  });
});

describe('mix', () => {
  it('returns first color at weight 0', () => {
    expect(mix('#ffffff', '#000000', 0)).toBe('#ffffff');
  });

  it('returns second color at weight 100', () => {
    expect(mix('#ffffff', '#000000', 100)).toBe('#000000');
  });

  it('returns mid blend at weight 50', () => {
    const result = mix('#ffffff', '#000000', 50);
    expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    const rgb = hexToRgb(result)!;
    expect(rgb.r).toBeCloseTo(128, 0);
    expect(rgb.g).toBeCloseTo(128, 0);
    expect(rgb.b).toBeCloseTo(128, 0);
  });
});

describe('complement', () => {
  it('returns a color 180 degrees apart in hue', () => {
    const hex = '#ff0000';
    const comp = complement(hex);
    expect(comp).not.toBe(hex);
    expect(hexToRgb(comp)).toBeTruthy();
  });
});
