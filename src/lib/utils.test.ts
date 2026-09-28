import { describe, it, expect } from 'vitest';
import { getContrastRatio } from '../lib/utils';
import { generatePayloadString } from '../hooks/useQREditor';
import { Payload } from '../types';

describe('getContrastRatio', () => {
  it('returns 21 for identical black and white colors', () => {
    expect(getContrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
  });

  it('returns 1 for identical colors', () => {
    expect(getContrastRatio('#ff0000', '#ff0000')).toBeCloseTo(1, 2);
  });

  it('returns higher ratio for black-on-white than light gray-on-white', () => {
    const blackWhite = getContrastRatio('#000000', '#ffffff');
    const grayWhite = getContrastRatio('#808080', '#ffffff');
    expect(blackWhite).toBeGreaterThan(grayWhite);
  });
});

describe('generatePayloadString', () => {
  it('returns text directly for text payload', () => {
    const payload: Payload = { type: 'text', text: 'Hello World' };
    expect(generatePayloadString(payload)).toBe('Hello World');
  });

  it('normalizes URL by adding https://', () => {
    const payload: Payload = { type: 'url', url: 'example.com' };
    expect(generatePayloadString(payload)).toBe('https://example.com');
  });

  it('preserves http:// in URL', () => {
    const payload: Payload = { type: 'url', url: 'http://example.com' };
    expect(generatePayloadString(payload)).toBe('http://example.com');
  });

  it('preserves https:// in URL', () => {
    const payload: Payload = { type: 'url', url: 'https://example.com' };
    expect(generatePayloadString(payload)).toBe('https://example.com');
  });

  it('returns empty string for empty URL', () => {
    const payload: Payload = { type: 'url', url: '' };
    expect(generatePayloadString(payload)).toBe('');
  });

  it('generates mailto with subject and body', () => {
    const payload: Payload = {
      type: 'email', email: 'test@example.com', subject: 'Hello', body: 'World',
    };
    const result = generatePayloadString(payload);
    expect(result).toContain('mailto:test@example.com');
    expect(result).toContain('subject=Hello');
    expect(result).toContain('body=World');
  });

  it('generates tel: for phone', () => {
    const payload: Payload = { type: 'phone', phone: '+15551234567' };
    expect(generatePayloadString(payload)).toBe('tel:+15551234567');
  });

  it('returns empty string for empty phone', () => {
    const payload: Payload = { type: 'phone', phone: '' };
    expect(generatePayloadString(payload)).toBe('');
  });

  it('generates WIFI payload with correct escaping', () => {
    const payload: Payload = {
      type: 'wifi', ssid: 'MyNetwork', password: 'secret', encryption: 'WPA', hidden: false,
    };
    const result = generatePayloadString(payload);
    expect(result).toContain('WIFI:S:MyNetwork');
    expect(result).toContain('T:WPA');
    expect(result).toContain('P:secret');
    expect(result).toContain('H:false');
  });

  it('escapes special characters in SSID', () => {
    const payload: Payload = {
      type: 'wifi', ssid: 'My;Network', password: '', encryption: 'nopass', hidden: false,
    };
    const result = generatePayloadString(payload);
    expect(result).toContain('S:My\\;Network');
  });

  it('handles open network with no password', () => {
    const payload: Payload = {
      type: 'wifi', ssid: 'OpenNet', password: '', encryption: 'nopass', hidden: true,
    };
    const result = generatePayloadString(payload);
    expect(result).toContain('WIFI:S:OpenNet');
    expect(result).toContain('T:nopass');
    expect(result).toContain('H:true');
  });
});
