import { QRPreset } from '../types';

export const PRESETS: QRPreset[] = [
  {
    id: 'classic',
    name: 'Classic',
    appearance: {
      foregroundColor: '#000000',
      backgroundColor: '#ffffff',
      transparentBackground: false,
      moduleStyle: 'square',
      finderStyle: 'square',
      errorCorrectionLevel: 'M',
      logoUrl: undefined,
    }
  },
  {
    id: 'soft',
    name: 'Soft',
    appearance: {
      foregroundColor: '#4a5568',
      backgroundColor: '#e0e5ec',
      transparentBackground: false,
      moduleStyle: 'rounded',
      finderStyle: 'extra-rounded',
      errorCorrectionLevel: 'M',
      logoUrl: undefined,
    }
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    appearance: {
      foregroundColor: '#000000',
      backgroundColor: '#ffff00',
      transparentBackground: false,
      moduleStyle: 'square',
      finderStyle: 'square',
      errorCorrectionLevel: 'H',
      logoUrl: undefined,
    }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    appearance: {
      foregroundColor: '#1a202c',
      backgroundColor: '#f7fafc',
      transparentBackground: true,
      moduleStyle: 'dots',
      finderStyle: 'dot',
      errorCorrectionLevel: 'Q',
      logoUrl: undefined,
    }
  },
  {
    id: 'dark-mode',
    name: 'Dark Mode',
    appearance: {
      foregroundColor: '#ffffff',
      backgroundColor: '#1a202c',
      transparentBackground: false,
      moduleStyle: 'rounded',
      finderStyle: 'extra-rounded',
      errorCorrectionLevel: 'M',
      logoUrl: undefined,
    }
  },
  {
    id: 'accent',
    name: 'Accent',
    appearance: {
      foregroundColor: '#3b82f6',
      backgroundColor: '#e0e5ec',
      transparentBackground: false,
      moduleStyle: 'rounded',
      finderStyle: 'extra-rounded',
      errorCorrectionLevel: 'Q',
      logoUrl: undefined,
    }
  }
];
