import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/Utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-label-md font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-on-primary hover:bg-primary/90 shadow-sm",
        secondary:
          "bg-primary/10 text-primary hover:bg-primary/20",
        outline:
          "border border-outline-variant text-on-surface hover:bg-surface-container-high",
        danger:
          "border border-error text-error hover:bg-error/10",
        ghost:
          "text-on-surface-variant hover:bg-surface-container-high",
      },
      size: {
        sm: "px-2.5 py-0.5 text-[11px] rounded-lg",
        md: "px-4 py-1.5 text-[13px] rounded-xl",
        lg: "px-6 py-2 text-[13px] rounded-xl",
        icon: "p-1.5 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "md",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button }
