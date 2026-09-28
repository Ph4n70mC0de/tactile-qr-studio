import { describe, it, expect } from 'vitest';
import { validatePayload, validateUrl, validateEmail, validatePhone, validateWifi, validateAppearance, validateExport } from './qrValidation';
import { Payload, QRAppearance } from '../types';
import { defaultAppearance } from './qrAppearance';

describe('validateUrl', () => {
  it('rejects empty URL', () => {
    const result = validateUrl('');
    expect(result.isValid).toBe(false);
    expect(result.messages.some(m => m.code === 'url_empty')).toBe(true);
  });

  it('rejects whitespace-only URL', () => {
    const result = validateUrl('   ');
    expect(result.isValid).toBe(false);
  });

  it('accepts valid HTTP URL', () => {
    const result = validateUrl('http://example.com');
    expect(result.isValid).toBe(true);
  });

  it('accepts valid HTTPS URL', () => {
    const result = validateUrl('https://example.com/path');
    expect(result.isValid).toBe(true);
  });

  it('accepts URL without protocol (will be normalized)', () => {
    const result = validateUrl('example.com');
    expect(result.isValid).toBe(true);
    expect(result.messages.some(m => m.code === 'url_normalized')).toBe(true);
  });

  it('rejects ftp:// protocol', () => {
    const result = validateUrl('ftp://example.com');
    expect(result.isValid).toBe(false);
    expect(result.messages.some(m => m.code === 'url_unsupported_protocol')).toBe(true);
  });

  it('rejects javascript: protocol', () => {
    const result = validateUrl('javascript:alert(1)');
    expect(result.isValid).toBe(false);
  });

  it('rejects data: protocol', () => {
    const result = validateUrl('data:text/html,<script>');
    expect(result.isValid).toBe(false);
  });

  it('rejected URL with tel: prefix when using URL type', () => {
    const result = validateUrl('tel:+1234567890');
    expect(result.isValid).toBe(false);
  });

  it('rejected URL with mailto: prefix', () => {
    const result = validateUrl('mailto:test@example.com');
    expect(result.isValid).toBe(false);
  });
});

describe('validateEmail', () => {
  it('rejects empty email', () => {
    const result = validateEmail('');
    expect(result.isValid).toBe(false);
    expect(result.messages.some(m => m.code === 'email_empty')).toBe(true);
  });

  it('accepts valid email', () => {
    const result = validateEmail('user@example.com');
    expect(result.isValid).toBe(true);
  });

  it('accepts email with subdomain', () => {
    const result = validateEmail('user@mail.example.com');
    expect(result.isValid).toBe(true);
  });

  it('rejects email without @', () => {
    const result = validateEmail('userexample.com');
    expect(result.isValid).toBe(false);
  });

  it('rejects email without domain', () => {
    const result = validateEmail('user@');
    expect(result.isValid).toBe(false);
  });

  it('rejects email without TLD', () => {
    const result = validateEmail('user@example');
    expect(result.isValid).toBe(false);
  });

  it('rejects email with spaces', () => {
    const result = validateEmail('user @example.com');
    expect(result.isValid).toBe(false);
  });
});

describe('validatePhone', () => {
  it('rejects empty phone', () => {
    const result = validatePhone('');
    expect(result.isValid).toBe(false);
    expect(result.messages.some(m => m.code === 'phone_empty')).toBe(true);
  });

  it('accepts valid 09-starting 11-digit phone number', () => {
    const result = validatePhone('09123456789');
    expect(result.isValid).toBe(true);
  });

  it('rejects phone not starting with 09', () => {
    const result = validatePhone('12345678901');
    expect(result.isValid).toBe(false);
  });

  it('rejects phone shorter than 11 digits', () => {
    const result = validatePhone('0912345678');
    expect(result.isValid).toBe(false);
  });

  it('rejects phone longer than 11 digits', () => {
    const result = validatePhone('091234567890');
    expect(result.isValid).toBe(false);
  });

  it('rejects phone with letters', () => {
    const result = validatePhone('0912ABCDEFG');
    expect(result.isValid).toBe(false);
  });

  it('rejects phone with spaces and symbols', () => {
    const result = validatePhone('0912 345-678');
    expect(result.isValid).toBe(false);
  });
});

describe('validateWifi', () => {
  it('rejects empty SSID', () => {
    const result = validateWifi('', '', 'WPA');
    expect(result.isValid).toBe(false);
    expect(result.messages.some(m => m.code === 'wifi_ssid_empty')).toBe(true);
  });

  it('accepts valid WPA network with password', () => {
    const result = validateWifi('MyNetwork', 'securePassword123', 'WPA');
    expect(result.isValid).toBe(true);
  });

  it('rejects WPA network without password', () => {
    const result = validateWifi('MyNetwork', '', 'WPA');
    expect(result.isValid).toBe(false);
    expect(result.messages.some(m => m.code === 'wifi_password_required')).toBe(true);
  });

  it('accepts open network without password', () => {
    const result = validateWifi('OpenNet', '', 'nopass');
    expect(result.isValid).toBe(true);
  });

  it('rejects SSID longer than 32 characters', () => {
    const result = validateWifi('A'.repeat(33), 'password', 'WPA');
    expect(result.isValid).toBe(false);
    expect(result.messages.some(m => m.code === 'wifi_ssid_too_long')).toBe(true);
  });

  it('rejects password longer than 63 characters', () => {
    const result = validateWifi('MyNetwork', 'A'.repeat(64), 'WPA');
    expect(result.isValid).toBe(false);
    expect(result.messages.some(m => m.code === 'wifi_password_too_long')).toBe(true);
  });

  it('warns on weak password (less than 8 chars)', () => {
    const result = validateWifi('MyNetwork', 'short', 'WPA');
    expect(result.isValid).toBe(true);
    expect(result.messages.some(m => m.code === 'wifi_password_weak')).toBe(true);
  });

  it('accepts WEP network with password', () => {
    const result = validateWifi('WepNet', 'password', 'WEP');
    expect(result.isValid).toBe(true);
  });

  it('warns on special characters in password', () => {
    const result = validateWifi('MyNetwork', 'pass"word;', 'WPA');
    expect(result.messages.some(m => m.code === 'wifi_password_special_chars')).toBe(true);
  });
});

describe('validatePayload', () => {
  it('validates text payload', () => {
    expect(validatePayload({ type: 'text', text: 'Hello' }).isValid).toBe(true);
    expect(validatePayload({ type: 'text', text: '' }).isValid).toBe(false);
  });

  it('validates URL payload', () => {
    expect(validatePayload({ type: 'url', url: 'https://example.com' }).isValid).toBe(true);
    expect(validatePayload({ type: 'url', url: '' }).isValid).toBe(false);
    expect(validatePayload({ type: 'url', url: 'ftp://bad.com' }).isValid).toBe(false);
  });

  it('validates email payload', () => {
    expect(validatePayload({ type: 'email', email: 'user@example.com' }).isValid).toBe(true);
    expect(validatePayload({ type: 'email', email: 'bad' }).isValid).toBe(false);
  });

  it('validates phone payload', () => {
    expect(validatePayload({ type: 'phone', phone: '+15551234567' }).isValid).toBe(true);
    expect(validatePayload({ type: 'phone', phone: '' }).isValid).toBe(false);
  });

  it('validates wifi payload', () => {
    expect(validatePayload({ type: 'wifi', ssid: 'Net', password: 'pass', encryption: 'WPA', hidden: false }).isValid).toBe(true);
    expect(validatePayload({ type: 'wifi', ssid: '', password: '', encryption: 'WPA', hidden: false }).isValid).toBe(false);
  });
});

describe('validateAppearance', () => {
  const basePayload: Payload = { type: 'text', text: 'Hello World' };

  it('passes with default appearance', () => {
    const results = validateAppearance(defaultAppearance, basePayload);
    expect(results.some(m => m.severity === 'error')).toBe(false);
  });

  it('warns on low contrast', () => {
    const appearance: QRAppearance = {
      ...defaultAppearance,
      foregroundColor: '#cccccc',
      backgroundColor: '#e0e5ec',
    };
    const results = validateAppearance(appearance, basePayload);
    expect(results.some(m => m.severity === 'error' && m.code === 'low_contrast')).toBe(true);
  });

  it('warns on insufficient quiet zone', () => {
    const appearance: QRAppearance = { ...defaultAppearance, margin: 0 };
    const results = validateAppearance(appearance, basePayload);
    expect(results.some(m => m.code === 'insufficient_quiet_zone')).toBe(true);
  });

  it('warns when logo present without H error correction', () => {
    const appearance: QRAppearance = {
      ...defaultAppearance,
      logoFile: new File([''], 'logo.png', { type: 'image/png' }),
      errorCorrectionLevel: 'M',
    };
    const results = validateAppearance(appearance, basePayload);
    expect(results.some(m => m.code === 'logo_low_error_correction')).toBe(true);
  });

  it('does not warn about error correction when logo with H', () => {
    const appearance: QRAppearance = {
      ...defaultAppearance,
      logoFile: new File([''], 'logo.png', { type: 'image/png' }),
      errorCorrectionLevel: 'H',
    };
    const results = validateAppearance(appearance, basePayload);
    expect(results.some(m => m.code === 'logo_low_error_correction')).toBe(false);
  });

  it('warns when logo is too large', () => {
    const appearance: QRAppearance = {
      ...defaultAppearance,
      logoFile: new File([''], 'logo.png', { type: 'image/png' }),
      errorCorrectionLevel: 'H',
      logoSize: 0.5,
    };
    const results = validateAppearance(appearance, basePayload);
    expect(results.some(m => m.code === 'logo_too_large')).toBe(true);
  });

  it('warns on dense payload', () => {
    const longPayload: Payload = { type: 'text', text: 'x'.repeat(2100) };
    const results = validateAppearance(defaultAppearance, longPayload);
    expect(results.some(m => m.code === 'payload_too_dense')).toBe(true);
  });

  it('does not warn about density for short payload', () => {
    const results = validateAppearance(defaultAppearance, basePayload);
    expect(results.some(m => m.code === 'payload_too_dense')).toBe(false);
  });

  it('info message on transparent background', () => {
    const appearance: QRAppearance = { ...defaultAppearance, transparentBackground: true };
    const results = validateAppearance(appearance, basePayload);
    expect(results.some(m => m.code === 'transparent_background')).toBe(true);
  });

  it('does not check contrast when transparent background is enabled', () => {
    const appearance: QRAppearance = {
      ...defaultAppearance,
      transparentBackground: true,
      foregroundColor: '#cccccc',
      backgroundColor: '#e0e5ec',
    };
    const results = validateAppearance(appearance, basePayload);
    expect(results.some(m => m.code === 'low_contrast')).toBe(false);
  });
});

describe('validateExport', () => {
  const basePayload: Payload = { type: 'url', url: 'https://example.com' };

  it('errors on empty payload for export', () => {
    const emptyPayload: Payload = { type: 'text', text: '' };
    const results = validateExport(defaultAppearance, emptyPayload, 'png');
    expect(results.some(m => m.code === 'export_empty_payload')).toBe(true);
  });

  it('passes with valid payload', () => {
    const results = validateExport(defaultAppearance, basePayload, 'png');
    expect(results.some(m => m.severity === 'error')).toBe(false);
  });

  it('warns on small PNG size', () => {
    const appearance: QRAppearance = { ...defaultAppearance, size: 50 };
    const results = validateExport(appearance, basePayload, 'png');
    expect(results.some(m => m.code === 'export_png_small')).toBe(true);
  });

  it('does not warn on small size for SVG', () => {
    const appearance: QRAppearance = { ...defaultAppearance, size: 50 };
    const results = validateExport(appearance, basePayload, 'svg');
    expect(results.some(m => m.code === 'export_png_small')).toBe(false);
  });

  it('notes logo in export message when present', () => {
    const appearance: QRAppearance = {
      ...defaultAppearance,
      logoFile: new File([''], 'logo.png', { type: 'image/png' }),
      errorCorrectionLevel: 'H',
    };
    const results = validateExport(appearance, basePayload, 'png');
    expect(results.some(m => m.code === 'logo_export')).toBe(true);
  });
});
