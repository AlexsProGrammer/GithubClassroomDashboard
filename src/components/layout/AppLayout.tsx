import { Link, Outlet, useNavigate } from 'react-router-dom'
import { signOutFromFirebase } from '../../services/firebase'
import { useAuthStore } from '../../store/useAuthStore'

export function AppLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOutFromFirebase()
    } catch (error) {
      console.error('[Auth] Firebase sign-out failed:', error)
    } finally {
      clearAuth()
      navigate('/login', { replace: true })
    }
  }

  const handleSwitchAccount = async () => {
    try {
      await signOutFromFirebase()
    } catch (error) {
      console.error('[Auth] Firebase sign-out failed during account switch:', error)
    } finally {
      clearAuth()
      navigate('/login?switchAccount=1', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <span className="text-sm font-semibold tracking-wide">Quest Log</span>
          <div className="flex items-center gap-4 text-sm text-slate-700">
            <Link className="hover:text-slate-900" to="/login">
              Login
            </Link>
            {isAuthenticated ? (
              <Link className="hover:text-slate-900" to="/dashboard">
                Dashboard
              </Link>
            ) : null}
            {isAuthenticated ? (
              <button
                className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                onClick={handleSwitchAccount}
                type="button"
              >
                Switch account
              </button>
            ) : null}
            {isAuthenticated ? (
              <button
                className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                onClick={handleLogout}
                type="button"
              >
                Logout
              </button>
            ) : null}
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {isAuthenticated
                ? `Logged in as ${user?.name ?? 'GitHub User'}`
                : 'Not logged in'}
            </span>
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
