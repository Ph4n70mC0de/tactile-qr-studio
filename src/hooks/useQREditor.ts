import { useState, useMemo, useCallback } from 'react';
import { Payload, QRAppearance, ContentType, QRPreset } from '../types';

const defaultAppearance: QRAppearance = {
  size: 300,
  margin: 10,
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  transparentBackground: false,
  moduleStyle: 'square',
  finderStyle: 'square',
  errorCorrectionLevel: 'M',
  logoSize: 0.4,
};

export function generatePayloadString(payload: Payload): string {
  switch (payload.type) {
    case 'text':
      return payload.text;
    case 'url': {
      // Ensure it has a protocol
      if (!payload.url) return '';
      return /^https?:\/\//i.test(payload.url) ? payload.url : `https://${payload.url}`;
    }
    case 'email':
      if (!payload.email) return '';
      let mailto = `mailto:${payload.email}`;
      const params = new URLSearchParams();
      if (payload.subject) params.append('subject', payload.subject);
      if (payload.body) params.append('body', payload.body);
      const queryString = params.toString();
      if (queryString) mailto += `?${queryString}`;
      return mailto;
    case 'phone':
      return payload.phone ? `tel:${payload.phone}` : '';
    case 'wifi':
      if (!payload.ssid) return '';
      const escape = (str: string) => str.replace(/([\\;,":])/g, '\\$1');
      return `WIFI:S:${escape(payload.ssid)};T:${payload.encryption};P:${payload.password ? escape(payload.password) : ''};H:${payload.hidden ? 'true' : 'false'};;`;
    default:
      return '';
  }
}

export function useQREditor() {
  const [payload, setPayload] = useState<Payload>({ type: 'url', url: 'https://example.com' });
  const [appearance, setAppearance] = useState<QRAppearance>(defaultAppearance);

  const payloadString = useMemo(() => generatePayloadString(payload), [payload]);

  const updatePayload = useCallback((updates: Partial<Payload>) => {
    setPayload((prev) => ({ ...prev, ...updates } as Payload));
  }, []);

  const changeType = useCallback((type: ContentType) => {
    switch (type) {
      case 'text':
        setPayload({ type: 'text', text: '' });
        break;
      case 'url':
        setPayload({ type: 'url', url: '' });
        break;
      case 'email':
        setPayload({ type: 'email', email: '' });
        break;
      case 'phone':
        setPayload({ type: 'phone', phone: '' });
        break;
      case 'wifi':
        setPayload({ type: 'wifi', ssid: '', password: '', encryption: 'WPA', hidden: false });
        break;
    }
  }, []);

  const updateAppearance = useCallback((updates: Partial<QRAppearance>) => {
    setAppearance((prev) => ({ ...prev, ...updates }));
  }, []);

  const applyPreset = useCallback((preset: QRPreset) => {
    setAppearance((prev) => ({ ...prev, ...preset.appearance }));
  }, []);

  const reset = useCallback(() => {
    setPayload({ type: 'url', url: 'https://example.com' });
    setAppearance(defaultAppearance);
  }, []);

  return {
    payload,
    payloadString,
    appearance,
    updatePayload,
    changeType,
    updateAppearance,
    applyPreset,
    reset,
  };
}
