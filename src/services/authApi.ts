import api from './axiosInstance'

export const loginApi = (email: string, password: string) =>
  api.post('/auth/login', { email, password }).then((r) => r.data)

export const refreshApi = (refreshToken: string) =>
  api.post('/auth/refresh', { refresh_token: refreshToken }).then((r) => r.data)

export const logoutApi = (refreshToken: string) =>
  api.post('/auth/logout', { refresh_token: refreshToken }).then((r) => r.data)

export const getMeApi = () =>
  api.get('/auth/me').then((r) => r.data)
