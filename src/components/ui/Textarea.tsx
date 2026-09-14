import * as React from "react"
import { cn } from "@/src/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[100px] w-full rounded-xl bg-neu-base px-4 py-3 text-sm text-neu-text placeholder:text-neu-text-muted",
          "shadow-neu-pressed neu-border outline-none transition-all duration-200 resize-none",
          "focus:ring-2 focus:ring-neu-accent/50",
          error && "ring-2 ring-red-400 focus:ring-red-400 text-red-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
