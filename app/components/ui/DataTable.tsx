import * as React from "react";
/* eslint-disable react-refresh/only-export-components -- shared table primitives and variants are intentionally colocated */
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/Utils";

/* ─── Container (card wrapper) ─── */

const tableContainerVariants = cva(
  "bg-surface-container-lowest rounded-xl border overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-surface-container-highest",
        elevated:
          "border-surface-container-highest shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05),0_4px_6px_-2px_rgba(0,0,0,0.02)]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function TableContainer({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof tableContainerVariants>) {
  return (
    <div
      className={cn(tableContainerVariants({ variant }), className)}
      {...props}
    />
  );
}

/* ─── Header bar (title + right‑side actions) ─── */

interface TableToolbarProps extends React.ComponentProps<"div"> {
  title: string;
  count?: number;
}

function TableToolbar({
  title,
  count,
  className,
  children,
  ...props
}: TableToolbarProps) {
  return (
    <div
      className={cn(
        "p-4 border-b border-surface-container-highest flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3",
        className,
      )}
      {...props}
    >
      <h3 className="text-headline-md font-headline-md text-on-surface">
        {title}
      </h3>
      {children ?? (
        count !== undefined && (
          <span className="text-label-sm font-label-sm text-on-surface-variant">
            {count} records
          </span>
        )
      )}
    </div>
  );
}

/* ─── Primitive table elements ─── */

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="overflow-x-auto">
      <table
        className={cn("w-full text-left border-collapse", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      className={cn(
        "bg-surface-container-low text-on-surface-variant text-label-sm font-label-sm uppercase tracking-wider",
        className,
      )}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      className={cn(
        "divide-y divide-surface-container-highest text-body-sm font-body-sm",
        className,
      )}
      {...props}
    />
  );
}

/* ─── TableRow ─── */

const tableRowVariants = cva("transition-colors", {
  variants: {
    variant: {
      default: "hover:bg-surface-container-low/50",
      clickable: "hover:bg-surface-container-low/50 cursor-pointer",
    },
  },
  defaultVariants: { variant: "default" },
});

function TableRow({
  className,
  variant,
  ...props
}: React.ComponentProps<"tr"> & VariantProps<typeof tableRowVariants>) {
  return (
    <tr className={cn(tableRowVariants({ variant }), className)} {...props} />
  );
}

/* ─── TableHead ─── */

const tableHeadVariants = cva("font-medium", {
  variants: {
    size: {
      sm: "px-3 py-2",
      md: "px-4 py-2",
      lg: "px-6 py-2",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
  },
  defaultVariants: { size: "md", align: "left" },
});

function TableHead({
  className,
  size,
  align,
  ...props
}: React.ComponentProps<"th"> & VariantProps<typeof tableHeadVariants>) {
  return (
    <th
      className={cn(tableHeadVariants({ size, align }), className)}
      {...props}
    />
  );
}

/* ─── TableCell ─── */

const tableCellVariants = cva("", {
  variants: {
    size: {
      sm: "px-3 py-2",
      md: "px-4 py-2.5",
      lg: "px-6 py-2.5",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
  },
  defaultVariants: { size: "md", align: "left" },
});

function TableCell({
  className,
  size,
  align,
  ...props
}: React.ComponentProps<"td"> & VariantProps<typeof tableCellVariants>) {
  return (
    <td
      className={cn(tableCellVariants({ size, align }), className)}
      {...props}
    />
  );
}

/* ─── Empty / Loading / Error states ─── */

interface TableEmptyProps {
  colSpan: number;
  icon?: string;
  message: string;
  description?: string;
  action?: React.ReactNode;
}

function TableEmpty({
  colSpan,
  icon,
  message,
  description,
  action,
}: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center">
        <div className="flex flex-col items-center gap-2">
          {icon && (
            <span className="material-symbols-outlined text-[40px] text-on-surface-variant/30">
              {icon}
            </span>
          )}
          <p className="text-body-lg font-body-lg text-on-surface-variant">
            {message}
          </p>
          {description && (
            <p className="text-label-sm font-label-sm text-on-surface-variant/60">
              {description}
            </p>
          )}
          {action}
        </div>
      </td>
    </tr>
  );
}

interface TableLoadingProps {
  colSpan: number;
  message?: string;
}

function TableLoading({ colSpan, message = "Loading…" }: TableLoadingProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-primary animate-spin">
            progress_activity
          </span>
          <p className="text-body-md font-body-md text-on-surface-variant">
            {message}
          </p>
        </div>
      </td>
    </tr>
  );
}

interface TableErrorProps {
  colSpan: number;
  message: string;
}

function TableError({ colSpan, message }: TableErrorProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-16 text-center">
        <div className="flex items-center justify-center gap-3 text-error">
          <span className="material-symbols-outlined">error</span>
          <p className="text-body-md font-body-md">{message}</p>
        </div>
      </td>
    </tr>
  );
}

/* ─── Footer (e.g. "Showing 5 of 12 records") ─── */

interface TableFooterInfoProps extends React.ComponentProps<"div"> {
  showing: number;
  total: number;
  label?: string;
}

function TableFooter({
  showing,
  total,
  label = "records",
  className,
  ...props
}: TableFooterInfoProps) {
  if (showing === 0) return null;
  return (
    <div
      className={cn(
        "p-3 border-t border-surface-container-highest flex justify-center",
        className,
      )}
      {...props}
    >
      <span className="text-label-sm font-label-sm text-on-surface-variant">
        Showing {showing} of {total} {label}
      </span>
    </div>
  );
}

/* ─── Avatar helper ─── */

const tableAvatarVariants = cva(
  "rounded-full bg-primary/10 flex items-center justify-center shrink-0",
  {
    variants: {
      size: {
        sm: "w-6 h-6",
        md: "w-7 h-7",
        lg: "w-8 h-8",
      },
    },
    defaultVariants: { size: "md" },
  },
);

const avatarTextVariants = cva("text-primary font-bold", {
  variants: {
    size: {
      sm: "text-label-sm font-label-sm",
      md: "text-label-md font-label-md",
      lg: "text-label-md font-label-md",
    },
  },
  defaultVariants: { size: "md" },
});

interface TableAvatarProps extends VariantProps<typeof tableAvatarVariants> {
  name: string;
  subtitle?: string;
}

function TableAvatar({ name, subtitle, size }: TableAvatarProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={cn(tableAvatarVariants({ size }))}>
        <span className={cn(avatarTextVariants({ size }))}>
          {name?.charAt(0)?.toUpperCase() ?? "?"}
        </span>
      </div>
      <div className="flex flex-col min-w-0">
        <span className="font-medium text-on-surface truncate text-body-sm">
          {name}
        </span>
        {subtitle && (
          <span className="text-label-sm font-label-sm text-on-surface-variant capitalize truncate">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Status badge helper ─── */

const tableBadgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-medium",
  {
    variants: {
      variant: {
        primary: "bg-primary/10 text-primary",
        secondary: "bg-secondary/10 text-secondary",
        warning: "bg-[#F59E0B]/10 text-[#F59E0B]",
        error: "bg-error/10 text-error",
        info: "bg-[#0EA5E9]/10 text-[#0EA5E9]",
        neutral: "bg-surface-container text-on-surface-variant",
      },
      size: {
        sm: "px-1.5 py-0.5 text-label-sm font-label-sm",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-xs font-bold",
      },
    },
    defaultVariants: { variant: "neutral", size: "md" },
  },
);

interface TableBadgeProps extends VariantProps<typeof tableBadgeVariants> {
  label: string;
  className?: string;
  icon?: string;
}

function TableBadge({ label, className, icon, variant, size }: TableBadgeProps) {
  return (
    <span className={cn(tableBadgeVariants({ variant, size }), className)}>
      {icon && (
        <span className="material-symbols-outlined text-[14px]">{icon}</span>
      )}
      {label}
    </span>
  );
}

export {
  TableContainer,
  tableContainerVariants,
  TableToolbar,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  tableRowVariants,
  TableHead,
  tableHeadVariants,
  TableCell,
  tableCellVariants,
  TableEmpty,
  TableLoading,
  TableError,
  TableFooter,
  TableAvatar,
  tableAvatarVariants,
  TableBadge,
  tableBadgeVariants,
};
