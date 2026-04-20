import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/hooks/useAuth'
import { LogOut, User } from 'lucide-react'

const rolColor: Record<string, string> = {
  admin:      'bg-danger',
  supervisor: 'bg-warning text-dark',
  operario:   'bg-secondary',
}

export default function Navbar() {
  const user   = useAuthStore((s) => s.user)
  const logout = useLogout()

  return (
    <nav className="vs-navbar d-flex align-items-center justify-content-between px-4 py-2">
      <span className="fw-semibold text-dark" style={{ fontSize: '.95rem' }}>
        Sistema de Producción Entomológica
      </span>
      <div className="d-flex align-items-center gap-3">
        {user && (
          <>
            <span className="d-flex align-items-center gap-2 text-secondary" style={{ fontSize: '.85rem' }}>
              <User size={14} />
              {user.nombre}
              <span className={`vs-badge-role text-white ${rolColor[user.rol] ?? 'bg-secondary'}`}>
                {user.rol}
              </span>
            </span>
            <button
              onClick={logout}
              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
              style={{ fontSize: '.8rem' }}
            >
              <LogOut size={13} /> Salir
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
