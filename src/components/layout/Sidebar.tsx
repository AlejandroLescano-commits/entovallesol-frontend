import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Bug, ArrowRightLeft, Package,
  FileBarChart, Upload, Users, Settings,
} from 'lucide-react'

const nav = [
  { to: '/dashboard',                label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/produccion/sitotroga',     label: 'Sitotroga',       icon: Bug },
  { to: '/produccion/trichogramma',  label: 'Trichogramma',    icon: Bug },
  { to: '/produccion/galleria',      label: 'Galleria',        icon: Bug },
  { to: '/produccion/paratheresia',  label: 'Paratheresia',    icon: Bug },
  { to: '/distribucion',             label: 'Distribución',    icon: ArrowRightLeft },
  { to: '/inventario',               label: 'Inventario',      icon: Package },
  { to: '/reportes',                 label: 'Reportes',        icon: FileBarChart },
  { to: '/importacion',              label: 'Importación',     icon: Upload },
  { to: '/usuarios',                 label: 'Usuarios',        icon: Users },
  { to: '/configuracion',            label: 'Configuración',   icon: Settings },
]

export default function Sidebar() {
  return (
    <aside className="vs-sidebar">
      <div
        className="px-3 py-4 d-flex align-items-center gap-2 border-bottom"
        style={{ borderColor: 'rgba(255,255,255,.1) !important' }}
      >
        <div
          className="d-flex align-items-center justify-content-center"
          style={{ width: 32, height: 32, borderRadius: 8, background: '#4ade80', flexShrink: 0 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#14532d">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20c8 0 6-8 14-8a4.38 4.38 0 010 .56A8 8 0 0017 8z"/>
          </svg>
        </div>
        <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.15rem', color: '#fff' }}>
          Valle<span style={{ color: '#4ade80' }}>Sol</span>
        </span>
      </div>
      <nav className="py-2 flex-grow-1">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link d-flex align-items-center gap-2${isActive ? ' active' : ''}`}
          >
            <Icon size={15} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-3" style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.3)', borderTop: '1px solid rgba(255,255,255,.08)' }}>
        ValleSol S.A.C. v1.0
      </div>
    </aside>
  )
}
