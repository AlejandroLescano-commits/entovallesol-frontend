import { useState } from 'react'
import {
  useTrichogramma, useCreateTrichogramma, useAnularTrichogramma,
  useNotasAvispitas, useCreateNotaAvispitas, useAnularNotaAvispitas,
  useUnidadesAvispas, useLugaresAvispitas,
} from '@/hooks/useProduccion'
import toast from 'react-hot-toast'

const PAGE_SIZE = 15

// ─── Constantes de validación ────────────────────────────────────────────────
const PLANCHAS_MAX    = 100_000
const CANTIDAD_MAX    = 10_000_000   // pulg²
const CANTIDAD_MIN    = 0.01
const DESCRIPCION_MAX = 500
const HOY = new Date().toISOString().split('T')[0]
const FECHA_MIN = new Date(new Date().setFullYear(new Date().getFullYear() - 5))
  .toISOString().split('T')[0]

// ─── Tipos ───────────────────────────────────────────────────────────────────
type ProdErrors = { fecha?: string; cantidad?: string }
type NotaErrors = { fecha?: string; cantidad?: string; descripcion?: string }

// ─── Validadores ─────────────────────────────────────────────────────────────
function validarFecha(v: string): string | undefined {
  if (!v) return 'La fecha es obligatoria.'
  if (v > HOY) return 'La fecha no puede ser futura.'
  if (v < FECHA_MIN) return `No puede ser anterior a ${FECHA_MIN}.`
}

function validarPlanchas(v: string): string | undefined {
  if (!v || v.trim() === '') return 'Las planchas son obligatorias.'
  const n = Number(v)
  if (isNaN(n)) return 'Debe ser un número válido.'
  if (n <= 0) return 'Debe ser mayor a 0.'
  if (n < CANTIDAD_MIN) return `Mínimo: ${CANTIDAD_MIN}.`
  if (n > PLANCHAS_MAX) return `Máximo: ${PLANCHAS_MAX.toLocaleString()} planchas.`
  if (!/^\d+(\.\d{1,2})?$/.test(v.trim())) return 'Máximo 2 decimales.'
}

function validarCantidadPulg(v: string): string | undefined {
  if (!v || v.trim() === '') return 'La cantidad es obligatoria.'
  const n = Number(v)
  if (isNaN(n)) return 'Debe ser un número válido.'
  if (n <= 0) return 'Debe ser mayor a 0.'
  if (n < CANTIDAD_MIN) return `Mínimo: ${CANTIDAD_MIN}.`
  if (n > CANTIDAD_MAX) return `Máximo: ${CANTIDAD_MAX.toLocaleString()} pulg².`
  if (!/^\d+(\.\d{1,2})?$/.test(v.trim())) return 'Máximo 2 decimales.'
}

function validarDescripcion(v: string): string | undefined {
  if (v.length > DESCRIPCION_MAX) return `Máximo ${DESCRIPCION_MAX} caracteres (actual: ${v.length}).`
}

function hasErrors(e: Record<string, string | undefined>) {
  return Object.values(e).some(Boolean)
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <div className="invalid-feedback d-block" style={{ fontSize: '.78rem' }}>{msg}</div>
}

// ─── Utilidades ───────────────────────────────────────────────────────────────
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
            acc.push(p); return acc
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
          <div className="modal-header border-0 pb-0"><h6 className="modal-title fw-bold text-danger">⚠ Confirmar anulación</h6></div>
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

const INIT_FORM = { fecha: '', id_unidad: '', cantidad: '' }
const INIT_NOTA = { fecha: '', tiposalida: 'Parasitacion', id_lugarliberacion: '', descripcion: '', id_unidad: '', cantidad: '' }

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

  const [form, setForm] = useState(INIT_FORM)
  const [formErrors, setFormErrors] = useState<ProdErrors>({})
  const [formTouched, setFormTouched] = useState<Partial<Record<keyof ProdErrors, boolean>>>({})

  const [notaForm, setNotaForm] = useState(INIT_NOTA)
  const [notaErrors, setNotaErrors] = useState<NotaErrors>({})
  const [notaTouched, setNotaTouched] = useState<Partial<Record<keyof NotaErrors, boolean>>>({})

  const prodPag  = usePagination(registros)
  const notasPag = usePagination(notas)
  const esParasitacion = notaForm.tiposalida === 'Parasitacion'

  // Conversión para preview
  const pulgProduccion = form.cantidad ? Number(form.cantidad) * 80 : null
  const pulgNota = esParasitacion && notaForm.cantidad ? Number(notaForm.cantidad) * 31 : null

  // ── Validadores ─────────────────────────────────────────────────────────
  const validateProd = (f: typeof form): ProdErrors => ({
    fecha: validarFecha(f.fecha),
    cantidad: validarPlanchas(f.cantidad),      // producción siempre en planchas
  })

  const validateNota = (f: typeof notaForm): NotaErrors => ({
    fecha: validarFecha(f.fecha),
    // Parasitacion → planchas; otros tipos → pulg²
    cantidad: f.tiposalida === 'Parasitacion'
      ? validarPlanchas(f.cantidad)
      : validarCantidadPulg(f.cantidad),
    descripcion: validarDescripcion(f.descripcion),
  })

  const setProdField = (key: keyof typeof form, value: string) => {
    const next = { ...form, [key]: value }
    setForm(next)
    if (formTouched[key as keyof ProdErrors]) setFormErrors(validateProd(next))
  }

  const setNotaField = (key: keyof typeof notaForm, value: string) => {
    const next = { ...notaForm, [key]: value }
    setNotaForm(next)
    if (notaTouched[key as keyof NotaErrors]) setNotaErrors(validateNota(next))
  }

  const touchProd = (field: keyof ProdErrors) => {
    setFormTouched(t => ({ ...t, [field]: true }))
    setFormErrors(validateProd(form))
  }

  const touchNota = (field: keyof NotaErrors) => {
    setNotaTouched(t => ({ ...t, [field]: true }))
    setNotaErrors(validateNota(notaForm))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormTouched({ fecha: true, cantidad: true })
    const errs = validateProd(form)
    setFormErrors(errs)
    if (hasErrors(errs)) { toast.error('Corrige los errores antes de guardar.'); return }
    crear.mutate(
      { ...form, cantidad: Number(form.cantidad) * 80, id_unidad: form.id_unidad ? Number(form.id_unidad) : null },
      { onSuccess: () => { setShowModal(false); setForm(INIT_FORM); setFormErrors({}); setFormTouched({}) } }
    )
  }

  const handleNotaSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setNotaTouched({ fecha: true, cantidad: true, descripcion: true })
    const errs = validateNota(notaForm)
    setNotaErrors(errs)
    if (hasErrors(errs)) { toast.error('Corrige los errores antes de guardar.'); return }
    const cantidadFinal = esParasitacion ? Number(notaForm.cantidad) * 31 : Number(notaForm.cantidad)
    crearNota.mutate(
      {
        ...notaForm,
        cantidad: cantidadFinal,
        id_unidad: notaForm.id_unidad ? Number(notaForm.id_unidad) : null,
        id_lugarliberacion: notaForm.id_lugarliberacion ? Number(notaForm.id_lugarliberacion) : null,
      },
      {
        onSuccess: () => {
          setShowNotaModal(false); setNotaForm(INIT_NOTA)
          setNotaErrors({}); setNotaTouched({})
        },
      }
    )
  }

  const cerrarProd = () => { setShowModal(false); setForm(INIT_FORM); setFormErrors({}); setFormTouched({}) }
  const cerrarNota = () => { setShowNotaModal(false); setNotaForm(INIT_NOTA); setNotaErrors({}); setNotaTouched({}) }

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

      {/* ── Modal Producción ─────────────────────────────────────────────── */}
      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,.4)' }}>
          <div className="modal-dialog"><div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Nuevo registro — Trichogramma</h5>
              <button className="btn-close" onClick={cerrarProd} />
            </div>
            <form onSubmit={handleSubmit} noValidate>
              <div className="modal-body d-flex flex-column gap-3">
                <div>
                  <label className="form-label fw-semibold">Fecha *</label>
                  <input
                    type="date" max={HOY} min={FECHA_MIN}
                    className={`form-control ${formTouched.fecha && formErrors.fecha ? 'is-invalid' : formTouched.fecha && !formErrors.fecha ? 'is-valid' : ''}`}
                    value={form.fecha}
                    onChange={e => setProdField('fecha', e.target.value)}
                    onBlur={() => touchProd('fecha')}
                  />
                  <FieldError msg={formTouched.fecha ? formErrors.fecha : undefined} />
                </div>
                <div>
                  <label className="form-label fw-semibold">Planchas *</label>
                  <input
                    type="number" step="0.01" min={CANTIDAD_MIN} max={PLANCHAS_MAX}
                    className={`form-control ${formTouched.cantidad && formErrors.cantidad ? 'is-invalid' : formTouched.cantidad && !formErrors.cantidad ? 'is-valid' : ''}`}
                    value={form.cantidad}
                    placeholder={`Nº de planchas (máx ${PLANCHAS_MAX.toLocaleString()})`}
                    onChange={e => setProdField('cantidad', e.target.value)}
                    onBlur={() => touchProd('cantidad')}
                  />
                  <FieldError msg={formTouched.cantidad ? formErrors.cantidad : undefined} />
                  {form.cantidad && !formErrors.cantidad && pulgProduccion !== null && (
                    <small className="text-muted mt-1 d-block">
                      = <strong>{pulgProduccion.toLocaleString('es-PE', { maximumFractionDigits: 2 })} pulg²</strong> guardados
                    </small>
                  )}
                </div>
                <div>
                  <label className="form-label fw-semibold">Unidad</label>
                  <select className="form-select" value={form.id_unidad} onChange={e => setProdField('id_unidad', e.target.value)}>
                    <option value="">— Seleccionar —</option>
                    {unidades.map((u: any) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={cerrarProd}>Cancelar</button>
                <button type="submit" className="btn-vs btn" disabled={crear.isPending}>{crear.isPending ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div></div>
        </div>
      )}

      {/* ── Modal Nota de Salida ─────────────────────────────────────────── */}
      {showNotaModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,.4)' }}>
          <div className="modal-dialog"><div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Nota de Salida — Trichogramma</h5>
              <button className="btn-close" onClick={cerrarNota} />
            </div>
            <form onSubmit={handleNotaSubmit} noValidate>
              <div className="modal-body d-flex flex-column gap-3">
                <div>
                  <label className="form-label fw-semibold">Fecha *</label>
                  <input
                    type="date" max={HOY} min={FECHA_MIN}
                    className={`form-control ${notaTouched.fecha && notaErrors.fecha ? 'is-invalid' : notaTouched.fecha && !notaErrors.fecha ? 'is-valid' : ''}`}
                    value={notaForm.fecha}
                    onChange={e => setNotaField('fecha', e.target.value)}
                    onBlur={() => touchNota('fecha')}
                  />
                  <FieldError msg={notaTouched.fecha ? notaErrors.fecha : undefined} />
                </div>
                <div>
                  <label className="form-label fw-semibold">Tipo de salida</label>
                  <select
                    className="form-select"
                    value={notaForm.tiposalida}
                    onChange={e => {
                      // limpiar cantidad al cambiar tipo para evitar confusión de unidades
                      const next = { ...notaForm, tiposalida: e.target.value, cantidad: '' }
                      setNotaForm(next)
                      setNotaTouched({})
                      setNotaErrors({})
                    }}
                  >
                    <option value="Parasitacion">Parasitación</option>
                    <option value="Liberacion">Liberación</option>
                    <option value="Ventas">Ventas</option>
                  </select>
                </div>
                <div>
                  <label className="form-label fw-semibold">Lugar de liberación</label>
                  <select className="form-select" value={notaForm.id_lugarliberacion} onChange={e => setNotaField('id_lugarliberacion', e.target.value)}>
                    <option value="">— Seleccionar —</option>
                    {lugares.map((l: any) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label fw-semibold">
                    {esParasitacion ? 'Planchas *' : 'Cantidad (pulg²) *'}
                  </label>
                  <input
                    type="number" step="0.01"
                    min={CANTIDAD_MIN}
                    max={esParasitacion ? PLANCHAS_MAX : CANTIDAD_MAX}
                    className={`form-control ${notaTouched.cantidad && notaErrors.cantidad ? 'is-invalid' : notaTouched.cantidad && !notaErrors.cantidad ? 'is-valid' : ''}`}
                    value={notaForm.cantidad}
                    placeholder={esParasitacion
                      ? `Nº de planchas (máx ${PLANCHAS_MAX.toLocaleString()})`
                      : `pulg² a descontar (máx ${CANTIDAD_MAX.toLocaleString()})`}
                    onChange={e => setNotaField('cantidad', e.target.value)}
                    onBlur={() => touchNota('cantidad')}
                  />
                  <FieldError msg={notaTouched.cantidad ? notaErrors.cantidad : undefined} />
                  {esParasitacion && notaForm.cantidad && !notaErrors.cantidad && pulgNota !== null && (
                    <small className="text-muted mt-1 d-block">
                      = <strong>{pulgNota.toLocaleString('es-PE', { maximumFractionDigits: 2 })} pulg²</strong> descontados
                    </small>
                  )}
                </div>
                <div>
                  <label className="form-label fw-semibold">
                    Descripción
                    <span className="text-muted fw-normal ms-1" style={{ fontSize: '.78rem' }}>
                      ({notaForm.descripcion.length}/{DESCRIPCION_MAX})
                    </span>
                  </label>
                  <textarea
                    className={`form-control ${notaTouched.descripcion && notaErrors.descripcion ? 'is-invalid' : ''}`}
                    rows={2} maxLength={DESCRIPCION_MAX}
                    placeholder="Observaciones opcionales..."
                    value={notaForm.descripcion}
                    onChange={e => setNotaField('descripcion', e.target.value)}
                    onBlur={() => touchNota('descripcion')}
                  />
                  <FieldError msg={notaTouched.descripcion ? notaErrors.descripcion : undefined} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={cerrarNota}>Cancelar</button>
                <button type="submit" className="btn-vs btn" disabled={crearNota.isPending}>{crearNota.isPending ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div></div>
        </div>
      )}
    </div>
  )
}
