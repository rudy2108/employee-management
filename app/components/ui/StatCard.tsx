import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/Utils"
import type { PageStat } from "../../services/Api"

const statCardVariants = cva(
  "bg-surface-container-lowest rounded-xl border relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "p-4 border-surface-container-highest ambient-shadow-surface-1 flex flex-col justify-between",
        compact:
          "p-3 border-surface-container-highest ambient-shadow-surface-1",
        hr:
          "p-4 border-surface-container-highest shadow-glow flex flex-col justify-between",
        leave:
          "p-4 border-surface-variant group",
        problems:
          "p-4 border-outline-variant custom-shadow flex flex-col justify-between transition-colors group",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function StatCard({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof statCardVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "div"

  return (
    <Comp
      data-slot="stat-card"
      data-variant={variant}
      className={cn(statCardVariants({ variant, className }))}
      {...props}
    />
  )
}

interface StatCardContentProps {
  card: PageStat;
  value: number;
}

function StatCardContent({ card, value }: StatCardContentProps) {
  return (
    <>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wide">
          {card.title}
        </h3>
        <div className={`p-1.5 rounded-lg ${card.iconBg} ${card.iconColor}`}>
          <span className="material-symbols-outlined">{card.icon}</span>
        </div>
      </div>
      <div className="text-display-lg font-display-lg text-on-surface font-bold text-3xl">
        {value}
      </div>
    </>
  );
}

export { StatCard, StatCardContent }
