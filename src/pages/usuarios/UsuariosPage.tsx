import { useState } from 'react'
import { useUsuarios, useCreateUsuario, useUpdateUsuario, useDeleteUsuario } from '@/hooks/useUsuarios'
import { useAuthStore } from '@/store/authStore'

/* ─── Types ───────────────────────────────────────────────────────────────── */
type RolKey = 'operario' | 'supervisor' | 'admin'

/* ─── Role config ─────────────────────────────────────────────────────────── */
const ROL_CONFIG: Record<RolKey, { label: string; bg: string; color: string; icon: string }> = {
  operario:   { label: 'Operario',   bg: 'var(--vs-neutral-soft)', color: 'var(--vs-text-muted)',  icon: '👷' },
  supervisor: { label: 'Supervisor', bg: 'var(--vs-warn-soft)',    color: 'var(--vs-warn)',         icon: '🔍' },
  admin:      { label: 'Admin',      bg: '#ede9fe',                color: '#7c3aed',                icon: '🛡' },
}

function RolBadge({ rol }: { rol: string }) {
  const c = ROL_CONFIG[rol as RolKey] ?? ROL_CONFIG.operario
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 10px', borderRadius: 20, fontSize: '.72rem', fontWeight: 600, background: c.bg, color: c.color }}>
      {c.icon} {c.label}
    </span>
  )
}

function EstadoBadge({ activo }: { activo: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 9px', borderRadius: 20, fontSize: '.72rem', fontWeight: 600, background: activo ? 'var(--vs-success-soft)' : 'var(--vs-neutral-soft)', color: activo ? 'var(--vs-success)' : 'var(--vs-text-muted)' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  )
}

/* ─── Avatar ──────────────────────────────────────────────────────────────── */
function Avatar({ nombre, rol }: { nombre: string; rol: string }) {
  const initials = nombre.trim().split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
  const colors: Record<RolKey, string> = {
    operario:   '#16a34a',
    supervisor: '#d97706',
    admin:      '#7c3aed',
  }
  const bg = colors[rol as RolKey] ?? '#16a34a'
  return (
    <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${bg}20`, border: `2px solid ${bg}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem', fontWeight: 700, color: bg, flexShrink: 0 }}>
      {initials || '?'}
    </div>
  )
}

/* ─── Confirm modal ───────────────────────────────────────────────────────── */
function ConfirmModal({ nombre, onConfirm, onCancel }: { nombre: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="vs-overlay">
      <div className="vs-dialog vs-dialog--sm">
        <div className="vs-dialog__head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--vs-danger-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🗑</span>
            <h6 style={{ margin: 0, fontWeight: 600, fontSize: '.92rem', color: 'var(--vs-danger)' }}>Eliminar usuario</h6>
          </div>
        </div>
        <div className="vs-dialog__body" style={{ fontSize: '.88rem', color: 'var(--vs-text-secondary)', lineHeight: 1.55 }}>
          ¿Seguro que deseas eliminar a <strong>{nombre}</strong>? Esta acción no se puede deshacer.
        </div>
        <div className="vs-dialog__foot">
          <button className="vs-btn vs-btn--ghost" onClick={onCancel}>Cancelar</button>
          <button className="vs-btn vs-btn--danger" onClick={onConfirm}>🗑 Eliminar</button>
        </div>
      </div>
    </div>
  )
}

/* ─── Main ────────────────────────────────────────────────────────────────── */
export default function UsuariosPage() {
  const { data: usuarios = [], isLoading } = useUsuarios()
  const crear     = useCreateUsuario()
  const actualizar = useUpdateUsuario()
  const eliminar  = useDeleteUsuario()
  const rol       = useAuthStore(s => s.user?.rol)

  const [showModal, setShowModal]   = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nombre: string } | null>(null)
  const [showPass, setShowPass]     = useState(false)
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'operario' })

  const resetForm = () => setForm({ nombre: '', email: '', password: '', rol: 'operario' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    crear.mutate(form, {
      onSuccess: () => { setShowModal(false); resetForm() },
    })
  }

  const totalActivos   = usuarios.filter((u: any) => u.activo).length
  const totalInactivos = usuarios.filter((u: any) => !u.activo).length
  const totalAdmins    = usuarios.filter((u: any) => u.rol === 'admin').length

  if (rol !== 'admin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 12, color: 'var(--vs-text-muted)' }}>
        <span style={{ fontSize: '2.5rem' }}>🔒</span>
        <p style={{ margin: 0, fontSize: '.95rem', fontWeight: 500 }}>Solo los administradores pueden gestionar usuarios.</p>
      </div>
    )
  }

  return (
    <>
      <style>{`
        :root {
          --vs-primary:      #16a34a;
          --vs-primary-soft: #dcfce7;
          --vs-success:      #15803d;
          --vs-success-soft: #dcfce7;
          --vs-danger:       #dc2626;
          --vs-danger-soft:  #fee2e2;
          --vs-warn:         #d97706;
          --vs-warn-soft:    #fef3c7;
          --vs-neutral-soft: #f3f4f6;
          --vs-border:       #e5e7eb;
          --vs-text-primary:   #111827;
          --vs-text-secondary: #374151;
          --vs-text-muted:     #9ca3af;
          --vs-bg-card:      #ffffff;
          --vs-bg-page:      #f9fafb;
        }
        .vs-overlay { position: fixed; inset: 0; z-index: 1050; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .vs-dialog { background: var(--vs-bg-card); border-radius: 14px; width: 100%; max-width: 480px; box-shadow: 0 20px 40px rgba(0,0,0,.18); overflow: hidden; }
        .vs-dialog--sm { max-width: 360px; }
        .vs-dialog__head { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--vs-border); }
        .vs-dialog__body { padding: 20px; }
        .vs-dialog__foot { display: flex; justify-content: flex-end; gap: 8px; padding: 14px 20px; border-top: 1px solid var(--vs-border); background: #fafafa; }
        .vs-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 16px; border-radius: 8px; font-size: .85rem; font-weight: 500; border: none; cursor: pointer; transition: opacity .15s, transform .1s; }
        .vs-btn:active { transform: scale(.97); }
        .vs-btn--primary { background: var(--vs-primary); color: #fff; }
        .vs-btn--primary:hover { opacity: .88; }
        .vs-btn--ghost { background: transparent; border: 1px solid var(--vs-border); color: var(--vs-text-secondary); }
        .vs-btn--ghost:hover { background: var(--vs-neutral-soft); }
        .vs-btn--danger { background: var(--vs-danger); color: #fff; }
        .vs-btn--danger:hover { opacity: .88; }
        .vs-btn--warn { background: var(--vs-warn); color: #fff; }
        .vs-btn--sm { padding: 4px 10px; font-size: .75rem; border-radius: 6px; }
        .vs-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }
        .vs-icon-btn { background: none; border: none; cursor: pointer; color: var(--vs-text-muted); font-size: 1rem; padding: 2px 4px; border-radius: 4px; line-height: 1; }
        .vs-icon-btn:hover { color: var(--vs-text-primary); background: var(--vs-neutral-soft); }
        .vs-card { background: var(--vs-bg-card); border: 1px solid var(--vs-border); border-radius: 12px; overflow: hidden; }
        .vs-metric-card { background: var(--vs-bg-card); border: 1px solid var(--vs-border); border-radius: 10px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; }
        .vs-table { width: 100%; border-collapse: collapse; font-size: .84rem; }
        .vs-table thead th { padding: 10px 14px; background: var(--vs-bg-page); font-size: .72rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: var(--vs-text-muted); border-bottom: 1px solid var(--vs-border); white-space: nowrap; }
        .vs-table tbody tr { border-bottom: 1px solid var(--vs-border); transition: background .1s; }
        .vs-table tbody tr:last-child { border-bottom: none; }
        .vs-table tbody tr:hover { background: #f9fafb; }
        .vs-table td { padding: 10px 14px; color: var(--vs-text-secondary); vertical-align: middle; }
        .vs-form-label { display: block; font-size: .8rem; font-weight: 600; color: var(--vs-text-secondary); margin-bottom: 5px; }
        .vs-input { width: 100%; padding: 8px 12px; font-size: .88rem; border: 1px solid var(--vs-border); border-radius: 8px; background: #fff; color: var(--vs-text-primary); transition: border-color .15s; box-sizing: border-box; }
        .vs-input:focus { outline: none; border-color: var(--vs-primary); box-shadow: 0 0 0 3px rgba(22,163,74,.1); }
        .vs-modal-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; max-height: 65vh; overflow-y: auto; }
        .vs-action-btn { padding: 4px 10px; border-radius: 6px; font-size: .75rem; font-weight: 500; border: 1px solid; cursor: pointer; transition: all .12s; display: inline-flex; align-items: center; gap: 4px; }
        .vs-action-btn:active { transform: scale(.96); }
        .vs-action-btn--activate { border-color: #86efac; background: transparent; color: var(--vs-success); }
        .vs-action-btn--activate:hover { background: var(--vs-success-soft); }
        .vs-action-btn--deactivate { border-color: #fcd34d; background: transparent; color: var(--vs-warn); }
        .vs-action-btn--deactivate:hover { background: var(--vs-warn-soft); }
        .vs-action-btn--delete { border-color: #fca5a5; background: transparent; color: var(--vs-danger); }
        .vs-action-btn--delete:hover { background: var(--vs-danger-soft); }
        .vs-spinner { display: flex; justify-content: center; padding: 48px 0; }
        .vs-pass-wrap { position: relative; }
        .vs-pass-wrap .vs-input { padding-right: 40px; }
        .vs-pass-toggle { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--vs-text-muted); font-size: .85rem; padding: 2px; }
        .vs-pass-toggle:hover { color: var(--vs-text-primary); }
        .vs-rol-selector { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .vs-rol-option { border: 1.5px solid var(--vs-border); border-radius: 8px; padding: 10px 8px; text-align: center; cursor: pointer; transition: all .15s; background: #fff; }
        .vs-rol-option:hover { border-color: var(--vs-primary); background: var(--vs-primary-soft); }
        .vs-rol-option.selected { border-color: var(--vs-primary); background: var(--vs-primary-soft); }
        .vs-rol-option.selected-supervisor { border-color: var(--vs-warn); background: var(--vs-warn-soft); }
        .vs-rol-option.selected-admin { border-color: #7c3aed; background: #ede9fe; }
        .vs-rol-option .rol-icon { font-size: 1.2rem; display: block; margin-bottom: 4px; }
        .vs-rol-option .rol-label { font-size: .75rem; font-weight: 600; color: var(--vs-text-secondary); }
      `}</style>

      {/* Confirm eliminar */}
      {deleteTarget && (
        <ConfirmModal
          nombre={deleteTarget.nombre}
          onConfirm={() => { eliminar.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) }) }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontWeight: 700, fontSize: '1.4rem', color: 'var(--vs-text-primary)' }}>
            👥 Usuarios
          </h1>
          <p style={{ margin: '3px 0 0', fontSize: '.83rem', color: 'var(--vs-text-muted)' }}>
            Gestión de accesos al sistema
          </p>
        </div>
        <button className="vs-btn vs-btn--primary" onClick={() => setShowModal(true)}>
          + Nuevo usuario
        </button>
      </div>

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { icon: '👥', label: 'Total usuarios',  value: usuarios.length,  color: '#16a34a' },
          { icon: '✅', label: 'Activos',          value: totalActivos,     color: '#15803d' },
          { icon: '⛔', label: 'Inactivos',        value: totalInactivos,   color: '#dc2626' },
          { icon: '🛡', label: 'Administradores',  value: totalAdmins,      color: '#7c3aed' },
        ].map(m => (
          <div key={m.label} className="vs-metric-card">
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${m.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{m.icon}</div>
            <div>
              <div style={{ fontSize: '.72rem', color: 'var(--vs-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.04em' }}>{m.label}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--vs-text-primary)', lineHeight: 1.2 }}>{m.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="vs-card">
        {isLoading
          ? <div className="vs-spinner"><div className="spinner-border text-success" /></div>
          : (
            <table className="vs-table">
              <thead>
                <tr>
                  <th style={{ width: 44 }}>#</th>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right', paddingRight: 16 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '48px 0', color: 'var(--vs-text-muted)' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>👤</div>
                        <div style={{ fontSize: '.85rem' }}>Aún no hay usuarios registrados</div>
                      </td>
                    </tr>
                  )
                  : usuarios.map((u: any, i: number) => (
                    <tr key={u.id}>
                      <td style={{ color: 'var(--vs-text-muted)', fontSize: '.78rem' }}>{i + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar nombre={u.nombre} rol={u.rol} />
                          <span style={{ fontWeight: 500, color: 'var(--vs-text-primary)' }}>{u.nombre}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--vs-text-muted)', fontSize: '.82rem' }}>{u.email}</td>
                      <td><RolBadge rol={u.rol} /></td>
                      <td><EstadoBadge activo={u.activo} /></td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                          <button
                            className={`vs-action-btn ${u.activo ? 'vs-action-btn--deactivate' : 'vs-action-btn--activate'}`}
                            disabled={actualizar.isPending}
                            onClick={() => actualizar.mutate({ id: u.id, data: { activo: !u.activo } })}
                          >
                            {u.activo ? '⏸ Desactivar' : '▶ Activar'}
                          </button>
                          <button
                            className="vs-action-btn vs-action-btn--delete"
                            onClick={() => setDeleteTarget({ id: u.id, nombre: u.nombre })}
                          >
                            🗑 Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          )
        }
      </div>

      {/* Modal: Nuevo usuario */}
      {showModal && (
        <div className="vs-overlay">
          <div className="vs-dialog">
            <div className="vs-dialog__head">
              <h5 style={{ margin: 0, fontWeight: 600, fontSize: '.95rem' }}>👤 Nuevo usuario</h5>
              <button className="vs-icon-btn" onClick={() => { setShowModal(false); resetForm() }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="vs-modal-body">

                <div>
                  <label className="vs-form-label">Nombre completo *</label>
                  <input
                    className="vs-input"
                    placeholder="Ej. Juan Pérez"
                    value={form.nombre}
                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="vs-form-label">Correo electrónico *</label>
                  <input
                    type="email"
                    className="vs-input"
                    placeholder="correo@ejemplo.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="vs-form-label">Contraseña *</label>
                  <div className="vs-pass-wrap">
                    <input
                      type={showPass ? 'text' : 'password'}
                      className="vs-input"
                      placeholder="Mínimo 6 caracteres"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      required
                    />
                    <button type="button" className="vs-pass-toggle" onClick={() => setShowPass(v => !v)}>
                      {showPass ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="vs-form-label">Rol *</label>
                  <div className="vs-rol-selector">
                    {(Object.entries(ROL_CONFIG) as [RolKey, typeof ROL_CONFIG[RolKey]][]).map(([key, cfg]) => {
                      const isSelected = form.rol === key
                      const selectedClass = isSelected
                        ? key === 'supervisor' ? 'selected-supervisor'
                        : key === 'admin' ? 'selected-admin'
                        : 'selected'
                        : ''
                      return (
                        <button
                          key={key}
                          type="button"
                          className={`vs-rol-option ${selectedClass}`}
                          onClick={() => setForm(f => ({ ...f, rol: key }))}
                        >
                          <span className="rol-icon">{cfg.icon}</span>
                          <span className="rol-label">{cfg.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

              </div>
              <div className="vs-dialog__foot">
                <button type="button" className="vs-btn vs-btn--ghost" onClick={() => { setShowModal(false); resetForm() }}>
                  Cancelar
                </button>
                <button type="submit" className="vs-btn vs-btn--primary" disabled={crear.isPending}>
                  {crear.isPending ? '⏳ Creando...' : '✓ Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
