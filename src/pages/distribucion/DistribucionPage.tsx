import { useState } from 'react'
import { useNotasSitodroga, useNotasAvispitas, useNotasMoscas, useNotasGalleria, useLugaresAvispitas, useLugaresMoscas } from '@/hooks/useProduccion'

type TabKey = 'sitodroga' | 'avispitas' | 'moscas' | 'galleria'

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

  const lugarNombre = (lugares: any[], id: number | null) =>
    lugares.find((l: any) => l.id === id)?.nombre ?? '—'

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'sitodroga', label: 'Sitotroga' },
    { key: 'avispitas', label: 'Trichogramma' },
    { key: 'moscas',    label: 'Paratheresia' },
    { key: 'galleria',  label: 'Galleria' },
  ]

  return (
    <div>
      <div className="mb-4">
        <h1 className="vs-page-title mb-0">Distribución</h1>
        <p className="text-muted" style={{ fontSize: '.85rem' }}>Historial de notas de salida por especie</p>
      </div>

      {/* Filtro fechas */}
      <div className="vs-card mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label fw-semibold">Fecha inicio</label>
            <input type="date" className="form-control" value={fi} onChange={e => setFi(e.target.value)} />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">Fecha fin</label>
            <input type="date" className="form-control" value={ff} onChange={e => setFf(e.target.value)} />
          </div>
          <div className="col-md-2">
            <button className="btn btn-outline-secondary w-100" onClick={() => { setFi(''); setFf('') }}>
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        {TABS.map(t => (
          <li key={t.key} className="nav-item">
            <button className={`nav-link ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          </li>
        ))}
      </ul>

      {/* Sitodroga */}
      {tab === 'sitodroga' && (
        <div className="vs-card">
          <table className="table vs-table mb-0">
            <thead><tr><th>#</th><th>Fecha</th><th>Tipo salida</th><th>Cantidad (g)</th><th>Factor</th><th>Descripción</th></tr></thead>
            <tbody>
              {notasSit.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-4">Sin registros</td></tr>}
              {notasSit.map((n: any) => (
                <tr key={n.id}>
                  <td>{n.id}</td><td>{n.fecha}</td>
                  <td><span className="badge bg-primary">{n.tiposalida}</span></td>
                  <td>{n.cantidad}</td><td>{n.factor}</td><td>{n.descripcion ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Avispitas */}
      {tab === 'avispitas' && (
        <div className="vs-card">
          <table className="table vs-table mb-0">
            <thead><tr><th>#</th><th>Fecha</th><th>Tipo salida</th><th>Lugar</th><th>Cantidad (pulg²)</th><th>Descripción</th></tr></thead>
            <tbody>
              {notasAvis.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-4">Sin registros</td></tr>}
              {notasAvis.map((n: any) => (
                <tr key={n.id}>
                  <td>{n.id}</td><td>{n.fecha}</td>
                  <td><span className="badge bg-primary">{n.tiposalida}</span></td>
                  <td>{lugarNombre(lugaresAvis, n.id_lugarliberacion)}</td>
                  <td>{n.cantidad}</td><td>{n.descripcion ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Moscas */}
      {tab === 'moscas' && (
        <div className="vs-card">
          <table className="table vs-table mb-0">
            <thead><tr><th>#</th><th>Fecha</th><th>Tipo salida</th><th>Lugar</th><th>Cantidad (parejas)</th><th>Descripción</th></tr></thead>
            <tbody>
              {notasMosc.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-4">Sin registros</td></tr>}
              {notasMosc.map((n: any) => (
                <tr key={n.id}>
                  <td>{n.id}</td><td>{n.fecha}</td>
                  <td><span className="badge bg-primary">{n.tiposalida}</span></td>
                  <td>{lugarNombre(lugaresMosc, n.id_lugarliberacion)}</td>
                  <td>{n.cantidad}</td><td>{n.descripcion ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Galleria */}
      {tab === 'galleria' && (
        <div className="vs-card">
          <table className="table vs-table mb-0">
            <thead><tr><th>#</th><th>Fecha</th><th>Tipo salida</th><th>Cantidad</th><th>Ratio</th><th>Descripción</th></tr></thead>
            <tbody>
              {notasGall.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-4">Sin registros</td></tr>}
              {notasGall.map((n: any) => (
                <tr key={n.id}>
                  <td>{n.id}</td><td>{n.fecha}</td>
                  <td><span className="badge bg-primary">{n.tiposalida}</span></td>
                  <td>{n.cantidad}</td><td>{n.ratio ?? '—'}</td><td>{n.descripcion ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}