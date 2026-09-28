import * as React from "react"
import { cn } from "@/src/lib/utils"

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value'> {
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange: (val: number) => void;
  formatValue?: (val: number) => string;
}

export function Slider({ className, id, label, value, min = 0, max = 100, step = 1, onValueChange, formatValue, ...props }: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  const displayValue = formatValue ? formatValue(value) : value;
  const labelId = id ? `${id}-label` : undefined;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {label && (
        <div className="flex justify-between items-center text-sm font-medium text-neu-text">
          <label htmlFor={id} id={labelId}>
            {label}
          </label>
          <span className="text-neu-text-muted tabular-nums">{displayValue}</span>
        </div>
      )}
      <div className="relative h-4 w-full flex items-center">
        <div className="absolute inset-0 rounded-full bg-neu-base shadow-neu-pressed-sm neu-border" />

        <div
          className="absolute h-2 left-1 rounded-full bg-neu-accent/50 transition-all duration-75"
          style={{ width: `calc(${percentage}% - 8px)` }}
        />

        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-labelledby={labelId}
          aria-label={label ? undefined : 'Adjust value'}
          onChange={(e) => onValueChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer focus:outline-none"
          {...props}
        />

        <div
          className="pointer-events-none absolute h-6 w-6 rounded-full bg-neu-base shadow-neu neu-border flex items-center justify-center transition-all duration-75"
          style={{ left: `calc(${percentage}% - 12px)` }}
        >
          <div className="h-2 w-2 rounded-full bg-neu-accent" />
        </div>
      </div>
    </div>
  )
}
