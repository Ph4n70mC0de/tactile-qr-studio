export type QRExportFormat = 'png' | 'svg';

export interface QRExportOptions {
  format: QRExportFormat;
  filename: string;
}

export type QRExportStatus = 'idle' | 'exporting' | 'success' | 'error';

export interface QRExportState {
  status: QRExportStatus;
  error: string | null;
  filename: string | null;
}

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

export function generateSafeFilename(base: string, format: QRExportFormat): string {
  const sanitizedBase = sanitizeFilename(base || 'qr-code');
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  return `${sanitizedBase}-${timestamp}.${format}`;
}

export function getExportLabel(status: QRExportStatus): string {
  switch (status) {
    case 'idle': return 'Export';
    case 'exporting': return 'Exporting...';
    case 'success': return 'Export Complete';
    case 'error': return 'Export Failed';
    default: return 'Export';
  }
}
