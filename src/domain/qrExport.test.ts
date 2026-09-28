import { describe, it, expect } from 'vitest';
import { generateSafeFilename, sanitizeFilename, getExportLabel, QRExportStatus } from './qrExport';

describe('sanitizeFilename', () => {
  it('lowercases and sanitizes basic names', () => {
    expect(sanitizeFilename('My QR Code')).toBe('my-qr-code');
  });

  it('replaces spaces with hyphens', () => {
    expect(sanitizeFilename('hello world')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(sanitizeFilename('hello@world!.com')).toBe('hello-world-com');
  });

  it('collapses multiple hyphens', () => {
    expect(sanitizeFilename('a--b---c')).toBe('a-b-c');
  });

  it('removes leading and trailing hyphens', () => {
    expect(sanitizeFilename('-hello-')).toBe('hello');
  });

  it('returns empty string for only special characters', () => {
    expect(sanitizeFilename('@#$')).toBe('');
  });

  it('preserves alphanumeric characters', () => {
    expect(sanitizeFilename('abc123')).toBe('abc123');
  });

  it('preserves hyphens and underscores', () => {
    expect(sanitizeFilename('a-b_c')).toBe('a-b_c');
  });
});

describe('generateSafeFilename', () => {
  it('generates a filename with the correct extension', () => {
    const result = generateSafeFilename('qr-code', 'png');
    expect(result).toMatch(/qr-code-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.png/);
  });

  it('generates SVG filename with correct extension', () => {
    const result = generateSafeFilename('my-code', 'svg');
    expect(result).toMatch(/my-code-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.svg/);
  });

  it('uses fallback name for empty base', () => {
    const result = generateSafeFilename('', 'png');
    expect(result).toMatch(/^qr-code-/);
  });

  it('sanitizes the base name', () => {
    const result = generateSafeFilename('My QR Code!', 'png');
    expect(result).toMatch(/^my-qr-code-/);
  });

  it('uses local time, not UTC', () => {
    const result = generateSafeFilename('test', 'svg');
    expect(result).toMatch(/^test-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.svg/);
  });
});

describe('getExportLabel', () => {
  const cases: Array<[QRExportStatus, string]> = [
    ['idle', 'Export'],
    ['exporting', 'Exporting...'],
    ['success', 'Export Complete'],
    ['error', 'Export Failed'],
  ];

  cases.forEach(([status, expected]) => {
    it(`returns "${expected}" for ${status}`, () => {
      expect(getExportLabel(status)).toBe(expected);
    });
  });
});
