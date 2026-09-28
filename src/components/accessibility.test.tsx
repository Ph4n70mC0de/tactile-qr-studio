import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import axe from 'axe-core';

import { QRContentForm } from './QRContentForm';
import { QRAppearanceForm } from './QRAppearanceForm';
import { Payload, QRAppearance } from '../types';

const textPayload: Payload = { type: 'text', text: 'Hello World' };
const urlPayload: Payload = { type: 'url', url: 'https://example.com' };
const wifiPayload: Payload = {
  type: 'wifi',
  ssid: 'MyNetwork',
  password: 'secret123',
  encryption: 'WPA',
  hidden: false,
};

const baseAppearance: QRAppearance = {
  size: 300,
  margin: 10,
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  transparentBackground: false,
  moduleStyle: 'square',
  finderStyle: 'square',
  errorCorrectionLevel: 'M',
  logoUrl: '',
  logoSize: 0.4,
};

async function checkAxe(node: HTMLElement) {
  const results = await axe.run(node, {
    rules: {
      'color-contrast': { enabled: false },
    },
  });
  return results;
}

describe('QRContentForm accessibility', () => {
  it('has no accessibility violations with text payload', async () => {
    const { container } = render(<QRContentForm payload={textPayload} onChange={vi.fn()} />);
    const results = await checkAxe(container);
    expect(results.violations).toEqual([]);
  });

  it('has no accessibility violations with url payload', async () => {
    const { container } = render(<QRContentForm payload={urlPayload} onChange={vi.fn()} />);
    const results = await checkAxe(container);
    expect(results.violations).toEqual([]);
  });

  it('has no accessibility violations with wifi payload', async () => {
    const { container } = render(<QRContentForm payload={wifiPayload} onChange={vi.fn()} />);
    const results = await checkAxe(container);
    expect(results.violations).toEqual([]);
  });

  it('has no accessibility violations with empty text payload', async () => {
    const { container } = render(<QRContentForm payload={{ type: 'text', text: '' }} onChange={vi.fn()} />);
    const results = await checkAxe(container);
    expect(results.violations).toEqual([]);
  });

  it('has no accessibility violations with unsupported URL protocol', async () => {
    const { container } = render(
      <QRContentForm payload={{ type: 'url', url: 'javascript:alert(1)' }} onChange={vi.fn()} />
    );
    const results = await checkAxe(container);
    expect(results.violations).toEqual([]);
  });
});

describe('QRAppearanceForm accessibility', () => {
  it('has no accessibility violations with default appearance', async () => {
    const { container } = render(<QRAppearanceForm appearance={baseAppearance} onChange={vi.fn()} />);
    const results = await checkAxe(container);
    expect(results.violations).toEqual([]);
  });

  it('has no accessibility violations with transparent background', async () => {
    const transparentAppearance: QRAppearance = { ...baseAppearance, transparentBackground: true };
    const { container } = render(<QRAppearanceForm appearance={transparentAppearance} onChange={vi.fn()} />);
    const results = await checkAxe(container);
    expect(results.violations).toEqual([]);
  });

  it('has no accessibility violations with logo URL', async () => {
    const withLogo: QRAppearance = { ...baseAppearance, logoUrl: 'https://example.com/logo.png' };
    const { container } = render(<QRAppearanceForm appearance={withLogo} onChange={vi.fn()} />);
    const results = await checkAxe(container);
    expect(results.violations).toEqual([]);
  });
});
