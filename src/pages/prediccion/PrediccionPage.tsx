import { useState, useReducer, useEffect, useCallback } from 'react'
import {
  usePrediccionTodas,
  useModeloConfig,
  useUpdateModeloConfig,
  useModeloKpis,
  useEntrenarModelo,
} from '@/hooks/usePrediccion'

// ── Tipos ──────────────────────────────────────────────────────────────────────
interface PrediccionDia {
  fecha: string
  demanda_estimada: number
  produccion_necesaria: number
}

interface BalanceDia {
  fecha: string
  produccion_esperada: number
  demanda_total_esperada: number
  balance: number
  estado: 'superávit' | 'déficit'
}

interface ModeloInfo {
  r2_score: number | null
  mae: number | null
  rmse: number | null
  n_registros: number | null
  entrenado_en: string
}

interface ResultadoEspecie {
  especie: string
  unidad: string
  auto_train_activo: boolean
  rango_meses: number
  modelo_info: ModeloInfo
  prediccion_produccion: {
    r2_score: number
    tendencia: string
    promedio_historico: number
    predicciones: PrediccionDia[]
  }
  prediccion_por_destino: Record<string, { predicciones?: PrediccionDia[]; error?: string }>
  balance: BalanceDia[]
  error?: string
}

interface ModeloConfigRow {
  especie: string
  activo: boolean
  rango_meses: number
  ultimo_r2: number | null
  ultimo_entreno: string | null
}

interface LogRow {
  entrenado_en: string
  r2_score: number
  mae: number
  rmse: number
  n_registros: number
  fue_reemplazado: boolean
  motivo_rechazo: string | null
}

// ── Constantes ─────────────────────────────────────────────────────────────────
const ESPECIES = [
  { key: 'sitotroga',    label: 'Sitotroga',    unidad: 'g',       color: '#16a34a', light: '#f0fdf4', icon: '🌾' },
  { key: 'trichogramma', label: 'Trichogramma', unidad: 'pulg²',   color: '#0284c7', light: '#f0f9ff', icon: '🐝' },
  { key: 'galleria',     label: 'Galleria',     unidad: 'unid.',   color: '#9333ea', light: '#faf5ff', icon: '🦋' },
  { key: 'paratheresia', label: 'Paratheresia', unidad: 'parejas', color: '#ea580c', light: '#fff7ed', icon: '🪰' },
] as const

const PAGE_SIZE = 10

// ── Utilidades ─────────────────────────────────────────────────────────────────
function fmt(n: number | null | undefined): string {
  if (n == null) return '—'
  return Number.isInteger(n) ? String(n) : n.toFixed(3)
}

function fmtFecha(iso: string): string {
  return iso?.slice(0, 10) ?? '—'
}

function r2Color(v: number | null): string {
  if (v == null) return '#9ca3af'
  if (v >= 0.85) return '#16a34a'
  if (v >= 0.6)  return '#ea580c'
  return '#dc2626'
}

function paginar<T>(data: T[], pagina: number): T[] {
  return data.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE)
}

// ── Tipos paginación ──────────────────────────────────────────────────────────
type PagState  = Record<string, number>
type PagAction = { key: string; page: number } | { type: 'reset' }

function pagReducer(state: PagState, action: PagAction): PagState {
  if ('type' in action && action.type === 'reset')
    return Object.fromEntries(ESPECIES.map(e => [e.key, 1]))
  const a = action as { key: string; page: number }
  return { ...state, [a.key]: a.page }
}

// ── CSS global ────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @keyframes fadeUp   { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:none } }
  @keyframes spin     { to { transform: rotate(360deg) } }
  @keyframes pulse    { 0%,100% { opacity:1 } 50% { opacity:.5 } }
  @keyframes shimmer  { from { background-position:-200% 0 } to { background-position:200% 0 } }

  .pred-card      { animation: fadeUp .35s ease both }
  .pred-card:nth-child(2) { animation-delay:.05s }
  .pred-card:nth-child(3) { animation-delay:.10s }
  .pred-card:nth-child(4) { animation-delay:.15s }

  .pred-tab-btn   { transition: background .15s, color .15s, box-shadow .15s }
  .pred-tab-btn:hover:not(.active) { background: #f3f4f6 !important }

  .pred-btn-primary { transition: opacity .15s, transform .1s }
  .pred-btn-primary:hover:not(:disabled) { opacity:.9 }
  .pred-btn-primary:active:not(:disabled) { transform: scale(.98) }

  .pred-toggle    { transition: background .2s }
  .pred-toggle-thumb { transition: left .2s }

  .pred-row:hover { background: #f9fafb !important }

  .pred-skeleton  {
    background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
    background-size: 200% 100%;
    animation: shimmer 1.2s infinite;
    border-radius: 6px;
  }
`

// ── Paginador ─────────────────────────────────────────────────────────────────
function Paginador({ total, pagina, onChange }: { total: number; pagina: number; onChange: (p: number) => void }) {
  const totalPags = Math.ceil(total / PAGE_SIZE)
  if (totalPags <= 1) return null

  const pages = Array.from({ length: totalPags }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPags || Math.abs(p - pagina) <= 1)
    .reduce<(number | '...')[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...')
      acc.push(p); return acc
    }, [])

  const btnStyle = (active: boolean, disabled: boolean): React.CSSProperties => ({
    padding: '4px 10px', borderRadius: 6,
    border: `1px solid ${active ? '#16a34a' : '#e5e7eb'}`,
    background: active ? '#16a34a' : disabled ? '#f9fafb' : '#fff',
    color: active ? '#fff' : disabled ? '#d1d5db' : '#374151',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 12, fontWeight: active ? 600 : 400,
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
      <span style={{ fontSize: 12, color: '#9ca3af' }}>
        Pág. {pagina} de {totalPags} · {total} registros
      </span>
      <div style={{ display: 'flex', gap: 4 }}>
        <button onClick={() => onChange(1)}         disabled={pagina === 1}         style={btnStyle(false, pagina === 1)}>«</button>
        <button onClick={() => onChange(pagina - 1)} disabled={pagina === 1}         style={btnStyle(false, pagina === 1)}>‹</button>
        {pages.map((p, i) =>
          p === '...'
            ? <span key={`e${i}`} style={{ padding: '4px 8px', color: '#9ca3af', fontSize: 12 }}>…</span>
            : <button key={p} onClick={() => onChange(p as number)} style={btnStyle(pagina === p, false)}>{p}</button>
        )}
        <button onClick={() => onChange(pagina + 1)} disabled={pagina === totalPags} style={btnStyle(false, pagina === totalPags)}>›</button>
        <button onClick={() => onChange(totalPags)} disabled={pagina === totalPags} style={btnStyle(false, pagina === totalPags)}>»</button>
      </div>
    </div>
  )
}

// ── Chip / Badge ──────────────────────────────────────────────────────────────
function Chip({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 20,
      background: bg, color, fontSize: 11, fontWeight: 600,
      border: `1px solid ${color}25`,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }: { label: string; value: string | number | null; sub?: string; color?: string }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
      padding: '12px 16px', textAlign: 'center', minWidth: 80, flex: '1 1 80px',
    }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: color ?? '#111827', letterSpacing: -0.5, lineHeight: 1 }}>
        {value ?? '—'}
      </div>
      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

// ── Barra R² ──────────────────────────────────────────────────────────────────
function R2Bar({ value }: { value: number | null }) {
  const pct = Math.max(0, Math.min(100, (value ?? 0) * 100))
  const col  = r2Color(value)
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: '#6b7280' }}>Calidad del modelo (R²)</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: col }}>{fmt(value)}</span>
      </div>
      <div style={{ height: 6, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: col, transition: 'width .6s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        <span style={{ fontSize: 10, color: '#dc2626' }}>Malo &lt;0.6</span>
        <span style={{ fontSize: 10, color: '#ea580c' }}>Regular 0.6–0.85</span>
        <span style={{ fontSize: 10, color: '#16a34a' }}>Excelente ≥0.85</span>
      </div>
    </div>
  )
}

// ── Panel KPIs ────────────────────────────────────────────────────────────────
function KpisPanel({ especie, color }: { especie: string; color: string }) {
  const [open, setOpen] = useState(false)
  const { data, isLoading } = useModeloKpis(especie)
  const logs: LogRow[] = data ?? []

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
          color: '#374151', fontSize: 13, fontWeight: 600, padding: '8px 0',
        }}
      >
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 24, height: 24, borderRadius: 6, background: color + '18', color, fontSize: 14,
        }}>📊</span>
        Historial de KPIs del modelo
        <span style={{
          fontSize: 10, color: '#9ca3af',
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform .2s', display: 'inline-block', marginLeft: 2,
        }}>▼</span>
      </button>

      {open && (
        <div style={{ marginTop: 12, animation: 'fadeUp .2s ease' }}>
          {isLoading && (
            <div style={{ display: 'flex', gap: 8 }}>
              {[80, 80, 80, 80].map((w, i) => (
                <div key={i} className="pred-skeleton" style={{ height: 64, width: w }} />
              ))}
            </div>
          )}

          {!isLoading && logs.length === 0 && (
            <div style={{
              background: '#f9fafb', border: '1px dashed #e5e7eb',
              borderRadius: 10, padding: '16px 20px', color: '#9ca3af', fontSize: 13,
            }}>
              Sin historial de entrenamientos aún.
            </div>
          )}

          {!isLoading && logs.length > 0 && (() => {
            const ult = logs[0]
            return (
              <>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  <StatCard label="R²"        value={fmt(ult.r2_score)}   sub="Ajuste"           color={r2Color(ult.r2_score)} />
                  <StatCard label="MAE"       value={fmt(ult.mae)}        sub="Error medio" />
                  <StatCard label="RMSE"      value={fmt(ult.rmse)}       sub="Error cuadrático" />
                  <StatCard label="Registros" value={ult.n_registros}     sub="Datos usados"     color={color} />
                  <div style={{
                    background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
                    padding: '12px 16px', textAlign: 'center', flex: '1 1 90px',
                  }}>
                    <div style={{ marginBottom: 4 }}>
                      <Chip
                        label={ult.fue_reemplazado ? '✓ Guardado' : '✗ Rechazado'}
                        bg={ult.fue_reemplazado ? '#dcfce7' : '#fef3c7'}
                        color={ult.fue_reemplazado ? '#15803d' : '#92400e'}
                      />
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>Estado</div>
                    <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{fmtFecha(ult.entrenado_en)}</div>
                  </div>
                </div>

                <R2Bar value={ult.r2_score} />

                {logs.length > 1 && (
                  <div style={{ marginTop: 16, overflowX: 'auto' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                      Historial completo ({logs.length} entrenamientos)
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead>
                        <tr style={{ background: '#f9fafb' }}>
                          {['Fecha', 'R²', 'MAE', 'RMSE', 'Registros', 'Estado', 'Motivo rechazo'].map(h => (
                            <th key={h} style={{
                              padding: '8px 12px', textAlign: 'left', color: '#6b7280',
                              fontWeight: 600, borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap',
                            }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log, i) => (
                          <tr key={i} className="pred-row" style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '8px 12px', whiteSpace: 'nowrap', color: '#374151' }}>
                              {log.entrenado_en?.slice(0, 16).replace('T', ' ')}
                            </td>
                            <td style={{ padding: '8px 12px', fontWeight: 700, color: r2Color(log.r2_score) }}>
                              {fmt(log.r2_score)}
                            </td>
                            <td style={{ padding: '8px 12px', color: '#374151' }}>{fmt(log.mae)}</td>
                            <td style={{ padding: '8px 12px', color: '#374151' }}>{fmt(log.rmse)}</td>
                            <td style={{ padding: '8px 12px', color: '#374151' }}>{log.n_registros}</td>
                            <td style={{ padding: '8px 12px' }}>
                              <Chip
                                label={log.fue_reemplazado ? '✓ Guardado' : '✗ Rechazado'}
                                bg={log.fue_reemplazado ? '#dcfce7' : '#fef3c7'}
                                color={log.fue_reemplazado ? '#15803d' : '#92400e'}
                              />
                            </td>
                            <td style={{ padding: '8px 12px', color: '#9ca3af', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {log.motivo_rechazo ?? '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )
          })()}
        </div>
      )}
    </div>
  )
}

// ── Tabla genérica de predicciones ────────────────────────────────────────────
function TablaPredicciones({ predicciones, unidad }: { predicciones: PrediccionDia[]; unidad: string }) {
  const [pagina, setPagina] = useState(1)
  if (!predicciones?.length) return (
    <div style={{ color: '#9ca3af', fontSize: 13, padding: '12px 0' }}>Sin predicciones disponibles.</div>
  )
  return (
    <>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Fecha', `Demanda est. (${unidad})`, `Prod. necesaria (${unidad})`].map(h => (
                <th key={h} style={{
                  padding: '10px 14px', textAlign: 'left', color: '#6b7280',
                  fontWeight: 600, borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginar(predicciones, pagina).map((p, i) => (
              <tr key={p.fecha} className="pred-row" style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '10px 14px', color: '#374151' }}>{p.fecha}</td>
                <td style={{ padding: '10px 14px', color: '#374151' }}>{fmt(p.demanda_estimada)}</td>
                <td style={{ padding: '10px 14px', fontWeight: 700, color: '#111827' }}>{fmt(p.produccion_necesaria)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Paginador total={predicciones.length} pagina={pagina} onChange={setPagina} />
    </>
  )
}

// ── Tabla Balance ─────────────────────────────────────────────────────────────
function TablaBalance({ balance, unidad }: { balance: BalanceDia[]; unidad: string }) {
  const [pagina, setPagina] = useState(1)
  if (!balance?.length) return (
    <div style={{ color: '#9ca3af', fontSize: 13, padding: '12px 0' }}>
      Sin datos de balance. Se necesitan predicciones de producción y salidas.
    </div>
  )

  const superavit = balance.filter(b => b.estado === 'superávit').length
  const deficit   = balance.length - superavit
  const pctOk     = Math.round((superavit / balance.length) * 100)

  return (
    <>
      {/* Resumen */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{
          background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 8,
          padding: '7px 14px', fontSize: 13, color: '#15803d', fontWeight: 600,
        }}>
          ↑ {superavit} días con superávit
        </div>
        <div style={{
          background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8,
          padding: '7px 14px', fontSize: 13, color: '#dc2626', fontWeight: 600,
        }}>
          ↓ {deficit} días con déficit
        </div>
        {/* Mini barra de cobertura */}
        <div style={{ flex: '1 1 120px', minWidth: 120 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontSize: 11, color: '#6b7280' }}>Cobertura</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: pctOk >= 70 ? '#16a34a' : '#ea580c' }}>{pctOk}%</span>
          </div>
          <div style={{ height: 5, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pctOk}%`, borderRadius: 99, background: pctOk >= 70 ? '#16a34a' : '#ea580c', transition: 'width .6s ease' }} />
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Fecha', `Prod. esp. (${unidad})`, `Demanda (${unidad})`, 'Balance', 'Estado'].map(h => (
                <th key={h} style={{
                  padding: '10px 14px', textAlign: 'left', color: '#6b7280',
                  fontWeight: 600, borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginar(balance, pagina).map((b, i) => (
              <tr key={b.fecha} className="pred-row" style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '10px 14px', color: '#374151' }}>{b.fecha}</td>
                <td style={{ padding: '10px 14px', color: '#374151' }}>{fmt(b.produccion_esperada)}</td>
                <td style={{ padding: '10px 14px', color: '#374151' }}>{fmt(b.demanda_total_esperada)}</td>
                <td style={{ padding: '10px 14px', fontWeight: 700, color: b.balance >= 0 ? '#16a34a' : '#dc2626' }}>
                  {b.balance >= 0 ? '+' : ''}{fmt(b.balance)}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <Chip
                    label={b.estado === 'superávit' ? '↑ superávit' : '↓ déficit'}
                    bg={b.estado === 'superávit' ? '#dcfce7' : '#fee2e2'}
                    color={b.estado === 'superávit' ? '#15803d' : '#dc2626'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Paginador total={balance.length} pagina={pagina} onChange={setPagina} />
    </>
  )
}

// ── Tabla Por Destino ─────────────────────────────────────────────────────────
function TablaPorDestino({ destinos, unidad }: {
  destinos: Record<string, { predicciones?: PrediccionDia[]; error?: string }>
  unidad: string
}) {
  const tipos = Object.keys(destinos)
  const [activo, setActivo] = useState(tipos[0] ?? '')
  const [pagina, setPagina] = useState(1)
  const pred = destinos[activo]
  useEffect(() => { setPagina(1) }, [activo])

  if (!tipos.length) return <div style={{ color: '#9ca3af', fontSize: 13 }}>Sin destinos configurados.</div>

  return (
    <>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {tipos.map(t => (
          <button key={t} onClick={() => setActivo(t)} style={{
            padding: '5px 12px', borderRadius: 20, border: '1px solid',
            borderColor: activo === t ? '#16a34a' : '#e5e7eb',
            background: activo === t ? '#16a34a' : '#fff',
            color: activo === t ? '#fff' : '#374151',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>{t}</button>
        ))}
      </div>

      {pred?.error ? (
        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#92400e' }}>
          ⚠️ {pred.error}
        </div>
      ) : pred?.predicciones?.length ? (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Fecha', `Demanda est. (${unidad})`, `Prod. necesaria (${unidad})`].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#6b7280', fontWeight: 600, borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginar(pred.predicciones, pagina).map((p, i) => (
                  <tr key={p.fecha} className="pred-row" style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 14px', color: '#374151' }}>{p.fecha}</td>
                    <td style={{ padding: '10px 14px', color: '#374151' }}>{fmt(p.demanda_estimada)}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#111827' }}>{fmt(p.produccion_necesaria)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Paginador total={pred.predicciones.length} pagina={pagina} onChange={setPagina} />
        </>
      ) : (
        <div style={{ color: '#9ca3af', fontSize: 13 }}>Sin predicciones para este destino.</div>
      )}
    </>
  )
}

// ── Resumen rápido de especie ─────────────────────────────────────────────────
function EspecieResumen({ r, color, unidad }: { r: ResultadoEspecie; color: string; unidad: string }) {
  const pred = r.prediccion_produccion
  const bal  = r.balance ?? []
  const deficit = bal.filter(b => b.estado === 'déficit').length

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
      {pred?.r2_score != null && (
        <Chip label={`R² ${fmt(pred.r2_score)}`} bg={r2Color(pred.r2_score) + '18'} color={r2Color(pred.r2_score)} />
      )}
      {pred?.tendencia && (
        <Chip
          label={`${pred.tendencia === 'creciente' ? '↑' : '↓'} ${pred.tendencia}`}
          bg={pred.tendencia === 'creciente' ? '#f0fdf4' : '#fef2f2'}
          color={pred.tendencia === 'creciente' ? '#15803d' : '#dc2626'}
        />
      )}
      {pred?.promedio_historico != null && (
        <Chip label={`Prom. histórico: ${fmt(pred.promedio_historico)} ${unidad}`} bg="#f9fafb" color="#374151" />
      )}
      {r.modelo_info?.entrenado_en && (
        <Chip label={`🕐 ${fmtFecha(r.modelo_info.entrenado_en)}`} bg="#f0f9ff" color="#0284c7" />
      )}
      {deficit > 0 && (
        <Chip label={`⚠️ ${deficit} días en déficit`} bg="#fee2e2" color="#dc2626" />
      )}
    </div>
  )
}

// ── Tarjeta de Especie ────────────────────────────────────────────────────────
type Tab = 'produccion' | 'destino' | 'balance' | 'kpis'

function EspecieCard({
  label, unidad, color, icon, especieClave, resultado: r, pagina, onPaginaChange,
}: {
  label: string; unidad: string; color: string; icon: string
  especieClave: string
  resultado: ResultadoEspecie
  pagina: number; onPaginaChange: (p: number) => void
}) {
  const [tab, setTab] = useState<Tab>('produccion')

  if (r?.error) return (
    <div className="pred-card" style={{
      background: '#fff', border: '1px solid #fee2e2', borderRadius: 14,
      padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{label}</span>
      </div>
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>
        ⚠️ {r.error}
      </div>
    </div>
  )

  const pred = r.prediccion_produccion

  const TABS: { key: Tab; label: string }[] = [
    { key: 'produccion', label: 'Producción' },
    { key: 'destino',    label: 'Por destino' },
    { key: 'balance',    label: 'Balance' },
    { key: 'kpis',       label: 'KPIs' },
  ]

  return (
    <div className="pred-card" style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14,
      boxShadow: '0 1px 4px rgba(0,0,0,.06)', overflow: 'hidden',
    }}>
      {/* Franja superior de color */}
      <div style={{ height: 3, background: color }} />

      <div style={{ padding: 20 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: color + '18', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
          }}>
            {icon}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#111827', lineHeight: 1 }}>{label}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>{r.especie} · {r.unidad}</div>
          </div>
        </div>

        {/* Chips resumen */}
        <EspecieResumen r={r} color={color} unidad={unidad} />

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 2, marginBottom: 16,
          background: '#f3f4f6', borderRadius: 10, padding: 3,
        }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pred-tab-btn${tab === t.key ? ' active' : ''}`}
              style={{
                flex: 1, padding: '7px 4px', borderRadius: 8, border: 'none',
                background: tab === t.key ? '#fff' : 'transparent',
                color: tab === t.key ? color : '#6b7280',
                fontWeight: tab === t.key ? 700 : 400,
                fontSize: 12, cursor: 'pointer',
                boxShadow: tab === t.key ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenido de tabs */}
        {tab === 'produccion' && (
          <>
            <TablaPredicciones predicciones={pred?.predicciones ?? []} unidad={unidad} />
            {/* la paginación externa (para mantener la página al cambiar días) */}
            {/* Se sobreescribe con la interna de TablaPredicciones — se puede unificar si se desea */}
          </>
        )}
        {tab === 'destino' && r.prediccion_por_destino && (
          <TablaPorDestino destinos={r.prediccion_por_destino} unidad={unidad} />
        )}
        {tab === 'balance' && (
          <TablaBalance balance={r.balance} unidad={unidad} />
        )}
        {tab === 'kpis' && (
          <KpisPanel especie={especieClave} color={color} />
        )}
      </div>
    </div>
  )
}

// ── Panel de entrenamiento ────────────────────────────────────────────────────
function PanelEntrenamiento() {
  const { data: configs, isLoading } = useModeloConfig() as {
    data: ModeloConfigRow[] | undefined; isLoading: boolean
  }
  const { mutate: updateConfig, isPending: isUpdating } = useUpdateModeloConfig()
  const {
    mutate: entrenar,
    isPending: isTraining,
    variables: trainTarget,
  } = useEntrenarModelo()

  const [editRango, setEditRango]     = useState<string | null>(null)
  const [rangoVal,  setRangoVal]      = useState(6)
  const [resultado, setResultado]     = useState<Record<string, any> | null>(null)
  const [collapsed, setCollapsed]     = useState(false)

  const handleEntrenar = useCallback((especie?: string) => {
    setResultado(null)
    entrenar(especie, {
      onSuccess: (res) => setResultado(res),
    })
  }, [entrenar])

  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14,
      marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,.06)', overflow: 'hidden',
    }}>
      {/* Header colapsable */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', cursor: 'pointer', userSelect: 'none',
        }}
        onClick={() => setCollapsed(v => !v)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: '#f0fdf4',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>⚙️</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Entrenamiento de modelos</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              Dispara el entrenamiento manualmente cuando lo necesites
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={e => { e.stopPropagation(); handleEntrenar(undefined) }}
            disabled={isTraining}
            className="pred-btn-primary"
            style={{
              padding: '7px 16px', borderRadius: 8, border: 'none',
              background: isTraining ? '#d1fae5' : '#16a34a',
              color: isTraining ? '#15803d' : '#fff',
              fontWeight: 700, fontSize: 12, cursor: isTraining ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span style={{ display: 'inline-block', animation: isTraining && !trainTarget ? 'spin 1s linear infinite' : 'none' }}>⚙️</span>
            {isTraining && !trainTarget ? 'Entrenando…' : 'Entrenar todas'}
          </button>
          <span style={{
            fontSize: 12, color: '#9ca3af',
            transform: collapsed ? 'rotate(-90deg)' : 'none',
            transition: 'transform .2s', display: 'inline-block',
          }}>▼</span>
        </div>
      </div>

      {/* Cards de especies (colapsable) */}
      {!collapsed && (
        <div style={{ padding: '0 20px 20px' }}>
          {isLoading ? (
            <div style={{ display: 'flex', gap: 10 }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="pred-skeleton" style={{ height: 110, flex: '1 1 150px', borderRadius: 10 }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {configs?.map(cfg => {
                const esp = ESPECIES.find(e => e.key === cfg.especie)
                const isThisTraining = isTraining && trainTarget === cfg.especie
                return (
                  <div key={cfg.especie} style={{
                    background: '#f9fafb', border: '1px solid #e5e7eb',
                    borderRadius: 10, padding: '12px 14px', flex: '1 1 160px',
                    transition: 'border-color .2s',
                  }}>
                    {/* Nombre + último R² */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#111827', textTransform: 'capitalize' }}>
                        {esp?.icon} {cfg.especie}
                      </div>
                      {cfg.ultimo_r2 != null && (
                        <Chip
                          label={`R² ${cfg.ultimo_r2}`}
                          bg={r2Color(cfg.ultimo_r2) + '18'}
                          color={r2Color(cfg.ultimo_r2)}
                        />
                      )}
                    </div>

                    {/* Rango de meses */}
                    {editRango === cfg.especie ? (
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 8 }}>
                        <input
                          type="number" min={1} max={24} value={rangoVal}
                          onChange={e => setRangoVal(parseInt(e.target.value))}
                          onClick={e => e.stopPropagation()}
                          style={{
                            width: 48, padding: '3px 6px', borderRadius: 6,
                            border: '1px solid #d1d5db', fontSize: 12,
                          }}
                        />
                        <span style={{ fontSize: 11, color: '#6b7280' }}>meses</span>
                        <button
                          onClick={e => { e.stopPropagation(); updateConfig({ especie: cfg.especie, data: { rango_meses: rangoVal } }); setEditRango(null) }}
                          style={{ background: esp?.color ?? '#16a34a', color: '#fff', border: 'none', borderRadius: 6, padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}
                        >✓</button>
                        <button
                          onClick={e => { e.stopPropagation(); setEditRango(null) }}
                          style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 6, padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}
                        >✗</button>
                      </div>
                    ) : (
                      <button
                        onClick={e => { e.stopPropagation(); setEditRango(cfg.especie); setRangoVal(cfg.rango_meses) }}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: 11, color: '#6b7280', padding: 0, marginBottom: 8,
                          textDecoration: 'underline dotted', display: 'block',
                        }}
                      >
                        Rango: {cfg.rango_meses} meses ✎
                      </button>
                    )}

                    {/* Botón entrenar individual */}
                    <button
                      onClick={e => { e.stopPropagation(); handleEntrenar(cfg.especie) }}
                      disabled={isTraining}
                      className="pred-btn-primary"
                      style={{
                        width: '100%', padding: '6px 0', borderRadius: 7, border: `1px solid ${esp?.color ?? '#16a34a'}30`,
                        background: isThisTraining ? (esp?.color ?? '#16a34a') + '18' : '#fff',
                        color: esp?.color ?? '#16a34a',
                        fontWeight: 700, fontSize: 12, cursor: isTraining ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                      }}
                    >
                      <span style={{ display: 'inline-block', animation: isThisTraining ? 'spin 1s linear infinite' : 'none' }}>⚙️</span>
                      {isThisTraining ? 'Entrenando…' : 'Entrenar'}
                    </button>

                    {cfg.ultimo_entreno && (
                      <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 6 }}>
                        Último: {fmtFecha(cfg.ultimo_entreno)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Resultado del entrenamiento */}
          {resultado && (
            <div style={{
              marginTop: 14, background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: 10, padding: '12px 16px', fontSize: 12,
              animation: 'fadeUp .3s ease',
            }}>
              <div style={{ fontWeight: 700, color: '#15803d', marginBottom: 6 }}>✓ Entrenamiento completado</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {Object.entries(resultado).map(([esp, res]: [string, any]) => (
                  <div key={esp} style={{ color: '#374151' }}>
                    <strong style={{ textTransform: 'capitalize' }}>{esp}:</strong>{' '}
                    {res?.fue_reemplazado
                      ? <span style={{ color: '#15803d' }}>✓ Guardado — R² {fmt(res.r2_score)}, MAE {fmt(res.mae)}</span>
                      : <span style={{ color: '#92400e' }}>✗ Rechazado — {res?.motivo_rechazo ?? 'datos insuficientes'}</span>
                    }
                  </div>
                ))}
              </div>
              <button
                onClick={() => setResultado(null)}
                style={{
                  marginTop: 8, background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: 11, color: '#6b7280',
                  textDecoration: 'underline', padding: 0,
                }}
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Selector de días ──────────────────────────────────────────────────────────
const ATAJOS = [7, 14, 30, 60, 90, 180] as const

function SelectorDias({
  dias, onCambio, onActualizar, isFetching,
}: {
  dias: number
  onCambio: (n: number) => void
  onActualizar: () => void
  isFetching: boolean
}) {
  const [input, setInput] = useState(String(dias))

  const aplicar = () => {
    const n = parseInt(input)
    if (n > 0 && n <= 365) onCambio(n)
  }

  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14,
      padding: '16px 20px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: .5 }}>
            Días a predecir
          </label>
          <input
            type="number" min={1} max={365} value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && aplicar()}
            style={{
              width: 100, padding: '8px 12px', borderRadius: 8,
              border: '1px solid #d1d5db', fontSize: 14, outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {ATAJOS.map(d => (
            <button
              key={d}
              onClick={() => { setInput(String(d)); onCambio(d) }}
              style={{
                padding: '8px 13px', borderRadius: 8, border: '1px solid',
                borderColor: dias === d ? '#16a34a' : '#e5e7eb',
                background: dias === d ? '#16a34a' : '#fff',
                color: dias === d ? '#fff' : '#374151',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >{d}d</button>
          ))}
        </div>

        <button
          onClick={aplicar}
          style={{
            padding: '8px 20px', borderRadius: 8, border: 'none',
            background: '#111827', color: '#fff', fontWeight: 700,
            fontSize: 13, cursor: 'pointer',
          }}
        >
          Calcular
        </button>

        <button
          onClick={onActualizar}
          style={{
            padding: '8px 13px', borderRadius: 8,
            border: '1px solid #e5e7eb', background: '#fff',
            color: '#374151', fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
          }}
        >
          <span style={{ display: 'inline-block', animation: isFetching ? 'spin 1s linear infinite' : 'none' }}>↺</span>
          Actualizar
        </button>
      </div>
    </div>
  )
}

// ── Banner de alerta global ───────────────────────────────────────────────────
function BannerAlerta({ data }: { data: Record<string, ResultadoEspecie> }) {
  const especiesConDeficit = Object.entries(data)
    .filter(([, r]) => r.balance?.some(b => b.estado === 'déficit'))
    .map(([k]) => ESPECIES.find(e => e.key === k)?.label ?? k)

  if (!especiesConDeficit.length) return null

  return (
    <div style={{
      background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
      padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#dc2626',
      display: 'flex', alignItems: 'center', gap: 10,
      animation: 'fadeUp .3s ease',
    }}>
      <span style={{ fontSize: 18 }}>⚠️</span>
      <div>
        <strong>Déficit proyectado</strong> en: {especiesConDeficit.join(', ')}.
        Revisa la pestaña <strong>Balance</strong> en cada especie afectada.
      </div>
    </div>
  )
}

// ── Skeleton de carga ─────────────────────────────────────────────────────────
function SkeletonCards() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14,
          padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,.05)',
        }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div className="pred-skeleton" style={{ width: 40, height: 40, borderRadius: 10 }} />
            <div style={{ flex: 1 }}>
              <div className="pred-skeleton" style={{ height: 14, width: '30%', marginBottom: 6 }} />
              <div className="pred-skeleton" style={{ height: 11, width: '20%' }} />
            </div>
          </div>
          <div className="pred-skeleton" style={{ height: 36, borderRadius: 10, marginBottom: 14 }} />
          <div className="pred-skeleton" style={{ height: 160, borderRadius: 8 }} />
        </div>
      ))}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function PrediccionPage() {
  const [dias,    setDias]    = useState(30)
  const [pags,    dispatch]   = useReducer(
    pagReducer,
    Object.fromEntries(ESPECIES.map(e => [e.key, 1]))
  )

  const { data, isLoading, refetch, isFetching } = usePrediccionTodas(dias)

  const handleCambioDias = useCallback((n: number) => {
    setDias(n)
    dispatch({ type: 'reset' })
  }, [])

  const totalEsps  = data ? Object.values(data).filter((r: any) => !r.error).length : 0
  const totalPreds = data
    ? Object.values(data).reduce((acc: number, r: any) => acc + (r.prediccion_produccion?.predicciones?.length ?? 0), 0)
    : 0

  return (
    <div style={{ width: '100%', padding: '0 0 40px' }}>
      <style>{GLOBAL_CSS}</style>

      {/* ── Header ── */}
      <div style={{ marginBottom: 24, paddingTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: -0.5 }}>
              Predicción de Demanda
            </h1>
            <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>
              Regresión lineal sobre datos históricos
              {totalEsps > 0 && ` · ${totalEsps} especies activas`}
              {totalPreds > 0 && ` · ${totalPreds} predicciones cargadas`}
            </p>
          </div>
          {/* Indicador de carga */}
          {isFetching && !isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9ca3af' }}>
              <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>↺</span>
              Actualizando…
            </div>
          )}
        </div>
      </div>

      {/* ── Panel de entrenamiento ── */}
      <PanelEntrenamiento />

      {/* ── Selector de días ── */}
      <SelectorDias
        dias={dias}
        onCambio={handleCambioDias}
        onActualizar={() => refetch()}
        isFetching={isFetching}
      />

      {/* ── Alerta déficit ── */}
      {data && <BannerAlerta data={data} />}

      {/* ── Contenido principal ── */}
      {isLoading && <SkeletonCards />}

      {!isLoading && data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {ESPECIES.map(({ key, label, unidad, color, icon }) => {
            const r = data[key]
            if (!r) return null
            return (
              <EspecieCard
                key={key}
                label={label}
                unidad={unidad}
                color={color}
                icon={icon}
                especieClave={key}
                resultado={r}
                pagina={pags[key]}
                onPaginaChange={p => dispatch({ key, page: p })}
              />
            )
          })}
        </div>
      )}

      {/* ── Sin datos ── */}
      {!isLoading && !data && (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14,
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Sin datos de predicción</div>
          <div style={{ fontSize: 13, color: '#9ca3af' }}>
            Verifica que el backend esté activo y que haya datos de producción registrados.
          </div>
        </div>
      )}
    </div>
  )
}
