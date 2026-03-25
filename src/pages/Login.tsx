import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithGitHub } from '../services/firebase'
import { useAuthStore } from '../store/useAuthStore'

export default function Login() {
  const setAuth = useAuthStore((state) => state.setAuth)
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleLogin = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const { user, accessToken } = await signInWithGitHub()

      setAuth(
        {
          name: user.displayName ?? user.email ?? 'GitHub User',
          avatar: user.photoURL ?? '',
        },
        accessToken,
      )

      navigate('/dashboard', { replace: true })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Login</h1>
      <p className="mt-2 text-sm text-slate-600">Sign in with your GitHub account.</p>
      <button
        className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Login with GitHub'}
      </button>
      {errorMessage ? <p className="mt-4 text-sm text-red-600">{errorMessage}</p> : null}
    </section>
  )
}
