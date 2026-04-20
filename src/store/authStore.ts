import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  id: number
  nombre: string
  rol: string
}

interface AuthState {
  accessToken:  string | null
  refreshToken: string | null
  expiresAt:    number | null   // timestamp ms
  user:         AuthUser | null
  setTokens: (at: string, rt: string, expiresIn: number, user: AuthUser) => void
  setAccessToken: (at: string, expiresIn: number) => void
  logout: () => void
  isAuthenticated: () => boolean
  isTokenExpired: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken:  null,
      refreshToken: null,
      expiresAt:    null,
      user:         null,

      setTokens: (at, rt, expiresIn, user) =>
        set({
          accessToken:  at,
          refreshToken: rt,
          expiresAt:    Date.now() + expiresIn * 1000,
          user,
        }),

      setAccessToken: (at, expiresIn) =>
        set({ accessToken: at, expiresAt: Date.now() + expiresIn * 1000 }),

      logout: () =>
        set({ accessToken: null, refreshToken: null, expiresAt: null, user: null }),

      isAuthenticated: () => !!get().accessToken,

      // Considera expirado 30 s antes para evitar carreras
      isTokenExpired: () => {
        const exp = get().expiresAt
        return exp == null || Date.now() > exp - 30_000
      },
    }),
    { name: 'vallesol-auth' }
  )
)
