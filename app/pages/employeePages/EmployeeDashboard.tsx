import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import type { RootState } from '../../Store'
import { employeeAPI, leaveAPI, holidayAPI } from '../../services/Api'
import { cap, timeAgo, CARD_SHADOW } from '../../lib/Utils'
import Header from '../../components/layout/Header'

// ─── Leave Balance Section ──────────────────────────────────────────────────

interface LeaveTypeRow {
  label: string
  icon: string
  color: string
  barColor: string
  days: number
  total: number
}

// ─── Quick Actions ───────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { id: 'qa-clock', icon: 'login', label: 'Clock In / Out' },
  { id: 'qa-leave', icon: 'event_busy', label: 'Request Leave' },
  { id: 'qa-report', icon: 'description', label: 'Submit Report' },
]

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EmployeeDashboard() {
  // Auth – get the logged-in admin's name (used as the employee's display name)
  const admin = useSelector((s: RootState) => s.auth.admin)

  // Clock-in toggle state
  const [clockedIn, setClockedIn] = useState(false)

  // Data queries
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeAPI.fetchAll,
  })

  const { data: leaveRequests = [] } = useQuery({
    queryKey: ['leaves'],
    queryFn: leaveAPI.fetchAll,
  })

  const { data: holidays = [] } = useQuery({
    queryKey: ['holidays'],
    queryFn: holidayAPI.fetchAll,
  })

  // --- Derived: current date display
  const now = new Date()
  const dateLabel = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // --- Derived: the employee record matching logged-in admin email
  const myEmployee = employees.find(
    (e) => e.email.toLowerCase() === admin?.email?.toLowerCase()
  )

  // If no match, fall back to the first employee for demo (totalLeaves default 12)
  const totalLeaves = myEmployee?.totalLeaves ?? 12

  // --- Derived: my leave requests (filter only the logged-in employee's leaves)
  const myLeaves = myEmployee
    ? leaveRequests.filter(
        (l) => String(l.employeeId) === String(myEmployee.id)
      )
    : [] // No match → show empty rather than leaking all employees' data

  // Compute used/remaining per type
  const usedAnnual = myLeaves.filter(
    (l) =>
      (l.status === 'approved' || l.status === 'hr_approved') &&
      (l.type === 'Annual Leave' || l.type === 'Immediate Leave')
  ).length

  const usedSick = myLeaves.filter(
    (l) =>
      (l.status === 'approved' || l.status === 'hr_approved') &&
      l.type === 'Sick Leave'
  ).length

  const usedPersonal = myLeaves.filter(
    (l) =>
      (l.status === 'approved' || l.status === 'hr_approved') &&
      l.type === 'Personal Leave'
  ).length

  const annualTotal = totalLeaves
  const sickTotal = myEmployee?.sickLeaves ?? 8
  const personalTotal = myEmployee?.personalLeaves ?? 4

  const leaveTypes: LeaveTypeRow[] = [
    {
      label: 'Annual Leave',
      icon: 'beach_access',
      color: 'text-primary',
      barColor: 'bg-primary',
      days: Math.max(0, annualTotal - usedAnnual),
      total: annualTotal,
    },
    {
      label: 'Sick Leave',
      icon: 'medical_services',
      color: 'text-tertiary',
      barColor: 'bg-tertiary',
      days: Math.max(0, sickTotal - usedSick),
      total: sickTotal,
    },
    {
      label: 'Personal Leave',
      icon: 'person',
      color: 'text-secondary',
      barColor: 'bg-secondary',
      days: Math.max(0, personalTotal - usedPersonal),
      total: personalTotal,
    },
  ]

  // --- Derived: recent activity from my leave requests
  const recentLeaves = [...myLeaves]
    .sort((a, b) => b.appliedDate.localeCompare(a.appliedDate))
    .slice(0, 5)

  // --- Derived: upcoming holidays — only future dates, sorted, up to 4
  const today = now.toISOString().split('T')[0] // e.g. "2026-06-26"
  const upcomingHolidays = [...holidays]
    .filter((h) => {
      // h.date is like "Aug 15, 2026"
      const parsed = new Date(h.date)
      return !isNaN(parsed.getTime()) && parsed.toISOString().split('T')[0] >= today
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4)

  return (
    <div
      className="flex-1 flex flex-col bg-background min-h-screen"
      style={{ backgroundColor: '#F8FAFC' }}
    >
      {/* Top Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-4">

        {/* ── Welcome Banner ───────────────────────────────── */}
        <section
          className="relative overflow-hidden rounded-2xl p-6 text-white"
          style={{ background: 'linear-gradient(135deg, #006b5f 0%, #00897b 60%, #00acc1 100%)' }}
        >
          {/* Content */}
          <div className="relative z-10">
            <p className="text-label-md font-label-md opacity-80 mb-1">{dateLabel}</p>
            <h1 className="text-headline-lg font-headline-lg font-bold">
              Welcome back, {admin?.name ?? 'Employee'}!
            </h1>
            <p className="text-body-md font-body-md max-w-xl mt-1 opacity-90">
              {myEmployee
                ? `${cap(myEmployee.designation)} · ${cap(myEmployee.department)} · EMP ${myEmployee.empId}`
                : 'Have a productive day! Check your leave balance and upcoming holidays below.'}
            </p>
          </div>

          {/* Clock-In Button inside banner */}
          <div className="relative z-10 mt-4">
            <button
              id="emp-clockin-btn"
              onClick={() => setClockedIn((v) => !v)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-label-md transition-all active:scale-95 shadow-md ${
                clockedIn
                  ? 'bg-error-container text-on-error-container'
                  : 'bg-primary-container text-on-primary-container'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {clockedIn ? 'logout' : 'schedule'}
              </span>
              {clockedIn ? 'Clock Out' : 'Clock In'}
            </button>
          </div>

          {/* Decorative icon */}
          <span
            className="material-symbols-outlined absolute -right-10 -top-10 text-[220px] opacity-5 select-none pointer-events-none"
            aria-hidden="true"
          >
            diversity_3
          </span>
        </section>

        {/* ── Bento Row 1: Quick Actions + Leave Balance ────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

          {/* Quick Actions — 4 cols */}
          <div
            className="lg:col-span-4 bg-surface-container-lowest rounded-xl border border-surface-container-highest p-4"
            style={CARD_SHADOW}
          >
            <h3 className="text-headline-md font-headline-md text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">bolt</span>
              Quick Actions
            </h3>
            <div className="flex flex-col gap-3">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  id={action.id}
                  className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl hover:bg-primary-container/20 transition-all group active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-surface rounded-lg shadow-sm text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-[20px]">
                        {action.icon}
                      </span>
                    </div>
                    <span className="text-label-md font-label-md font-bold text-on-surface">
                      {action.label}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant">
                    chevron_right
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Leave Balance — 8 cols */}
          <div
            className="lg:col-span-8 bg-surface-container-lowest rounded-xl border border-surface-container-highest p-4"
            style={CARD_SHADOW}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">pending_actions</span>
                Leave Balance Summary
              </h3>
              <button className="text-primary text-label-md font-label-md hover:underline">
                View History
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {leaveTypes.map((lt) => {
                const pct = lt.total > 0 ? Math.round((lt.days / lt.total) * 100) : 0
                return (
                  <div
                    key={lt.label}
                    className="p-4 bg-surface-container-low rounded-xl relative overflow-hidden group border border-transparent hover:border-primary/20 transition-all"
                  >
                    <p className="text-label-md font-label-md text-on-surface-variant mb-1">
                      {lt.label}
                    </p>
                    <h4 className={`text-headline-lg font-headline-lg font-bold ${lt.color}`}>
                      {String(lt.days).padStart(2, '0')}{' '}
                      <span className="text-label-md font-normal opacity-70">Days</span>
                    </h4>
                    <div className="w-full bg-surface-container-highest h-2 rounded-full mt-3 overflow-hidden">
                      <div
                        className={`${lt.barColor} h-full rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-label-sm font-label-sm text-on-surface-variant mt-1 opacity-70">
                      {lt.days} of {lt.total} remaining
                    </p>
                    <span
                      className="material-symbols-outlined absolute -bottom-3 -right-3 text-[80px] opacity-5 group-hover:opacity-10 transition-opacity select-none pointer-events-none"
                      aria-hidden="true"
                    >
                      {lt.icon}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Bento Row 2: Recent Activity + Upcoming Holidays ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Recent Activity (my leaves) — 7 cols */}
          <div
            className="lg:col-span-7 bg-surface-container-lowest rounded-xl border border-surface-container-highest p-4"
            style={CARD_SHADOW}
          >
            <h3 className="text-headline-md font-headline-md text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">reorder</span>
              My Leave Activity
            </h3>

            {recentLeaves.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-on-surface-variant gap-2">
                <span className="material-symbols-outlined text-[40px] opacity-30">
                  event_available
                </span>
                <p className="text-body-sm font-body-sm">No leave requests found.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {recentLeaves.map((leave, idx) => {
                  const statusMeta: Record<string, { icon: string; bg: string; color: string; label: string }> = {
                    approved: { icon: 'check_circle', bg: 'bg-primary/10', color: 'text-primary', label: 'Approved' },
                    hr_approved: { icon: 'verified', bg: 'bg-tertiary/10', color: 'text-tertiary', label: 'HR Approved' },
                    pending: { icon: 'pending', bg: 'bg-[#F59E0B]/10', color: 'text-[#F59E0B]', label: 'Pending' },
                    rejected: { icon: 'cancel', bg: 'bg-error/10', color: 'text-error', label: 'Rejected' },
                    hr_rejected: { icon: 'do_not_disturb_on', bg: 'bg-error/10', color: 'text-error', label: 'HR Rejected' },
                  }
                  const meta = statusMeta[leave.status] ?? statusMeta['pending']

                  return (
                    <li key={leave.id} className="flex gap-3 relative">
                      {idx < recentLeaves.length - 1 && (
                        <div className="absolute left-4 top-8 bottom-[-12px] w-px bg-surface-container-highest" />
                      )}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ring-4 ring-surface-container-lowest ${meta.bg} ${meta.color}`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {meta.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-body-sm font-body-sm text-on-surface font-medium">
                            {leave.type}
                          </p>
                          <span
                            className={`text-label-sm font-label-sm px-2 py-0.5 rounded-full shrink-0 ml-2 ${meta.bg} ${meta.color}`}
                          >
                            {meta.label}
                          </span>
                        </div>
                        <p className="text-label-sm font-label-sm text-on-surface-variant">
                          {leave.duration}
                        </p>
                        <p className="text-label-sm font-label-sm text-on-surface-variant/60 mt-0.5">
                          {timeAgo(leave.appliedDate)}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Upcoming Holidays — 5 cols */}
          <div
            className="lg:col-span-5 bg-surface-container-lowest rounded-xl border border-surface-container-highest p-4"
            style={CARD_SHADOW}
          >
            <h3 className="text-headline-md font-headline-md text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">celebration</span>
              Upcoming Holidays
            </h3>

            {upcomingHolidays.length === 0 ? (
              <p className="text-body-sm font-body-sm text-on-surface-variant text-center py-6">
                No upcoming holidays.
              </p>
            ) : (
              <div className="space-y-2">
                {upcomingHolidays.map((h, idx) => {
                  // Parse "Aug 15, 2026" → day and month
                  const parts = h.date.split(' ')
                  const monthAbbr = parts[0] ?? ''
                  const dayNum = (parts[1] ?? '').replace(',', '')

                  const isFirst = idx === 0
                  return (
                    <div
                      key={h.id}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                        isFirst
                          ? 'bg-surface-container-low border-l-4 border-primary'
                          : 'bg-surface-container-low/60'
                      }`}
                    >
                      <div className="bg-surface px-3 py-1 rounded-lg shadow-sm text-center shrink-0">
                        <p className="text-[10px] text-on-surface-variant uppercase font-semibold leading-none mb-0.5">
                          {monthAbbr}
                        </p>
                        <p className={`text-headline-md font-headline-md leading-tight ${isFirst ? 'text-primary' : 'text-on-surface-variant'}`}>
                          {dayNum}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-label-md font-label-md font-bold text-on-surface truncate">
                          {h.name}
                        </p>
                        <p className="text-body-sm font-body-sm text-on-surface-variant">
                          {h.type === 'Public' ? 'Company Wide Holiday' : 'Optional Holiday'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <button className="w-full mt-4 py-2 border border-outline-variant text-on-surface-variant text-label-md font-label-md rounded-lg hover:bg-surface-container-high transition-colors">
              View All Holidays
            </button>
          </div>
        </div>

      </main>
    </div>
  )
}
