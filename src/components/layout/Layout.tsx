import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { useTokenRefreshTimer } from '@/hooks/useAuth'

export default function Layout() {
  useTokenRefreshTimer()

  return (
    <div className="d-flex" style={{ minHeight: '100vh', background: 'var(--vs-bg)' }}>
      <Sidebar />
      <div className="d-flex flex-column flex-grow-1 overflow-hidden">
        <Navbar />
        <main className="flex-grow-1 overflow-auto p-4" style={{ background: 'var(--vs-bg)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
