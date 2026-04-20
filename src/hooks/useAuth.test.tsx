import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import React from 'react'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
)

beforeEach(() => {
  useAuthStore.setState({
    accessToken: null, refreshToken: null, expiresAt: null, user: null,
  })
})

describe('authStore', () => {
  it('setTokens guarda todos los campos', () => {
    const { result } = renderHook(() => useAuthStore(), { wrapper })
    act(() => {
      result.current.setTokens('at', 'rt', 900, { id: 1, nombre: 'Ana', rol: 'admin' })
    })
    expect(result.current.accessToken).toBe('at')
    expect(result.current.refreshToken).toBe('rt')
    expect(result.current.user?.nombre).toBe('Ana')
    expect(result.current.isAuthenticated()).toBe(true)
  })

  it('logout limpia el estado', () => {
    const { result } = renderHook(() => useAuthStore(), { wrapper })
    act(() => {
      result.current.setTokens('at', 'rt', 900, { id: 1, nombre: 'Ana', rol: 'admin' })
      result.current.logout()
    })
    expect(result.current.accessToken).toBeNull()
    expect(result.current.isAuthenticated()).toBe(false)
  })

  it('isTokenExpired detecta token expirado', () => {
    const { result } = renderHook(() => useAuthStore(), { wrapper })
    act(() => {
      // expiresAt en el pasado
      result.current.setTokens('at', 'rt', -100, { id: 1, nombre: 'Ana', rol: 'admin' })
    })
    expect(result.current.isTokenExpired()).toBe(true)
  })
})
