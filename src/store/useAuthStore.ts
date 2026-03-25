import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type AuthUser = {
  name: string
  avatar: string
}

type AuthState = {
  user: AuthUser | null
  githubToken: string | null
  isAuthenticated: boolean
  setAuth: (user: AuthUser, githubToken: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      githubToken: null,
      isAuthenticated: false,
      setAuth: (user, githubToken) => {
        set({ user, githubToken, isAuthenticated: true })
      },
      clearAuth: () => {
        set({ user: null, githubToken: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-session',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
