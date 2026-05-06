import { useState } from 'react'
import {
  useTrichogramma, useCreateTrichogramma, useAnularTrichogramma,
  useNotasAvispitas, useCreateNotaAvispitas, useAnularNotaAvispitas,
  useUnidadesAvispas, useLugaresAvispitas,
} from '@/hooks/useProduccion'
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

function ConfirmModal({ mensaje, onConfirm, onCancel }: { mensaje: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,.45)' }}>
      <div className="modal-dialog modal-sm modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header border-0 pb-0">
            <h6 className="modal-title fw-bold text-danger">⚠ Confirmar anulación</h6>
          </div>
          <div className="modal-body pt-2" style={{ fontSize: '.88rem' }}>{mensaje}</div>
          <div className="modal-footer border-0 pt-0 gap-2">
            <button className="btn btn-sm btn-secondary" onClick={onCancel}>Cancelar</button>
            <button className="btn btn-sm btn-danger" onClick={onConfirm}>Anular</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailModal({ title, fields, onClose }: { title: string; fields: { label: string; value: any }[]; onClose: () => void }) {
  return (
    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,.45)' }} onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header" style={{ borderBottom: '2px solid #e5e7eb' }}>
            <h5 className="modal-title fw-bold" style={{ fontSize: '.95rem' }}>🔍 {title}</h5>
            <button className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body" style={{ padding: '1.25rem 1.5rem' }}>
            <dl className="row mb-0" style={{ rowGap: '.4rem' }}>
              {fields.map(({ label, value }) => (
                <>
                  <dt key={`dt-${label}`} className="col-sm-5 mb-0" style={{ fontSize: '.8rem', color: '#6b7280', fontWeight: 500 }}>{label}</dt>
                  <dd key={`dd-${label}`} className="col-sm-7 mb-0" style={{ fontSize: '.88rem', color: value != null && value !== '' ? '#111827' : '#9ca3af' }}>
                    {value != null && value !== '' ? value : '—'}
                  </dd>
                </>
              ))}
            </dl>
          </div>
          <div className="modal-footer" style={{ borderTop: '1px solid #f3f4f6' }}>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

const fmt = (v: string | null | undefined) =>
  v ? new Date(v).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' }) : null

export default function TrichogrammaPage() {
  const { data: registros = [], isLoading } = useTrichogramma()
  const { data: notas = [] } = useNotasAvispitas()
  const { data: unidades = [] } = useUnidadesAvispas()
  const { data: lugares = [] } = useLugaresAvispitas()
  const crear = useCreateTrichogramma()
  const crearNota = useCreateNotaAvispitas()
  const anular = useAnularTrichogramma()
  const anularNota = useAnularNotaAvispitas()

  const [tab, setTab] = useState<'produccion' | 'notas'>('produccion')
  const [showModal, setShowModal] = useState(false)
  const [showNotaModal, setShowNotaModal] = useState(false)
  const [confirm, setConfirm] = useState<{ id: number; tipo: 'produccion' | 'nota' } | null>(null)
  const [detail, setDetail] = useState<{ data: any; tipo: 'produccion' | 'nota' } | null>(null)

  const [form, setForm] = useState({ fecha: '', id_unidad: '', cantidad: '' })
  const [notaForm, setNotaForm] = useState({ fecha: '', tiposalida: 'Parasitacion', id_lugarliberacion: '', descripcion: '', id_unidad: '', cantidad: '' })

  const prodPag  = usePagination(registros)
  const notasPag = usePagination(notas)
  const esParasitacion = notaForm.tiposalida === 'Parasitacion'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fecha || !form.cantidad) return toast.error('Completa los campos requeridos')
    crear.mutate(
      { ...form, cantidad: Number(form.cantidad) * 80, id_unidad: form.id_unidad ? Number(form.id_unidad) : null },
      { onSuccess: () => { setShowModal(false); setForm({ fecha: '', id_unidad: '', cantidad: '' }) } }
    )
  }

  const handleNotaSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!notaForm.fecha || !notaForm.cantidad) return toast.error('Completa los campos requeridos')
    const cantidadFinal = esParasitacion ? Number(notaForm.cantidad) * 31 : Number(notaForm.cantidad)
    crearNota.mutate(
      { ...notaForm, cantidad: cantidadFinal, id_unidad: notaForm.id_unidad ? Number(notaForm.id_unidad) : null, id_lugarliberacion: notaForm.id_lugarliberacion ? Number(notaForm.id_lugarliberacion) : null },
      { onSuccess: () => { setShowNotaModal(false); setNotaForm({ fecha: '', tiposalida: 'Parasitacion', id_lugarliberacion: '', descripcion: '', id_unidad: '', cantidad: '' }) } }
    )
  }

  const ejecutarAnulacion = () => {
    if (!confirm) return
    if (confirm.tipo === 'produccion') anular.mutate(confirm.id, { onSettled: () => setConfirm(null) })
    else anularNota.mutate(confirm.id, { onSettled: () => setConfirm(null) })
  }

  const detailFields = detail
    ? detail.tipo === 'produccion'
      ? [
          { label: 'ID', value: detail.data.id },
          { label: 'Fecha', value: detail.data.fecha },
          { label: 'Cantidad (pulg²)', value: Number(detail.data.cantidad).toLocaleString('es-PE', { maximumFractionDigits: 2 }) },
          { label: 'Nota origen ID', value: detail.data.nota_origen_id },
          { label: 'Estado', value: detail.data.activo ? '✅ Activo' : '❌ Anulado' },
          { label: 'Registrado por', value: detail.data.registrado_por },
          { label: 'Creado en', value: fmt(detail.data.creado_en) },
          { label: 'Anulado por', value: detail.data.anulado_por },
          { label: 'Anulado en', value: fmt(detail.data.anulado_en) },
        ]
      : [
          { label: 'ID', value: detail.data.id },
          { label: 'Fecha', value: detail.data.fecha },
          { label: 'Tipo de salida', value: detail.data.tiposalida },
          { label: 'Lugar liberación', value: lugares.find((l: any) => l.id === detail.data.id_lugarliberacion)?.nombre },
          { label: 'Cantidad (pulg²)', value: Number(detail.data.cantidad).toLocaleString('es-PE', { maximumFractionDigits: 2 }) },
          { label: 'Descripción', value: detail.data.descripcion },
          { label: 'Estado', value: detail.data.activo ? '✅ Activo' : '❌ Anulado' },
          { label: 'Registrado por', value: detail.data.registrado_por },
          { label: 'Creado en', value: fmt(detail.data.creado_en) },
          { label: 'Anulado por', value: detail.data.anulado_por },
          { label: 'Anulado en', value: fmt(detail.data.anulado_en) },
        ]
    : []

  return (
    <div>
      {confirm && (
        <ConfirmModal
          mensaje={confirm.tipo === 'produccion' ? 'Se anulará este registro de producción de Trichogramma.' : 'Se anulará esta nota de salida de avispitas.'}
          onConfirm={ejecutarAnulacion}
          onCancel={() => setConfirm(null)}
        />
      )}
      {detail && (
        <DetailModal
          title={detail.tipo === 'produccion' ? 'Detalle — Producción Trichogramma' : 'Detalle — Nota de Salida Trichogramma'}
          fields={detailFields}
          onClose={() => setDetail(null)}
        />
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="vs-page-title mb-0">Trichogramma</h1>
          <p className="text-muted mb-0" style={{ fontSize: '.85rem' }}>Avispitas — unidad: pulgadas²</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn-vs btn" onClick={() => setShowNotaModal(true)}>+ Nota Salida</button>
          <button className="btn-vs btn" onClick={() => setShowModal(true)}>+ Producción</button>
        </div>
      </div>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className={`nav-link ${tab === 'produccion' ? 'active' : ''}`} onClick={() => { setTab('produccion'); prodPag.setPage(1) }}>
            Producción <span className="badge bg-secondary ms-2" style={{ fontSize: '.7rem' }}>{registros.length}</span>
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab === 'notas' ? 'active' : ''}`} onClick={() => { setTab('notas'); notasPag.setPage(1) }}>
            Notas de Salida <span className="badge bg-secondary ms-2" style={{ fontSize: '.7rem' }}>{notas.length}</span>
          </button>
        </li>
      </ul>

      {tab === 'produccion' && (
        <div className="vs-card">
          {isLoading
            ? <div className="vs-spinner"><div className="spinner-border text-success" /></div>
            : <>
                <table className="table vs-table mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: 48 }}>#</th><th>Fecha</th><th>Cantidad (pulg²)</th><th>Activo</th>
                      <th style={{ width: 110 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {prodPag.slice.length === 0
                      ? <tr><td colSpan={5} className="text-center text-muted py-4">Sin registros</td></tr>
                      : prodPag.slice.map((r: any, index: number) => (
                          <tr key={r.id}>
                            <td style={{ color: '#9ca3af', fontSize: '.8rem' }}>{(prodPag.page - 1) * PAGE_SIZE + index + 1}</td>
                            <td>{r.fecha}</td>
                            <td>{Number(r.cantidad).toLocaleString('es-PE', { maximumFractionDigits: 2 })}</td>
                            <td><span className={`badge ${r.activo ? 'bg-success' : 'bg-secondary'}`}>{r.activo ? 'Sí' : 'No'}</span></td>
                            <td className="d-flex gap-1">
                              <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: '.72rem', padding: '2px 7px' }} title="Ver detalle" onClick={() => setDetail({ data: r, tipo: 'produccion' })}>👁</button>
                              {r.activo && (
                                <button className="btn btn-sm btn-outline-danger" style={{ fontSize: '.72rem', padding: '2px 8px' }} disabled={anular.isPending}
                                  onClick={() => setConfirm({ id: r.id, tipo: 'produccion' })}>Anular</button>
                              )}
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

      {tab === 'notas' && (
        <div className="vs-card">
          <table className="table vs-table mb-0">
            <thead>
              <tr>
                <th style={{ width: 48 }}>#</th><th>Fecha</th><th>Tipo</th><th>Lugar</th><th>Cantidad (pulg²)</th><th>Descripción</th><th>Activo</th>
                <th style={{ width: 110 }}></th>
              </tr>
            </thead>
            <tbody>
              {notasPag.slice.length === 0
                ? <tr><td colSpan={8} className="text-center text-muted py-4">Sin notas</td></tr>
                : notasPag.slice.map((n: any, index: number) => (
                    <tr key={n.id}>
                      <td style={{ color: '#9ca3af', fontSize: '.8rem' }}>{(notasPag.page - 1) * PAGE_SIZE + index + 1}</td>
                      <td>{n.fecha}</td>
                      <td><span className="badge bg-primary">{n.tiposalida}</span></td>
                      <td>{lugares.find((l: any) => l.id === n.id_lugarliberacion)?.nombre ?? '—'}</td>
                      <td>{Number(n.cantidad).toLocaleString('es-PE', { maximumFractionDigits: 2 })}</td>
                      <td>{n.descripcion ?? '—'}</td>
                      <td><span className={`badge ${n.activo ? 'bg-success' : 'bg-secondary'}`}>{n.activo ? 'Sí' : 'No'}</span></td>
                      <td className="d-flex gap-1">
                        <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: '.72rem', padding: '2px 7px' }} title="Ver detalle" onClick={() => setDetail({ data: n, tipo: 'nota' })}>👁</button>
                        {n.activo && (
                          <button className="btn btn-sm btn-outline-danger" style={{ fontSize: '.72rem', padding: '2px 8px' }} disabled={anularNota.isPending}
                            onClick={() => setConfirm({ id: n.id, tipo: 'nota' })}>Anular</button>
                        )}
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
          <Pagination page={notasPag.page} total={notasPag.total} setPage={notasPag.setPage} />
        </div>
      )}

      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,.4)' }}>
          <div className="modal-dialog"><div className="modal-content">
            <div className="modal-header"><h5 className="modal-title">Nuevo registro — Trichogramma</h5><button className="btn-close" onClick={() => setShowModal(false)} /></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body d-flex flex-column gap-3">
                <div><label className="form-label fw-semibold">Fecha *</label><input type="date" className="form-control" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} required /></div>
                <div>
                  <label className="form-label fw-semibold">Planchas *</label>
                  <input type="number" step="0.01" className="form-control" value={form.cantidad} onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))} required />
                  {form.cantidad && <small className="text-muted mt-1 d-block">= <strong>{(Number(form.cantidad) * 80).toLocaleString('es-PE', { maximumFractionDigits: 2 })} pulg²</strong> guardados</small>}
                </div>
                <div><label className="form-label fw-semibold">Unidad</label>
                  <select className="form-select" value={form.id_unidad} onChange={e => setForm(f => ({ ...f, id_unidad: e.target.value }))}>
                    <option value="">— Seleccionar —</option>{unidades.map((u: any) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                  </select></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-vs btn" disabled={crear.isPending}>{crear.isPending ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div></div>
        </div>
      )}

      {showNotaModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,.4)' }}>
          <div className="modal-dialog"><div className="modal-content">
            <div className="modal-header"><h5 className="modal-title">Nota de Salida — Trichogramma</h5><button className="btn-close" onClick={() => setShowNotaModal(false)} /></div>
            <form onSubmit={handleNotaSubmit}>
              <div className="modal-body d-flex flex-column gap-3">
                <div><label className="form-label fw-semibold">Fecha *</label><input type="date" className="form-control" value={notaForm.fecha} onChange={e => setNotaForm(f => ({ ...f, fecha: e.target.value }))} required /></div>
                <div><label className="form-label fw-semibold">Tipo de salida</label>
                  <select className="form-select" value={notaForm.tiposalida} onChange={e => setNotaForm(f => ({ ...f, tiposalida: e.target.value, cantidad: '' }))}>
                    <option value="Parasitacion">Parasitación</option><option value="Liberacion">Liberación</option><option value="Ventas">Ventas</option>
                  </select></div>
                <div><label className="form-label fw-semibold">Lugar de liberación</label>
                  <select className="form-select" value={notaForm.id_lugarliberacion} onChange={e => setNotaForm(f => ({ ...f, id_lugarliberacion: e.target.value }))}>
                    <option value="">— Seleccionar —</option>{lugares.map((l: any) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                  </select></div>
                <div>
                  <label className="form-label fw-semibold">{esParasitacion ? 'Planchas *' : 'Cantidad (pulg²) *'}</label>
                  <input type="number" step="0.01" className="form-control" value={notaForm.cantidad} onChange={e => setNotaForm(f => ({ ...f, cantidad: e.target.value }))} required />
                  {esParasitacion && notaForm.cantidad && <small className="text-muted mt-1 d-block">= <strong>{(Number(notaForm.cantidad) * 31).toLocaleString('es-PE', { maximumFractionDigits: 2 })} pulg²</strong> descontados</small>}
                </div>
                <div><label className="form-label fw-semibold">Descripción</label><textarea className="form-control" rows={2} value={notaForm.descripcion} onChange={e => setNotaForm(f => ({ ...f, descripcion: e.target.value }))} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNotaModal(false)}>Cancelar</button>
                <button type="submit" className="btn-vs btn" disabled={crearNota.isPending}>{crearNota.isPending ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div></div>
        </div>
      )}
    </div>
  )
}
