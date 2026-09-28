import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QRContentForm } from './QRContentForm';
import { Payload } from '../types';

describe('QRContentForm', () => {
  describe('text type', () => {
    const payload: Payload = { type: 'text', text: 'Hello World' };

    it('renders text input and updates payload', () => {
      const onChange = vi.fn();
      render(<QRContentForm payload={payload} onChange={onChange} />);

      const textarea = screen.getByLabelText('Plain Text');
      fireEvent.change(textarea, { target: { value: 'New text content' } });

      expect(onChange).toHaveBeenCalledWith({ type: 'text', text: 'New text content' });
    });

    it('shows character count for non-empty text', () => {
      render(<QRContentForm payload={payload} onChange={vi.fn()} />);

      expect(screen.getByText('11/4296 characters')).toBeInTheDocument();
    });

    it('shows error when text is empty', () => {
      const emptyPayload: Payload = { type: 'text', text: '' };
      render(<QRContentForm payload={emptyPayload} onChange={vi.fn()} />);

      expect(screen.getByRole('alert')).toHaveTextContent('Text content is required.');
    });

    it('marks text input as aria-invalid when empty', () => {
      const emptyPayload: Payload = { type: 'text', text: '' };
      render(<QRContentForm payload={emptyPayload} onChange={vi.fn()} />);

      expect(screen.getByLabelText('Plain Text')).toHaveAttribute('aria-invalid', 'true');
    });

    it('does not show character count for empty text', () => {
      const emptyPayload: Payload = { type: 'text', text: '' };
      render(<QRContentForm payload={emptyPayload} onChange={vi.fn()} />);

      expect(screen.queryByText(/characters/)).not.toBeInTheDocument();
    });
  });

  describe('url type', () => {
    const payload: Payload = { type: 'url', url: 'example.com' };

    it('renders URL input and updates payload', () => {
      const onChange = vi.fn();
      render(<QRContentForm payload={payload} onChange={onChange} />);

      const input = screen.getByLabelText('Website URL');
      fireEvent.change(input, { target: { value: 'https://newsite.com' } });

      expect(onChange).toHaveBeenCalledWith({ type: 'url', url: 'https://newsite.com' });
    });

    it('shows normalization hint when protocol is missing', () => {
      render(<QRContentForm payload={payload} onChange={vi.fn()} />);

      expect(screen.getByText('No protocol detected — HTTPS will be added automatically.')).toBeInTheDocument();
    });

    it('shows error for unsupported protocols', () => {
      const badPayload: Payload = { type: 'url', url: 'javascript:alert(1)' };
      render(<QRContentForm payload={badPayload} onChange={vi.fn()} />);

      expect(screen.getByRole('alert')).toHaveTextContent('Unsupported protocol');
    });

    it('marks URL input as aria-invalid for unsupported protocol', () => {
      const badPayload: Payload = { type: 'url', url: 'ftp://example.com' };
      render(<QRContentForm payload={badPayload} onChange={vi.fn()} />);

      expect(screen.getByLabelText('Website URL')).toHaveAttribute('aria-invalid', 'true');
    });

    it('does not show normalization hint for explicit HTTP URLs', () => {
      const httpPayload: Payload = { type: 'url', url: 'http://example.com' };
      render(<QRContentForm payload={httpPayload} onChange={vi.fn()} />);

      expect(screen.queryByText('No protocol detected')).not.toBeInTheDocument();
    });
  });

  describe('email type', () => {
    const payload: Payload = { type: 'email', email: 'test@example.com' };

    it('renders email, subject, and body inputs', () => {
      render(<QRContentForm payload={payload} onChange={vi.fn()} />);

      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Subject (Optional)')).toBeInTheDocument();
      expect(screen.getByLabelText('Body (Optional)')).toBeInTheDocument();
    });

    it('updates email when input changes', () => {
      const onChange = vi.fn();
      render(<QRContentForm payload={payload} onChange={onChange} />);

      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'new@test.com' } });

      expect(onChange).toHaveBeenCalledWith({ type: 'email', email: 'new@test.com' });
    });
  });

  describe('phone type', () => {
    const payload: Payload = { type: 'phone', phone: '+15551234567' };

    it('renders phone input and updates payload', () => {
      const onChange = vi.fn();
      render(<QRContentForm payload={payload} onChange={onChange} />);

      const input = screen.getByLabelText('Phone Number');
      fireEvent.change(input, { target: { value: '+15559998888' } });

      expect(onChange).toHaveBeenCalledWith({ type: 'phone', phone: '+15559998888' });
    });
  });

  describe('wifi type', () => {
    const payload: Payload = {
      type: 'wifi',
      ssid: 'MyNetwork',
      password: 'secret123',
      encryption: 'WPA',
      hidden: false,
    };

    it('renders SSID, password, encryption, and hidden fields', () => {
      render(<QRContentForm payload={payload} onChange={vi.fn()} />);

      expect(screen.getByLabelText('Network Name (SSID)')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Encryption')).toBeInTheDocument();
    });

    it('updates SSID when input changes', () => {
      const onChange = vi.fn();
      render(<QRContentForm payload={payload} onChange={onChange} />);

      fireEvent.change(screen.getByLabelText('Network Name (SSID)'), { target: { value: 'NewNetwork' } });

      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ type: 'wifi', ssid: 'NewNetwork' }));
    });

    it('updates encryption when select changes', () => {
      const onChange = vi.fn();
      render(<QRContentForm payload={payload} onChange={onChange} />);

      fireEvent.change(screen.getByLabelText('Encryption'), { target: { value: 'WEP' } });

      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ type: 'wifi', encryption: 'WEP' }));
    });

    it('clears password when encryption is set to nopass', () => {
      const onChange = vi.fn();
      render(<QRContentForm payload={payload} onChange={onChange} />);

      fireEvent.change(screen.getByLabelText('Encryption'), { target: { value: 'nopass' } });

      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ type: 'wifi', encryption: 'nopass', password: '' }));
    });

    it('disables password input when encryption is nopass', () => {
      const nopassPayload: Payload = {
        type: 'wifi',
        ssid: 'MyNetwork',
        password: '',
        encryption: 'nopass',
        hidden: false,
      };
      render(<QRContentForm payload={nopassPayload} onChange={vi.fn()} />);

      expect(screen.getByLabelText('Password')).toBeDisabled();
    });

    it('shows character count for SSID near max', () => {
      const longSsidPayload: Payload = {
        type: 'wifi',
        ssid: 'A'.repeat(30),
        password: '',
        encryption: 'WPA',
        hidden: false,
      };
      render(<QRContentForm payload={longSsidPayload} onChange={vi.fn()} />);

      expect(screen.getByText('30/32 characters')).toBeInTheDocument();
    });

    it('toggles hidden network checkbox', () => {
      const onChange = vi.fn();
      render(<QRContentForm payload={payload} onChange={onChange} />);

      const hiddenCheckbox = screen.getByRole('checkbox');
      fireEvent.click(hiddenCheckbox);

      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ type: 'wifi', hidden: true }));
    });
  });
});
