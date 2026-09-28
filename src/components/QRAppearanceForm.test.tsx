import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QRAppearanceForm } from './QRAppearanceForm';
import { QRAppearance } from '../types';

const baseAppearance: QRAppearance = {
  size: 300,
  margin: 10,
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  transparentBackground: false,
  moduleStyle: 'square',
  finderStyle: 'square',
  errorCorrectionLevel: 'M',
  logoFile: null,
  logoSize: 0.4,
};

describe('QRAppearanceForm', () => {
  it('renders all appearance controls', () => {
    render(<QRAppearanceForm appearance={baseAppearance} onChange={vi.fn()} />);

    expect(screen.getByLabelText('Foreground Color')).toBeInTheDocument();
    expect(screen.getByLabelText('Background Color')).toBeInTheDocument();
    expect(screen.getByLabelText('Transparent')).toBeInTheDocument();
    expect(screen.getByText('QR Size')).toBeInTheDocument();
    expect(screen.getByText('Quiet Zone (Margin)')).toBeInTheDocument();
    expect(screen.getByText('Pixel Style')).toBeInTheDocument();
    expect(screen.getByText('Corner Style')).toBeInTheDocument();
    expect(screen.getByText('Error Correction')).toBeInTheDocument();
    expect(screen.getByLabelText('Center Logo (Optional)')).toBeInTheDocument();
  });

  it('updates foreground color when color input changes', () => {
    const onChange = vi.fn();
    render(<QRAppearanceForm appearance={baseAppearance} onChange={onChange} />);

    const colorInput = screen.getByLabelText('Foreground color');
    fireEvent.change(colorInput, { target: { value: '#ff0000' } });

    expect(onChange).toHaveBeenCalledWith({ foregroundColor: '#ff0000' });
  });

  it('updates background color when color input changes', () => {
    const onChange = vi.fn();
    render(<QRAppearanceForm appearance={baseAppearance} onChange={onChange} />);

    const colorInput = screen.getByLabelText('Background color');
    fireEvent.change(colorInput, { target: { value: '#00ff00' } });

    expect(onChange).toHaveBeenCalledWith({ backgroundColor: '#00ff00' });
  });

  it('disables background color input when transparent is checked', () => {
    const transparentAppearance: QRAppearance = { ...baseAppearance, transparentBackground: true };
    render(<QRAppearanceForm appearance={transparentAppearance} onChange={vi.fn()} />);

    expect(screen.getByLabelText('Background color')).toBeDisabled();
  });

  it('updates transparentBackground when checkbox changes', () => {
    const onChange = vi.fn();
    render(<QRAppearanceForm appearance={baseAppearance} onChange={onChange} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(onChange).toHaveBeenCalledWith({ transparentBackground: true });
  });

  it('updates QR size when slider changes', () => {
    const onChange = vi.fn();
    render(<QRAppearanceForm appearance={baseAppearance} onChange={onChange} />);

    const sizeSlider = screen.getByLabelText('QR Size') as HTMLInputElement;
    fireEvent.change(sizeSlider, { target: { value: '420' } });

    expect(onChange).toHaveBeenCalledWith({ size: 420 });
  });

  it('updates margin when slider changes', () => {
    const onChange = vi.fn();
    render(<QRAppearanceForm appearance={baseAppearance} onChange={onChange} />);

    const marginSlider = screen.getByLabelText('Quiet Zone (Margin)') as HTMLInputElement;
    fireEvent.change(marginSlider, { target: { value: '15' } });

    expect(onChange).toHaveBeenCalledWith({ margin: 15 });
  });

  it('updates module style when radio button changes', () => {
    const onChange = vi.fn();
    render(<QRAppearanceForm appearance={baseAppearance} onChange={onChange} />);

    const dotsButton = screen.getByRole('radio', { name: 'dots' });
    fireEvent.click(dotsButton);

    expect(onChange).toHaveBeenCalledWith({ moduleStyle: 'dots' });
  });

  it('updates finder style when radio button changes', () => {
    const onChange = vi.fn();
    render(<QRAppearanceForm appearance={baseAppearance} onChange={onChange} />);

    const dotButton = screen.getByRole('radio', { name: 'dot' });
    fireEvent.click(dotButton);

    expect(onChange).toHaveBeenCalledWith({ finderStyle: 'dot' });
  });

  it('updates error correction level when radio button changes', () => {
    const onChange = vi.fn();
    render(<QRAppearanceForm appearance={baseAppearance} onChange={onChange} />);

    const highLevelButton = screen.getByTitle('Level H');
    fireEvent.click(highLevelButton);

    expect(onChange).toHaveBeenCalledWith({ errorCorrectionLevel: 'H' });
  });

  it('uploads logo when file is selected', () => {
    const onChange = vi.fn();
    render(<QRAppearanceForm appearance={baseAppearance} onChange={onChange} />);

    const file = new File([''], 'logo.png', { type: 'image/png' });
    const input = document.getElementById('logo-file') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    expect(onChange).toHaveBeenCalledWith({ logoFile: file });
  });

  it('shows logo size slider when logo file is present', () => {
    const withLogo: QRAppearance = { ...baseAppearance, logoFile: new File([''], 'logo.png', { type: 'image/png' }) };
    render(<QRAppearanceForm appearance={withLogo} onChange={vi.fn()} />);

    expect(screen.getByText('Logo Size')).toBeInTheDocument();
  });

  it('hides logo size slider when no logo file', () => {
    render(<QRAppearanceForm appearance={baseAppearance} onChange={vi.fn()} />);

    expect(screen.queryByText('Logo Size')).not.toBeInTheDocument();
  });

  it('updates logo size when slider changes and logo is present', () => {
    const onChange = vi.fn();
    const withLogo: QRAppearance = { ...baseAppearance, logoFile: new File([''], 'logo.png', { type: 'image/png' }) };
    render(<QRAppearanceForm appearance={withLogo} onChange={onChange} />);

    const logoSizeSlider = screen.getByLabelText('Logo Size') as HTMLInputElement;
    fireEvent.change(logoSizeSlider, { target: { value: '0.5' } });

    expect(onChange).toHaveBeenCalledWith({ logoSize: 0.5 });
  });
});
