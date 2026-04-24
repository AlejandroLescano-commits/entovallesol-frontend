import { useState } from 'react'
import { useSitotroga, useCreateSitotroga, useNotasSitodroga, useCreateNotaSitodroga, useUnidadesSitodroga } from '@/hooks/useProduccion'
import toast from 'react-hot-toast'

const PAGE_SIZE = 15

function usePagination<T>(data: T[]) {
  const [page, setPage] = useState(1)
  const total = Math.ceil(data.length / PAGE_SIZE) || 1
  const slice = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  return { slice, page, total, setPage }
}

function Pagination({ page, total, setPage }: { page: number; total: number; setPage: (p: number) => void }) {
  if (total <= 1) return null
  return (
    <div className="d-flex align-items-center justify-content-between px-1 pt-3" style={{ borderTop: '1px solid #f3f4f6' }}>
      <span style={{ fontSize: '.78rem', color: '#9ca3af' }}>Página {page} de {total}</span>
      <div className="d-flex gap-1">
        <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: '.75rem', padding: '2px 10px' }} disabled={page === 1} onClick={() => setPage(page - 1)}>← Ant</button>
        {Array.from({ length: total }, (_, i) => i + 1)
          .filter(p => p === 1 || p === total || Math.abs(p - page) <= 1)
          .reduce<(number | '...')[]>((acc, p, i, arr) => {
            if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...')
            acc.push(p)
            return acc
          }, [])
          .map((p, i) =>
            p === '...'
              ? <span key={`e${i}`} style={{ padding: '0 4px', fontSize: '.75rem', color: '#9ca3af' }}>…</span>
              : <button key={p} className={`btn btn-sm ${page === p ? 'btn-success' : 'btn-outline-secondary'}`} style={{ fontSize: '.75rem', padding: '2px 8px', minWidth: 30 }} onClick={() => setPage(p as number)}>{p}</button>
          )}
        <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: '.75rem', padding: '2px 10px' }} disabled={page === total} onClick={() => setPage(page + 1)}>Sig →</button>
      </div>
    </div>
  )
}

export default function SitotrogaPage() {
  const { data: registros = [], isLoading } = useSitotroga()
  const { data: notas = [] } = useNotasSitodroga()
  const { data: unidades = [] } = useUnidadesSitodroga()
  const crear = useCreateSitotroga()
  const crearNota = useCreateNotaSitodroga()

  const [tab, setTab] = useState<'produccion' | 'notas'>('produccion')
  const [showModal, setShowModal] = useState(false)
  const [showNotaModal, setShowNotaModal] = useState(false)

  const [form, setForm] = useState({ fecha: '', id_unidad: '', cantidad: '' })
  const [notaForm, setNotaForm] = useState({
    fecha: '', tiposalida: 'T.exiguum', descripcion: '', id_unidad: '', factor: '1', cantidad: ''
  })

  const prodPag  = usePagination(registros)
  const notasPag = usePagination(notas)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fecha || !form.cantidad) return toast.error('Completa los campos requeridos')
    crear.mutate(
      { ...form, cantidad: Number(form.cantidad), id_unidad: form.id_unidad ? Number(form.id_unidad) : null },
      { onSuccess: () => { setShowModal(false); setForm({ fecha: '', id_unidad: '', cantidad: '' }) } }
    )
  }

  const handleNotaSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!notaForm.fecha || !notaForm.cantidad) return toast.error('Completa los campos requeridos')
    crearNota.mutate(
      { ...notaForm, cantidad: Number(notaForm.cantidad), factor: Number(notaForm.factor), id_unidad: notaForm.id_unidad ? Number(notaForm.id_unidad) : null },
      { onSuccess: () => { setShowNotaModal(false); setNotaForm({ fecha: '', tiposalida: 'T.exiguum', descripcion: '', id_unidad: '', factor: '1', cantidad: '' }) } }
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="vs-page-title mb-0">Sitotroga cerealella</h1>
          <p className="text-muted mb-0" style={{ fontSize: '.85rem' }}>Huevos — unidad: gramos</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn-vs btn" onClick={() => setShowNotaModal(true)}>+ Nota Salida</button>
          <button className="btn-vs btn" onClick={() => setShowModal(true)}>+ Producción</button>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className={`nav-link ${tab === 'produccion' ? 'active' : ''}`} onClick={() => { setTab('produccion'); prodPag.setPage(1) }}>
            Producción
            <span className="badge bg-secondary ms-2" style={{ fontSize: '.7rem' }}>{registros.length}</span>
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab === 'notas' ? 'active' : ''}`} onClick={() => { setTab('notas'); notasPag.setPage(1) }}>
            Notas de Salida
            <span className="badge bg-secondary ms-2" style={{ fontSize: '.7rem' }}>{notas.length}</span>
          </button>
        </li>
      </ul>

      {/* Tabla producción */}
      {tab === 'produccion' && (
        <div className="vs-card">
          {isLoading
            ? <div className="vs-spinner"><div className="spinner-border text-success" /></div>
            : <>
                <table className="table vs-table mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: 48 }}>#</th>
                      <th>Fecha</th>
                      <th>Cantidad (g)</th>
                      <th>Unidad</th>
                      <th>Activo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prodPag.slice.length === 0
                      ? <tr><td colSpan={5} className="text-center text-muted py-4">Sin registros</td></tr>
                      : prodPag.slice.map((r: any, index: number) => (
                          <tr key={r.id}>
                            <td style={{ color: '#9ca3af', fontSize: '.8rem' }}>
                              {(prodPag.page - 1) * PAGE_SIZE + index + 1}
                            </td>
                            <td>{r.fecha}</td>
                            <td>{r.cantidad}</td>
                            <td>{r.id_unidad ?? '—'}</td>
                            <td>
                              <span className={`badge ${r.activo ? 'bg-success' : 'bg-secondary'}`}>
                                {r.activo ? 'Sí' : 'No'}
                              </span>
                            </td>
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
                <Pagination page={prodPag.page} total={prodPag.total} setPage={prodPag.setPage} />
              </>
          }
        </div>
      )}

      {/* Tabla notas */}
      {tab === 'notas' && (
        <div className="vs-card">
          <table className="table vs-table mb-0">
            <thead>
              <tr>
                <th style={{ width: 48 }}>#</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Factor</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {notasPag.slice.length === 0
                ? <tr><td colSpan={6} className="text-center text-muted py-4">Sin notas</td></tr>
                : notasPag.slice.map((n: any, index: number) => (
                    <tr key={n.id}>
                      <td style={{ color: '#9ca3af', fontSize: '.8rem' }}>
                        {(notasPag.page - 1) * PAGE_SIZE + index + 1}
                      </td>
                      <td>{n.fecha}</td>
                      <td><span className="badge bg-primary">{n.tiposalida}</span></td>
                      <td>{n.cantidad}</td>
                      <td>{n.factor}</td>
                      <td>{n.descripcion ?? '—'}</td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
          <Pagination page={notasPag.page} total={notasPag.total} setPage={notasPag.setPage} />
        </div>
      )}

      {/* Modal producción */}
      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,.4)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nuevo registro — Sitotroga</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body d-flex flex-column gap-3">
                  <div>
                    <label className="form-label fw-semibold">Fecha *</label>
                    <input type="date" className="form-control" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="form-label fw-semibold">Cantidad (g) *</label>
                    <input type="number" step="0.01" className="form-control" value={form.cantidad} onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="form-label fw-semibold">Unidad de medida</label>
                    <select className="form-select" value={form.id_unidad} onChange={e => setForm(f => ({ ...f, id_unidad: e.target.value }))}>
                      <option value="">— Seleccionar —</option>
                      {unidades.map((u: any) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn-vs btn" disabled={crear.isPending}>
                    {crear.isPending ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal nota salida */}
      {showNotaModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,.4)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nota de Salida — Sitotroga</h5>
                <button className="btn-close" onClick={() => setShowNotaModal(false)} />
              </div>
              <form onSubmit={handleNotaSubmit}>
                <div className="modal-body d-flex flex-column gap-3">
                  <div>
                    <label className="form-label fw-semibold">Fecha *</label>
                    <input type="date" className="form-control" value={notaForm.fecha} onChange={e => setNotaForm(f => ({ ...f, fecha: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="form-label fw-semibold">Tipo de salida *</label>
                    <select className="form-select" value={notaForm.tiposalida} onChange={e => setNotaForm(f => ({ ...f, tiposalida: e.target.value }))}>
                      <option value="T.exiguum">T. exiguum</option>
                      <option value="T.pretiosum">T. pretiosum</option>
                      <option value="Infestación">Infestación</option>
                      <option value="Ventas">Ventas</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label fw-semibold">Cantidad (g) *</label>
                    <input type="number" step="0.01" className="form-control" value={notaForm.cantidad} onChange={e => setNotaForm(f => ({ ...f, cantidad: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="form-label fw-semibold">Factor</label>
                    <input type="number" step="0.01" className="form-control" value={notaForm.factor} onChange={e => setNotaForm(f => ({ ...f, factor: e.target.value }))} />
                  </div>
                  <div>
                    <label className="form-label fw-semibold">Descripción</label>
                    <textarea className="form-control" rows={2} value={notaForm.descripcion} onChange={e => setNotaForm(f => ({ ...f, descripcion: e.target.value }))} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowNotaModal(false)}>Cancelar</button>
                  <button type="submit" className="btn-vs btn" disabled={crearNota.isPending}>
                    {crearNota.isPending ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}