import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { useTokenRefreshTimer } from '@/hooks/useAuth'

export default function Layout() {
  useTokenRefreshTimer()

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar />
      <div className="d-flex flex-column flex-grow-1 overflow-hidden">
        <Navbar />
        <main className="flex-grow-1 overflow-auto p-4" style={{ background: '#f9fafb' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}