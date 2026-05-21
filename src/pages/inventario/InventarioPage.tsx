import { useSitotroga, useTrichogramma, useGalleria, useParatheresia, useNotasSitodroga, useNotasAvispitas, useNotasMoscas, useNotasGalleria } from '@/hooks/useProduccion'

// ── Umbrales de alerta por especie (% del stock respecto a producción total) ──
const THRESHOLD_CRITICO = 15   // ≤15 % → crítico (rojo)
const THRESHOLD_BAJO    = 30   // ≤30 % → bajo   (amarillo)

type StockStatus = 'critico' | 'bajo' | 'normal'

function getStockStatus(pct: number): StockStatus {
  if (pct <= THRESHOLD_CRITICO) return 'critico'
  if (pct <= THRESHOLD_BAJO)    return 'bajo'
  return 'normal'
}

const STATUS_CONFIG: Record<StockStatus, { bg: string; text: string; badge: string; icon: string; barColor?: string }> = {
  critico: { bg: '#fef2f2', text: '#991b1b', badge: '#dc2626', icon: '⚠️', barColor: '#dc2626' },
  bajo:    { bg: '#fffbeb', text: '#92400e', badge: '#d97706', icon: '⚡', barColor: '#d97706' },
  normal:  { bg: 'transparent', text: '', badge: '', icon: '', barColor: undefined },
}

function calcularSaldo(produccion: any[], notas: any[]) {
  const totalProd   = produccion.reduce((s, r) => s + (r.cantidad || 0), 0)
  const totalSalida = notas.reduce((s, n) => s + (n.cantidad || 0), 0)
  return { totalProd, totalSalida, saldo: totalProd - totalSalida }
}

function AlertaBanner({ alertas }: { alertas: { label: string; status: StockStatus; pct: number }[] }) {
  if (alertas.length === 0) return null

  const criticas = alertas.filter(a => a.status === 'critico')
  const bajas    = alertas.filter(a => a.status === 'bajo')

  return (
    <div
      className="mb-4 p-3 rounded"
      style={{
        background: criticas.length > 0 ? '#fef2f2' : '#fffbeb',
        border: `1px solid ${criticas.length > 0 ? '#fecaca' : '#fde68a'}`,
      }}
    >
      <div className="d-flex align-items-start gap-2">
        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>
          {criticas.length > 0 ? '🚨' : '⚠️'}
        </span>
        <div>
          <div style={{ fontWeight: 700, fontSize: '.85rem', color: criticas.length > 0 ? '#991b1b' : '#92400e' }}>
            {criticas.length > 0
              ? `Stock crítico detectado (${criticas.length} especie${criticas.length > 1 ? 's' : ''})`
              : `Stock bajo detectado (${bajas.length} especie${bajas.length > 1 ? 's' : ''})`}
          </div>
          <div style={{ fontSize: '.78rem', color: '#6b7280', marginTop: 2 }}>
            {criticas.length > 0 && (
              <span>
                <strong style={{ color: '#dc2626' }}>Crítico:</strong>{' '}
                {criticas.map(a => `${a.label} (${a.pct.toFixed(0)}%)`).join(', ')}
              </span>
            )}
            {criticas.length > 0 && bajas.length > 0 && <span className="mx-1">·</span>}
            {bajas.length > 0 && (
              <span>
                <strong style={{ color: '#d97706' }}>Bajo:</strong>{' '}
                {bajas.map(a => `${a.label} (${a.pct.toFixed(0)}%)`).join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InventarioCard({
  label, unidad, produccion, notas, color,
}: {
  label: string; unidad: string; produccion: any[]; notas: any[]; color: string
}) {
  const { totalProd, totalSalida, saldo } = calcularSaldo(produccion, notas)
  const pct    = totalProd > 0 ? Math.max(0, Math.min(100, (saldo / totalProd) * 100)) : 0
  const status = getStockStatus(pct)
  const cfg    = STATUS_CONFIG[status]

  return (
    <div
      className="vs-card h-100"
      style={
        status !== 'normal'
          ? { border: `1.5px solid ${cfg.badge}`, background: cfg.bg }
          : undefined
      }
    >
      {/* Header */}
      <div className="d-flex align-items-center gap-2 mb-3">
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <h6 className="fw-semibold mb-0 flex-grow-1">{label}</h6>

        {/* Badge de alerta */}
        {status !== 'normal' && (
          <span
            className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded"
            style={{
              background: cfg.badge,
              color: '#fff',
              fontSize: '.65rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '.03em',
              whiteSpace: 'nowrap',
            }}
          >
            {cfg.icon} {status === 'critico' ? 'Crítico' : 'Bajo'}
          </span>
        )}
      </div>

      {/* Métricas */}
      <div className="row g-2 mb-3">
        <div className="col-4 text-center">
          <div className="text-muted" style={{ fontSize: '.7rem', textTransform: 'uppercase', fontWeight: 600 }}>Producción</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color }}>{totalProd.toFixed(1)}</div>
          <div className="text-muted" style={{ fontSize: '.7rem' }}>{unidad}</div>
        </div>
        <div className="col-4 text-center">
          <div className="text-muted" style={{ fontSize: '.7rem', textTransform: 'uppercase', fontWeight: 600 }}>Salidas</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#dc2626' }}>{totalSalida.toFixed(1)}</div>
          <div className="text-muted" style={{ fontSize: '.7rem' }}>{unidad}</div>
        </div>
        <div className="col-4 text-center">
          <div className="text-muted" style={{ fontSize: '.7rem', textTransform: 'uppercase', fontWeight: 600 }}>Saldo</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: saldo >= 0 ? '#14532d' : '#dc2626' }}>
            {saldo.toFixed(1)}
          </div>
          <div className="text-muted" style={{ fontSize: '.7rem' }}>{unidad}</div>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mb-1 d-flex justify-content-between" style={{ fontSize: '.75rem', color: '#6b7280' }}>
        <span>Stock disponible</span>
        <span style={{ color: status !== 'normal' ? cfg.badge : undefined, fontWeight: status !== 'normal' ? 700 : undefined }}>
          {pct.toFixed(0)}%
        </span>
      </div>
      <div className="progress" style={{ height: 6, borderRadius: 4 }}>
        <div
          className="progress-bar"
          style={{
            width: `${pct}%`,
            background: cfg.barColor ?? color,
            borderRadius: 4,
          }}
        />
      </div>

      {/* Mensaje de alerta inline */}
      {status !== 'normal' && (
        <div
          className="mt-2 px-2 py-1 rounded"
          style={{ background: cfg.badge + '18', fontSize: '.72rem', color: cfg.text, fontWeight: 500 }}
        >
          {status === 'critico'
            ? `⚠️ Stock por debajo del ${THRESHOLD_CRITICO}%. Reponer con urgencia.`
            : `⚡ Stock por debajo del ${THRESHOLD_BAJO}%. Considerar reposición.`}
        </div>
      )}
    </div>
  )
}

export default function InventarioPage() {
  const { data: sitotroga    = [] } = useSitotroga()
  const { data: trichogramma = [] } = useTrichogramma()
  const { data: galleria     = [] } = useGalleria()
  const { data: paratheresia = [] } = useParatheresia()
  const { data: notasSit     = [] } = useNotasSitodroga()
  const { data: notasAvis    = [] } = useNotasAvispitas()
  const { data: notasMosc    = [] } = useNotasMoscas()
  const { data: notasGall    = [] } = useNotasGalleria()

  const especies = [
    { label: 'Sitotroga cerealella',     unidad: 'g',       produccion: sitotroga,    notas: notasSit,  color: '#14532d' },
    { label: 'Trichogramma',             unidad: 'pulg²',   produccion: trichogramma, notas: notasAvis, color: '#1d4ed8' },
    { label: 'Galleria melonella',       unidad: 'unid.',   produccion: galleria,     notas: notasGall, color: '#b45309' },
    { label: 'Paratheresia claripalpis', unidad: 'parejas', produccion: paratheresia, notas: notasMosc, color: '#7c3aed' },
  ]

  // Calcular alertas para el banner superior
  const alertas = especies
    .map(e => {
      const { totalProd, saldo } = calcularSaldo(e.produccion, e.notas)
      const pct = totalProd > 0 ? Math.max(0, Math.min(100, (saldo / totalProd) * 100)) : 0
      return { label: e.label, status: getStockStatus(pct), pct }
    })
    .filter(a => a.status !== 'normal')

  return (
    <div>
      <div className="mb-4">
        <h1 className="vs-page-title mb-0">Inventario</h1>
        <p className="text-muted" style={{ fontSize: '.85rem' }}>
          Saldo actual por especie (producción acumulada − salidas acumuladas)
        </p>
      </div>

      {/* Banner global de alertas */}
      <AlertaBanner alertas={alertas} />

      <div className="row g-3">
        {especies.map(e => (
          <div key={e.label} className="col-md-6">
            <InventarioCard {...e} />
          </div>
        ))}
      </div>
    </div>
  )
}
