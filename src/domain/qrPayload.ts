import { Payload } from '../types';

export function normalizeUrl(url: string): string {
  if (!url || !url.trim()) return '';
  const trimmed = url.trim();

  if (/^(ftp|javascript|data|file|vbscript|tel|mailto):/i.test(trimmed)) {
    return '';
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

export function escapeWifiValue(str: string): string {
  return str.replace(/([\\;,":])/g, '\\$1');
}

export function generatePayloadString(payload: Payload): string {
  switch (payload.type) {
    case 'text':
      return payload.text;
    case 'url': {
      const normalized = normalizeUrl(payload.url);
      return normalized;
    }
    case 'email': {
      if (!payload.email) return '';
      let mailto = `mailto:${payload.email}`;
      const params = new URLSearchParams();
      if (payload.subject) params.append('subject', payload.subject);
      if (payload.body) params.append('body', payload.body);
      const queryString = params.toString();
      if (queryString) mailto += `?${queryString}`;
      return mailto;
    }
    case 'phone':
      return payload.phone ? `tel:${payload.phone}` : '';
    case 'wifi': {
      if (!payload.ssid) return '';
      return `WIFI:S:${escapeWifiValue(payload.ssid)};T:${payload.encryption};P:${payload.password ? escapeWifiValue(payload.password) : ''};H:${payload.hidden ? 'true' : 'false'};;`;
    }
    default:
      return '';
  }
}
