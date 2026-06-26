import { Navigate } from 'react-router'

/**
 * Shared redirect component used by both the index route (/) and
 * the catch-all route (*) to redirect unauthenticated or unknown
 * paths to the login page.
 */
export default function RedirectToLogin() {
  return <Navigate to="/login" replace />
}
