import { useState } from 'react'
import {
  useParatheresia, useCreateParatheresia, useAnularParatheresia, useEliminarParatheresia,
  useNotasMoscas, useCreateNotaMoscas, useAnularNotaMoscas, useEliminarNotaMoscas,
  useUnidadesMoscas, useLugaresMoscas,
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
  const pages = Array.from({ length: total }, (_, i) => i + 1)
    .filter(p => p === 1 || p === total || Math.abs(p - page) <= 1)
    .reduce<(number | '...')[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...')
      acc.push(p)
      return acc
    }, [])
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 0', borderTop: '1px solid var(--vsp-border)' }}>
      <span style={{ fontSize: '.78rem', color: 'var(--vsp-text-muted)' }}>Página {page} de {total}</span>
      <div style={{ display: 'flex', gap: 4 }}>
        <button className="vsp-page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>
        {pages.map((p, i) =>
          p === '...'
            ? <span key={`e${i}`} style={{ padding: '0 6px', color: 'var(--vsp-text-muted)', lineHeight: '28px' }}>…</span>
            : <button key={p} className={`vsp-page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p as number)}>{p}</button>
        )}
        <button className="vsp-page-btn" disabled={page === total} onClick={() => setPage(page + 1)}>›</button>
      </div>
    </div>
  )
}

function ConfirmModal({ mensaje, accionLabel = 'Anular', onConfirm, onCancel }: { mensaje: string; accionLabel?: string; onConfirm: () => void; onCancel: () => void }) {
  const isEliminar = accionLabel === 'Eliminar'
  return (
    <div className="vsp-overlay">
      <div className="vsp-dialog vsp-dialog--sm">
        <div className="vsp-dialog__head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 32, height: 32, borderRadius: '50%', background: isEliminar ? 'var(--vsp-danger-soft)' : 'var(--vsp-warn-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
              {isEliminar ? '🗑' : '⚠️'}
            </span>
            <h6 style={{ margin: 0, fontWeight: 600, fontSize: '.92rem', color: isEliminar ? 'var(--vsp-danger)' : 'var(--vsp-warn)' }}>
              Confirmar {accionLabel.toLowerCase()}
            </h6>
          </div>
        </div>
        <div className="vsp-dialog__body" style={{ fontSize: '.88rem', color: 'var(--vsp-text-secondary)', lineHeight: 1.55 }}>{mensaje}</div>
        <div className="vsp-dialog__foot">
          <button className="vsp-btn vsp-btn--ghost" onClick={onCancel}>Cancelar</button>
          <button className={`vsp-btn ${isEliminar ? 'vsp-btn--danger' : 'vsp-btn--warn'}`} onClick={onConfirm}>
            {isEliminar ? '🗑 Eliminar' : '⚠ Anular'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DetailModal({ title, fields, onClose }: { title: string; fields: { label: string; value: any }[]; onClose: () => void }) {
  return (
    <div className="vsp-overlay" onClick={onClose}>
      <div className="vsp-dialog" onClick={e => e.stopPropagation()}>
        <div className="vsp-dialog__head">
          <h5 style={{ margin: 0, fontWeight: 600, fontSize: '.95rem' }}>{title}</h5>
          <button className="vsp-icon-btn" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        <div className="vsp-dialog__body">
          <div className="vsp-detail-grid">
            {fields.map(({ label, value }) => (
              <div key={label} className="vsp-detail-row">
                <span className="vsp-detail-label">{label}</span>
                <span className="vsp-detail-value">
                  {value != null && value !== '' ? value : <span style={{ color: 'var(--vsp-text-muted)' }}>—</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="vsp-dialog__foot">
          <button className="vsp-btn vsp-btn--ghost" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ icon, label, value, color = '#16a34a' }: { icon: string; label: string; value: number; color?: string }) {
  return (
    <div className="vsp-metric-card">
      <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: '.72rem', color: 'var(--vsp-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--vsp-text-primary)', lineHeight: 1.2 }}>{value}</div>
      </div>
    </div>
  )
}

function Badge({ activo }: { activo: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 9px', borderRadius: 20, fontSize: '.72rem', fontWeight: 600, background: activo ? 'var(--vsp-success-soft)' : 'var(--vsp-neutral-soft)', color: activo ? 'var(--vsp-success)' : 'var(--vsp-text-muted)' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
      {activo ? 'Activo' : 'Anulado'}
    </span>
  )
}

const TIPO_COLORS: Record<string, { bg: string; color: string }> = {
  Parasitacion: { bg: '#ede9fe', color: '#6d28d9' },
  Venta:        { bg: 'var(--vsp-success-soft)', color: 'var(--vsp-success)' },
  Liberacion:   { bg: '#dbeafe', color: '#1d4ed8' },
}

function TipoBadge({ tipo }: { tipo: string }) {
  const c = TIPO_COLORS[tipo] ?? { bg: 'var(--vsp-neutral-soft)', color: 'var(--vsp-text-muted)' }
  return (
    <span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: 20, fontSize: '.72rem', fontWeight: 600, background: c.bg, color: c.color }}>{tipo}</span>
  )
}

const fmt = (v: string | null | undefined) =>
  v ? new Date(v).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' }) : null

const NOTA_FORM_DEFAULT = {
  fecha: '', tiposalida: 'Parasitacion',
  id_lugarliberacion: '', descripcion: '',
  id_unidad: '', cantidad: '',
}

type Confirm = { id: number; tipo: 'produccion' | 'nota'; accion: 'anular' | 'eliminar'; mensaje: string }
type Detail  = { data: any; tipo: 'produccion' | 'nota' }

export default function ParathesiaPage() {
  const { data: registros = [], isLoading } = useParatheresia()
  const { data: notas = [] }    = useNotasMoscas()
  const { data: unidades = [] } = useUnidadesMoscas()
  const { data: lugares = [] }  = useLugaresMoscas()

  const crear        = useCreateParatheresia()
  const crearNota    = useCreateNotaMoscas()
  const anular       = useAnularParatheresia()
  const anularNota   = useAnularNotaMoscas()
  const eliminar     = useEliminarParatheresia()
  const eliminarNota = useEliminarNotaMoscas()

  const [tab, setTab]                     = useState<'produccion' | 'notas'>('produccion')
  const [showModal, setShowModal]         = useState(false)
  const [showNotaModal, setShowNotaModal] = useState(false)
  const [confirm, setConfirm]             = useState<Confirm | null>(null)
  const [detail, setDetail]               = useState<Detail | null>(null)
  const [form, setForm]                   = useState({ fecha: '', id_unidad: '', cantidad: '' })
  const [notaForm, setNotaForm]           = useState(NOTA_FORM_DEFAULT)

  const prodPag  = usePagination(registros)
  const notasPag = usePagination(notas)

  const totalActivos  = registros.filter((r: any) => r.activo).length
  const totalAnulados = registros.filter((r: any) => !r.activo).length
  const notasActivas  = notas.filter((n: any) => n.activo).length

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
    crearNota.mutate(
      {
        ...notaForm,
        cantidad: Number(notaForm.cantidad),
        id_unidad: notaForm.id_unidad ? Number(notaForm.id_unidad) : null,
        id_lugarliberacion: notaForm.tiposalida === 'Liberacion' && notaForm.id_lugarliberacion
          ? Number(notaForm.id_lugarliberacion)
          : null,
      },
      { onSuccess: () => { setShowNotaModal(false); setNotaForm(NOTA_FORM_DEFAULT) } }
    )
  }

  const ejecutarAccion = () => {
    if (!confirm) return
    const { id, tipo, accion } = confirm
    const mutation =
      accion === 'anular'
        ? (tipo === 'produccion' ? anular : anularNota)
        : (tipo === 'produccion' ? eliminar : eliminarNota)
    mutation.mutate(id, { onSettled: () => setConfirm(null) })
  }

  const detailFields = detail
    ? detail.tipo === 'produccion'
      ? [
          { label: 'ID',                value: detail.data.id },
          { label: 'Fecha',             value: detail.data.fecha },
          { label: 'Cantidad (parejas)',value: detail.data.cantidad },
          { label: 'Unidad',            value: detail.data.id_unidad },
          { label: 'Estado',            value: <Badge activo={detail.data.activo} /> },
          { label: 'Registrado por',    value: detail.data.registrado_por },
          { label: 'Creado en',         value: fmt(detail.data.creado_en) },
          { label: 'Anulado por',       value: detail.data.anulado_por },
          { label: 'Anulado en',        value: fmt(detail.data.anulado_en) },
        ]
      : [
          { label: 'ID',               value: detail.data.id },
          { label: 'Fecha',            value: detail.data.fecha },
          { label: 'Tipo de salida',   value: <TipoBadge tipo={detail.data.tiposalida} /> },
          { label: 'Lugar liberación', value: (lugares as any[]).find(l => l.id === detail.data.id_lugarliberacion)?.nombre },
          { label: 'Cantidad (parejas)', value: detail.data.cantidad },
          { label: 'Descripción',      value: detail.data.descripcion },
          { label: 'Estado',           value: <Badge activo={detail.data.activo} /> },
          { label: 'Registrado por',   value: detail.data.registrado_por },
          { label: 'Creado en',        value: fmt(detail.data.creado_en) },
          { label: 'Anulado por',      value: detail.data.anulado_por },
          { label: 'Anulado en',       value: fmt(detail.data.anulado_en) },
        ]
    : []

  return (
    <>
      <style>{`
        :root {
          --vsp-primary:       #16a34a;
          --vsp-primary-soft:  #dcfce7;
          --vsp-success:       #15803d;
          --vsp-success-soft:  #dcfce7;
          --vsp-danger:        #dc2626;
          --vsp-danger-soft:   #fee2e2;
          --vsp-warn:          #d97706;
          --vsp-warn-soft:     #fef3c7;
          --vsp-neutral-soft:  #f3f4f6;
          --vsp-border:        #e5e7eb;
          --vsp-text-primary:  #111827;
          --vsp-text-secondary:#374151;
          --vsp-text-muted:    #9ca3af;
          --vsp-bg-card:       #ffffff;
          --vsp-bg-page:       #f9fafb;
        }
        .vsp-overlay { position: fixed; inset: 0; z-index: 1050; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .vsp-dialog { background: var(--vsp-bg-card); border-radius: 14px; width: 100%; max-width: 480px; box-shadow: 0 20px 40px rgba(0,0,0,.18); overflow: hidden; }
        .vsp-dialog--sm { max-width: 360px; }
        .vsp-dialog__head { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--vsp-border); }
        .vsp-dialog__body { padding: 20px; }
        .vsp-dialog__foot { display: flex; justify-content: flex-end; gap: 8px; padding: 14px 20px; border-top: 1px solid var(--vsp-border); background: #fafafa; }
        .vsp-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 16px; border-radius: 8px; font-size: .85rem; font-weight: 500; border: none; cursor: pointer; transition: opacity .15s, transform .1s; }
        .vsp-btn:active { transform: scale(.97); }
        .vsp-btn--primary { background: var(--vsp-primary); color: #fff; }
        .vsp-btn--primary:hover { opacity: .88; }
        .vsp-btn--ghost { background: transparent; border: 1px solid var(--vsp-border); color: var(--vsp-text-secondary); }
        .vsp-btn--ghost:hover { background: var(--vsp-neutral-soft); }
        .vsp-btn--danger { background: var(--vsp-danger); color: #fff; }
        .vsp-btn--danger:hover { opacity: .88; }
        .vsp-btn--warn { background: var(--vsp-warn); color: #fff; }
        .vsp-btn--warn:hover { opacity: .88; }
        .vsp-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }
        .vsp-icon-btn { background: none; border: none; cursor: pointer; color: var(--vsp-text-muted); font-size: 1rem; padding: 2px 6px; border-radius: 4px; line-height: 1; }
        .vsp-icon-btn:hover { color: var(--vsp-text-primary); background: var(--vsp-neutral-soft); }
        .vsp-card { background: var(--vsp-bg-card); border: 1px solid var(--vsp-border); border-radius: 12px; overflow: hidden; }
        .vsp-metric-card { background: var(--vsp-bg-card); border: 1px solid var(--vsp-border); border-radius: 10px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; }
        .vsp-table { width: 100%; border-collapse: collapse; font-size: .84rem; }
        .vsp-table thead th { padding: 10px 14px; background: var(--vsp-bg-page); font-size: .72rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: var(--vsp-text-muted); border-bottom: 1px solid var(--vsp-border); white-space: nowrap; }
        .vsp-table tbody tr { border-bottom: 1px solid var(--vsp-border); transition: background .1s; }
        .vsp-table tbody tr:last-child { border-bottom: none; }
        .vsp-table tbody tr:hover { background: #f9fafb; }
        .vsp-table td { padding: 10px 14px; color: var(--vsp-text-secondary); vertical-align: middle; }
        .vsp-tabs { display: flex; gap: 2px; border-bottom: 1px solid var(--vsp-border); margin-bottom: 20px; }
        .vsp-tab { padding: 9px 18px; font-size: .88rem; font-weight: 500; border: none; background: none; cursor: pointer; color: var(--vsp-text-muted); border-bottom: 2px solid transparent; margin-bottom: -1px; transition: color .15s; display: flex; align-items: center; gap: 8px; }
        .vsp-tab:hover { color: var(--vsp-text-secondary); }
        .vsp-tab.active { color: var(--vsp-primary); border-color: var(--vsp-primary); font-weight: 600; }
        .vsp-tab-badge { background: var(--vsp-neutral-soft); color: var(--vsp-text-muted); font-size: .65rem; font-weight: 700; padding: 1px 7px; border-radius: 10px; }
        .vsp-tab.active .vsp-tab-badge { background: var(--vsp-primary-soft); color: var(--vsp-primary); }
        .vsp-page-btn { width: 30px; height: 30px; border-radius: 6px; border: 1px solid var(--vsp-border); background: var(--vsp-bg-card); font-size: .82rem; cursor: pointer; color: var(--vsp-text-secondary); transition: all .12s; }
        .vsp-page-btn:hover:not(:disabled) { background: var(--vsp-neutral-soft); }
        .vsp-page-btn.active { background: var(--vsp-primary); border-color: var(--vsp-primary); color: #fff; font-weight: 600; }
        .vsp-page-btn:disabled { opacity: .35; cursor: not-allowed; }
        .vsp-form-label { display: block; font-size: .8rem; font-weight: 600; color: var(--vsp-text-secondary); margin-bottom: 5px; }
        .vsp-input { width: 100%; padding: 8px 12px; font-size: .88rem; border: 1px solid var(--vsp-border); border-radius: 8px; background: #fff; color: var(--vsp-text-primary); transition: border-color .15s; box-sizing: border-box; }
        .vsp-input:focus { outline: none; border-color: var(--vsp-primary); box-shadow: 0 0 0 3px rgba(22,163,74,.1); }
        .vsp-action-btn { padding: 4px 10px; border-radius: 6px; font-size: .75rem; font-weight: 500; border: 1px solid; cursor: pointer; transition: all .12s; display: inline-flex; align-items: center; gap: 4px; }
        .vsp-action-btn:active { transform: scale(.96); }
        .vsp-action-btn--view { border-color: var(--vsp-border); background: transparent; color: var(--vsp-text-muted); }
        .vsp-action-btn--view:hover { border-color: var(--vsp-text-secondary); color: var(--vsp-text-secondary); }
        .vsp-action-btn--anular { border-color: #fca5a5; background: transparent; color: var(--vsp-danger); }
        .vsp-action-btn--anular:hover { background: var(--vsp-danger-soft); }
        .vsp-action-btn--delete { border-color: var(--vsp-danger); background: var(--vsp-danger); color: #fff; }
        .vsp-action-btn--delete:hover { opacity: .85; }
        .vsp-detail-grid { display: flex; flex-direction: column; }
        .vsp-detail-row { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--vsp-border); }
        .vsp-detail-row:last-child { border-bottom: none; }
        .vsp-detail-label { flex: 0 0 140px; font-size: .78rem; font-weight: 600; color: var(--vsp-text-muted); }
        .vsp-detail-value { font-size: .85rem; color: var(--vsp-text-primary); }
        .vsp-spinner { display: flex; justify-content: center; padding: 48px 0; }
        .vsp-modal-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; max-height: 65vh; overflow-y: auto; }
        .vsp-field-slide { animation: slideDown .2s ease; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {confirm && (
        <ConfirmModal
          mensaje={confirm.mensaje}
          accionLabel={confirm.accion === 'eliminar' ? 'Eliminar' : 'Anular'}
          onConfirm={ejecutarAccion}
          onCancel={() => setConfirm(null)}
        />
      )}
      {detail && (
        <DetailModal
          title={detail.tipo === 'produccion' ? '🔍 Detalle — Producción Paratheresia' : '🔍 Detalle — Nota de Salida'}
          fields={detailFields}
          onClose={() => setDetail(null)}
        />
      )}

      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontWeight: 700, fontSize: '1.4rem', color: 'var(--vsp-text-primary)' }}>
            🦟 Paratheresia claripalpis
          </h1>
          <p style={{ margin: '3px 0 0', fontSize: '.83rem', color: 'var(--vsp-text-muted)' }}>
            Moscas parasitoide — unidad: parejas
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="vsp-btn vsp-btn--ghost" onClick={() => setShowNotaModal(true)}>↗ Nota de Salida</button>
          <button className="vsp-btn vsp-btn--primary" onClick={() => setShowModal(true)}>+ Registrar Producción</button>
        </div>
      </div>

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        <MetricCard icon="🦟" label="Total registros" value={registros.length} color="#16a34a" />
        <MetricCard icon="✅" label="Activos"          value={totalActivos}     color="#15803d" />
        <MetricCard icon="❌" label="Anulados"         value={totalAnulados}    color="#dc2626" />
        <MetricCard icon="📋" label="Notas activas"    value={notasActivas}     color="#d97706" />
      </div>

      {/* Tabs */}
      <div className="vsp-tabs">
        <button className={`vsp-tab ${tab === 'produccion' ? 'active' : ''}`} onClick={() => { setTab('produccion'); prodPag.setPage(1) }}>
          🦟 Producción <span className="vsp-tab-badge">{registros.length}</span>
        </button>
        <button className={`vsp-tab ${tab === 'notas' ? 'active' : ''}`} onClick={() => { setTab('notas'); notasPag.setPage(1) }}>
          📋 Notas de Salida <span className="vsp-tab-badge">{notas.length}</span>
        </button>
      </div>

      {/* Tab: Producción */}
      {tab === 'produccion' && (
        <div className="vsp-card">
          {isLoading
            ? <div className="vsp-spinner"><div className="spinner-border text-success" /></div>
            : <>
                <table className="vsp-table">
                  <thead>
                    <tr>
                      <th style={{ width: 44 }}>#</th>
                      <th>Fecha</th>
                      <th>Cantidad (parejas)</th>
                      <th>Estado</th>
                      <th style={{ width: 150, textAlign: 'right', paddingRight: 16 }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prodPag.slice.length === 0
                      ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--vsp-text-muted)' }}>Sin registros aún</td></tr>
                      : prodPag.slice.map((r: any, index: number) => (
                          <tr key={r.id}>
                            <td style={{ color: 'var(--vsp-text-muted)', fontSize: '.78rem' }}>{(prodPag.page - 1) * PAGE_SIZE + index + 1}</td>
                            <td style={{ fontWeight: 500, color: 'var(--vsp-text-primary)' }}>{r.fecha}</td>
                            <td>{Number(r.cantidad).toLocaleString('es-PE')}</td>
                            <td><Badge activo={r.activo} /></td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                                <button className="vsp-action-btn vsp-action-btn--view" onClick={() => setDetail({ data: r, tipo: 'produccion' })} title="Ver detalle">👁 Ver</button>
                                {r.activo ? (
                                  <button className="vsp-action-btn vsp-action-btn--anular" disabled={anular.isPending}
                                    onClick={() => setConfirm({ id: r.id, tipo: 'produccion', accion: 'anular', mensaje: 'Se anulará este registro de producción de Paratheresia. Podrás eliminarlo permanentemente después.' })}>
                                    Anular
                                  </button>
                                ) : (
                                  <button className="vsp-action-btn vsp-action-btn--delete" disabled={eliminar.isPending}
                                    onClick={() => setConfirm({ id: r.id, tipo: 'produccion', accion: 'eliminar', mensaje: 'Esto borrará el registro de forma permanente. No se puede deshacer.' })}>
                                    🗑 Eliminar
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
                <div style={{ padding: '0 4px 4px' }}>
                  <Pagination page={prodPag.page} total={prodPag.total} setPage={prodPag.setPage} />
                </div>
              </>
          }
        </div>
      )}

      {/* Tab: Notas de Salida */}
      {tab === 'notas' && (
        <div className="vsp-card">
          <table className="vsp-table">
            <thead>
              <tr>
                <th style={{ width: 44 }}>#</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Lugar liberación</th>
                <th>Cantidad</th>
                <th>Estado</th>
                <th style={{ width: 150, textAlign: 'right', paddingRight: 16 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {notasPag.slice.length === 0
                ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--vsp-text-muted)' }}>Sin notas de salida aún</td></tr>
                : notasPag.slice.map((n: any, index: number) => (
                    <tr key={n.id}>
                      <td style={{ color: 'var(--vsp-text-muted)', fontSize: '.78rem' }}>{(notasPag.page - 1) * PAGE_SIZE + index + 1}</td>
                      <td style={{ fontWeight: 500, color: 'var(--vsp-text-primary)' }}>{n.fecha}</td>
                      <td><TipoBadge tipo={n.tiposalida} /></td>
                      <td style={{ color: n.id_lugarliberacion ? 'var(--vsp-text-primary)' : 'var(--vsp-text-muted)' }}>
                        {(lugares as any[]).find(l => l.id === n.id_lugarliberacion)?.nombre ?? '—'}
                      </td>
                      <td>{Number(n.cantidad).toLocaleString('es-PE')}</td>
                      <td><Badge activo={n.activo} /></td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                          <button className="vsp-action-btn vsp-action-btn--view" onClick={() => setDetail({ data: n, tipo: 'nota' })} title="Ver detalle">👁 Ver</button>
                          {n.activo ? (
                            <button className="vsp-action-btn vsp-action-btn--anular" disabled={anularNota.isPending}
                              onClick={() => setConfirm({ id: n.id, tipo: 'nota', accion: 'anular', mensaje: 'Se anulará esta nota de salida de Paratheresia.' })}>
                              Anular
                            </button>
                          ) : (
                            <button className="vsp-action-btn vsp-action-btn--delete" disabled={eliminarNota.isPending}
                              onClick={() => setConfirm({ id: n.id, tipo: 'nota', accion: 'eliminar', mensaje: 'Esto borrará la nota de forma permanente. No se puede deshacer.' })}>
                              🗑 Eliminar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
          <div style={{ padding: '0 4px 4px' }}>
            <Pagination page={notasPag.page} total={notasPag.total} setPage={notasPag.setPage} />
          </div>
        </div>
      )}

      {/* Modal: Nuevo Registro */}
      {showModal && (
        <div className="vsp-overlay">
          <div className="vsp-dialog">
            <div className="vsp-dialog__head">
              <h5 style={{ margin: 0, fontWeight: 600, fontSize: '.95rem' }}>🦟 Nuevo registro — Paratheresia</h5>
              <button className="vsp-icon-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="vsp-modal-body">
                <div>
                  <label className="vsp-form-label">Fecha *</label>
                  <input type="date" className="vsp-input" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} required />
                </div>
                <div>
                  <label className="vsp-form-label">Cantidad (parejas) *</label>
                  <input type="number" step="1" min="1" className="vsp-input" placeholder="Ej. 250" value={form.cantidad} onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))} required />
                </div>
                <div>
                  <label className="vsp-form-label">Unidad</label>
                  <select className="vsp-input" value={form.id_unidad} onChange={e => setForm(f => ({ ...f, id_unidad: e.target.value }))}>
                    <option value="">— Seleccionar unidad —</option>
                    {(unidades as any[]).map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div className="vsp-dialog__foot">
                <button type="button" className="vsp-btn vsp-btn--ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="vsp-btn vsp-btn--primary" disabled={crear.isPending}>
                  {crear.isPending ? '⏳ Guardando...' : '✓ Guardar registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nota de Salida */}
      {showNotaModal && (
        <div className="vsp-overlay">
          <div className="vsp-dialog">
            <div className="vsp-dialog__head">
              <h5 style={{ margin: 0, fontWeight: 600, fontSize: '.95rem' }}>📋 Nota de Salida — Paratheresia</h5>
              <button className="vsp-icon-btn" onClick={() => setShowNotaModal(false)}>✕</button>
            </div>
            <form onSubmit={handleNotaSubmit}>
              <div className="vsp-modal-body">
                <div>
                  <label className="vsp-form-label">Fecha *</label>
                  <input type="date" className="vsp-input" value={notaForm.fecha} onChange={e => setNotaForm(f => ({ ...f, fecha: e.target.value }))} required />
                </div>

                <div>
                  <label className="vsp-form-label">Tipo de salida</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 2 }}>
                    {([
                      { value: 'Parasitacion', icon: '🧬', label: 'Parasitación' },
                      { value: 'Venta',        icon: '💰', label: 'Venta'        },
                      { value: 'Liberacion',   icon: '📍', label: 'Liberación'   },
                    ] as const).map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setNotaForm(f => ({
                          ...f,
                          tiposalida: opt.value,
                          id_lugarliberacion: opt.value !== 'Liberacion' ? '' : f.id_lugarliberacion,
                        }))}
                        style={{
                          padding: '10px 6px', borderRadius: 8, border: '1.5px solid',
                          borderColor: notaForm.tiposalida === opt.value ? 'var(--vsp-primary)' : 'var(--vsp-border)',
                          background: notaForm.tiposalida === opt.value ? 'var(--vsp-primary-soft)' : 'transparent',
                          color: notaForm.tiposalida === opt.value ? 'var(--vsp-success)' : 'var(--vsp-text-secondary)',
                          cursor: 'pointer', fontWeight: 600, fontSize: '.8rem',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                          transition: 'all .15s',
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{opt.icon}</span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {notaForm.tiposalida === 'Liberacion' && (
                  <div className="vsp-field-slide">
                    <label className="vsp-form-label">📍 Lugar de liberación *</label>
                    <select className="vsp-input" value={notaForm.id_lugarliberacion} onChange={e => setNotaForm(f => ({ ...f, id_lugarliberacion: e.target.value }))} required>
                      <option value="">— Seleccionar lugar —</option>
                      {(lugares as any[]).map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                    </select>
                    <p style={{ margin: '5px 0 0', fontSize: '.75rem', color: 'var(--vsp-text-muted)' }}>
                      Indica el campo o zona donde se liberarán las parejas.
                    </p>
                  </div>
                )}

                <div>
                  <label className="vsp-form-label">Cantidad (parejas) *</label>
                  <input type="number" step="1" min="1" className="vsp-input" placeholder="Ej. 100" value={notaForm.cantidad} onChange={e => setNotaForm(f => ({ ...f, cantidad: e.target.value }))} required />
                </div>

                <div>
                  <label className="vsp-form-label">Descripción</label>
                  <textarea className="vsp-input" style={{ resize: 'vertical', minHeight: 70 }} placeholder="Observaciones opcionales..." value={notaForm.descripcion} onChange={e => setNotaForm(f => ({ ...f, descripcion: e.target.value }))} />
                </div>
              </div>
              <div className="vsp-dialog__foot">
                <button type="button" className="vsp-btn vsp-btn--ghost" onClick={() => setShowNotaModal(false)}>Cancelar</button>
                <button type="submit" className="vsp-btn vsp-btn--primary" disabled={crearNota.isPending}>
                  {crearNota.isPending ? '⏳ Guardando...' : '✓ Guardar nota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
