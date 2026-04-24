import { useSitotroga, useTrichogramma, useGalleria, useParatheresia, useNotasSitodroga, useNotasAvispitas, useNotasMoscas, useNotasGalleria } from '@/hooks/useProduccion'

function calcularSaldo(produccion: any[], notas: any[]) {
  const totalProd = produccion.reduce((s, r) => s + (r.cantidad || 0), 0)
  const totalSalida = notas.reduce((s, n) => s + (n.cantidad || 0), 0)
  return { totalProd, totalSalida, saldo: totalProd - totalSalida }
}

function InventarioCard({ label, unidad, produccion, notas, color }: {
  label: string; unidad: string; produccion: any[]; notas: any[]; color: string
}) {
  const { totalProd, totalSalida, saldo } = calcularSaldo(produccion, notas)
  const pct = totalProd > 0 ? Math.max(0, Math.min(100, (saldo / totalProd) * 100)) : 0

  return (
    <div className="vs-card h-100">
      <div className="d-flex align-items-center gap-2 mb-3">
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <h6 className="fw-semibold mb-0">{label}</h6>
      </div>

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

      <div className="mb-1 d-flex justify-content-between" style={{ fontSize: '.75rem', color: '#6b7280' }}>
        <span>Stock disponible</span>
        <span>{pct.toFixed(0)}%</span>
      </div>
      <div className="progress" style={{ height: 6, borderRadius: 4 }}>
        <div
          className="progress-bar"
          style={{ width: `${pct}%`, background: color, borderRadius: 4 }}
        />
      </div>
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

  return (
    <div>
      <div className="mb-4">
        <h1 className="vs-page-title mb-0">Inventario</h1>
        <p className="text-muted" style={{ fontSize: '.85rem' }}>Saldo actual por especie (producción acumulada − salidas acumuladas)</p>
      </div>

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