import { useSitotroga, useTrichogramma, useGalleria, useParatheresia, useNotasSitodroga, useNotasAvispitas, useNotasMoscas, useNotasGalleria } from '@/hooks/useProduccion'

// ── Lógica de alertas basada en DÍAS DE COBERTURA ─────────────────────────
// Calculado en base a los promedios reales de Feb-Abr 2026:
//
//   Sitotroga     → produce y sale todo el mismo día → saldo 0 es NORMAL
//                   no se emite alerta por stock bajo
//
//   Trichogramma  → promedio salida diaria ≈ 1,460 pulg²
//                   crítico  < 7 días  (<  10,220 pulg²)
//                   bajo     < 14 días (<  20,440 pulg²)
//
//   Galleria      → ciclo biológico: opera en negativo de forma natural
//                   saldo negativo es NORMAL, no se emite alerta
//
//   Paratheresia  → promedio salida diaria ≈ 148 parejas
//                   crítico  < 7 días  (<  1,036 parejas)
//                   bajo     < 14 días (<  2,072 parejas)

type StockStatus = 'critico' | 'bajo' | 'normal'

interface EspecieConfig {
  label: string
  unidad: string
  color: string
  // Si es null, el saldo negativo/cero es comportamiento esperado → siempre 'normal'
  promedioSalidaDiaria: number | null
  diasCritico: number
  diasBajo: number
}

const ESPECIES_CONFIG: EspecieConfig[] = [
  {
    label: 'Sitotroga cerealella',
    unidad: 'g',
    color: '#14532d',
    promedioSalidaDiaria: null,   // produce y consume el mismo día → no aplica alerta
    diasCritico: 0,
    diasBajo: 0,
  },
  {
    label: 'Trichogramma',
    unidad: 'pulg²',
    color: '#1d4ed8',
    promedioSalidaDiaria: 1460,   // promedio real Feb-Abr 2026
    diasCritico: 7,               // < 10,220 pulg² → crítico
    diasBajo: 14,                 // < 20,440 pulg² → bajo
  },
  {
    label: 'Galleria melonella',
    unidad: 'unid.',
    color: '#b45309',
    promedioSalidaDiaria: null,   // saldo negativo es normal por ciclo biológico
    diasCritico: 0,
    diasBajo: 0,
  },
  {
    label: 'Paratheresia claripalpis',
    unidad: 'parejas',
    color: '#7c3aed',
    promedioSalidaDiaria: 148,    // promedio real Feb-Abr 2026
    diasCritico: 7,               // <  1,036 parejas → crítico
    diasBajo: 14,                 // <  2,072 parejas → bajo
  },
]

function getStockStatus(saldo: number, cfg: EspecieConfig): StockStatus {
  if (cfg.promedioSalidaDiaria === null) return 'normal'
  const diasCobertura = saldo / cfg.promedioSalidaDiaria
  if (diasCobertura < cfg.diasCritico) return 'critico'
  if (diasCobertura < cfg.diasBajo)    return 'bajo'
  return 'normal'
}

function getDiasCobertura(saldo: number, cfg: EspecieConfig): number | null {
  if (cfg.promedioSalidaDiaria === null) return null
  return Math.max(0, Math.round(saldo / cfg.promedioSalidaDiaria))
}

const STATUS_STYLE: Record<StockStatus, { bg: string; text: string; badge: string; barColor: string; icon: string }> = {
  critico: { bg: '#fef2f2', text: '#991b1b', badge: '#dc2626', barColor: '#dc2626', icon: '⚠️' },
  bajo:    { bg: '#fffbeb', text: '#92400e', badge: '#d97706', barColor: '#d97706', icon: '⚡' },
  normal:  { bg: 'transparent', text: '', badge: '#16a34a', barColor: '#16a34a', icon: '' },
}

function calcularSaldo(produccion: any[], notas: any[]) {
  const totalProd   = produccion.reduce((s, r) => s + (r.cantidad || 0), 0)
  const totalSalida = notas.reduce((s, n) => s + (n.cantidad || 0), 0)
  return { totalProd, totalSalida, saldo: totalProd - totalSalida }
}

// ── Banner global ─────────────────────────────────────────────────────────
function AlertaBanner({ alertas }: { alertas: { label: string; status: StockStatus; dias: number }[] }) {
  if (alertas.length === 0) return null
  const criticas = alertas.filter(a => a.status === 'critico')
  const bajas    = alertas.filter(a => a.status === 'bajo')
  return (
    <div className="mb-4 p-3 rounded" style={{
      background: criticas.length > 0 ? '#fef2f2' : '#fffbeb',
      border: `1px solid ${criticas.length > 0 ? '#fecaca' : '#fde68a'}`,
    }}>
      <div className="d-flex align-items-start gap-2">
        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{criticas.length > 0 ? '🚨' : '⚠️'}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: '.85rem', color: criticas.length > 0 ? '#991b1b' : '#92400e' }}>
            {criticas.length > 0
              ? `Stock crítico — ${criticas.length} especie${criticas.length > 1 ? 's' : ''} con menos de 7 días de cobertura`
              : `Stock bajo — ${bajas.length} especie${bajas.length > 1 ? 's' : ''} con menos de 14 días de cobertura`}
          </div>
          <div style={{ fontSize: '.78rem', color: '#6b7280', marginTop: 2 }}>
            {criticas.length > 0 && (
              <span>
                <strong style={{ color: '#dc2626' }}>Crítico:</strong>{' '}
                {criticas.map(a => `${a.label} (${a.dias} días)`).join(', ')}
              </span>
            )}
            {criticas.length > 0 && bajas.length > 0 && <span className="mx-1">·</span>}
            {bajas.length > 0 && (
              <span>
                <strong style={{ color: '#d97706' }}>Bajo:</strong>{' '}
                {bajas.map(a => `${a.label} (${a.dias} días)`).join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Tarjeta por especie ───────────────────────────────────────────────────
function InventarioCard({
  cfg, produccion, notas,
}: {
  cfg: EspecieConfig; produccion: any[]; notas: any[]
}) {
  const { totalProd, totalSalida, saldo } = calcularSaldo(produccion, notas)
  const status = getStockStatus(saldo, cfg)
  const dias   = getDiasCobertura(saldo, cfg)
  const st     = STATUS_STYLE[status]

  // Barra de progreso: muestra días de cobertura relativo a 30 días (un mes)
  // Para especies sin umbral (Sitotroga, Galleria) muestra barra neutra
  const barPct = cfg.promedioSalidaDiaria === null
    ? (saldo >= 0 ? 100 : 0)
    : Math.min(100, Math.max(0, (dias! / 30) * 100))

  return (
    <div
      className="vs-card h-100"
      style={status !== 'normal' ? { border: `1.5px solid ${st.badge}`, background: st.bg } : undefined}
    >
      {/* Header */}
      <div className="d-flex align-items-center gap-2 mb-3">
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
        <h6 className="fw-semibold mb-0 flex-grow-1" style={{ fontStyle: 'italic' }}>{cfg.label}</h6>
        {status !== 'normal' && (
          <span className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded"
            style={{ background: st.badge, color: '#fff', fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.03em', whiteSpace: 'nowrap' }}>
            {st.icon} {status === 'critico' ? 'Crítico' : 'Bajo'}
          </span>
        )}
        {status === 'normal' && cfg.promedioSalidaDiaria !== null && (
          <span className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded"
            style={{ background: '#dcfce7', color: '#15803d', fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.03em' }}>
            ✓ Saludable
          </span>
        )}
        {cfg.promedioSalidaDiaria === null && (
          <span className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded"
            style={{ background: '#f3f4f6', color: '#6b7280', fontSize: '.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.03em' }}>
            Ciclo continuo
          </span>
        )}
      </div>

      {/* Métricas */}
      <div className="row g-2 mb-3">
        {[
          { lbl: 'Producción', val: totalProd, color: cfg.color },
          { lbl: 'Salidas',    val: totalSalida, color: '#dc2626' },
          { lbl: 'Saldo',      val: saldo, color: saldo >= 0 ? '#14532d' : '#dc2626' },
        ].map(({ lbl, val, color }) => (
          <div key={lbl} className="col-4 text-center">
            <div className="text-muted" style={{ fontSize: '.7rem', textTransform: 'uppercase', fontWeight: 600 }}>{lbl}</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color }}>{val.toLocaleString('es-PE', { maximumFractionDigits: 1 })}</div>
            <div className="text-muted" style={{ fontSize: '.7rem' }}>{cfg.unidad}</div>
          </div>
        ))}
      </div>

      {/* Barra de cobertura */}
      {cfg.promedioSalidaDiaria !== null && (
        <>
          <div className="mb-1 d-flex justify-content-between" style={{ fontSize: '.75rem', color: '#6b7280' }}>
            <span>Cobertura estimada</span>
            <span style={{ color: status !== 'normal' ? st.badge : '#15803d', fontWeight: 600 }}>
              {dias} días
            </span>
          </div>
          <div className="progress mb-1" style={{ height: 6, borderRadius: 4, background: '#f3f4f6' }}>
            <div className="progress-bar" style={{ width: `${barPct}%`, background: st.barColor, borderRadius: 4, transition: 'width .4s ease' }} />
          </div>
          <div style={{ fontSize: '.7rem', color: '#9ca3af', marginBottom: 4 }}>
            Referencia: 30 días · Promedio salida {cfg.promedioSalidaDiaria.toLocaleString('es-PE')} {cfg.unidad}/día
          </div>
        </>
      )}

      {/* Para especies de ciclo continuo */}
      {cfg.promedioSalidaDiaria === null && (
        <div className="mt-1" style={{ fontSize: '.75rem', color: '#6b7280', lineHeight: 1.5 }}>
          {cfg.label === 'Sitotroga cerealella'
            ? '⚙️ Produce y entrega el mismo día — saldo cero es el comportamiento esperado.'
            : '⚙️ Opera con saldo variable por ciclo biológico — el negativo es normal y esperado.'}
        </div>
      )}

      {/* Alerta inline */}
      {status !== 'normal' && (
        <div className="mt-2 px-2 py-1 rounded" style={{ background: st.badge + '18', fontSize: '.72rem', color: st.text, fontWeight: 500 }}>
          {status === 'critico'
            ? `⚠️ Menos de 7 días de cobertura. Programar producción con urgencia.`
            : `⚡ Entre 7 y 14 días de cobertura. Considerar incrementar producción.`}
        </div>
      )}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────
export default function InventarioPage() {
  const { data: sitotroga    = [] } = useSitotroga()
  const { data: trichogramma = [] } = useTrichogramma()
  const { data: galleria     = [] } = useGalleria()
  const { data: paratheresia = [] } = useParatheresia()
  const { data: notasSit     = [] } = useNotasSitodroga()
  const { data: notasAvis    = [] } = useNotasAvispitas()
  const { data: notasMosc    = [] } = useNotasMoscas()
  const { data: notasGall    = [] } = useNotasGalleria()

  const datasets = [
    { cfg: ESPECIES_CONFIG[0], produccion: sitotroga,    notas: notasSit  },
    { cfg: ESPECIES_CONFIG[1], produccion: trichogramma, notas: notasAvis },
    { cfg: ESPECIES_CONFIG[2], produccion: galleria,     notas: notasGall },
    { cfg: ESPECIES_CONFIG[3], produccion: paratheresia, notas: notasMosc },
  ]

  // Banner: solo especies con umbral definido y estado no-normal
  const alertas = datasets
    .filter(d => d.cfg.promedioSalidaDiaria !== null)
    .map(d => {
      const { saldo } = calcularSaldo(d.produccion, d.notas)
      const status    = getStockStatus(saldo, d.cfg)
      const dias      = getDiasCobertura(saldo, d.cfg) ?? 0
      return { label: d.cfg.label, status, dias }
    })
    .filter(a => a.status !== 'normal')

  return (
    <div>
      <div className="mb-4">
        <h1 className="vs-page-title mb-0">Inventario</h1>
        <p className="text-muted" style={{ fontSize: '.85rem' }}>
          Stock actual por especie · Alertas basadas en días de cobertura operativa
        </p>
      </div>

      <AlertaBanner alertas={alertas} />

      <div className="row g-3">
        {datasets.map(d => (
          <div key={d.cfg.label} className="col-md-6">
            <InventarioCard {...d} />
          </div>
        ))}
      </div>
    </div>
  )
}
