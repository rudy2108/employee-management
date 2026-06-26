import { Navigate, Outlet } from 'react-router'
import { Suspense, useState } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../Store'
import Sidebar from '../components/layout/Sidebar'
import EmployeeSidebar from '../components/layout/EmployeeSidebar'

export default function ProtectedRoute() {
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated)
  const admin = useSelector((s: RootState) => s.auth.admin)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  if (!isAuthenticated) return <Navigate to="/login" replace />

  // Determine which sidebar to show based on the user's role.
  // Admins get the collapsible admin sidebar; all other roles get the employee sidebar.
  const isAdmin = admin?.role === 'admin'

  return (
    <div className="text-on-background font-body-md antialiased overflow-x-hidden" style={{ backgroundColor: '#F8FAFC' }}>
      {isAdmin ? (
        // Admin sidebar — collapsible
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      ) : (
        // Employee sidebar — fixed 280px, no collapse
        <EmployeeSidebar />
      )}

      {/* Content area: offset left margin based on sidebar type and state */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          isAdmin
            ? sidebarCollapsed
              ? 'md:ml-[64px]'
              : 'md:ml-[240px]'
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
