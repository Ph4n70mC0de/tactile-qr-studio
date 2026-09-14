import * as React from "react"
import { cn } from "@/src/lib/utils"

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange: (val: number) => void;
}

export function Slider({ className, label, value, min = 0, max = 100, step = 1, onValueChange, ...props }: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {label && (
        <div className="flex justify-between items-center text-sm font-medium text-neu-text">
          <span>{label}</span>
          <span className="text-neu-text-muted">{value}</span>
        </div>
      )}
      <div className="relative h-4 w-full flex items-center">
        {/* Track */}
        <div className="absolute inset-0 rounded-full bg-neu-base shadow-neu-pressed-sm neu-border" />
        
        {/* Fill */}
        <div 
          className="absolute h-2 left-1 rounded-full bg-neu-accent/50 transition-all duration-75"
          style={{ width: `calc(${percentage}% - 8px)` }}
        />

        {/* Hidden native range input for accessibility and interaction */}
        <input 
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onValueChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          {...props}
        />

        {/* Custom Thumb */}
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
