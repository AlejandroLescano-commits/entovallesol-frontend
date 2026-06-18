import { useState } from 'react'
import {
  useSitotroga, useCreateSitotroga, useAnularSitotroga, useEliminarSitotroga,
  useNotasSitodroga, useCreateNotaSitodroga, useAnularNotaSitodroga, useEliminarNotaSitodroga,
  useUnidadesSitodroga,
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 0', borderTop: '1px solid var(--vs-border)' }}>
      <span style={{ fontSize: '.78rem', color: 'var(--vs-text-muted)' }}>Página {page} de {total}</span>
      <div style={{ display: 'flex', gap: 4 }}>
        <button className="vs-page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>
        {pages.map((p, i) =>
          p === '...'
            ? <span key={`e${i}`} style={{ padding: '0 6px', color: 'var(--vs-text-muted)', lineHeight: '28px' }}>…</span>
            : <button key={p} className={`vs-page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p as number)}>{p}</button>
        )}
        <button className="vs-page-btn" disabled={page === total} onClick={() => setPage(page + 1)}>›</button>
      </div>
    </div>
  )
}

function ConfirmModal({ mensaje, accionLabel = 'Anular', onConfirm, onCancel }: { mensaje: string; accionLabel?: string; onConfirm: () => void; onCancel: () => void }) {
  const isEliminar = accionLabel === 'Eliminar'
  return (
    <div className="vs-overlay">
      <div className="vs-dialog vs-dialog--sm">
        <div className="vs-dialog__head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 32, height: 32, borderRadius: '50%', background: isEliminar ? 'var(--vs-danger-soft)' : 'var(--vs-warn-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
              {isEliminar ? '🗑' : '⚠️'}
            </span>
            <h6 style={{ margin: 0, fontWeight: 600, fontSize: '.92rem', color: isEliminar ? 'var(--vs-danger)' : 'var(--vs-warn)' }}>
              Confirmar {accionLabel.toLowerCase()}
            </h6>
          </div>
        </div>
        <div className="vs-dialog__body" style={{ fontSize: '.88rem', color: 'var(--vs-text-secondary)', lineHeight: 1.55 }}>{mensaje}</div>
        <div className="vs-dialog__foot">
          <button className="vs-btn vs-btn--ghost" onClick={onCancel}>Cancelar</button>
          <button className={`vs-btn ${isEliminar ? 'vs-btn--danger' : 'vs-btn--warn'}`} onClick={onConfirm}>
            {isEliminar ? '🗑 Eliminar' : '⚠ Anular'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DetailModal({ title, fields, onClose }: { title: string; fields: { label: string; value: any }[]; onClose: () => void }) {
  return (
    <div className="vs-overlay" onClick={onClose}>
      <div className="vs-dialog" onClick={e => e.stopPropagation()}>
        <div className="vs-dialog__head">
          <h5 style={{ margin: 0, fontWeight: 600, fontSize: '.95rem' }}>{title}</h5>
          <button className="vs-icon-btn" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        <div className="vs-dialog__body">
          <div className="vs-detail-grid">
            {fields.map(({ label, value }) => (
              <div key={label} className="vs-detail-row">
                <span className="vs-detail-label">{label}</span>
                <span className="vs-detail-value">
                  {value != null && value !== '' ? value : <span style={{ color: 'var(--vs-text-muted)' }}>—</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="vs-dialog__foot">
          <button className="vs-btn vs-btn--ghost" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ icon, label, value, color = 'var(--vs-primary)' }: { icon: string; label: string; value: number; color?: string }) {
  return (
    <div className="vs-metric-card">
      <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: '.72rem', color: 'var(--vs-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--vs-text-primary)', lineHeight: 1.2 }}>{value}</div>
      </div>
    </div>
  )
}

function Badge({ activo }: { activo: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 9px', borderRadius: 20, fontSize: '.72rem', fontWeight: 600, background: activo ? 'var(--vs-success-soft)' : 'var(--vs-neutral-soft)', color: activo ? 'var(--vs-success)' : 'var(--vs-text-muted)' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
      {activo ? 'Activo' : 'Anulado'}
    </span>
  )
}

const TIPO_COLORS: Record<string, { bg: string; color: string }> = {
  'T.exiguum':   { bg: 'var(--vs-primary-soft)', color: 'var(--vs-primary)' },
  'T.pretiosum': { bg: '#ede9fe',                color: '#7c3aed'           },
  'Crysopas':    { bg: 'var(--vs-warn-soft)',    color: 'var(--vs-warn)'    },
  'Infestación': { bg: 'var(--vs-danger-soft)',  color: 'var(--vs-danger)'  },
  'Ventas':      { bg: 'var(--vs-success-soft)', color: 'var(--vs-success)' },
}

function TipoBadge({ tipo }: { tipo: string }) {
  const c = TIPO_COLORS[tipo] ?? { bg: 'var(--vs-neutral-soft)', color: 'var(--vs-text-muted)' }
  return (
    <span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: 20, fontSize: '.72rem', fontWeight: 600, background: c.bg, color: c.color }}>{tipo}</span>
  )
}

const fmt = (v: string | null | undefined) =>
  v ? new Date(v).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' }) : null

type Confirm = { id: number; tipo: 'produccion' | 'nota'; accion: 'anular' | 'eliminar'; mensaje: string }

export default function SitotrogaPage() {
  const { data: registros = [], isLoading } = useSitotroga()
  const { data: notas = [] } = useNotasSitodroga()
  const { data: unidades = [] } = useUnidadesSitodroga()
  const crear      = useCreateSitotroga()
  const crearNota  = useCreateNotaSitodroga()
  const anular     = useAnularSitotroga()
  const anularNota = useAnularNotaSitodroga()
  const eliminar     = useEliminarSitotroga()
  const eliminarNota = useEliminarNotaSitodroga()

  const [tab, setTab] = useState<'produccion' | 'notas'>('produccion')
  const [showModal, setShowModal] = useState(false)
  const [showNotaModal, setShowNotaModal] = useState(false)
  const [confirm, setConfirm] = useState<Confirm | null>(null)
  const [detail, setDetail] = useState<{ data: any; tipo: 'produccion' | 'nota' } | null>(null)

  const [form, setForm] = useState({ fecha: '', id_unidad: '', cantidad: '' })
  const [notaForm, setNotaForm] = useState({ fecha: '', tiposalida: 'T.exiguum', descripcion: '', id_unidad: '', factor: '1', cantidad: '' })

  const prodPag  = usePagination(registros)
  const notasPag = usePagination(notas)

  const esExiguum = notaForm.tiposalida === 'T.exiguum'
  const cantidadConvertida = esExiguum && notaForm.cantidad
    ? Number(notaForm.cantidad) * 12.5 + Number(notaForm.factor || 0) : null
  const trichogrammaGenerado = esExiguum && notaForm.cantidad
    ? Number(notaForm.cantidad) * 80 : null

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
    if (!notaForm.fecha || !notaForm.cantidad) return toast.error('Completa los campos requeridos')
    if (esExiguum && !notaForm.factor) return toast.error('El factor es obligatorio para T.exiguum')
    const cantidadFinal = esExiguum
      ? Number(notaForm.cantidad) * 12.5 + Number(notaForm.factor)
      : Number(notaForm.cantidad)
    crearNota.mutate(
      { ...notaForm, cantidad: cantidadFinal, factor: esExiguum ? Number(notaForm.factor) : 1, id_unidad: notaForm.id_unidad ? Number(notaForm.id_unidad) : null },
      { onSuccess: () => { setShowNotaModal(false); setNotaForm({ fecha: '', tiposalida: 'T.exiguum', descripcion: '', id_unidad: '', factor: '1', cantidad: '' }) } }
    )
  }

  const pedirConfirm = (id: number, tipo: 'produccion' | 'nota', extra?: string) => {
    const base = tipo === 'produccion' ? 'Se anulará este registro de producción. Podrás eliminarlo permanentemente después.' : 'Se anulará esta nota de salida.'
    setConfirm({ id, tipo, accion: 'anular', mensaje: base + (extra ? ` ${extra}` : '') })
  }

  const pedirConfirmEliminar = (id: number, tipo: 'produccion' | 'nota', extra?: string) => {
    const base = tipo === 'produccion' ? 'Esto borrará el registro de producción de forma permanente.' : 'Esto borrará la nota de salida de forma permanente.'
    setConfirm({ id, tipo, accion: 'eliminar', mensaje: base + (extra ? ` ${extra}` : '') + ' No se puede deshacer.' })
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
          { label: 'ID', value: detail.data.id },
          { label: 'Fecha', value: detail.data.fecha },
          { label: 'Cantidad (g)', value: detail.data.cantidad },
          { label: 'Unidad', value: detail.data.id_unidad },
          { label: 'Estado', value: <Badge activo={detail.data.activo} /> },
          { label: 'Registrado por', value: detail.data.registrado_por },
          { label: 'Creado en', value: fmt(detail.data.creado_en) },
          { label: 'Anulado por', value: detail.data.anulado_por },
          { label: 'Anulado en', value: fmt(detail.data.anulado_en) },
        ]
      : [
          { label: 'ID', value: detail.data.id },
          { label: 'Fecha', value: detail.data.fecha },
          { label: 'Tipo de salida', value: <TipoBadge tipo={detail.data.tiposalida} /> },
          { label: 'Cantidad', value: detail.data.cantidad },
          { label: 'Factor', value: detail.data.tiposalida === 'T.exiguum' ? detail.data.factor : null },
          { label: 'Descripción', value: detail.data.descripcion },
          { label: 'Estado', value: <Badge activo={detail.data.activo} /> },
          { label: 'Registrado por', value: detail.data.registrado_por },
          { label: 'Creado en', value: fmt(detail.data.creado_en) },
          { label: 'Anulado por', value: detail.data.anulado_por },
          { label: 'Anulado en', value: fmt(detail.data.anulado_en) },
        ]
    : []

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
        .vs-btn--warn:hover { opacity: .88; }
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
        .vs-tabs { display: flex; gap: 2px; border-bottom: 1px solid var(--vs-border); margin-bottom: 20px; }
        .vs-tab { padding: 9px 18px; font-size: .88rem; font-weight: 500; border: none; background: none; cursor: pointer; color: var(--vs-text-muted); border-bottom: 2px solid transparent; margin-bottom: -1px; transition: color .15s; display: flex; align-items: center; gap: 8px; }
        .vs-tab:hover { color: var(--vs-text-secondary); }
        .vs-tab.active { color: var(--vs-primary); border-color: var(--vs-primary); font-weight: 600; }
        .vs-tab-badge { background: var(--vs-neutral-soft); color: var(--vs-text-muted); font-size: .65rem; font-weight: 700; padding: 1px 7px; border-radius: 10px; }
        .vs-tab.active .vs-tab-badge { background: var(--vs-primary-soft); color: var(--vs-primary); }
        .vs-page-btn { width: 30px; height: 30px; border-radius: 6px; border: 1px solid var(--vs-border); background: var(--vs-bg-card); font-size: .82rem; cursor: pointer; color: var(--vs-text-secondary); transition: all .12s; }
        .vs-page-btn:hover:not(:disabled) { background: var(--vs-neutral-soft); }
        .vs-page-btn.active { background: var(--vs-primary); border-color: var(--vs-primary); color: #fff; font-weight: 600; }
        .vs-page-btn:disabled { opacity: .35; cursor: not-allowed; }
        .vs-form-label { display: block; font-size: .8rem; font-weight: 600; color: var(--vs-text-secondary); margin-bottom: 5px; }
        .vs-input { width: 100%; padding: 8px 12px; font-size: .88rem; border: 1px solid var(--vs-border); border-radius: 8px; background: #fff; color: var(--vs-text-primary); transition: border-color .15s; box-sizing: border-box; }
        .vs-input:focus { outline: none; border-color: var(--vs-primary); box-shadow: 0 0 0 3px rgba(22,163,74,.1); }
        .vs-action-btn { padding: 4px 10px; border-radius: 6px; font-size: .75rem; font-weight: 500; border: 1px solid; cursor: pointer; transition: all .12s; display: inline-flex; align-items: center; gap: 4px; }
        .vs-action-btn:active { transform: scale(.96); }
        .vs-action-btn--view { border-color: var(--vs-border); background: transparent; color: var(--vs-text-muted); }
        .vs-action-btn--view:hover { border-color: var(--vs-text-secondary); color: var(--vs-text-secondary); }
        .vs-action-btn--anular { border-color: #fca5a5; background: transparent; color: var(--vs-danger); }
        .vs-action-btn--anular:hover { background: var(--vs-danger-soft); }
        .vs-action-btn--delete { border-color: var(--vs-danger); background: var(--vs-danger); color: #fff; }
        .vs-action-btn--delete:hover { opacity: .85; }
        .vs-detail-grid { display: flex; flex-direction: column; gap: 0; }
        .vs-detail-row { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--vs-border); }
        .vs-detail-row:last-child { border-bottom: none; }
        .vs-detail-label { flex: 0 0 140px; font-size: .78rem; font-weight: 600; color: var(--vs-text-muted); }
        .vs-detail-value { font-size: .85rem; color: var(--vs-text-primary); }
        .vs-spinner { display: flex; justify-content: center; padding: 48px 0; }
        .vs-alert-info { background: var(--vs-primary-soft); border: 1px solid #86efac; border-radius: 8px; padding: 8px 12px; font-size: .83rem; color: var(--vs-success); display: flex; align-items: center; gap: 6px; }
        .vs-alert-purple { background: #ede9fe; border: 1px solid #c4b5fd; border-radius: 8px; padding: 8px 12px; font-size: .83rem; color: #7c3aed; display: flex; align-items: center; gap: 6px; }
        .vs-formula-box { background: var(--vs-bg-page); border: 1px solid var(--vs-border); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
        .vs-modal-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; max-height: 65vh; overflow-y: auto; }
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
          title={detail.tipo === 'produccion' ? '🔍 Detalle — Producción Sitotroga' : '🔍 Detalle — Nota de Salida Sitotroga'}
          fields={detailFields}
          onClose={() => setDetail(null)}
        />
      )}

      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontWeight: 700, fontSize: '1.4rem', color: 'var(--vs-text-primary)' }}>
            🌾 Sitotroga cerealella
          </h1>
          <p style={{ margin: '3px 0 0', fontSize: '.83rem', color: 'var(--vs-text-muted)' }}>
            Huevos — unidad: gramos
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="vs-btn vs-btn--ghost" onClick={() => setShowNotaModal(true)}>
            ↗ Nota de Salida
          </button>
          <button className="vs-btn vs-btn--primary" onClick={() => setShowModal(true)}>
            + Registrar Producción
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        <MetricCard icon="📦" label="Total registros" value={registros.length} color="#16a34a" />
        <MetricCard icon="✅" label="Activos" value={totalActivos} color="#15803d" />
        <MetricCard icon="❌" label="Anulados" value={totalAnulados} color="#dc2626" />
        <MetricCard icon="📋" label="Notas activas" value={notasActivas} color="#d97706" />
      </div>

      {/* Tabs */}
      <div className="vs-tabs">
        <button className={`vs-tab ${tab === 'produccion' ? 'active' : ''}`} onClick={() => { setTab('produccion'); prodPag.setPage(1) }}>
          📦 Producción
          <span className="vs-tab-badge">{registros.length}</span>
        </button>
        <button className={`vs-tab ${tab === 'notas' ? 'active' : ''}`} onClick={() => { setTab('notas'); notasPag.setPage(1) }}>
          📋 Notas de Salida
          <span className="vs-tab-badge">{notas.length}</span>
        </button>
      </div>

      {/* Tab: Producción */}
      {tab === 'produccion' && (
        <div className="vs-card">
          {isLoading
            ? <div className="vs-spinner"><div className="spinner-border text-success" /></div>
            : <>
                <table className="vs-table">
                  <thead>
                    <tr>
                      <th style={{ width: 44 }}>#</th>
                      <th>Fecha</th>
                      <th>Cantidad (g)</th>
                      <th>Unidad</th>
                      <th>Estado</th>
                      <th style={{ width: 140, textAlign: 'right', paddingRight: 16 }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prodPag.slice.length === 0
                      ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--vs-text-muted)' }}>Sin registros aún</td></tr>
                      : prodPag.slice.map((r: any, index: number) => (
                          <tr key={r.id}>
                            <td style={{ color: 'var(--vs-text-muted)', fontSize: '.78rem' }}>{(prodPag.page - 1) * PAGE_SIZE + index + 1}</td>
                            <td style={{ fontWeight: 500, color: 'var(--vs-text-primary)' }}>{r.fecha}</td>
                            <td>{Number(r.cantidad).toLocaleString('es-PE', { maximumFractionDigits: 2 })}</td>
                            <td style={{ color: r.id_unidad ? 'var(--vs-text-primary)' : 'var(--vs-text-muted)' }}>{r.id_unidad ?? '—'}</td>
                            <td><Badge activo={r.activo} /></td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                                <button className="vs-action-btn vs-action-btn--view" onClick={() => setDetail({ data: r, tipo: 'produccion' })} title="Ver detalle">👁 Ver</button>
                                {r.activo ? (
                                  <button className="vs-action-btn vs-action-btn--anular" disabled={anular.isPending}
                                    onClick={() => pedirConfirm(r.id, 'produccion')}>
                                    Anular
                                  </button>
                                ) : (
                                  <button className="vs-action-btn vs-action-btn--delete" disabled={eliminar.isPending}
                                    onClick={() => pedirConfirmEliminar(r.id, 'produccion')}>
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
        <div className="vs-card">
          <table className="vs-table">
            <thead>
              <tr>
                <th style={{ width: 44 }}>#</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Factor</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th style={{ width: 140, textAlign: 'right', paddingRight: 16 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {notasPag.slice.length === 0
                ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--vs-text-muted)' }}>Sin notas de salida aún</td></tr>
                : notasPag.slice.map((n: any, index: number) => (
                    <tr key={n.id}>
                      <td style={{ color: 'var(--vs-text-muted)', fontSize: '.78rem' }}>{(notasPag.page - 1) * PAGE_SIZE + index + 1}</td>
                      <td style={{ fontWeight: 500, color: 'var(--vs-text-primary)' }}>{n.fecha}</td>
                      <td><TipoBadge tipo={n.tiposalida} /></td>
                      <td>{Number(n.cantidad).toLocaleString('es-PE', { maximumFractionDigits: 2 })}</td>
                      <td style={{ color: n.tiposalida === 'T.exiguum' ? 'var(--vs-text-primary)' : 'var(--vs-text-muted)' }}>
                        {n.tiposalida === 'T.exiguum' ? n.factor : '—'}
                      </td>
                      <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--vs-text-muted)' }}>{n.descripcion ?? '—'}</td>
                      <td><Badge activo={n.activo} /></td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                          <button className="vs-action-btn vs-action-btn--view" onClick={() => setDetail({ data: n, tipo: 'nota' })} title="Ver detalle">👁 Ver</button>
                          {n.activo ? (
                            <button className="vs-action-btn vs-action-btn--anular" disabled={anularNota.isPending}
                              onClick={() => pedirConfirm(n.id, 'nota', n.tiposalida === 'T.exiguum' ? 'También se revertirá el registro de Trichogramma generado.' : '')}>
                              Anular
                            </button>
                          ) : (
                            <button className="vs-action-btn vs-action-btn--delete" disabled={eliminarNota.isPending}
                              onClick={() => pedirConfirmEliminar(n.id, 'nota', n.tiposalida === 'T.exiguum' ? 'También se eliminará el registro de Trichogramma generado.' : '')}>
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

      {/* Modal: Nuevo Registro de Producción */}
      {showModal && (
        <div className="vs-overlay">
          <div className="vs-dialog">
            <div className="vs-dialog__head">
              <h5 style={{ margin: 0, fontWeight: 600, fontSize: '.95rem' }}>📦 Nuevo registro — Sitotroga</h5>
              <button className="vs-icon-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="vs-modal-body">
                <div>
                  <label className="vs-form-label">Fecha *</label>
                  <input type="date" className="vs-input" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} required />
                </div>
                <div>
                  <label className="vs-form-label">Cantidad (g) *</label>
                  <input type="number" step="0.01" className="vs-input" placeholder="Ej. 250" value={form.cantidad} onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))} required />
                </div>
                <div>
                  <label className="vs-form-label">Unidad de medida</label>
                  <select className="vs-input" value={form.id_unidad} onChange={e => setForm(f => ({ ...f, id_unidad: e.target.value }))}>
                    <option value="">— Seleccionar unidad —</option>
                    {unidades.map((u: any) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div className="vs-dialog__foot">
                <button type="button" className="vs-btn vs-btn--ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="vs-btn vs-btn--primary" disabled={crear.isPending}>
                  {crear.isPending ? '⏳ Guardando...' : '✓ Guardar registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nota de Salida */}
      {showNotaModal && (
        <div className="vs-overlay">
          <div className="vs-dialog">
            <div className="vs-dialog__head">
              <h5 style={{ margin: 0, fontWeight: 600, fontSize: '.95rem' }}>📋 Nota de Salida — Sitotroga</h5>
              <button className="vs-icon-btn" onClick={() => setShowNotaModal(false)}>✕</button>
            </div>
            <form onSubmit={handleNotaSubmit}>
              <div className="vs-modal-body">
                <div>
                  <label className="vs-form-label">Fecha *</label>
                  <input type="date" className="vs-input" value={notaForm.fecha} onChange={e => setNotaForm(f => ({ ...f, fecha: e.target.value }))} required />
                </div>

                <div>
                  <label className="vs-form-label">Tipo de salida *</label>
                  <select className="vs-input" value={notaForm.tiposalida}
                    onChange={e => setNotaForm(f => ({ ...f, tiposalida: e.target.value, factor: '1', cantidad: '' }))}>
                    <option value="T.exiguum">🐝 T. exiguum</option>
                    <option value="T.pretiosum">🐝 T. pretiosum</option>
                    <option value="Crysopas">🦟 Crysopas</option>
                    <option value="Infestación">⚠️ Infestación</option>
                    <option value="Ventas">💰 Ventas</option>
                  </select>
                </div>

                <div>
                  <label className="vs-form-label">{esExiguum ? 'Planchas *' : 'Cantidad (g) *'}</label>
                  <input type="number" step="0.01" className="vs-input"
                    placeholder={esExiguum ? 'Ej. 20' : 'Ej. 250'}
                    value={notaForm.cantidad}
                    onChange={e => setNotaForm(f => ({ ...f, cantidad: e.target.value }))}
                    required
                  />
                </div>

                {/* Bloque especial T.exiguum */}
                {esExiguum && (
                  <div className="vs-formula-box">
                    <div>
                      <label className="vs-form-label">Factor *</label>
                      <input type="number" step="0.01" className="vs-input"
                        placeholder="Ej. 1"
                        value={notaForm.factor}
                        onChange={e => setNotaForm(f => ({ ...f, factor: e.target.value }))}
                        required
                      />
                      <p style={{ margin: '5px 0 0', fontSize: '.75rem', color: 'var(--vs-text-muted)' }}>
                        Fórmula: planchas × 12.5 + factor = gramos descontados
                      </p>
                    </div>

                    {notaForm.cantidad && (
                      <>
                        <div className="vs-alert-info">
                          🌾 <strong>{cantidadConvertida?.toLocaleString('es-PE', { maximumFractionDigits: 2 })} g</strong> descontados de Sitotroga
                        </div>
                        <div className="vs-alert-purple">
                          🐝 También suma <strong>{trichogrammaGenerado?.toLocaleString('es-PE', { maximumFractionDigits: 2 })} pulg²</strong> al saldo de Trichogramma
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div>
                  <label className="vs-form-label">Descripción</label>
                  <textarea className="vs-input" style={{ resize: 'vertical', minHeight: 70 }}
                    placeholder="Observaciones opcionales..."
                    value={notaForm.descripcion}
                    onChange={e => setNotaForm(f => ({ ...f, descripcion: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="vs-form-label">Unidad de medida</label>
                  <select className="vs-input" value={notaForm.id_unidad} onChange={e => setNotaForm(f => ({ ...f, id_unidad: e.target.value }))}>
                    <option value="">— Seleccionar unidad —</option>
                    {unidades.map((u: any) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div className="vs-dialog__foot">
                <button type="button" className="vs-btn vs-btn--ghost" onClick={() => setShowNotaModal(false)}>Cancelar</button>
                <button type="submit" className="vs-btn vs-btn--primary" disabled={crearNota.isPending}>
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
