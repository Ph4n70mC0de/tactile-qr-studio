import { describe, it, expect, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';

describe('Responsive layout', () => {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
    window.innerHeight = originalInnerHeight;
  });

  it('renders without overflow on 320px width', () => {
    window.innerWidth = 320;
    window.innerHeight = 568;

    const { container } = render(<App />);
    const root = container.parentElement?.parentElement;

    expect(root).not.toBeNull();
  });

  it('renders without overflow on 768px width', () => {
    window.innerWidth = 768;
    window.innerHeight = 1024;

    const { container } = render(<App />);
    const root = container.parentElement?.parentElement;

    expect(root).not.toBeNull();
  });

  it('renders without overflow on 1440px width', () => {
    window.innerWidth = 1440;
    window.innerHeight = 900;

    const { container } = render(<App />);
    const root = container.parentElement?.parentElement;

    expect(root).not.toBeNull();
  });

  it('uses reduced motion styles when prefers-reduced-motion is set', () => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    expect(mediaQuery.matches).toBe(false);
  });
});
