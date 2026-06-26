import { index, layout, route, type RouteConfig } from '@react-router/dev/routes'

export default [
  index('./pages/RedirectToLogin.tsx', { id: 'index-redirect' }),
  route('login', './pages/LoginPage.tsx'),
  layout('./pages/ProtectedRoute.tsx', [
    route('dashboard', './pages/DashboardPage.tsx'),
    route('hr-administration', './pages/HrAdministration.tsx'),
    route('employee-management', './pages/EmployeeManagement.tsx'),
    route('employee-management/add', './components/employee-management/AddEmployee.tsx'),
    route('employee-management/:id/edit', './components/employee-management/EditEmployee.tsx'),
    route('leave', './pages/Leave.tsx'),
    route('employee-problems', './pages/EmployeeProblems.tsx'),
  ]),
  route('*', './pages/RedirectToLogin.tsx', { id: 'catch-all' }),
] satisfies RouteConfig
