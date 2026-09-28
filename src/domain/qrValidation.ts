import { Payload, QRAppearance } from '../types';
import { generatePayloadString } from './qrPayload';
import { getContrastRatio } from '../lib/utils';

export type QRWarningSeverity = 'info' | 'warning' | 'error';

export interface QRValidationMessage {
  severity: QRWarningSeverity;
  code: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  messages: QRValidationMessage[];
}

export function createResult(messages: QRValidationMessage[]): ValidationResult {
  return {
    isValid: messages.every(m => m.severity !== 'error'),
    messages,
  };
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^09\d{9}$/;

export function validateText(text: string): ValidationResult {
  const messages: QRValidationMessage[] = [];

  if (!text || !text.trim()) {
    messages.push({ severity: 'error', code: 'text_empty', message: 'Text content is required.' });
    return createResult(messages);
  }

  if (text.trim().length > 4296) {
    messages.push({ severity: 'warning', code: 'text_too_long', message: 'Text is very long. Large payloads produce dense QR codes that may be hard to scan.' });
  }

  return createResult(messages);
}

export function validateUrl(url: string): ValidationResult {
  const messages: QRValidationMessage[] = [];

  if (!url || !url.trim()) {
    messages.push({ severity: 'error', code: 'url_empty', message: 'URL is required.' });
    return createResult(messages);
  }

  const trimmed = url.trim();

  if (/^(ftp|javascript|data|file|vbscript):/i.test(trimmed)) {
    messages.push({
      severity: 'error',
      code: 'url_unsupported_protocol',
      message: 'Unsupported protocol. Only HTTP, HTTPS, or plain domain names are accepted.',
    });
    return createResult(messages);
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (!parsed.hostname || (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost')) {
        messages.push({ severity: 'error', code: 'url_invalid_domain', message: 'Please enter a valid URL with a proper domain name.' });
      } else {
        messages.push({ severity: 'info', code: 'url_valid', message: 'URL is valid and will be encoded as-is.' });
      }
    } catch {
      messages.push({ severity: 'error', code: 'url_malformed', message: 'Please enter a valid URL.' });
    }
  } else {
    if (/^(tel|mailto):/i.test(trimmed)) {
      messages.push({ severity: 'error', code: 'url_protocol_conflict', message: 'Use the dedicated content type for phone numbers or email addresses.' });
      return createResult(messages);
    }

    messages.push({ severity: 'info', code: 'url_normalized', message: 'HTTPS will be added automatically.' });
  }

  return createResult(messages);
}

export function validateEmail(email: string): ValidationResult {
  const messages: QRValidationMessage[] = [];

  if (!email || !email.trim()) {
    messages.push({ severity: 'error', code: 'email_empty', message: 'Email address is required.' });
    return createResult(messages);
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    messages.push({ severity: 'error', code: 'email_invalid', message: 'Please enter a valid email address.' });
  } else {
    messages.push({ severity: 'info', code: 'email_valid', message: 'Email address is valid.' });
  }

  return createResult(messages);
}

export function validatePhone(phone: string): ValidationResult {
  const messages: QRValidationMessage[] = [];

  if (!phone || !phone.trim()) {
    messages.push({ severity: 'error', code: 'phone_empty', message: 'Phone number is required.' });
    return createResult(messages);
  }

  if (!PHONE_REGEX.test(phone.trim())) {
    messages.push({ severity: 'error', code: 'phone_invalid', message: 'Enter an 11-digit mobile number starting with 09.' });
  } else {
    messages.push({ severity: 'info', code: 'phone_valid', message: 'Phone number is valid.' });
  }

  return createResult(messages);
}

export function validateWifi(
  ssid: string,
  password?: string,
  encryption?: 'WEP' | 'WPA' | 'nopass'
): ValidationResult {
  const messages: QRValidationMessage[] = [];

  if (!ssid || !ssid.trim()) {
    messages.push({ severity: 'error', code: 'wifi_ssid_empty', message: 'Network name (SSID) is required.' });
    return createResult(messages);
  }

  if (ssid.length > 32) {
    messages.push({ severity: 'error', code: 'wifi_ssid_too_long', message: 'SSID must be 32 characters or fewer.' });
  }

  if (encryption !== 'nopass' && (!password || !password.trim())) {
    messages.push({ severity: 'error', code: 'wifi_password_required', message: 'Password is required for encrypted networks.' });
  }

  if (password && password.trim().length < 8 && encryption !== 'nopass') {
    messages.push({ severity: 'warning', code: 'wifi_password_weak', message: 'WPA/WPA2 passwords should be at least 8 characters for security.' });
  }

  if (password && password.length > 63 && (encryption === 'WPA' || encryption === 'WEP')) {
    messages.push({ severity: 'error', code: 'wifi_password_too_long', message: 'Password must be 63 characters or fewer.' });
  }

  const passwordHasSpecial = password && /([\\;,":])/.test(password);
  if (passwordHasSpecial) {
    messages.push({ severity: 'info', code: 'wifi_password_special_chars', message: 'Special characters in password will be escaped during encoding.' });
  }

  return createResult(messages);
}

export function validatePayload(payload: Payload): ValidationResult {
  switch (payload.type) {
    case 'text':
      return validateText(payload.text);
    case 'url':
      return validateUrl(payload.url);
    case 'email': {
      const result = validateEmail(payload.email);
      if (payload.subject && payload.subject.length > 255) {
        result.messages.push({ severity: 'warning', code: 'email_subject_long', message: 'Subject is very long and may not display correctly on all devices.' });
      }
      if (payload.body && payload.body.length > 1000) {
        result.messages.push({ severity: 'warning', code: 'email_body_long', message: 'Email body is very long. Consider shortening for better compatibility.' });
      }
      return result;
    }
    case 'phone':
      return validatePhone(payload.phone);
    case 'wifi':
      return validateWifi(payload.ssid, payload.password, payload.encryption);
    default:
      return createResult([{ severity: 'error', code: 'unsupported_type', message: 'Unsupported content type.' }]);
  }
}

const MIN_CONTRAST_RATIO = 4.5;
const MIN_QUIET_ZONE = 4;
const MAX_LOGO_RATIO = 0.30;
const MAX_PAYLOAD_DENSITY = 2000;

export function validateAppearance(appearance: QRAppearance, payload: Payload): QRValidationMessage[] {
  const messages: QRValidationMessage[] = [];

  if (!appearance.transparentBackground) {
    const contrast = getContrastRatio(appearance.foregroundColor, appearance.backgroundColor);
    if (contrast < MIN_CONTRAST_RATIO) {
      messages.push({
        severity: 'error',
        code: 'low_contrast',
        message: `Contrast ratio is ${contrast.toFixed(1)}:1. A minimum of ${MIN_CONTRAST_RATIO}:1 is recommended for reliable scanning.`,
      });
    } else if (contrast < 7) {
      messages.push({
        severity: 'info',
        code: 'moderate_contrast',
        message: `Contrast ratio is ${contrast.toFixed(1)}:1. Higher contrast improves scan reliability.`,
      });
    }
  }

  if (appearance.margin < MIN_QUIET_ZONE) {
    messages.push({
      severity: 'warning',
      code: 'insufficient_quiet_zone',
      message: `Quiet zone margin is ${appearance.margin}. A minimum of ${MIN_QUIET_ZONE} is recommended for reliable scanning.`,
    });
  }

  if (appearance.logoFile) {
    if (appearance.errorCorrectionLevel !== 'H') {
      messages.push({
        severity: 'warning',
        code: 'logo_low_error_correction',
        message: 'When using a logo, Error Correction level "H" is recommended for better scan reliability.',
      });
    }

    if (appearance.logoSize > MAX_LOGO_RATIO) {
      messages.push({
        severity: 'warning',
        code: 'logo_too_large',
        message: `Logo size (${Math.round(appearance.logoSize * 100)}%) may be too large. A maximum of ${Math.round(MAX_LOGO_RATIO * 100)}% is recommended.`,
      });
    }
  }

  const payloadString = generatePayloadString(payload);

  if (payloadString && payloadString.length > MAX_PAYLOAD_DENSITY) {
    messages.push({
      severity: 'warning',
      code: 'payload_too_dense',
      message: `Payload is very long (${payloadString.length} characters). Dense QR codes may be difficult to scan at small sizes.`,
    });
  }

  if (appearance.transparentBackground) {
    messages.push({
      severity: 'info',
      code: 'transparent_background',
      message: 'Background will be transparent in the exported image.',
    });
  }

  return messages;
}

export function validateExport(appearance: QRAppearance, payload: Payload, format: 'png' | 'svg'): QRValidationMessage[] {
  const messages: QRValidationMessage[] = [];

  const payloadString = generatePayloadString(payload);

  if (!payloadString) {
    messages.push({ severity: 'error', code: 'export_empty_payload', message: 'Cannot export: content is empty.' });
    return messages;
  }

  if (format === 'png' && appearance.size < 100) {
    messages.push({ severity: 'warning', code: 'export_png_small', message: 'PNG export at small sizes may appear pixelated. Consider increasing QR size.' });
  }

  if (appearance.logoFile && !appearance.transparentBackground) {
    messages.push({ severity: 'info', code: 'logo_export', message: 'Logo will be included in the exported image.' });
  }

  return messages;
}
