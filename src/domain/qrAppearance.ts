import { QRAppearance, QRPreset } from '../types';

export const MIN_QR_SIZE = 128;
export const MAX_QR_SIZE = 1024;
export const DEFAULT_QR_SIZE = 300;

export const MIN_MARGIN = 0;
export const MAX_MARGIN = 40;
export const DEFAULT_MARGIN = 10;

export const MIN_LOGO_SIZE = 0;
export const MAX_LOGO_SIZE = 0.8;
export const DEFAULT_LOGO_SIZE = 0.4;

export const defaultAppearance: QRAppearance = {
  size: DEFAULT_QR_SIZE,
  margin: DEFAULT_MARGIN,
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  transparentBackground: false,
  moduleStyle: 'square',
  finderStyle: 'square',
  errorCorrectionLevel: 'M',
  logoSize: DEFAULT_LOGO_SIZE,
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function applyPreset(appearance: QRAppearance, preset: QRPreset): QRAppearance {
  return { ...appearance, ...preset.appearance };
}

export function resetAppearance(): QRAppearance {
  return { ...defaultAppearance };
}
