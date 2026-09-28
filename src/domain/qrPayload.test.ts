import { describe, it, expect } from 'vitest';
import { generatePayloadString, normalizeUrl, escapeWifiValue } from './qrPayload';
import { Payload } from '../types';

describe('normalizeUrl', () => {
  it('returns empty string for empty input', () => {
    expect(normalizeUrl('')).toBe('');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(normalizeUrl('   ')).toBe('');
  });

  it('preserves https:// URLs', () => {
    expect(normalizeUrl('https://example.com')).toBe('https://example.com');
  });

  it('preserves http:// URLs', () => {
    expect(normalizeUrl('http://example.com')).toBe('http://example.com');
  });

  it('adds https:// when protocol is missing', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com');
  });

  it('adds https:// for paths without protocol', () => {
    expect(normalizeUrl('example.com/path')).toBe('https://example.com/path');
  });

  it('rejects ftp:// protocol', () => {
    expect(normalizeUrl('ftp://example.com')).toBe('');
  });

  it('rejects javascript: protocol', () => {
    expect(normalizeUrl('javascript:alert(1)')).toBe('');
  });

  it('rejects data: protocol', () => {
    expect(normalizeUrl('data:text/html,<script>')).toBe('');
  });

  it('rejects file: protocol', () => {
    expect(normalizeUrl('file:///etc/passwd')).toBe('');
  });

  it('rejects vbscript: protocol', () => {
    expect(normalizeUrl('vbscript:msgbox')).toBe('');
  });

  it('handles whitespace by trimming', () => {
    expect(normalizeUrl('  example.com  ')).toBe('https://example.com');
  });

  it('is case-insensitive for protocol detection', () => {
    expect(normalizeUrl('HTTPS://example.com')).toBe('HTTPS://example.com');
  });
});

describe('escapeWifiValue', () => {
  it('does not modify normal strings', () => {
    expect(escapeWifiValue('MyNetwork')).toBe('MyNetwork');
  });

  it('escapes semicolons', () => {
    expect(escapeWifiValue('a;b')).toBe('a\\;b');
  });

  it('escapes commas', () => {
    expect(escapeWifiValue('a,b')).toBe('a\\,b');
  });

  it('escapes backslashes', () => {
    expect(escapeWifiValue('a\\b')).toBe('a\\\\b');
  });

  it('escapes double quotes', () => {
    expect(escapeWifiValue('a"b')).toBe('a\\"b');
  });

  it('escapes colons', () => {
    expect(escapeWifiValue('a:b')).toBe('a\\:b');
  });

  it('escapes multiple special characters', () => {
    expect(escapeWifiValue('a";b:c,d\\e')).toBe('a\\"\\;b\\:c\\,d\\\\e');
  });
});

describe('generatePayloadString', () => {
  it('returns text directly for text payload', () => {
    const payload: Payload = { type: 'text', text: 'Hello World' };
    expect(generatePayloadString(payload)).toBe('Hello World');
  });

  it('returns empty string for empty text payload', () => {
    const payload: Payload = { type: 'text', text: '' };
    expect(generatePayloadString(payload)).toBe('');
  });

  it('normalizes URL by adding https:// when no protocol', () => {
    const payload: Payload = { type: 'url', url: 'example.com' };
    expect(generatePayloadString(payload)).toBe('https://example.com');
  });

  it('preserves http:// URLs', () => {
    const payload: Payload = { type: 'url', url: 'http://example.com' };
    expect(generatePayloadString(payload)).toBe('http://example.com');
  });

  it('returns empty string for empty URL', () => {
    const payload: Payload = { type: 'url', url: '' };
    expect(generatePayloadString(payload)).toBe('');
  });

  it('returns empty string for unsupported protocol URLs', () => {
    const payload: Payload = { type: 'url', url: 'ftp://example.com' };
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

  it('generates mailto without subject and body', () => {
    const payload: Payload = {
      type: 'email', email: 'test@example.com',
    };
    expect(generatePayloadString(payload)).toBe('mailto:test@example.com');
  });

  it('returns empty string for empty email', () => {
    const payload: Payload = { type: 'email', email: '' };
    expect(generatePayloadString(payload)).toBe('');
  });

  it('generates tel: for phone', () => {
    const payload: Payload = { type: 'phone', phone: '+15551234567' };
    expect(generatePayloadString(payload)).toBe('tel:+15551234567');
  });

  it('returns empty string for empty phone', () => {
    const payload: Payload = { type: 'phone', phone: '' };
    expect(generatePayloadString(payload)).toBe('');
  });

  it('generates WIFI payload with WPA encryption', () => {
    const payload: Payload = {
      type: 'wifi', ssid: 'MyNetwork', password: 'secret', encryption: 'WPA', hidden: false,
    };
    const result = generatePayloadString(payload);
    expect(result).toBe('WIFI:S:MyNetwork;T:WPA;P:secret;H:false;;');
  });

  it('generates WIFI payload with hidden network', () => {
    const payload: Payload = {
      type: 'wifi', ssid: 'HiddenNet', password: 'password123', encryption: 'WPA', hidden: true,
    };
    const result = generatePayloadString(payload);
    expect(result).toContain('H:true');
  });

  it('generates WIFI payload with no password', () => {
    const payload: Payload = {
      type: 'wifi', ssid: 'OpenNet', password: '', encryption: 'nopass', hidden: false,
    };
    const result = generatePayloadString(payload);
    expect(result).toContain('T:nopass');
    expect(result).toContain('P:');
  });

  it('escapes special characters in SSID', () => {
    const payload: Payload = {
      type: 'wifi', ssid: 'My;Network', password: 'secret', encryption: 'WPA', hidden: false,
    };
    const result = generatePayloadString(payload);
    expect(result).toContain('S:My\\;Network');
  });

  it('returns empty string for empty SSID', () => {
    const payload: Payload = {
      type: 'wifi', ssid: '', password: '', encryption: 'WPA', hidden: false,
    };
    expect(generatePayloadString(payload)).toBe('');
  });

  it('handles special characters in email subject', () => {
    const payload: Payload = {
      type: 'email', email: 'test@example.com', subject: 'Hello & Goodbye', body: 'See you!',
    };
    const result = generatePayloadString(payload);
    expect(result).toContain('mailto:test@example.com');
    expect(result).toContain('subject=Hello+%26+Goodbye');
    expect(result).toContain('body=See+you%21');
  });
});
