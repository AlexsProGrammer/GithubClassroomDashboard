import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getReadableAuthError, signInWithGitHub } from '../services/firebase'
import { useAuthStore } from '../store/useAuthStore'

export default function Login() {
  const setAuth = useAuthStore((state) => state.setAuth)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleLogin = async (forceAccountSelection = false) => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const { user, accessToken } = await signInWithGitHub({ forceAccountSelection })

      setAuth(
        {
          name: user.displayName ?? user.email ?? 'GitHub User',
          avatar: user.photoURL ?? '',
        },
        accessToken,
      )

      navigate('/dashboard', { replace: true })
    } catch (error) {
      setErrorMessage(getReadableAuthError(error))
    } finally {
      setIsLoading(false)
    }
  }

  const showSwitchHint = searchParams.get('switchAccount') === '1'

  return (
    <section className="max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Login</h1>
      <p className="mt-2 text-sm text-slate-600">Sign in with your GitHub account.</p>
      {showSwitchHint ? (
        <p className="mt-2 text-sm text-amber-700">Choose a different account in the popup.</p>
      ) : null}
      <button
        className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => void handleLogin(false)}
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Login with GitHub'}
      </button>
      <button
        className="ml-3 mt-6 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => void handleLogin(true)}
        disabled={isLoading}
        type="button"
      >
        {isLoading ? 'Opening chooser...' : 'Use different GitHub account'}
      </button>
      {errorMessage ? <p className="mt-4 text-sm text-red-600">{errorMessage}</p> : null}
    </section>
  )
}
