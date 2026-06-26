import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import type { AppDispatch, RootState } from '../Store'
import Logo from '../assets/Logo/Logo.png'
import { Button } from '../components/ui/Button'
import { clearError, loginAdmin } from '../features/auth/AuthSlice'


const CURRENT_YEAR = new Date().getFullYear()

export default function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error, isAuthenticated, admin } = useSelector((s: RootState) => s.auth)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [usernameFocused, setUsernameFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      if (admin?.role === 'admin') {
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/employee-dashboard', { replace: true })
      }
    }
  }, [isAuthenticated, admin, navigate])

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value)
    if (error) dispatch(clearError())
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    if (error) dispatch(clearError())
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) return
    dispatch(loginAdmin({ username, password }))
  }

  const iconBase = "material-symbols-outlined text-[20px]"
  const iconFocusedClass = `${iconBase} text-primary`
  const iconUnfocusedClass = `${iconBase} text-on-surface-variant`
  const focusedStyle = { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }
  const unfocusedStyle = { fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }

  return (
    <div className="bg-inverse-surface min-h-screen flex items-center justify-center p-4 antialiased selection:bg-primary-container selection:text-on-primary-container">
      <main className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-surface rounded-xl shadow-glow overflow-hidden relative">
          {/* Content */}
          <div className="p-6 relative z-10">
            {/* Header / Logo */}
            <div className="flex flex-col items-center mb-6">
              <img
                alt="Cerebulb Logo"
                className="w-full h-auto max-w-[160px] mb-2 object-contain"
                src={Logo}
              />
              <h1 className="text-[24px] leading-[32px] tracking-[-0.02em] font-bold font-headline-lg text-on-surface">
                HRMS Portal
              </h1>
              <p className="text-[14px] leading-[20px] font-body-md text-on-surface-variant mt-1.5 text-center">
                Sign in to manage your employee profile and HR tasks.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-error/30 bg-error-container/20 px-3 py-2 text-[13px] text-error">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Username Input */}
              <div className="space-y-1.5">
                <label
                  className="block text-[13px] leading-[18px] tracking-[0.01em] font-semibold font-label-md text-on-surface"
                  htmlFor="login-username"
                >
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                    <span
                      className={usernameFocused ? iconFocusedClass : iconUnfocusedClass}
                      style={usernameFocused ? focusedStyle : unfocusedStyle}
                    >
                      person
                    </span>
                  </div>
                  <input
                    className="block w-full pl-9 pr-3 py-1.5 border border-outline-variant rounded-lg bg-surface text-on-surface text-[14px] leading-[20px] font-body-md placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    id="login-username"
                    name="username"
                    placeholder="Enter your username"
                    required
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    onFocus={() => setUsernameFocused(true)}
                    onBlur={() => setUsernameFocused(false)}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    className="block text-[13px] leading-[18px] tracking-[0.01em] font-semibold font-label-md text-on-surface"
                    htmlFor="login-password"
                  >
                    Password
                  </label>
                 
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                    <span
                      className={passwordFocused ? iconFocusedClass : iconUnfocusedClass}
                      style={passwordFocused ? focusedStyle : unfocusedStyle}
                    >
                      lock
                    </span>
                  </div>
                  <input
                    className="block w-full pl-9 pr-9 py-1.5 border border-outline-variant rounded-lg bg-surface text-on-surface text-[14px] leading-[20px] font-body-md placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    id="login-password"
                    name="password"
                    placeholder="••••••••"
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface transition-colors"
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center pt-1">
                <input
                  className="h-3.5 w-3.5 rounded border-outline-variant text-primary focus:ring-primary bg-surface transition-all cursor-pointer"
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label
                  className="ml-2 block text-[14px] leading-[20px] font-body-md text-on-surface-variant cursor-pointer"
                  htmlFor="remember-me"
                >
                  Remember me
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <Button
                  id="login-submit-btn"
                  className="w-full py-2"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      Authenticating…
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Subtle bottom accent line */}
          <div className="h-1 w-full bg-gradient-to-r from-primary to-secondary" />
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-[12px] leading-[16px] font-semibold font-label-sm text-inverse-on-surface/80">
            © {CURRENT_YEAR} HRMS Portal. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  )
}
