import { Navigate, Outlet } from 'react-router'
import { Suspense, useState } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../Store'
import Sidebar from '../components/layout/Sidebar'

export default function ProtectedRoute() {
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="text-on-background font-body-md antialiased overflow-x-hidden" style={{ backgroundColor: '#F8FAFC' }}>
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className={`${sidebarCollapsed ? "md:ml-[64px]" : "md:ml-[240px]"} flex flex-col min-h-screen transition-all duration-300`}>
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
