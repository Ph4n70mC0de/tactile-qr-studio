import React from 'react';
import { QRAppearance } from '../types';
import { Label } from './ui/Label';
import { Slider } from './ui/Slider';

interface QRAppearanceFormProps {
  appearance: QRAppearance;
  onChange: (updates: Partial<QRAppearance>) => void;
}

export function QRAppearanceForm({ appearance, onChange }: QRAppearanceFormProps) {
  return (
    <div className="space-y-8">
      {/* Colors */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label>Foreground Color</Label>
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full shadow-neu neu-border overflow-hidden shrink-0">
              <input 
                type="color" 
                value={appearance.foregroundColor}
                onChange={(e) => onChange({ foregroundColor: e.target.value })}
                className="absolute inset-[-10px] w-16 h-16 cursor-pointer"
              />
            </div>
            <span className="text-sm text-neu-text-muted uppercase font-mono">{appearance.foregroundColor}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <Label>Background Color</Label>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full shadow-neu neu-border overflow-hidden shrink-0">
                <input 
                  type="color" 
                  value={appearance.backgroundColor}
                  onChange={(e) => onChange({ backgroundColor: e.target.value })}
                  disabled={appearance.transparentBackground}
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

      {/* Spacing & Sizes */}
      <div className="space-y-6">
        <Slider
          label="Quiet Zone (Margin)"
          min={0}
          max={20}
          value={appearance.margin}
          onValueChange={(val) => onChange({ margin: val })}
        />
      </div>

      <div className="h-px bg-neu-dark/10 w-full" />

      {/* Shapes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label>Pixel Style</Label>
          <div className="flex flex-wrap gap-2">
            {(['square', 'dots', 'rounded'] as const).map(style => (
              <button
                key={style}
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
          <div className="flex flex-wrap gap-2">
            {(['square', 'dot', 'extra-rounded'] as const).map(style => (
              <button
                key={style}
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
        {/* Error Correction */}
        <div className="space-y-3">
          <Label>Error Correction</Label>
          <div className="flex flex-wrap gap-2">
            {(['L', 'M', 'Q', 'H'] as const).map(level => (
              <button
                key={level}
                onClick={() => onChange({ errorCorrectionLevel: level })}
                className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200 outline-none flex items-center justify-center
                  ${appearance.errorCorrectionLevel === level 
                    ? 'shadow-neu-pressed text-neu-accent neu-border' 
                    : 'shadow-neu hover:shadow-neu-hover text-neu-text neu-border'}`}
                title={`Level ${level}`}
              >
                {level}
              </button>
            ))}
          </div>
          <p className="text-xs text-neu-text-muted">Higher levels allow more damage but make the code denser.</p>
        </div>

        {/* Logo */}
        <div className="space-y-3">
          <Label>Center Logo URL (Optional)</Label>
          <input
            type="url"
            placeholder="https://..."
            value={appearance.logoUrl || ''}
            onChange={(e) => onChange({ logoUrl: e.target.value })}
            className="flex w-full rounded-xl bg-neu-base px-4 py-3 text-sm text-neu-text placeholder:text-neu-text-muted shadow-neu-pressed neu-border outline-none transition-all duration-200 focus:ring-2 focus:ring-neu-accent/50"
          />
        </div>
      </div>

    </div>
  );
}
