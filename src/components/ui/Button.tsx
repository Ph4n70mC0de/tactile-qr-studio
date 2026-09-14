import * as React from "react"
import { cn } from "@/src/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "icon" | "accent";
  size?: "default" | "sm" | "lg" | "icon";
  active?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", active = false, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-neu-accent disabled:opacity-50 disabled:pointer-events-none select-none",
          "bg-neu-base neu-border",
          // Default variants
          variant === "default" && "text-neu-text hover:text-neu-accent",
          variant === "accent" && "text-neu-accent font-semibold",
          variant === "icon" && "text-neu-text hover:text-neu-accent",
          
          // Shadow states
          active 
            ? "shadow-neu-pressed text-neu-accent" 
            : "shadow-neu hover:shadow-neu-hover active:shadow-neu-pressed",

          // Sizing
          size === "default" && "h-11 px-6 py-2",
          size === "sm" && "h-9 px-4",
          size === "lg" && "h-14 px-8 text-base",
          size === "icon" && "h-11 w-11",
          
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
