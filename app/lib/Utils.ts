import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(dateStr: string): string {
  const diffDays = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 7)}w ago`;
}

export function cap(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export const CARD_SHADOW = {
  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.02)",
};

// ─── Quick Actions Config ────────────────────────────────────────────────────

export const QUICK_ACTIONS = [
  { id: 'qa-clock', icon: 'login', label: 'Clock In / Out' },
  { id: 'qa-leave', icon: 'event_busy', label: 'Request Leave' },
  { id: 'qa-report', icon: 'description', label: 'Submit Report' },
];

// ─── Dashboard Helper Functions ──────────────────────────────────────────────

import type { LeaveRequest, LeaveTypeRow, Holiday } from '../services/Api';

/**
 * Compute the leave balance rows (annual, sick, personal) for the dashboard.
 */
export function computeLeaveTypes(
  myLeaves: LeaveRequest[],
  totalLeaves: number,
  sickLeaves: number,
  personalLeaves: number
): LeaveTypeRow[] {
  const isApproved = (l: LeaveRequest) =>
    l.status === 'approved' || l.status === 'hr_approved';

  const usedAnnual = myLeaves.filter(
    (l) => isApproved(l) && (l.type === 'Annual Leave' || l.type === 'Immediate Leave')
  ).length;

  const usedSick = myLeaves.filter(
    (l) => isApproved(l) && l.type === 'Sick Leave'
  ).length;

  const usedPersonal = myLeaves.filter(
    (l) => isApproved(l) && l.type === 'Personal Leave'
  ).length;

  return [
    {
      label: 'Annual Leave',
      icon: 'beach_access',
      color: 'text-primary',
      barColor: 'bg-primary',
      days: Math.max(0, totalLeaves - usedAnnual),
      total: totalLeaves,
    },
    {
      label: 'Sick Leave',
      icon: 'medical_services',
      color: 'text-tertiary',
      barColor: 'bg-tertiary',
      days: Math.max(0, sickLeaves - usedSick),
      total: sickLeaves,
    },
    {
      label: 'Personal Leave',
      icon: 'person',
      color: 'text-secondary',
      barColor: 'bg-secondary',
      days: Math.max(0, personalLeaves - usedPersonal),
      total: personalLeaves,
    },
  ];
}

/**
 * Get the N most recent leave requests, sorted by appliedDate descending.
 */
export function getRecentLeaves(myLeaves: LeaveRequest[], count = 5): LeaveRequest[] {
  return [...myLeaves]
    .sort((a, b) => b.appliedDate.localeCompare(a.appliedDate))
    .slice(0, count);
}

/**
 * Get upcoming holidays (future dates only), sorted chronologically, up to `count`.
 */
export function getUpcomingHolidays(holidays: Holiday[], count = 4): Holiday[] {
  const today = new Date().toISOString().split('T')[0];
  return [...holidays]
    .filter((h) => {
      const parsed = new Date(h.date);
      return !isNaN(parsed.getTime()) && parsed.toISOString().split('T')[0] >= today;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, count);
}

// ─── Employee Leave Page Helpers ─────────────────────────────────────────────

/**
 * Compute summary stats for the Employee Leave page cards.
 */
export function computeLeaveStats(
  userLeaves: LeaveRequest[],
  totalLeaves: number
) {
  const pendingLeaves = userLeaves.filter(
    (l) => l.status === 'pending' || l.status === 'hr_approved'
  ).length;
  const usedLeaves = userLeaves.filter(
    (l) => l.status === 'approved' || l.status === 'hr_approved'
  ).length;
  const annualBalance = Math.max(0, totalLeaves - usedLeaves);
  const sickLeaveUsed = userLeaves.filter(
    (l) => l.type === 'Sick Leave' && (l.status === 'approved' || l.status === 'hr_approved')
  ).length;

  return { pendingLeaves, usedLeaves, annualBalance, sickLeaveUsed };
}

/**
 * Get the CSS classes for a leave status badge.
 */
export function getLeaveStatusColor(status: string): string {
  switch (status) {
    case 'approved':      return 'bg-green-100 text-green-800';
    case 'rejected':
    case 'hr_rejected':   return 'bg-red-100 text-red-800';
    case 'pending':       return 'bg-orange-100 text-orange-800';
    default:              return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Get the dot color class for a leave type indicator.
 */
export function getLeaveDotColor(leaveType: string): string {
  if (leaveType === 'Sick Leave') return 'bg-error';
  if (leaveType === 'Personal Leave') return 'bg-tertiary';
  return 'bg-primary';
}

// ─── Shared: Find current user from employees list ──────────────────────────

import type { Employee } from '../services/Api';

/**
 * Find the employee record matching the logged-in admin's email.
 */
export function findCurrentEmployee(
  employees: Employee[],
  adminEmail?: string
): Employee | undefined {
  if (!adminEmail) return undefined;
  return employees.find(
    (e) => e.email.toLowerCase() === adminEmail.toLowerCase()
  );
}

// ─── Build Leave Stat Cards with Dynamic Values ──────────────────────────────

import type { LeaveStatCard } from '../services/Api';

/**
 * Build leave stat cards by merging static config with dynamic leave stats.
 */
export function buildLeaveStatCards(
  cardConfigs: LeaveStatCard[],
  leaveStats: ReturnType<typeof computeLeaveStats>
): (Omit<LeaveStatCard, 'statKey'> & { value: number })[] {
  return cardConfigs.map((config) => {
    const statValue = leaveStats[config.statKey];
    return {
      id: config.id,
      icon: config.icon,
      iconBg: config.iconBg,
      iconColor: config.iconColor,
      label: config.label,
      unit: config.unit,
      badge: config.badge,
      value: statValue,
    };
  });
}

// ─── Ticket Status and Category Helpers ──────────────────────────────────────

import type { TicketStatus, TicketCategory } from '../services/Api';

/**
 * Get ticket status styling by status id.
 */
export function getTicketStatus(statuses: TicketStatus[], statusId: string): TicketStatus | null {
  return statuses.find((s) => s.id === statusId) || null;
}

/**
 * Get category styling by checking if the category name matches any in the category config.
 */
export function getCategoryColor(categories: TicketCategory[], categoryName: string): { bgColor: string; textColor: string } {
  for (const cat of categories) {
    if (cat.categories.includes(categoryName)) {
      return { bgColor: cat.bgColor, textColor: cat.textColor };
    }
  }
  // Return default if no match found
  return { bgColor: 'bg-surface-container-highest', textColor: 'text-on-surface-variant' };
}
