import { useEffect, useMemo, useRef, useState } from 'react'
import { Chart, registerables } from 'chart.js'
import { useSitotroga, useTrichogramma, useGalleria, useParatheresia, useNotasSitodroga } from '@/hooks/useProduccion'
import { useUsuarios } from '@/hooks/useUsuarios'
import { exportarDashboardExcel, exportarDashboardPDF } from '@/utils/exportDashboard'

Chart.register(...registerables)

/* ── Colores por especie ─────────────────────────────────── */
const COLORS = {
  sitotroga:    { main: '#BA7517', light: 'rgba(186,117,23,0.12)',  bg: '#FAEEDA', text: '#633806' },
  trichogramma: { main: '#378ADD', light: 'rgba(55,138,221,0.12)',  bg: '#E6F1FB', text: '#0C447C' },
  galleria:     { main: '#D85A30', light: 'rgba(216,90,48,0.12)',   bg: '#FAECE7', text: '#4A1B0C' },
  paratheresia: { main: '#7F77DD', light: 'rgba(127,119,221,0.12)', bg: '#EEEDFE', text: '#26215C' },
}

/* ── Tipos y helpers de fecha/vista ──────────────────────── */
type Vista = 'dia' | 'mes' | 'anio'

const toISODate = (d: Date) => d.toISOString().slice(0, 10)

const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function formatLabel(fecha: string, vista: Vista): string {
  if (vista === 'dia') return fecha.slice(5)                 // MM-DD
  if (vista === 'anio') return fecha                         // YYYY
  const [y, m] = fecha.split('-')                            // mes: YYYY-MM -> "Ene 26"
  return `${MESES_CORTOS[parseInt(m, 10) - 1] ?? m} ${y.slice(2)}`
}

/** Agrupa una lista de registros {fecha, cantidad} según la vista elegida, sumando cantidades. */
function aggregateByPeriod(records: any[], vista: Vista, valueField = 'cantidad'): { fecha: string; cantidad: number }[] {
  if (!records?.length) return []
  if (vista === 'dia') {
    return [...records]
      .reverse()
      .filter((r: any) => r.fecha)
      .map((r: any) => ({ fecha: r.fecha, cantidad: r[valueField] || 0 }))
  }
  const map: Record<string, number> = {}
  records.forEach((r: any) => {
    if (!r.fecha) return
    const key = vista === 'mes' ? r.fecha.slice(0, 7) : r.fecha.slice(0, 4)
    map[key] = (map[key] || 0) + (r[valueField] || 0)
  })
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, cantidad]) => ({ fecha, cantidad }))
}

/* ── Persistencia del filtro (localStorage) ──────────────── */
const FILTROS_STORAGE_KEY = 'dashboard_produccion_filtros_v1'

type FiltrosGuardados = {
  vista: Vista
  rangoPersonalizado: boolean
  fechaInicio: string
  fechaFin: string
}

const VISTAS_VALIDAS: Vista[] = ['dia', 'mes', 'anio']
const esFechaValida = (f: unknown): f is string => typeof f === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(f)

function cargarFiltrosGuardados(): FiltrosGuardados | null {
  try {
    const raw = localStorage.getItem(FILTROS_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!VISTAS_VALIDAS.includes(parsed?.vista)) return null
    if (typeof parsed?.rangoPersonalizado !== 'boolean') return null
    if (!esFechaValida(parsed?.fechaInicio) || !esFechaValida(parsed?.fechaFin)) return null
    return parsed as FiltrosGuardados
  } catch {
    return null // localStorage no disponible o dato corrupto: se ignora sin romper la app
  }
}

function guardarFiltros(filtros: FiltrosGuardados) {
  try {
    localStorage.setItem(FILTROS_STORAGE_KEY, JSON.stringify(filtros))
  } catch {
    // modo privado, cuota llena, etc. — no bloquea el uso del dashboard
  }
}

function limpiarFiltrosGuardados() {
  try {
    localStorage.removeItem(FILTROS_STORAGE_KEY)
  } catch {
    // ignorar
  }
}

function rangoPorDefecto(dias = 30) {
  const d = new Date(); d.setDate(d.getDate() - dias); return toISODate(d)
}

/* ── Stat Card ───────────────────────────────────────────── */
function StatCard({ label, value, unit, color }: {
  label: string; value: string | number; unit: string
  color: { main: string; light: string; bg: string; text: string }
}) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, border: '0.5px solid #e5e5e0',
      padding: '1rem 1.25rem', position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: color.main, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 28, fontWeight: 600, color: color.main, lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: 13, color: color.main, opacity: .7 }}>{unit}</span>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: color.main }} />
    </div>
  )
}

/* ── Card wrapper ────────────────────────────────────────── */
function Card({ title, badge, badgeColor, children }: {
  title: string; badge?: string
  badgeColor?: { bg: string; text: string }; children: React.ReactNode
}) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #e5e5e0', padding: '1rem 1.25rem', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{title}</span>
        {badge && badgeColor && (
          <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 10px', borderRadius: 4, background: badgeColor.bg, color: badgeColor.text }}>
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

/* ── Leyenda manual ──────────────────────────────────────── */
function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
      {items.map(i => (
        <span key={i.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#888' }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: i.color, flexShrink: 0 }} />
          {i.label}
        </span>
      ))}
    </div>
  )
}

/* ── Estado vacío (se superpone al canvas cuando no hay datos en el rango) ── */
function SinDatos() {
  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, color: '#aaa', textAlign: 'center', padding: '0 1rem',
    }}>
      Sin datos en el periodo seleccionado
    </div>
  )
}

/* ── Selector de periodo (día/mes/año + rango personalizado) ── */
const inputStyle: React.CSSProperties = {
  fontSize: 13, padding: '6px 10px', borderRadius: 8, border: '1px solid #e0e0da',
  background: '#fff', color: '#333', outline: 'none',
}

function PeriodoSelector({
  vista, onVistaChange, personalizado, onPersonalizadoChange,
  fechaInicio, fechaFin, onFechaInicioChange, onFechaFinChange, onReset,
  onExportExcel, onExportPDF, exportando,
}: {
  vista: Vista
  onVistaChange: (v: Vista) => void
  personalizado: boolean
  onPersonalizadoChange: (v: boolean) => void
  fechaInicio: string
  fechaFin: string
  onFechaInicioChange: (v: string) => void
  onFechaFinChange: (v: string) => void
  onReset: () => void
  onExportExcel: () => void
  onExportPDF: () => void
  exportando: 'excel' | 'pdf' | null
}) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, border: '0.5px solid #e5e5e0',
      padding: '0.85rem 1.25rem', display: 'flex', flexWrap: 'wrap',
      alignItems: 'center', gap: 14, marginBottom: '1rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>Ver por</label>
        <select
          value={vista}
          onChange={e => onVistaChange(e.target.value as Vista)}
          style={inputStyle}
        >
          <option value="dia">Día</option>
          <option value="mes">Mes</option>
          <option value="anio">Año</option>
        </select>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#555', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={personalizado}
          onChange={e => onPersonalizadoChange(e.target.checked)}
        />
        Rango de fechas personalizado
      </label>

      {personalizado && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#888' }}>Desde</span>
          <input
            type="date"
            value={fechaInicio}
            max={fechaFin}
            onChange={e => onFechaInicioChange(e.target.value)}
            style={inputStyle}
          />
          <span style={{ fontSize: 12, color: '#888' }}>Hasta</span>
          <input
            type="date"
            value={fechaFin}
            min={fechaInicio}
            max={toISODate(new Date())}
            onChange={e => onFechaFinChange(e.target.value)}
            style={inputStyle}
          />
        </div>
      )}

      <button
        type="button"
        onClick={onReset}
        style={{
          marginLeft: 'auto', fontSize: 12, color: '#888', background: 'transparent',
          border: '1px solid #e0e0da', borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
        }}
      >
        Restablecer
      </button>

      <button
        type="button"
        onClick={onExportExcel}
        disabled={exportando !== null}
        style={{
          fontSize: 12, fontWeight: 500, color: '#1D6F3E', background: '#EAF3DE',
          border: '1px solid #cfe6bd', borderRadius: 8, padding: '6px 12px',
          cursor: exportando ? 'default' : 'pointer', opacity: exportando ? 0.6 : 1,
        }}
      >
        {exportando === 'excel' ? 'Exportando…' : 'Exportar Excel'}
      </button>

      <button
        type="button"
        onClick={onExportPDF}
        disabled={exportando !== null}
        style={{
          fontSize: 12, fontWeight: 500, color: '#A32D2D', background: '#FCEBEB',
          border: '1px solid #f0c8c8', borderRadius: 8, padding: '6px 12px',
          cursor: exportando ? 'default' : 'pointer', opacity: exportando ? 0.6 : 1,
        }}
      >
        {exportando === 'pdf' ? 'Exportando…' : 'Exportar PDF'}
      </button>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   DASHBOARD PAGE
═══════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  /* ── Estado de vista y rango de fechas (se inicializa desde localStorage si existe) ── */
  const [vista, setVista] = useState<Vista>(() => cargarFiltrosGuardados()?.vista ?? 'dia')
  const [rangoPersonalizado, setRangoPersonalizado] = useState<boolean>(
    () => cargarFiltrosGuardados()?.rangoPersonalizado ?? false
  )
  const [fechaInicioInput, setFechaInicioInput] = useState<string>(
    () => cargarFiltrosGuardados()?.fechaInicio ?? rangoPorDefecto(30)
  )
  const [fechaFinInput, setFechaFinInput] = useState<string>(
    () => cargarFiltrosGuardados()?.fechaFin ?? toISODate(new Date())
  )

  /* Persiste el filtro cada vez que cambia, para que sobreviva a recargas/cierres de pestaña */
  useEffect(() => {
    guardarFiltros({ vista, rangoPersonalizado, fechaInicio: fechaInicioInput, fechaFin: fechaFinInput })
  }, [vista, rangoPersonalizado, fechaInicioInput, fechaFinInput])

  /* Evita rangos inválidos: si el usuario mueve una fecha más allá de la otra, la otra se ajusta */
  const handleFechaInicioChange = (v: string) => {
    setFechaInicioInput(v)
    if (v > fechaFinInput) setFechaFinInput(v)
  }
  const handleFechaFinChange = (v: string) => {
    setFechaFinInput(v)
    if (v < fechaInicioInput) setFechaInicioInput(v)
  }

  const handleReset = () => {
    limpiarFiltrosGuardados()
    setVista('dia')
    setRangoPersonalizado(false)
    setFechaInicioInput(rangoPorDefecto(30))
    setFechaFinInput(toISODate(new Date()))
  }

  /* ── Exportación a Excel / PDF (usa exactamente los datos filtrados en pantalla) ── */
  const [exportando, setExportando] = useState<'excel' | 'pdf' | null>(null)

  /* Rango efectivo enviado al backend: personalizado si está activo,
     o un rango por defecto razonable según la vista elegida. */
  const params = useMemo(() => {
    if (rangoPersonalizado) {
      return { fecha_inicio: fechaInicioInput, fecha_fin: fechaFinInput }
    }
    const fin = new Date()
    const inicio = new Date()
    if (vista === 'dia') inicio.setDate(inicio.getDate() - 30)        // últimos 30 días
    else if (vista === 'mes') inicio.setMonth(inicio.getMonth() - 11) // últimos 12 meses
    else inicio.setFullYear(inicio.getFullYear() - 4)                 // últimos 5 años
    return { fecha_inicio: toISODate(inicio), fecha_fin: toISODate(fin) }
  }, [vista, rangoPersonalizado, fechaInicioInput, fechaFinInput])

  const { data: sitotroga    = [] } = useSitotroga(params)
  const { data: trichogramma = [] } = useTrichogramma(params)
  const { data: galleria     = [] } = useGalleria(params)
  const { data: paratheresia = [] } = useParatheresia(params)
  const { data: notasSit     = [] } = useNotasSitodroga(params)
  const { data: usuarios     = [] } = useUsuarios()

  /* Totales acumulados de producción (dentro del rango filtrado) */
  const totalSitotroga    = sitotroga.reduce((s: number, r: any)    => s + (r.cantidad || 0), 0)
  const totalTrichogramma = trichogramma.reduce((s: number, r: any) => s + (r.cantidad || 0), 0)
  const totalGalleria     = galleria.reduce((s: number, r: any)     => s + (r.cantidad || 0), 0)
  const totalParatheresia = paratheresia.reduce((s: number, r: any) => s + (r.cantidad || 0), 0)

  /* Últimos registros — el backend devuelve desc, index 0 = más reciente */
  const lastSitotroga    = sitotroga[0]
  const lastTrichogramma = trichogramma[0]
  const lastGalleria     = galleria[0]
  const lastParatheresia = paratheresia[0]

  /* Datos reales para el donut de salidas Sitotroga (dentro del rango filtrado) */
  const donutTipos = ['T.exiguum', 'Infestación', 'T.pretiosum', 'Crysopas', 'Ventas']
  const donutData  = donutTipos.map(tipo =>
    (notasSit as any[])
      .filter(n => n.tiposalida === tipo)
      .reduce((s, n) => s + (n.cantidad || 0), 0)
  )
  const donutColors = [
    COLORS.sitotroga.main,
    '#E24B4A',
    COLORS.trichogramma.main,
    '#22c55e',
    '#f59e0b',
  ]

  /* Series agregadas según la vista (día / mes / año) */
  const sitoAgg        = useMemo(() => aggregateByPeriod(sitotroga, vista),    [sitotroga, vista])
  const triAgg         = useMemo(() => aggregateByPeriod(trichogramma, vista), [trichogramma, vista])
  const galleriaAgg    = useMemo(() => aggregateByPeriod(galleria, vista),     [galleria, vista])
  const paratheresiaAgg = useMemo(() => aggregateByPeriod(paratheresia, vista), [paratheresia, vista])

  /* refs para los 3 canvas */
  const refBar   = useRef<HTMLCanvasElement>(null)
  const refDonut = useRef<HTMLCanvasElement>(null)
  const refLine  = useRef<HTMLCanvasElement>(null)
  const chartBar   = useRef<Chart | null>(null)
  const chartDonut = useRef<Chart | null>(null)
  const chartLine  = useRef<Chart | null>(null)

  const sinDatosBar = sitoAgg.length === 0 && triAgg.length === 0

  /* ── Gráfico 1: barras Sitotroga + línea Trichogramma ── */
  useEffect(() => {
    if (!refBar.current) return
    chartBar.current?.destroy()
    chartBar.current = null
    if (sinDatosBar) return

    const allKeys = Array.from(new Set([...sitoAgg.map(r => r.fecha), ...triAgg.map(r => r.fecha)])).sort()
    const sitoMap = Object.fromEntries(sitoAgg.map(r => [r.fecha, r.cantidad]))
    const triMap  = Object.fromEntries(triAgg.map(r => [r.fecha, r.cantidad / 10]))

    const labels   = allKeys.map(k => formatLabel(k, vista))
    const sitoVals = allKeys.map(k => sitoMap[k] ?? null)
    const triVals  = allKeys.map(k => triMap[k] ?? null)

    chartBar.current = new Chart(refBar.current, {
      data: {
        labels,
        datasets: [
          {
            type: 'bar',
            label: 'Sitotroga (g)',
            data: sitoVals,
            backgroundColor: COLORS.sitotroga.main,
            borderRadius: 4,
            order: 2,
          },
          {
            type: 'line',
            label: 'Trichogramma (pulg²/10)',
            data: triVals,
            borderColor: COLORS.trichogramma.main,
            backgroundColor: COLORS.trichogramma.light,
            pointRadius: 3,
            pointBackgroundColor: COLORS.trichogramma.main,
            tension: 0.35,
            fill: true,
            spanGaps: true,
            order: 1,
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ctx.datasetIndex === 1
                ? `Trichogramma: ${((ctx.raw as number) * 10).toFixed(0)} pulg²`
                : `${ctx.raw} g`,
            },
          },
        },
        scales: {
          x: { ticks: { font: { size: 9 }, color: '#aaa', autoSkip: true, maxTicksLimit: 14 }, grid: { display: false } },
          y: { ticks: { font: { size: 10 }, color: '#aaa' }, grid: { color: '#f0f0ec' } },
        },
      },
    } as any)

    return () => { chartBar.current?.destroy() }
  }, [sitoAgg, triAgg, vista, sinDatosBar])

  // Filtra solo tipos con cantidad > 0 para no mostrar sectores vacíos
  const donutFiltrados = donutTipos
    .map((label, i) => ({ label, value: donutData[i], color: donutColors[i] }))
    .filter(d => d.value > 0)
  const sinDatosDonut = donutFiltrados.length === 0

  /* ── Gráfico 2: donut salidas Sitotroga (datos reales, dentro del rango) ── */
  useEffect(() => {
    if (!refDonut.current) return
    chartDonut.current?.destroy()
    chartDonut.current = null
    if (sinDatosDonut) return

    const filtrados = donutFiltrados

    chartDonut.current = new Chart(refDonut.current, {
      type: 'doughnut',
      data: {
        labels: filtrados.map(d => d.label),
        datasets: [{
          data: filtrados.map(d => d.value),
          backgroundColor: filtrados.map(d => d.color),
          hoverOffset: 8,
          borderWidth: 2,
          borderColor: '#fff',
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => `${ctx.label}: ${(ctx.raw as number).toLocaleString('es-PE')} g` } },
        },
      },
    })

    return () => { chartDonut.current?.destroy() }
    // donutFiltrados se deriva de notasSit en cada render; usamos notasSit como dependencia estable
  }, [notasSit, sinDatosDonut])

  const sinDatosLine = galleriaAgg.length === 0 && paratheresiaAgg.length === 0

  /* ── Gráfico 3: líneas Galleria vs Paratheresia ─────── */
  useEffect(() => {
    if (!refLine.current) return
    chartLine.current?.destroy()
    chartLine.current = null
    if (sinDatosLine) return

    const gMap = Object.fromEntries(galleriaAgg.map(r => [r.fecha, r.cantidad / 10]))
    const pMap = Object.fromEntries(paratheresiaAgg.map(r => [r.fecha, r.cantidad]))

    const allLabels = Array.from(new Set([
      ...galleriaAgg.map(r => r.fecha),
      ...paratheresiaAgg.map(r => r.fecha),
    ])).sort()

    chartLine.current = new Chart(refLine.current, {
      type: 'line',
      data: {
        labels: allLabels.map(l => formatLabel(l, vista)),
        datasets: [
          {
            label: 'Galleria (unid./10)',
            data: allLabels.map(l => gMap[l] ?? null),
            borderColor: COLORS.galleria.main,
            backgroundColor: COLORS.galleria.light,
            pointRadius: 2,
            tension: 0.35,
            fill: true,
            spanGaps: true,
          },
          {
            label: 'Paratheresia (par.)',
            data: allLabels.map(l => pMap[l] ?? null),
            borderColor: COLORS.paratheresia.main,
            backgroundColor: COLORS.paratheresia.light,
            pointRadius: 2,
            tension: 0.35,
            fill: true,
            spanGaps: true,
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { font: { size: 9 }, color: '#aaa', autoSkip: true, maxTicksLimit: 12 }, grid: { display: false } },
          y: { ticks: { font: { size: 10 }, color: '#aaa' }, grid: { color: '#f0f0ec' } },
        },
      },
    })

    return () => { chartLine.current?.destroy() }
  }, [galleriaAgg, paratheresiaAgg, vista, sinDatosLine])

  const handleExportExcel = () => {
    setExportando('excel')
    try {
      exportarDashboardExcel({
        vista,
        fechaInicio: params.fecha_inicio,
        fechaFin: params.fecha_fin,
        sitotroga, trichogramma, galleria, paratheresia, notasSit,
        totales: {
          sitotroga: totalSitotroga,
          trichogramma: totalTrichogramma,
          galleria: totalGalleria,
          paratheresia: totalParatheresia,
        },
      })
    } finally {
      setExportando(null)
    }
  }

  const handleExportPDF = () => {
    setExportando('pdf')
    try {
      exportarDashboardPDF(
        {
          vista,
          fechaInicio: params.fecha_inicio,
          fechaFin: params.fecha_fin,
          sitotroga, trichogramma, galleria, paratheresia, notasSit,
          totales: {
            sitotroga: totalSitotroga,
            trichogramma: totalTrichogramma,
            galleria: totalGalleria,
            paratheresia: totalParatheresia,
          },
        },
        {
          bar: sinDatosBar ? null : chartBar.current?.toBase64Image() ?? null,
          donut: sinDatosDonut ? null : chartDonut.current?.toBase64Image() ?? null,
          line: sinDatosLine ? null : chartLine.current?.toBase64Image() ?? null,
        }
      )
    } finally {
      setExportando(null)
    }
  }

  /* ── Render ──────────────────────────────────────────── */
  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h1 className="vs-page-title mb-0">Dashboard</h1>
        <p className="text-muted" style={{ fontSize: '.85rem' }}>Resumen general de producción</p>
      </div>

      {/* Selector de periodo */}
      <PeriodoSelector
        vista={vista}
        onVistaChange={setVista}
        personalizado={rangoPersonalizado}
        onPersonalizadoChange={setRangoPersonalizado}
        fechaInicio={fechaInicioInput}
        fechaFin={fechaFinInput}
        onFechaInicioChange={handleFechaInicioChange}
        onFechaFinChange={handleFechaFinChange}
        onReset={handleReset}
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
        exportando={exportando}
      />

      {/* KPI cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <StatCard label="Sitotroga" value={totalSitotroga.toFixed(1)} unit="g" color={COLORS.sitotroga} />
        </div>
        <div className="col-6 col-md-3">
          <StatCard label="Trichogramma" value={totalTrichogramma.toFixed(0)} unit="pulg²" color={COLORS.trichogramma} />
        </div>
        <div className="col-6 col-md-3">
          <StatCard label="Galleria" value={totalGalleria.toFixed(0)} unit="unid." color={COLORS.galleria} />
        </div>
        <div className="col-6 col-md-3">
          <StatCard label="Paratheresia" value={totalParatheresia.toFixed(0)} unit="parejas" color={COLORS.paratheresia} />
        </div>
      </div>

      {/* Gráfico principal + donut */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-8">
          <Card
            title="Producción diaria"
            badge="Sitotroga + Trichogramma"
            badgeColor={COLORS.trichogramma}
          >
            <Legend items={[
              { label: 'Sitotroga (g)',           color: COLORS.sitotroga.main },
              { label: 'Trichogramma (pulg²/10)', color: COLORS.trichogramma.main },
            ]} />
            <div style={{ position: 'relative', width: '100%', height: 220 }}>
              <canvas ref={refBar} />
              {sinDatosBar && <SinDatos />}
            </div>
          </Card>
        </div>
        <div className="col-12 col-md-4">
          <Card title="Salidas Sitotroga" badge="Acumulado" badgeColor={COLORS.sitotroga}>
            <div style={{ position: 'relative', width: '100%', height: 190 }}>
              <canvas ref={refDonut} />
              {sinDatosDonut && <SinDatos />}
            </div>
            <Legend items={[
              { label: 'T.exiguum',   color: COLORS.sitotroga.main },
              { label: 'Infestación', color: '#E24B4A' },
              { label: 'T.pretiosum', color: COLORS.trichogramma.main },
              { label: 'Crysopas',    color: '#22c55e' },
              { label: 'Ventas',      color: '#f59e0b' },
            ]} />
          </Card>
        </div>
      </div>

      {/* Galleria/Paratheresia + tablas */}
      <div className="row g-3">
        <div className="col-12 col-md-5">
          <Card title="Galleria vs Paratheresia" badge="Producción" badgeColor={COLORS.paratheresia}>
            <Legend items={[
              { label: 'Galleria (unid./10)', color: COLORS.galleria.main },
              { label: 'Paratheresia (par.)', color: COLORS.paratheresia.main },
            ]} />
            <div style={{ position: 'relative', width: '100%', height: 180 }}>
              <canvas ref={refLine} />
              {sinDatosLine && <SinDatos />}
            </div>
          </Card>
        </div>

        <div className="col-12 col-md-4">
          <Card title="Últimos registros de producción">
            <table className="table vs-table mb-0">
              <thead>
                <tr><th>Especie</th><th>Fecha</th><th>Cantidad</th></tr>
              </thead>
              <tbody>
                {[
                  { label: 'Sitotroga',    color: COLORS.sitotroga.main,    last: lastSitotroga,    unit: 'g' },
                  { label: 'Trichogramma', color: COLORS.trichogramma.main, last: lastTrichogramma, unit: 'pulg²' },
                  { label: 'Galleria',     color: COLORS.galleria.main,     last: lastGalleria,     unit: 'unid.' },
                  { label: 'Paratheresia', color: COLORS.paratheresia.main, last: lastParatheresia, unit: 'parejas' },
                ].map(({ label, color, last, unit }) => (
                  <tr key={label}>
                    <td>
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: color, marginRight: 6 }} />
                      {label}
                    </td>
                    <td style={{ fontSize: 12, color: '#888' }}>{last?.fecha ?? '—'}</td>
                    <td style={{ fontWeight: 500 }}>
                      {last ? `${Number(last.cantidad).toLocaleString('es-PE', { maximumFractionDigits: 1 })} ${unit}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <div className="col-12 col-md-3">
          <Card title="Usuarios activos">
            {(usuarios as any[]).slice(0, 6).map((u: any) => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid #f0f0ec' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: COLORS.trichogramma.bg, color: COLORS.trichogramma.text,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 600, flexShrink: 0,
                  }}>
                    {u.nombre?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{u.nombre}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>{u.rol}</div>
                  </div>
                </div>
                <span style={{
                  fontSize: 10, padding: '2px 8px', borderRadius: 4,
                  background: u.activo ? '#EAF3DE' : '#FCEBEB',
                  color: u.activo ? '#3B6D11' : '#A32D2D',
                  fontWeight: 500,
                }}>
                  {u.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}
