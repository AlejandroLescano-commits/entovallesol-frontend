import { useEffect, useRef } from 'react'
import { Chart, registerables, TooltipItem } from 'chart.js'
import { useSitotroga, useTrichogramma, useGalleria, useParatheresia } from '@/hooks/useProduccion'
import { useUsuarios } from '@/hooks/useUsuarios'

Chart.register(...registerables)

/* ── Colores por especie ─────────────────────────────────── */
const COLORS = {
  sitotroga:    { main: '#BA7517', light: 'rgba(186,117,23,0.12)',  bg: '#FAEEDA', text: '#633806' },
  trichogramma: { main: '#378ADD', light: 'rgba(55,138,221,0.12)',  bg: '#E6F1FB', text: '#0C447C' },
  galleria:     { main: '#D85A30', light: 'rgba(216,90,48,0.12)',   bg: '#FAECE7', text: '#4A1B0C' },
  paratheresia: { main: '#7F77DD', light: 'rgba(127,119,221,0.12)', bg: '#EEEDFE', text: '#26215C' },
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
      {/* barra color inferior */}
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

/* ══════════════════════════════════════════════════════════
   DASHBOARD PAGE
═══════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { data: sitotroga    = [] } = useSitotroga()
  const { data: trichogramma = [] } = useTrichogramma()
  const { data: galleria     = [] } = useGalleria()
  const { data: paratheresia = [] } = useParatheresia()
  const { data: usuarios     = [] } = useUsuarios()

  /* Calcular totales acumulados */
  const totalSitotroga = sitotroga.reduce((sum, r) => sum + (r.cantidad || 0), 0)
  const totalTrichogramma = trichogramma.reduce((sum, r) => sum + (r.cantidad || 0), 0)
  const totalGalleria = galleria.reduce((sum, r) => sum + (r.cantidad || 0), 0)
  const totalParatheresia = paratheresia.reduce((sum, r) => sum + (r.cantidad || 0), 0)

  /* Obtener últimos registros */
  const lastSitotroga = sitotroga[sitotroga.length - 1]
  const lastTrichogramma = trichogramma[trichogramma.length - 1]
  const lastGalleria = galleria[galleria.length - 1]
  const lastParatheresia = paratheresia[paratheresia.length - 1]

  /* refs para los 3 canvas */
  const refBar   = useRef<HTMLCanvasElement>(null)
  const refDonut = useRef<HTMLCanvasElement>(null)
  const refLine  = useRef<HTMLCanvasElement>(null)
  const chartBar   = useRef<Chart | null>(null)
  const chartDonut = useRef<Chart | null>(null)
  const chartLine  = useRef<Chart | null>(null)

  /* ── Gráfico 1: barras Sitotroga + línea Trichogramma ── */
  useEffect(() => {
    if (!refBar.current || !sitotroga.length || !trichogramma.length) return
    chartBar.current?.destroy()

    const labels  = sitotroga.map((r: any) => r.fecha?.slice(5))   // "03-02"
    const sitoVals = sitotroga.map((r: any) => r.cantidad)
    const triMap: Record<string, number> = {}
    trichogramma.forEach((r: any) => { triMap[r.fecha?.slice(5)] = r.cantidad / 10 })
    const triVals = labels.map((l: string) => triMap[l] ?? null)

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
  }, [sitotroga, trichogramma])

  /* ── Gráfico 2: donut salidas Sitotroga ─────────────── */
  useEffect(() => {
    if (!refDonut.current || !sitotroga.length) return
    chartDonut.current?.destroy()

    chartDonut.current = new Chart(refDonut.current, {
      type: 'doughnut',
      data: {
        labels: ['T.exiguum', 'Infestación', 'T.pretiosum'],
        datasets: [{
          data: [11837, 1344, 0],
          backgroundColor: [COLORS.sitotroga.main, '#E24B4A', COLORS.trichogramma.main],
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
          tooltip: { callbacks: { label: ctx => `${ctx.label}: ${(ctx.raw as number).toLocaleString()} g` } },
        },
      },
    })

    return () => { chartDonut.current?.destroy() }
  }, [sitotroga])

  /* ── Gráfico 3: líneas Galleria vs Paratheresia ─────── */
  useEffect(() => {
    if (!refLine.current || !galleria.length || !paratheresia.length) return
    chartLine.current?.destroy()

    const gMap: Record<string, number> = {}
    galleria.forEach((r: any) => { gMap[r.fecha?.slice(5)] = r.cantidad / 10 })
    const pMap: Record<string, number> = {}
    paratheresia.forEach((r: any) => { const key = r.fecha?.slice(5)
pMap[key] = (pMap[key] || 0) + r.cantidad })

    const allLabels = [...new Set([
      ...galleria.map((r: any) => r.fecha?.slice(5)),
      ...paratheresia.map((r: any) => r.fecha?.slice(5)),
    ])].sort()

    chartLine.current = new Chart(refLine.current, {
      type: 'line',
      data: {
        labels: allLabels,
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
  }, [galleria, paratheresia])

  /* ── Render ──────────────────────────────────────────── */
  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h1 className="vs-page-title mb-0">Dashboard</h1>
        <p className="text-muted" style={{ fontSize: '.85rem' }}>Resumen general de producción</p>
      </div>

      {/* KPI cards - AHORA CON TOTALES ACUMULADOS */}
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
            title="Producción diaria — Marzo 2025"
            badge="Sitotroga + Trichogramma"
            badgeColor={COLORS.trichogramma}
          >
            <Legend items={[
              { label: 'Sitotroga (g)',           color: COLORS.sitotroga.main },
              { label: 'Trichogramma (pulg²/10)', color: COLORS.trichogramma.main },
            ]} />
            <div style={{ position: 'relative', width: '100%', height: 220 }}>
              <canvas ref={refBar} />
            </div>
          </Card>
        </div>
        <div className="col-12 col-md-4">
          <Card title="Salidas Sitotroga" badge="Marzo" badgeColor={COLORS.sitotroga}>
            <div style={{ position: 'relative', width: '100%', height: 190 }}>
              <canvas ref={refDonut} />
            </div>
            <Legend items={[
              { label: 'T.exiguum',   color: COLORS.sitotroga.main },
              { label: 'Infestación', color: '#E24B4A' },
              { label: 'T.pretiosum', color: COLORS.trichogramma.main },
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
                <tr>
                  <td>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: COLORS.sitotroga.main, marginRight: 6 }} />
                    Sitotroga
                  </td>
                  <td style={{ fontSize: 12, color: '#888' }}>{lastSitotroga?.fecha ?? '—'}</td>
                  <td style={{ fontWeight: 500 }}>{lastSitotroga ? `${lastSitotroga.cantidad} g` : '—'}</td>
                </tr>
                <tr>
                  <td>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: COLORS.trichogramma.main, marginRight: 6 }} />
                    Trichogramma
                  </td>
                  <td style={{ fontSize: 12, color: '#888' }}>{lastTrichogramma?.fecha ?? '—'}</td>
                  <td style={{ fontWeight: 500 }}>{lastTrichogramma ? `${lastTrichogramma.cantidad} pulg²` : '—'}</td>
                </tr>
                <tr>
                  <td>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: COLORS.galleria.main, marginRight: 6 }} />
                    Galleria
                  </td>
                  <td style={{ fontSize: 12, color: '#888' }}>{lastGalleria?.fecha ?? '—'}</td>
                  <td style={{ fontWeight: 500 }}>{lastGalleria ? `${lastGalleria.cantidad} unid.` : '—'}</td>
                </tr>
                <tr>
                  <td>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: COLORS.paratheresia.main, marginRight: 6 }} />
                    Paratheresia
                  </td>
                  <td style={{ fontSize: 12, color: '#888' }}>{lastParatheresia?.fecha ?? '—'}</td>
                  <td style={{ fontWeight: 500 }}>{lastParatheresia ? `${lastParatheresia.cantidad} parejas` : '—'}</td>
                </tr>
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