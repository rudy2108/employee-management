import { index, layout, route, type RouteConfig } from '@react-router/dev/routes'

export default [
  index('./pages/RedirectToLogin.tsx', { id: 'index-redirect' }),
  route('login', './pages/LoginPage.tsx'),
  layout('./pages/ProtectedRoute.tsx', [
    route('dashboard', './pages/adminPages/AdminDashboard.tsx'),
    route('hr-administration', './pages/adminPages/AdminHrAdministration.tsx'),
    route('employee-management', './pages/adminPages/AdminEmployeeManagement.tsx'),
    route('employee-management/add', './components/employee-management/AddEmployee.tsx'),
    route('employee-management/:id/edit', './components/employee-management/EditEmployee.tsx'),
    route('leave', './pages/adminPages/AdminLeaveManagement.tsx'),
    route('employee-problems', './pages/adminPages/AdminEmployeeProblems.tsx'),
    route('employee-dashboard', './pages/employeePages/EmployeeDashboard.tsx'),
    route('employee-profile', './pages/employeePages/EmployeeProfile.tsx'),
    route('employee-leave', './pages/employeePages/EmployeeLeave.tsx'),
    route('employee-support', './pages/employeePages/EmployeeSupport.tsx'),
  ]),
  route('*', './pages/RedirectToLogin.tsx', { id: 'catch-all' }),
] satisfies RouteConfig
