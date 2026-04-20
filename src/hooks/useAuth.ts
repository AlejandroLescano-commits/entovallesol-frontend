import { useEffect, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { loginApi, logoutApi } from '@/services/authApi'
import toast from 'react-hot-toast'
import axios from 'axios'

export function useLogin() {
  const navigate = useNavigate()
  const setTokens = useAuthStore((s) => s.setTokens)

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginApi(email, password),
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token, data.expires_in, {
        id:     data.user_id,
        nombre: data.nombre,
        rol:    data.rol,
      })
      navigate('/dashboard')
    },
    onError: (err) => {
      const msg =
        axios.isAxiosError(err)
          ? err.response?.data?.detail ?? 'Error al ingresar'
          : 'Error de red'
      toast.error(msg)
    },
  })
}

export function useLogout() {
  const store   = useAuthStore()
  const navigate = useNavigate()

  return async () => {
    if (store.refreshToken) {
      try { await logoutApi(store.refreshToken) } catch { /* ignora */ }
    }
    store.logout()
    navigate('/login')
    toast.success('Sesión cerrada')
  }
}

/**
 * Hook que renueva silenciosamente el access token 60 s antes de que expire.
 * Úsalo en el componente raíz de la app autenticada (Layout).
 */
export function useTokenRefreshTimer() {
  const store  = useAuthStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!store.expiresAt || !store.refreshToken) return

    // Renovar 60 s antes de expirar
    const delay = store.expiresAt - Date.now() - 60_000
    if (delay <= 0) return

    timerRef.current = setTimeout(async () => {
      try {
        const res = await axios.post('/api/v1/auth/refresh', {
          refresh_token: store.refreshToken,
        })
        store.setAccessToken(res.data.access_token, res.data.expires_in)
      } catch {
        store.logout()
        window.location.href = '/login'
      }
    }, delay)

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [store.expiresAt])
}
