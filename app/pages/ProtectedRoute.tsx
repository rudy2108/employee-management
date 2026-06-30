import { Suspense, useState } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router'
import type { RootState } from '../Store'
import Sidebar, { type SidebarNavItem } from '../components/layout/Sidebar'

export default function ProtectedRoute() {
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated)
  const admin = useSelector((s: RootState) => s.auth.admin)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [clockedIn, setClockedIn] = useState(false)

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const isAdmin = admin?.role === 'admin'

  const adminLinks: SidebarNavItem[] = [
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/hr-administration', icon: 'admin_panel_settings', label: 'HR Administration' },
    { to: '/employee-management', icon: 'badge', label: 'Employee Management' },
    { to: '/leave', icon: 'event_busy', label: 'Leave' },
    { to: '/employee-problems', icon: 'report_problem', label: 'Employee Problems' },
  ]

  const employeeLinks: SidebarNavItem[] = [
    { to: '/employee-dashboard', icon: 'dashboard', label: 'My Dashboard' },
    { to: '/employee-profile', icon: 'person', label: 'My Profile' },
    { to: '/employee-leave', icon: 'calendar_today', label: 'My Leave' },
    { to: '/employee-support', icon: 'report_problem', label: 'Support' },
  ]

  const employeeBottomLinks: SidebarNavItem[] = []

  return (
    <div className="text-on-background font-body-md antialiased overflow-x-hidden" style={{ backgroundColor: '#F8FAFC' }}>
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        navLinks={isAdmin ? adminLinks : employeeLinks}
        bottomLinks={[]}
        userName={admin?.name ?? (isAdmin ? 'Admin User' : 'Employee')}
        userEmail={admin?.email ?? ''}
        userRole={isAdmin ? 'HR Manager' : 'Employee'}
        showToggleButton={true}
        expandedWidthClass={isAdmin ? 'w-[240px]' : 'w-[280px]'}
        collapsedWidthClass="w-[64px]"
      />

      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed
            ? 'md:ml-[64px]'
            : isAdmin
            ? 'md:ml-[240px]'
            : 'md:ml-[280px]'
        }`}
      >
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen gap-3">
              <span className="material-symbols-outlined text-primary animate-spin">progress_activity</span>
              <p className="text-body-md font-body-md text-on-surface-variant">Loading…</p>
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </div>
    </div>
  )
}
