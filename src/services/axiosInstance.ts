import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  timeout: 15_000,
})

// ── Bandera para evitar múltiples refresh simultáneos ────────────────────────
let isRefreshing = false
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)))
  failedQueue = []
}

// ── Request interceptor — adjunta access token ───────────────────────────────
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const store = useAuthStore.getState()

  // Si está a punto de expirar, renueva antes de enviar
  if (store.accessToken && store.isTokenExpired() && store.refreshToken) {
    if (!isRefreshing) {
      isRefreshing = true
      try {
        const res = await axios.post(
          `${config.baseURL ?? '/api/v1'}/auth/refresh`,
          { refresh_token: store.refreshToken }
        )
        store.setAccessToken(res.data.access_token, res.data.expires_in)
        processQueue(null, res.data.access_token)
      } catch (err) {
        processQueue(err, null)
        store.logout()
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    } else {
      // Espera a que el refresh en curso termine
      await new Promise<string>((resolve, reject) =>
        failedQueue.push({ resolve, reject })
      )
    }
  }

  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response interceptor — maneja 401 ────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const store = useAuthStore.getState()

    // 401 y no es el endpoint de refresh ni ya reintentado
    if (
      error.response?.status === 401 &&
      !original._retry &&
      original.url !== '/auth/refresh' &&
      store.refreshToken
    ) {
      original._retry = true

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              original.headers.Authorization = `Bearer ${token}`
              resolve(api(original))
            },
            reject,
          })
        })
      }

      isRefreshing = true
      try {
        const res = await axios.post(
          `${original.baseURL ?? '/api/v1'}/auth/refresh`,
          { refresh_token: store.refreshToken }
        )
        store.setAccessToken(res.data.access_token, res.data.expires_in)
        processQueue(null, res.data.access_token)
        original.headers.Authorization = `Bearer ${res.data.access_token}`
        return api(original)
      } catch (err) {
        processQueue(err, null)
        store.logout()
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
