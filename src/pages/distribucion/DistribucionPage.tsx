import { useState } from 'react'
import {
  useNotasSitodroga, useNotasAvispitas, useNotasMoscas, useNotasGalleria,
  useLugaresAvispitas, useLugaresMoscas,
} from '@/hooks/useProduccion'

type TabKey = 'sitodroga' | 'avispitas' | 'moscas' | 'galleria'

const PAGE_SIZE = 10

/* ─── Pagination hook ─────────────────────────────────────────────────────── */
function usePagination<T>(data: T[]) {
  const [page, setPage] = useState(1)
  const total = Math.ceil(data.length / PAGE_SIZE) || 1
  const slice = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  return { slice, page, total, setPage }
}

/* ─── Pagination UI ───────────────────────────────────────────────────────── */
function Pagination({
  page, total, count, setPage,
}: { page: number; total: number; count: number; setPage: (p: number) => void }) {
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
      <span style={{ fontSize: '.78rem', color: 'var(--vs-text-muted)' }}>
        Página {page} de {total} — {count} registros
      </span>
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

/* ─── Badge de tipo ───────────────────────────────────────────────────────── */
const TIPO_COLORS: Record<string, { bg: string; color: string }> = {
  'T.exiguum':    { bg: 'var(--vs-primary-soft)', color: 'var(--vs-primary)' },
  'T.pretiosum':  { bg: '#ede9fe',                color: '#7c3aed'           },
  'Crysopas':     { bg: 'var(--vs-warn-soft)',    color: 'var(--vs-warn)'    },
  'Infestación':  { bg: 'var(--vs-danger-soft)',  color: 'var(--vs-danger)'  },
  'Ventas':       { bg: 'var(--vs-success-soft)', color: 'var(--vs-success)' },
  'Parasitacion': { bg: 'var(--vs-primary-soft)', color: 'var(--vs-primary)' },
  'Liberacion':   { bg: 'var(--vs-warn-soft)',    color: 'var(--vs-warn)'    },
}

function TipoBadge({ tipo }: { tipo: string }) {
  const c = TIPO_COLORS[tipo] ?? { bg: 'var(--vs-neutral-soft)', color: 'var(--vs-text-muted)' }
  return (
    <span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: 20, fontSize: '.72rem', fontWeight: 600, background: c.bg, color: c.color }}>
      {tipo}
    </span>
  )
}

/* ─── Metric card ─────────────────────────────────────────────────────────── */
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

/* ─── Empty state ─────────────────────────────────────────────────────────── */
function EmptyRow({ cols }: { cols: number }) {
  return (
    <tr>
      <td colSpan={cols} style={{ textAlign: 'center', padding: '48px 0', color: 'var(--vs-text-muted)' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>📭</div>
        <div style={{ fontSize: '.85rem' }}>Sin registros para este período</div>
      </td>
    </tr>
  )
}

/* ─── Main ────────────────────────────────────────────────────────────────── */
export default function DistribucionPage() {
  const [tab, setTab] = useState<TabKey>('sitodroga')
  const [fi, setFi] = useState('')
  const [ff, setFf] = useState('')

  const params = fi && ff ? { fecha_inicio: fi, fecha_fin: ff } : undefined

  const { data: notasSit  = [] } = useNotasSitodroga(params)
  const { data: notasAvis = [] } = useNotasAvispitas(params)
  const { data: notasMosc = [] } = useNotasMoscas(params)
  const { data: notasGall = [] } = useNotasGalleria(params)
  const { data: lugaresAvis = [] } = useLugaresAvispitas()
  const { data: lugaresMosc = [] } = useLugaresMoscas()

  const sitPag  = usePagination(notasSit)
  const avisPag = usePagination(notasAvis)
  const moscPag = usePagination(notasMosc)
  const gallPag = usePagination(notasGall)

  const lugarNombre = (lugares: any[], id: number | null) =>
    lugares.find((l: any) => l.id === id)?.nombre ?? '—'

  const limpiar = () => {
    setFi(''); setFf('')
    sitPag.setPage(1); avisPag.setPage(1); moscPag.setPage(1); gallPag.setPage(1)
  }

  const hayFiltro = fi && ff

  const TABS: { key: TabKey; label: string; icon: string; count: number }[] = [
    { key: 'sitodroga', label: 'Sitotroga',    icon: '🌾', count: notasSit.length  },
    { key: 'avispitas', label: 'Trichogramma', icon: '🐝', count: notasAvis.length },
    { key: 'moscas',    label: 'Paratheresia', icon: '🦟', count: notasMosc.length },
    { key: 'galleria',  label: 'Galleria',     icon: '🦋', count: notasGall.length },
  ]

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
        .vs-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 16px; border-radius: 8px; font-size: .85rem; font-weight: 500; border: none; cursor: pointer; transition: opacity .15s, transform .1s; }
        .vs-btn:active { transform: scale(.97); }
        .vs-btn--ghost { background: transparent; border: 1px solid var(--vs-border); color: var(--vs-text-secondary); }
        .vs-btn--ghost:hover { background: var(--vs-neutral-soft); }
        .vs-form-label { display: block; font-size: .8rem; font-weight: 600; color: var(--vs-text-secondary); margin-bottom: 5px; }
        .vs-input { width: 100%; padding: 8px 12px; font-size: .88rem; border: 1px solid var(--vs-border); border-radius: 8px; background: #fff; color: var(--vs-text-primary); transition: border-color .15s; box-sizing: border-box; }
        .vs-input:focus { outline: none; border-color: var(--vs-primary); box-shadow: 0 0 0 3px rgba(22,163,74,.1); }
        .vs-filter-bar { background: var(--vs-bg-card); border: 1px solid var(--vs-border); border-radius: 12px; padding: 16px 20px; display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
        .vs-filter-field { display: flex; flex-direction: column; min-width: 160px; }
        .vs-filter-pill { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 20px; font-size: .75rem; font-weight: 600; background: var(--vs-primary-soft); color: var(--vs-primary); border: 1px solid #86efac; }
      `}</style>

      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontWeight: 700, fontSize: '1.4rem', color: 'var(--vs-text-primary)' }}>
            📤 Distribución
          </h1>
          <p style={{ margin: '3px 0 0', fontSize: '.83rem', color: 'var(--vs-text-muted)' }}>
            Historial de notas de salida por especie
          </p>
        </div>
        {hayFiltro && (
          <span className="vs-filter-pill">
            📅 {fi} → {ff}
            <button onClick={limpiar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--vs-primary)', fontWeight: 700, fontSize: '.85rem', padding: 0, lineHeight: 1 }}>✕</button>
          </span>
        )}
      </div>

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
        <MetricCard icon="🌾" label="Sitotroga"    value={notasSit.length}  color="#16a34a" />
        <MetricCard icon="🐝" label="Trichogramma" value={notasAvis.length} color="#7c3aed" />
        <MetricCard icon="🦟" label="Paratheresia" value={notasMosc.length} color="#d97706" />
        <MetricCard icon="🦋" label="Galleria"     value={notasGall.length} color="#0ea5e9" />
      </div>

      {/* Filtro de fechas */}
      <div className="vs-filter-bar">
        <div className="vs-filter-field">
          <label className="vs-form-label">Fecha inicio</label>
          <input
            type="date" className="vs-input" value={fi}
            onChange={e => { setFi(e.target.value); sitPag.setPage(1); avisPag.setPage(1); moscPag.setPage(1); gallPag.setPage(1) }}
          />
        </div>
        <div className="vs-filter-field">
          <label className="vs-form-label">Fecha fin</label>
          <input
            type="date" className="vs-input" value={ff}
            onChange={e => { setFf(e.target.value); sitPag.setPage(1); avisPag.setPage(1); moscPag.setPage(1); gallPag.setPage(1) }}
          />
        </div>
        {hayFiltro && (
          <button className="vs-btn vs-btn--ghost" onClick={limpiar} style={{ marginBottom: 1 }}>
            ✕ Limpiar filtro
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="vs-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`vs-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.icon} {t.label}
            <span className="vs-tab-badge">{t.count}</span>
          </button>
        ))}
      </div>

      {/* ── Sitotroga ── */}
      {tab === 'sitodroga' && (
        <div className="vs-card">
          <table className="vs-table">
            <thead>
              <tr>
                <th style={{ width: 44 }}>#</th>
                <th>Fecha</th>
                <th>Tipo de salida</th>
                <th>Cantidad (g)</th>
                <th>Factor</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {sitPag.slice.length === 0
                ? <EmptyRow cols={6} />
                : sitPag.slice.map((n: any, i: number) => (
                  <tr key={n.id}>
                    <td style={{ color: 'var(--vs-text-muted)', fontSize: '.78rem' }}>{(sitPag.page - 1) * PAGE_SIZE + i + 1}</td>
                    <td style={{ fontWeight: 500, color: 'var(--vs-text-primary)' }}>{n.fecha}</td>
                    <td><TipoBadge tipo={n.tiposalida} /></td>
                    <td>{Number(n.cantidad).toLocaleString('es-PE', { maximumFractionDigits: 2 })}</td>
                    <td style={{ color: n.tiposalida === 'T.exiguum' ? 'var(--vs-text-primary)' : 'var(--vs-text-muted)' }}>
                      {n.tiposalida === 'T.exiguum' ? n.factor : '—'}
                    </td>
                    <td style={{ color: 'var(--vs-text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {n.descripcion ?? '—'}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          <div style={{ padding: '0 4px 4px' }}>
            <Pagination page={sitPag.page} total={sitPag.total} count={notasSit.length} setPage={sitPag.setPage} />
          </div>
        </div>
      )}

      {/* ── Trichogramma ── */}
      {tab === 'avispitas' && (
        <div className="vs-card">
          <table className="vs-table">
            <thead>
              <tr>
                <th style={{ width: 44 }}>#</th>
                <th>Fecha</th>
                <th>Tipo de salida</th>
                <th>Lugar</th>
                <th>Cantidad (pulg²)</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {avisPag.slice.length === 0
                ? <EmptyRow cols={6} />
                : avisPag.slice.map((n: any, i: number) => (
                  <tr key={n.id}>
                    <td style={{ color: 'var(--vs-text-muted)', fontSize: '.78rem' }}>{(avisPag.page - 1) * PAGE_SIZE + i + 1}</td>
                    <td style={{ fontWeight: 500, color: 'var(--vs-text-primary)' }}>{n.fecha}</td>
                    <td><TipoBadge tipo={n.tiposalida} /></td>
                    <td style={{ color: n.id_lugarliberacion ? 'var(--vs-text-primary)' : 'var(--vs-text-muted)' }}>
                      {lugarNombre(lugaresAvis, n.id_lugarliberacion)}
                    </td>
                    <td>{Number(n.cantidad).toLocaleString('es-PE', { maximumFractionDigits: 2 })}</td>
                    <td style={{ color: 'var(--vs-text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {n.descripcion ?? '—'}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          <div style={{ padding: '0 4px 4px' }}>
            <Pagination page={avisPag.page} total={avisPag.total} count={notasAvis.length} setPage={avisPag.setPage} />
          </div>
        </div>
      )}

      {/* ── Paratheresia ── */}
      {tab === 'moscas' && (
        <div className="vs-card">
          <table className="vs-table">
            <thead>
              <tr>
                <th style={{ width: 44 }}>#</th>
                <th>Fecha</th>
                <th>Tipo de salida</th>
                <th>Lugar</th>
                <th>Cantidad (parejas)</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {moscPag.slice.length === 0
                ? <EmptyRow cols={6} />
                : moscPag.slice.map((n: any, i: number) => (
                  <tr key={n.id}>
                    <td style={{ color: 'var(--vs-text-muted)', fontSize: '.78rem' }}>{(moscPag.page - 1) * PAGE_SIZE + i + 1}</td>
                    <td style={{ fontWeight: 500, color: 'var(--vs-text-primary)' }}>{n.fecha}</td>
                    <td><TipoBadge tipo={n.tiposalida} /></td>
                    <td style={{ color: n.id_lugarliberacion ? 'var(--vs-text-primary)' : 'var(--vs-text-muted)' }}>
                      {lugarNombre(lugaresMosc, n.id_lugarliberacion)}
                    </td>
                    <td>{Number(n.cantidad).toLocaleString('es-PE', { maximumFractionDigits: 2 })}</td>
                    <td style={{ color: 'var(--vs-text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {n.descripcion ?? '—'}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          <div style={{ padding: '0 4px 4px' }}>
            <Pagination page={moscPag.page} total={moscPag.total} count={notasMosc.length} setPage={moscPag.setPage} />
          </div>
        </div>
      )}

      {/* ── Galleria ── */}
      {tab === 'galleria' && (
        <div className="vs-card">
          <table className="vs-table">
            <thead>
              <tr>
                <th style={{ width: 44 }}>#</th>
                <th>Fecha</th>
                <th>Tipo de salida</th>
                <th>Cantidad</th>
                <th>Ratio</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {gallPag.slice.length === 0
                ? <EmptyRow cols={6} />
                : gallPag.slice.map((n: any, i: number) => (
                  <tr key={n.id}>
                    <td style={{ color: 'var(--vs-text-muted)', fontSize: '.78rem' }}>{(gallPag.page - 1) * PAGE_SIZE + i + 1}</td>
                    <td style={{ fontWeight: 500, color: 'var(--vs-text-primary)' }}>{n.fecha}</td>
                    <td><TipoBadge tipo={n.tiposalida} /></td>
                    <td>{Number(n.cantidad).toLocaleString('es-PE', { maximumFractionDigits: 2 })}</td>
                    <td style={{ color: n.ratio != null ? 'var(--vs-text-primary)' : 'var(--vs-text-muted)' }}>
                      {n.ratio ?? '—'}
                    </td>
                    <td style={{ color: 'var(--vs-text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {n.descripcion ?? '—'}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          <div style={{ padding: '0 4px 4px' }}>
            <Pagination page={gallPag.page} total={gallPag.total} count={notasGall.length} setPage={gallPag.setPage} />
          </div>
        </div>
      )}
    </>
  )
}
