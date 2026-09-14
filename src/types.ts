// QR Domain Types

export type ContentType = 'text' | 'url' | 'email' | 'phone' | 'wifi';

export interface BasePayload {
  type: ContentType;
}

export interface TextPayload extends BasePayload {
  type: 'text';
  text: string;
}

export interface UrlPayload extends BasePayload {
  type: 'url';
  url: string;
}

export interface EmailPayload extends BasePayload {
  type: 'email';
  email: string;
  subject?: string;
  body?: string;
}

export interface PhonePayload extends BasePayload {
  type: 'phone';
  phone: string;
}

export interface WifiPayload extends BasePayload {
  type: 'wifi';
  ssid: string;
  password?: string;
  encryption: 'WEP' | 'WPA' | 'nopass';
  hidden: boolean;
}

export type Payload = TextPayload | UrlPayload | EmailPayload | PhonePayload | WifiPayload;

export interface QRAppearance {
  size: number;
  margin: number;
  foregroundColor: string;
  backgroundColor: string;
  transparentBackground: boolean;
  moduleStyle: 'square' | 'dots' | 'rounded';
  finderStyle: 'square' | 'dot' | 'extra-rounded';
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  logoUrl?: string;
  logoSize: number; // multiplier of the QR size, e.g. 0.4
}

export interface QRPreset {
  id: string;
  name: string;
  appearance: Partial<QRAppearance>;
}
