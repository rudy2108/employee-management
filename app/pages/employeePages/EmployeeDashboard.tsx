import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import type { RootState } from '../../Store'
import { employeeAPI, leaveAPI } from '../../services/Api'
import { cap, CARD_SHADOW, computeLeaveTypes } from '../../lib/Utils'
import { LeaveBalanceSummaryCard } from '../../components/ui/StatCard'
import { PageHeader } from '../../components/ui/PageHeader'
import RecentActivityCard from '../../components/dashboard/RecentActivityCard'
import UpcomingHolidaysCard from '../../components/dashboard/UpcomingHolidaysCard'

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EmployeeDashboard() {
  const admin = useSelector((s: RootState) => s.auth.admin)
  const adminEmail = useMemo(() => admin?.email?.toLowerCase(), [admin?.email])

  // Data queries with optimized cache settings
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeAPI.fetchAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  })

  const { data: leaveRequests = [], isLoading: leavesLoading } = useQuery({
    queryKey: ['leaves'],
    queryFn: leaveAPI.fetchAll,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000,
  })

  // Memoized derived data to prevent unnecessary recalculations
  const myEmployee = useMemo(
    () => employees.find((e) => e.email.toLowerCase() === adminEmail),
    [employees, adminEmail]
  )

  const myLeaves = useMemo(
    () =>
      myEmployee
        ? leaveRequests.filter((l) => String(l.employeeId) === String(myEmployee.id))
        : [],
    [leaveRequests, myEmployee]
  )

  const leaveTypes = useMemo(
    () =>
      computeLeaveTypes(
        myLeaves,
        myEmployee?.totalLeaves ?? 12,
        myEmployee?.sickLeaves ?? 8,
        myEmployee?.personalLeaves ?? 4
      ),
    [myLeaves, myEmployee]
  )

  const pageSubtitle = useMemo(
    () =>
      myEmployee
        ? `${cap(myEmployee.designation)} · ${cap(myEmployee.department)} · EMP ${myEmployee.empId}`
        : 'Have a productive day! Check your leave balance and upcoming holidays below.',
    [myEmployee]
  )

  if (employeesLoading || leavesLoading) {
    return (
      <div className="flex-1 flex flex-col bg-background min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
        <main className="flex-1 p-4 space-y-4">
          <div className="h-20 bg-surface-container-low rounded-xl animate-pulse" />
        </main>
      </div>
    )
  }

  return (
    <div
      className="flex-1 flex flex-col bg-background min-h-screen"
      style={{ backgroundColor: '#F8FAFC' }}
    >
      {/* Main Content */}
      <main className="flex-1 p-4 space-y-4">

        {/* ── Welcome Banner ───────────────────────────────── */}
        <PageHeader
          title={`Welcome back, ${admin?.name ?? 'Employee'}!`}
          subtitle={pageSubtitle}
        />

        {/* ── Bento Row 1: Leave Balance ────── */}
        <LeaveBalanceSummaryCard 
          leaveTypes={leaveTypes}
          cardShadow={CARD_SHADOW}
        />

        {/* ── Bento Row 2: Recent Activity + Upcoming Holidays ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Recent Activity (my leaves) — 7 cols */}
          <div className="lg:col-span-7">
            <RecentActivityCard />
          </div>

          {/* Upcoming Holidays — 5 cols */}
          <div className="lg:col-span-5">
            <UpcomingHolidaysCard />
          </div>
        </div>

      </main>
    </div>
  )
}
