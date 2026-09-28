import { useState, useRef } from 'react';
import { QRAppearance } from '../types';
import { Label } from './ui/Label';
import { Slider } from './ui/Slider';
import { Image } from 'lucide-react';
import {
  MIN_QR_SIZE,
  MAX_QR_SIZE,
  MIN_LOGO_SIZE,
  MAX_LOGO_SIZE,
} from '../domain/qrAppearance';

interface QRAppearanceFormProps {
  appearance: QRAppearance;
  onChange: (updates: Partial<QRAppearance>) => void;
}

export function QRAppearanceForm({ appearance, onChange }: QRAppearanceFormProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="fg-color">Foreground Color</Label>
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full shadow-neu neu-border overflow-hidden shrink-0">
              <input
                id="fg-color"
                type="color"
                value={appearance.foregroundColor}
                onChange={(e) => onChange({ foregroundColor: e.target.value })}
                aria-label="Foreground color"
                className="absolute inset-[-10px] w-16 h-16 cursor-pointer"
              />
            </div>
            <span className="text-sm text-neu-text-muted uppercase font-mono">{appearance.foregroundColor}</span>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="bg-color">Background Color</Label>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full shadow-neu neu-border overflow-hidden shrink-0">
                <input
                  id="bg-color"
                  type="color"
                  value={appearance.backgroundColor}
                  onChange={(e) => onChange({ backgroundColor: e.target.value })}
                  disabled={appearance.transparentBackground}
                  aria-label="Background color"
                  className="absolute inset-[-10px] w-16 h-16 cursor-pointer disabled:opacity-50"
                />
              </div>
              <span className="text-sm text-neu-text-muted uppercase font-mono">{appearance.backgroundColor}</span>
            </div>
            <label className="flex items-center space-x-2 cursor-pointer mt-1">
              <input
                type="checkbox"
                className="w-4 h-4 rounded bg-neu-base shadow-neu-pressed border-none text-neu-accent focus:ring-neu-accent"
                checked={appearance.transparentBackground}
                onChange={(e) => onChange({ transparentBackground: e.target.checked })}
              />
              <span className="text-sm text-neu-text">Transparent</span>
            </label>
          </div>
        </div>
      </div>

      <div className="h-px bg-neu-dark/10 w-full" />

      <div className="space-y-6">
        <Slider
          id="qr-size"
          label="QR Size"
          min={MIN_QR_SIZE}
          max={MAX_QR_SIZE}
          step={16}
          value={appearance.size}
          formatValue={(v) => `${v}px`}
          onValueChange={(val) => onChange({ size: val })}
        />

        <Slider
          id="quiet-zone"
          label="Quiet Zone (Margin)"
          min={0}
          max={20}
          value={appearance.margin}
          formatValue={(v) => `${v} modules`}
          onValueChange={(val) => onChange({ margin: val })}
        />
      </div>

      <div className="h-px bg-neu-dark/10 w-full" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label>Pixel Style</Label>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Module style">
            {(['square', 'dots', 'rounded'] as const).map(style => (
              <button
                key={style}
                type="button"
                role="radio"
                aria-checked={appearance.moduleStyle === style}
                onClick={() => onChange({ moduleStyle: style })}
                className={`px-4 py-2 rounded-xl text-sm capitalize transition-all duration-200 outline-none
                  ${appearance.moduleStyle === style
                    ? 'shadow-neu-pressed text-neu-accent font-medium neu-border'
                    : 'shadow-neu hover:shadow-neu-hover text-neu-text neu-border'}`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <Label>Corner Style</Label>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Corner style">
            {(['square', 'dot', 'extra-rounded'] as const).map(style => (
              <button
                key={style}
                type="button"
                role="radio"
                aria-checked={appearance.finderStyle === style}
                onClick={() => onChange({ finderStyle: style })}
                className={`px-4 py-2 rounded-xl text-sm capitalize transition-all duration-200 outline-none
                  ${appearance.finderStyle === style
                    ? 'shadow-neu-pressed text-neu-accent font-medium neu-border'
                    : 'shadow-neu hover:shadow-neu-hover text-neu-text neu-border'}`}
              >
                {style === 'extra-rounded' ? 'Rounded' : style}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-px bg-neu-dark/10 w-full" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label>Error Correction</Label>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Error correction level">
            {(['L', 'M', 'Q', 'H'] as const).map(level => (
              <button
                key={level}
                type="button"
                role="radio"
                aria-checked={appearance.errorCorrectionLevel === level}
                title={`Level ${level}`}
                onClick={() => onChange({ errorCorrectionLevel: level })}
                className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200 outline-none flex items-center justify-center
                  ${appearance.errorCorrectionLevel === level
                    ? 'shadow-neu-pressed text-neu-accent neu-border'
                    : 'shadow-neu hover:shadow-neu-hover text-neu-text neu-border'}`}
              >
                {level}
              </button>
            ))}
          </div>
          <p className="text-xs text-neu-text-muted">Higher levels allow more damage but make the code denser.</p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="logo-file">Center Logo (Optional)</Label>
          {appearance.logoFile ? (
            <div className="flex items-center gap-4 rounded-xl bg-neu-base px-4 py-3 shadow-neu-pressed neu-border">
              <img
                src={URL.createObjectURL(appearance.logoFile)}
                alt="Logo preview"
                className="h-10 w-10 rounded object-cover"
              />
              <span className="text-sm text-neu-text truncate flex-1">{appearance.logoFile.name}</span>
              <button
                type="button"
                onClick={() => onChange({ logoFile: null })}
                className="text-xs text-neu-text-muted hover:text-neu-text underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <div
              className={`flex flex-col items-center justify-center gap-2 rounded-xl bg-neu-base px-4 py-6 neu-border cursor-pointer transition-colors ${
                isDragging ? 'shadow-neu-pressed text-neu-accent' : 'shadow-neu-pressed hover:shadow-neu-hover'
              }`}
              tabIndex={0}
              role="button"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) {
                  onChange({ logoFile: file });
                }
              }}
            >
              <Image className="h-8 w-8 text-neu-text-muted" />
              <span className="text-sm text-neu-text-muted">Drop an image here or click to browse</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            id="logo-file"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onChange({ logoFile: file });
            }}
          />

          {appearance.logoFile && (
            <Slider
              id="logo-size"
              label="Logo Size"
              min={MIN_LOGO_SIZE}
              max={MAX_LOGO_SIZE}
              step={0.05}
              value={appearance.logoSize}
              formatValue={(v) => `${Math.round(v * 100)}%`}
              onValueChange={(val) => onChange({ logoSize: val })}
            />
          )}
        </div>
      </div>

    </div>
  );
}
