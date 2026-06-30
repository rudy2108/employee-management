import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/Utils"
import type { PageStat } from "../../services/Api"
import { Button } from "./Button"

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

// ─── Leave Stat Card (EmployeeLeave page) ────────────────────────────────────

interface LeaveStatCardContentProps {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  value: number;
  unit: string;
  badge?: string;
}

function LeaveStatCardContent({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  unit,
  badge,
}: LeaveStatCardContentProps) {
  return (
    <>
      <div className="flex justify-between items-start mb-3">
        <div className={`${iconBg} p-2 rounded-lg ${iconColor}`}>
          <span className="material-symbols-outlined text-[24px]">{icon}</span>
        </div>
        {badge && (
          <span className="text-label-sm text-on-surface-variant">{badge}</span>
        )}
      </div>
      <div className="mt-auto">
        <p className="text-label-md text-on-surface-variant">{label}</p>
        <h3 className="text-headline-lg font-bold text-on-surface">
          {value}{' '}
          <span className="text-body-sm font-normal text-on-surface-variant">
            {unit}
          </span>
        </h3>
      </div>
    </>
  );
}

// ─── Leave Balance Card (EmployeeDashboard page) ─────────────────────────────

interface LeaveBalanceCardContentProps {
  label: string;
  icon: string;
  color: string;
  barColor: string;
  days: number;
  total: number;
}

function LeaveBalanceCardContent({
  label,
  icon,
  color,
  barColor,
  days,
  total,
}: LeaveBalanceCardContentProps) {
  const pct = total > 0 ? Math.round((days / total) * 100) : 0;
  return (
    <>
      <p className="text-label-md font-label-md text-on-surface-variant mb-1">
        {label}
      </p>
      <h4 className={`text-headline-lg font-headline-lg font-bold ${color}`}>
        {String(days).padStart(2, '0')}{' '}
        <span className="text-label-md font-normal opacity-70">Days</span>
      </h4>
      <div className="w-full bg-surface-container-highest h-2 rounded-full mt-3 overflow-hidden">
        <div
          className={`${barColor} h-full rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-label-sm font-label-sm text-on-surface-variant mt-1 opacity-70">
        {days} of {total} remaining
      </p>
      <span
        className="material-symbols-outlined absolute -bottom-3 -right-3 text-[80px] opacity-5 group-hover:opacity-10 transition-opacity select-none pointer-events-none"
        aria-hidden="true"
      >
        {icon}
      </span>
    </>
  );
}

// ─── Resource Card (EmployeeSupport page) ────────────────────────────────────

interface ResourceCardContentProps {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}

function ResourceCardContent({
  icon,
  iconBg,
  iconColor,
  title,
  description,
}: ResourceCardContentProps) {
  return (
    <>
      <div className={`${iconBg} p-2 rounded-lg`}>
        <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
      </div>
      <div>
        <h5 className="font-label-md text-on-surface">{title}</h5>
        <p className="text-body-sm text-on-surface-variant">{description}</p>
      </div>
    </>
  );
}

// ─── Leave Balance Summary Card (EmployeeDashboard page) ──────────────────────

interface LeaveType {
  label: string;
  icon: string;
  color: string;
  barColor: string;
  days: number;
  total: number;
}

interface LeaveBalanceSummaryCardProps {
  leaveTypes: LeaveType[];
  cardShadow?: React.CSSProperties;
  onViewHistory?: () => void;
}

function LeaveBalanceSummaryCard({
  leaveTypes,
  cardShadow,
  onViewHistory,
}: LeaveBalanceSummaryCardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
      <div
        className="lg:col-span-12 bg-surface-container-lowest rounded-xl border border-surface-container-highest p-4"
        style={cardShadow}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">pending_actions</span>
            Leave Balance Summary
          </h3>
          <Button variant="ghost" size="md" onClick={onViewHistory}>
            View History
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {leaveTypes.map((lt) => (
            <div
              key={lt.label}
              className="p-4 bg-surface-container-low rounded-xl relative overflow-hidden group border border-transparent hover:border-primary/20 transition-all"
            >
              <LeaveBalanceCardContent
                label={lt.label}
                icon={lt.icon}
                color={lt.color}
                barColor={lt.barColor}
                days={lt.days}
                total={lt.total}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export {
  StatCard,
  StatCardContent,
  LeaveStatCardContent,
  LeaveBalanceCardContent,
  LeaveBalanceSummaryCard,
  ResourceCardContent,
}
