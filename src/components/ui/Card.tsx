import * as React from "react"
import { cn } from "@/src/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  pressed?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, pressed, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl bg-neu-base p-6 transition-shadow duration-300",
          pressed ? "shadow-neu-pressed neu-border" : "shadow-neu neu-border",
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

export { Card }
