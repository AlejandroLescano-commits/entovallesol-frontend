import { useState } from 'react'
import { useGalleria, useCreateGalleria, useAnularGalleria, useNotasGalleria, useCreateNotaGalleria, useAnularNotaGalleria, useUnidadesGalleria } from '@/hooks/useProduccion'
import toast from 'react-hot-toast'

const PAGE_SIZE = 15

// ─── Constantes de validación ───────────────────────────────────────────────
const CANTIDAD_MAX = 10_000_000
const CANTIDAD_MIN = 0.01
const RATIO_MIN = 0.01
const RATIO_MAX = 1000
const DESCRIPCION_MAX = 500
const HOY = new Date().toISOString().split('T')[0]
// Fecha mínima razonable (ej: 5 años atrás)
const FECHA_MIN = new Date(new Date().setFullYear(new Date().getFullYear() - 5))
  .toISOString().split('T')[0]

// ─── Tipos de errores ────────────────────────────────────────────────────────
type ProduccionErrors = {
  fecha?: string
  cantidad?: string
  id_unidad?: string
}

type NotaErrors = {
  fecha?: string
  tiposalida?: string
  cantidad?: string
  ratio?: string
  descripcion?: string
}

// ─── Validadores ─────────────────────────────────────────────────────────────
function validarFecha(fecha: string): string | undefined {
  if (!fecha) return 'La fecha es obligatoria.'
  if (fecha > HOY) return 'La fecha no puede ser futura.'
  if (fecha < FECHA_MIN) return `La fecha no puede ser anterior a ${FECHA_MIN}.`
  return undefined
}

function validarCantidad(valor: string): string | undefined {
  if (!valor || valor.trim() === '') return 'La cantidad es obligatoria.'
  const n = Number(valor)
  if (isNaN(n)) return 'Debe ser un número válido.'
  if (n <= 0) return 'La cantidad debe ser mayor a 0.'
  if (n < CANTIDAD_MIN) return `Mínimo permitido: ${CANTIDAD_MIN}.`
  if (n > CANTIDAD_MAX) return `Máximo permitido: ${CANTIDAD_MAX.toLocaleString()}.`
  if (!/^\d+(\.\d{1,2})?$/.test(valor.trim())) return 'Máximo 2 decimales.'
  return undefined
}

function validarRatio(valor: string, requerido: boolean): string | undefined {
  if (!valor || valor.trim() === '') {
    return requerido ? 'El ratio es obligatorio para Paratheresia.' : undefined
  }
  const n = Number(valor)
  if (isNaN(n)) return 'Debe ser un número válido.'
  if (n <= 0) return 'El ratio debe ser mayor a 0.'
  if (n < RATIO_MIN) return `Mínimo permitido: ${RATIO_MIN}.`
  if (n > RATIO_MAX) return `Máximo permitido: ${RATIO_MAX}.`
  if (!/^\d+(\.\d{1,2})?$/.test(valor.trim())) return 'Máximo 2 decimales.'
  return undefined
}

function validarDescripcion(valor: string): string | undefined {
  if (valor.length > DESCRIPCION_MAX)
    return `Máximo ${DESCRIPCION_MAX} caracteres (actual: ${valor.length}).`
  return undefined
}

function validarProduccionForm(form: { fecha: string; cantidad: string; id_unidad: string }): ProduccionErrors {
  return {
    fecha: validarFecha(form.fecha),
    cantidad: validarCantidad(form.cantidad),
  }
}

function validarNotaForm(
  form: { fecha: string; tiposalida: string; cantidad: string; ratio: string; descripcion: string },
  ratioCustom: boolean
): NotaErrors {
  const ratioRequerido = form.tiposalida === 'Paratheresia'
  return {
    fecha: validarFecha(form.fecha),
    cantidad: validarCantidad(form.cantidad),
    ratio: ratioRequerido ? validarRatio(form.ratio, true) : undefined,
    descripcion: validarDescripcion(form.descripcion),
  }
}

function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean)
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
  const fmt = (v: string | null | undefined) =>
    v ? new Date(v).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' }) : null
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

// ─── Componente de campo con error ───────────────────────────────────────────
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <div className="invalid-feedback d-block" style={{ fontSize: '.78rem' }}>{msg}</div>
}

const fmt = (v: string | null | undefined) =>
  v ? new Date(v).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' }) : null

// ─── Estado inicial de formularios ───────────────────────────────────────────
const INIT_FORM = { fecha: '', id_unidad: '', cantidad: '' }
const INIT_NOTA = { fecha: '', tiposalida: 'Paratheresia', descripcion: '', id_unidad: '', cantidad: '', ratio: '' }

// ─── Página principal ─────────────────────────────────────────────────────────
export default function GalleriaPage() {
  const { data: registros = [], isLoading } = useGalleria()
  const { data: notas = [] } = useNotasGalleria()
  const { data: unidades = [] } = useUnidadesGalleria()
  const crear = useCreateGalleria()
  const crearNota = useCreateNotaGalleria()
  const anular = useAnularGalleria()
  const anularNota = useAnularNotaGalleria()

  const [tab, setTab] = useState<'produccion' | 'notas'>('produccion')
  const [showModal, setShowModal] = useState(false)
  const [showNotaModal, setShowNotaModal] = useState(false)
  const [confirm, setConfirm] = useState<{ id: number; tipo: 'produccion' | 'nota'; mensaje: string } | null>(null)
  const [detail, setDetail] = useState<{ data: any; tipo: 'produccion' | 'nota' } | null>(null)

  // Formulario producción
  const [form, setForm] = useState(INIT_FORM)
  const [formErrors, setFormErrors] = useState<ProduccionErrors>({})
  const [formTouched, setFormTouched] = useState<Partial<Record<keyof ProduccionErrors, boolean>>>({})

  // Formulario nota
  const [notaForm, setNotaForm] = useState(INIT_NOTA)
  const [notaErrors, setNotaErrors] = useState<NotaErrors>({})
  const [notaTouched, setNotaTouched] = useState<Partial<Record<keyof NotaErrors, boolean>>>({})
  const [ratioCustom, setRatioCustom] = useState(false)

  const prodPag = usePagination(registros)
  const notasPag = usePagination(notas)

  // ── Helpers para actualizar campo y validar on-blur ──────────────────────
  const touchProd = (field: keyof ProduccionErrors) => {
    setFormTouched(t => ({ ...t, [field]: true }))
    const errs = validarProduccionForm(form)
    setFormErrors(errs)
  }

  const touchNota = (field: keyof NotaErrors) => {
    setNotaTouched(t => ({ ...t, [field]: true }))
    const errs = validarNotaForm(notaForm, ratioCustom)
    setNotaErrors(errs)
  }

  // Validar en tiempo real cuando el campo ya fue tocado
  const setProdField = (key: keyof typeof form, value: string) => {
    const newForm = { ...form, [key]: value }
    setForm(newForm)
    if (formTouched[key as keyof ProduccionErrors]) {
      setFormErrors(validarProduccionForm(newForm))
    }
  }

  const setNotaField = (key: keyof typeof notaForm, value: string) => {
    const newForm = { ...notaForm, [key]: value }
    setNotaForm(newForm)
    if (notaTouched[key as keyof NotaErrors]) {
      setNotaErrors(validarNotaForm(newForm, ratioCustom))
    }
  }

  // ── Submit producción ────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Marcar todos como tocados
    setFormTouched({ fecha: true, cantidad: true, id_unidad: true })
    const errs = validarProduccionForm(form)
    setFormErrors(errs)
    if (hasErrors(errs)) {
      toast.error('Corrige los errores antes de guardar.')
      return
    }
    crear.mutate(
      { ...form, cantidad: Number(form.cantidad), id_unidad: form.id_unidad ? Number(form.id_unidad) : null },
      {
        onSuccess: () => {
          setShowModal(false)
          setForm(INIT_FORM)
          setFormErrors({})
          setFormTouched({})
        },
      }
    )
  }

  // ── Submit nota ──────────────────────────────────────────────────────────
  const handleNotaSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setNotaTouched({ fecha: true, cantidad: true, ratio: true, descripcion: true })
    const errs = validarNotaForm(notaForm, ratioCustom)
    setNotaErrors(errs)
    if (hasErrors(errs)) {
      toast.error('Corrige los errores antes de guardar.')
      return
    }
    crearNota.mutate(
      {
        ...notaForm,
        cantidad: Number(notaForm.cantidad),
        ratio: notaForm.ratio ? Number(notaForm.ratio) : null,
        id_unidad: notaForm.id_unidad ? Number(notaForm.id_unidad) : null,
      },
      {
        onSuccess: () => {
          setShowNotaModal(false)
          setNotaForm(INIT_NOTA)
          setNotaErrors({})
          setNotaTouched({})
          setRatioCustom(false)
        },
      }
    )
  }

  const cerrarNota = () => {
    setShowNotaModal(false)
    setNotaForm(INIT_NOTA)
    setNotaErrors({})
    setNotaTouched({})
    setRatioCustom(false)
  }

  const cerrarProd = () => {
    setShowModal(false)
    setForm(INIT_FORM)
    setFormErrors({})
    setFormTouched({})
  }

  const ejecutarAnulacion = () => {
    if (!confirm) return
    if (confirm.tipo === 'produccion') anular.mutate(confirm.id, { onSettled: () => setConfirm(null) })
    else anularNota.mutate(confirm.id, { onSettled: () => setConfirm(null) })
  }

  const parejasEstimadas =
    notaForm.tiposalida === 'Paratheresia' && notaForm.ratio && notaForm.cantidad
      ? Math.floor(Number(notaForm.cantidad) / Number(notaForm.ratio))
      : null

  const detailFields = detail
    ? detail.tipo === 'produccion'
      ? [
          { label: 'ID', value: detail.data.id },
          { label: 'Fecha', value: detail.data.fecha },
          { label: 'Cantidad', value: detail.data.cantidad },
          { label: 'Unidad', value: detail.data.id_unidad },
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
          { label: 'Cantidad', value: detail.data.cantidad },
          { label: 'Ratio', value: detail.data.ratio },
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
      {confirm && <ConfirmModal mensaje={confirm.mensaje} onConfirm={ejecutarAnulacion} onCancel={() => setConfirm(null)} />}
      {detail && (
        <DetailModal
          title={detail.tipo === 'produccion' ? 'Detalle — Producción Galleria' : 'Detalle — Nota de Salida Galleria'}
          fields={detailFields}
          onClose={() => setDetail(null)}
        />
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="vs-page-title mb-0">Galleria melonella</h1>
          <p className="text-muted mb-0" style={{ fontSize: '.85rem' }}>Larvas — unidad: unidades</p>
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
                      <th style={{ width: 48 }}>#</th>
                      <th>Fecha</th>
                      <th>Cantidad</th>
                      <th>Activo</th>
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
                            <td>{r.cantidad}</td>
                            <td><span className={`badge ${r.activo ? 'bg-success' : 'bg-secondary'}`}>{r.activo ? 'Sí' : 'No'}</span></td>
                            <td className="d-flex gap-1">
                              <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: '.72rem', padding: '2px 7px' }} title="Ver detalle" onClick={() => setDetail({ data: r, tipo: 'produccion' })}>👁</button>
                              {r.activo && (
                                <button className="btn btn-sm btn-outline-danger" style={{ fontSize: '.72rem', padding: '2px 8px' }} disabled={anular.isPending} onClick={() => setConfirm({ id: r.id, tipo: 'produccion', mensaje: 'Se anulará este registro de producción de Galleria.' })}>Anular</button>
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
                <th style={{ width: 48 }}>#</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Ratio</th>
                <th>Descripción</th>
                <th>Activo</th>
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
                      <td>{n.cantidad}</td>
                      <td>{n.ratio ?? '—'}</td>
                      <td>{n.descripcion ?? '—'}</td>
                      <td><span className={`badge ${n.activo ? 'bg-success' : 'bg-secondary'}`}>{n.activo ? 'Sí' : 'No'}</span></td>
                      <td className="d-flex gap-1">
                        <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: '.72rem', padding: '2px 7px' }} title="Ver detalle" onClick={() => setDetail({ data: n, tipo: 'nota' })}>👁</button>
                        {n.activo && (
                          <button className="btn btn-sm btn-outline-danger" style={{ fontSize: '.72rem', padding: '2px 8px' }} disabled={anularNota.isPending} onClick={() => setConfirm({ id: n.id, tipo: 'nota', mensaje: 'Se anulará esta nota de salida de Galleria.' })}>Anular</button>
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

      {/* ── Modal Producción ─────────────────────────────────────────────────── */}
      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,.4)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nuevo registro — Galleria</h5>
                <button className="btn-close" onClick={cerrarProd} />
              </div>
              <form onSubmit={handleSubmit} noValidate>
                <div className="modal-body d-flex flex-column gap-3">

                  {/* Fecha */}
                  <div>
                    <label className="form-label fw-semibold">Fecha *</label>
                    <input
                      type="date"
                      className={`form-control ${formTouched.fecha && formErrors.fecha ? 'is-invalid' : formTouched.fecha && !formErrors.fecha ? 'is-valid' : ''}`}
                      value={form.fecha}
                      max={HOY}
                      min={FECHA_MIN}
                      onChange={e => setProdField('fecha', e.target.value)}
                      onBlur={() => touchProd('fecha')}
                    />
                    <FieldError msg={formTouched.fecha ? formErrors.fecha : undefined} />
                  </div>

                  {/* Cantidad */}
                  <div>
                    <label className="form-label fw-semibold">Cantidad *</label>
                    <input
                      type="number"
                      step="0.01"
                      min={CANTIDAD_MIN}
                      max={CANTIDAD_MAX}
                      className={`form-control ${formTouched.cantidad && formErrors.cantidad ? 'is-invalid' : formTouched.cantidad && !formErrors.cantidad ? 'is-valid' : ''}`}
                      value={form.cantidad}
                      placeholder={`Ej: 500 (máx ${CANTIDAD_MAX.toLocaleString()})`}
                      onChange={e => setProdField('cantidad', e.target.value)}
                      onBlur={() => touchProd('cantidad')}
                    />
                    <FieldError msg={formTouched.cantidad ? formErrors.cantidad : undefined} />
                    <small className="text-muted" style={{ fontSize: '.75rem' }}>Ingresa un valor positivo con hasta 2 decimales.</small>
                  </div>

                  {/* Unidad (opcional) */}
                  <div>
                    <label className="form-label fw-semibold">Unidad</label>
                    <select
                      className="form-select"
                      value={form.id_unidad}
                      onChange={e => setProdField('id_unidad', e.target.value)}
                    >
                      <option value="">— Seleccionar —</option>
                      {unidades.map((u: any) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={cerrarProd}>Cancelar</button>
                  <button type="submit" className="btn-vs btn" disabled={crear.isPending}>
                    {crear.isPending ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Nota de Salida ──────────────────────────────────────────────── */}
      {showNotaModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,.4)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nota de Salida — Galleria</h5>
                <button className="btn-close" onClick={cerrarNota} />
              </div>
              <form onSubmit={handleNotaSubmit} noValidate>
                <div className="modal-body d-flex flex-column gap-3">

                  {/* Fecha */}
                  <div>
                    <label className="form-label fw-semibold">Fecha *</label>
                    <input
                      type="date"
                      className={`form-control ${notaTouched.fecha && notaErrors.fecha ? 'is-invalid' : notaTouched.fecha && !notaErrors.fecha ? 'is-valid' : ''}`}
                      value={notaForm.fecha}
                      max={HOY}
                      min={FECHA_MIN}
                      onChange={e => setNotaField('fecha', e.target.value)}
                      onBlur={() => touchNota('fecha')}
                    />
                    <FieldError msg={notaTouched.fecha ? notaErrors.fecha : undefined} />
                  </div>

                  {/* Tipo de salida */}
                  <div>
                    <label className="form-label fw-semibold">Tipo de salida</label>
                    <select
                      className="form-select"
                      value={notaForm.tiposalida}
                      onChange={e => {
                        const val = e.target.value
                        setNotaField('tiposalida', val)
                        // Al cambiar tipo, limpiar ratio si no es Paratheresia
                        if (val !== 'Paratheresia') {
                          setNotaField('ratio', '')
                          setRatioCustom(false)
                        }
                      }}
                    >
                      <option value="Paratheresia">Paratheresia</option>
                      <option value="Instalacion">Instalación</option>
                      <option value="Ventas">Ventas</option>
                    </select>
                  </div>

                  {/* Ratio (solo Paratheresia) */}
                  {notaForm.tiposalida === 'Paratheresia' && (
                    <div>
                      <label className="form-label fw-semibold">
                        Ratio *
                        <span className="text-muted fw-normal ms-1" style={{ fontSize: '.78rem' }}>(larvas por pareja)</span>
                      </label>
                      <select
                        className={`form-select ${notaTouched.ratio && notaErrors.ratio ? 'is-invalid' : notaTouched.ratio && !notaErrors.ratio && notaForm.ratio ? 'is-valid' : ''}`}
                        value={ratioCustom ? 'custom' : notaForm.ratio}
                        onChange={e => {
                          if (e.target.value === 'custom') {
                            setRatioCustom(true)
                            setNotaField('ratio', '')
                          } else {
                            setRatioCustom(false)
                            setNotaField('ratio', e.target.value)
                          }
                        }}
                        onBlur={() => touchNota('ratio')}
                      >
                        <option value="">— Seleccionar —</option>
                        <option value="3">3</option>
                        <option value="3.5">3.5</option>
                        <option value="4">4</option>
                        <option value="custom">Otro (ingresar manual)</option>
                      </select>

                      {ratioCustom && (
                        <input
                          type="number"
                          step="0.01"
                          min={RATIO_MIN}
                          max={RATIO_MAX}
                          className={`form-control mt-2 ${notaTouched.ratio && notaErrors.ratio ? 'is-invalid' : notaTouched.ratio && !notaErrors.ratio && notaForm.ratio ? 'is-valid' : ''}`}
                          placeholder={`Ratio manual (${RATIO_MIN}–${RATIO_MAX})`}
                          value={notaForm.ratio}
                          onChange={e => setNotaField('ratio', e.target.value)}
                          onBlur={() => touchNota('ratio')}
                        />
                      )}

                      <FieldError msg={notaTouched.ratio ? notaErrors.ratio : undefined} />
                      <small className="text-muted d-block mt-1" style={{ fontSize: '.75rem' }}>
                        Parejas = floor(cantidad / ratio)
                      </small>

                      {parejasEstimadas !== null && !notaErrors.ratio && !notaErrors.cantidad && (
                        <div className="alert alert-success py-1 px-2 mt-2 mb-0" style={{ fontSize: '.85rem' }}>
                          Parejas estimadas: <strong>{parejasEstimadas}</strong>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cantidad */}
                  <div>
                    <label className="form-label fw-semibold">Cantidad *</label>
                    <input
                      type="number"
                      step="0.01"
                      min={CANTIDAD_MIN}
                      max={CANTIDAD_MAX}
                      className={`form-control ${notaTouched.cantidad && notaErrors.cantidad ? 'is-invalid' : notaTouched.cantidad && !notaErrors.cantidad ? 'is-valid' : ''}`}
                      value={notaForm.cantidad}
                      placeholder={`Ej: 1000 (máx ${CANTIDAD_MAX.toLocaleString()})`}
                      onChange={e => setNotaField('cantidad', e.target.value)}
                      onBlur={() => touchNota('cantidad')}
                    />
                    <FieldError msg={notaTouched.cantidad ? notaErrors.cantidad : undefined} />
                    <small className="text-muted" style={{ fontSize: '.75rem' }}>Ingresa un valor positivo con hasta 2 decimales.</small>
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="form-label fw-semibold">
                      Descripción
                      <span className="text-muted fw-normal ms-1" style={{ fontSize: '.78rem' }}>
                        ({notaForm.descripcion.length}/{DESCRIPCION_MAX})
                      </span>
                    </label>
                    <textarea
                      className={`form-control ${notaTouched.descripcion && notaErrors.descripcion ? 'is-invalid' : ''}`}
                      rows={2}
                      maxLength={DESCRIPCION_MAX}
                      value={notaForm.descripcion}
                      placeholder="Observaciones opcionales..."
                      onChange={e => setNotaField('descripcion', e.target.value)}
                      onBlur={() => touchNota('descripcion')}
                    />
                    <FieldError msg={notaTouched.descripcion ? notaErrors.descripcion : undefined} />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={cerrarNota}>Cancelar</button>
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
