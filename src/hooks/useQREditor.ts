import { useState, useMemo, useCallback } from 'react';
import { Payload, QRAppearance, ContentType, QRPreset } from '../types';
import { generatePayloadString } from '../domain/qrPayload';
import { defaultAppearance } from '../domain/qrAppearance';

export { generatePayloadString };
export { defaultAppearance };

export function useQREditor() {
  const [payload, setPayload] = useState<Payload>({ type: 'url', url: '' });
  const [appearance, setAppearance] = useState<QRAppearance>(defaultAppearance);

  const payloadString = useMemo(() => generatePayloadString(payload), [payload]);

  const updatePayload = useCallback((newPayload: Payload) => {
    setPayload(newPayload);
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
        setPayload({ type: 'email', email: '', subject: '', body: '' });
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
    setPayload({ type: 'url', url: '' });
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
