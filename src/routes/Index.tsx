/* eslint-disable react-refresh/only-export-components -- route manifest: lazy page chunks live alongside the router config, not a fast-refreshable component module */
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import ProtectedRoute from './ProtectedRoute'

const AddEmployeePage = lazy(() => import('../components/employee-management/AddEmployee'))
const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const EditEmployeePage = lazy(() => import('../components/employee-management/EditEmployee'))
const EmployeeManagementPage = lazy(() => import('../pages/EmployeeManagement'))
const EmployeeProblemsPage = lazy(() => import('../pages/EmployeeProblems'))
const HRAdministrationPage = lazy(() => import('../pages/HrAdministration'))
const LeavePage = lazy(() => import('../pages/Leave'))
const LoginPage = lazy(() => import('../pages/LoginPage'))

const RouteFallback = () => (
  <div className="flex items-center justify-center min-h-screen gap-3">
    <span className="material-symbols-outlined text-primary animate-spin">progress_activity</span>
    <p className="text-body-md font-body-md text-on-surface-variant">Loading…</p>
  </div>
)

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<RouteFallback />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/hr-administration',
        element: <HRAdministrationPage />,
      },
      {
        path: '/employee-management',
        element: <EmployeeManagementPage />,
      },
      {
        path: '/employee-management/add',
        element: <AddEmployeePage />,
      },
      {
        path: '/employee-management/:id/edit',
        element: <EditEmployeePage />,
      },
      {
        path: '/leave',
        element: <LeavePage />,
      },
      {
        path: '/employee-problems',
        element: <EmployeeProblemsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
])

export default router

