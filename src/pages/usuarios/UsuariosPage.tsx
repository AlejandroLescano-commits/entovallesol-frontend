import { useState } from 'react'
import { useUsuarios, useCreateUsuario, useUpdateUsuario, useDeleteUsuario } from '@/hooks/useUsuarios'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export default function UsuariosPage() {
  const { data: usuarios = [], isLoading } = useUsuarios()
  const crear = useCreateUsuario()
  const actualizar = useUpdateUsuario()
  const eliminar = useDeleteUsuario()
  const rol = useAuthStore(s => s.user?.rol)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'operario' })

  if (rol !== 'admin') return <div className="vs-card text-center text-muted py-5">Solo administradores pueden gestionar usuarios.</div>

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    crear.mutate(form, { onSuccess: () => { setShowModal(false); setForm({ nombre: '', email: '', password: '', rol: 'operario' }) } })
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="vs-page-title mb-0">Usuarios</h1>
          <p className="text-muted mb-0" style={{ fontSize: '.85rem' }}>Gestión de accesos al sistema</p>
        </div>
        <button className="btn-vs btn" onClick={() => setShowModal(true)}>+ Nuevo usuario</button>
      </div>

      <div className="vs-card">
        {isLoading ? <div className="vs-spinner"><div className="spinner-border text-success" /></div> : (
          <table className="table vs-table mb-0">
            <thead><tr><th>#</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {usuarios.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-4">Sin usuarios</td></tr>}
              {usuarios.map((u: any) => (
                <tr key={u.id}>
                  <td>{u.id}</td><td>{u.nombre}</td><td>{u.email}</td>
                  <td><span className="badge bg-secondary">{u.rol}</span></td>
                  <td><span className={`badge ${u.activo ? 'bg-success' : 'bg-danger'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span></td>
                  <td>
                    <button className="btn btn-sm btn-outline-warning me-1"
                      onClick={() => actualizar.mutate({ id: u.id, data: { activo: !u.activo } })}>
                      {u.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <button className="btn btn-sm btn-outline-danger"
                      onClick={() => { if (confirm('¿Eliminar usuario?')) eliminar.mutate(u.id) }}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,.4)' }}>
          <div className="modal-dialog"><div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Nuevo usuario</h5>
              <button className="btn-close" onClick={() => setShowModal(false)} />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body d-flex flex-column gap-3">
                <div><label className="form-label fw-semibold">Nombre *</label>
                  <input className="form-control" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required /></div>
                <div><label className="form-label fw-semibold">Email *</label>
                  <input type="email" className="form-control" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required /></div>
                <div><label className="form-label fw-semibold">Contraseña *</label>
                  <input type="password" className="form-control" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required /></div>
                <div><label className="form-label fw-semibold">Rol</label>
                  <select className="form-select" value={form.rol} onChange={e => setForm(f => ({ ...f, rol: e.target.value }))}>
                    <option value="operario">Operario</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Admin</option>
                  </select></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-vs btn" disabled={crear.isPending}>{crear.isPending ? 'Creando...' : 'Crear'}</button>
              </div>
            </form>
          </div></div>
        </div>
      )}
    </div>
  )
}