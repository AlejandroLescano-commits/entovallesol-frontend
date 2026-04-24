import { useState } from 'react'
import { usePrediccionTodas } from '@/hooks/useProduccion'

const ESPECIES = [
  { key: 'sitotroga',    label: 'Sitotroga',    unidad: 'g' },
  { key: 'trichogramma', label: 'Trichogramma', unidad: 'pulg²' },
  { key: 'galleria',     label: 'Galleria',     unidad: 'unid.' },
  { key: 'paratheresia', label: 'Paratheresia', unidad: 'parejas' },
]

export default function PrediccionPage() {
  const [dias, setDias] = useState(30)
  const [diasInput, setDiasInput] = useState('30')
  const { data, isLoading, refetch } = usePrediccionTodas(dias)

  const aplicar = () => {
    const n = parseInt(diasInput)
    if (n > 0 && n <= 365) setDias(n)
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="vs-page-title mb-0">Predicción de Demanda</h1>
        <p className="text-muted" style={{ fontSize: '.85rem' }}>Regresión lineal sobre datos históricos de producción</p>
      </div>

      <div className="vs-card mb-4">
        <div className="d-flex align-items-end gap-3">
          <div>
            <label className="form-label fw-semibold">Días a predecir</label>
            <input type="number" className="form-control" style={{ width: 120 }} min={1} max={365}
              value={diasInput} onChange={e => setDiasInput(e.target.value)} />
          </div>
          <button className="btn-vs btn" onClick={aplicar}>Calcular</button>
          <button className="btn btn-outline-secondary" onClick={() => refetch()}>↺ Actualizar</button>
        </div>
      </div>

      {isLoading && <div className="vs-spinner"><div className="spinner-border text-success" /></div>}

      {data && (
        <div className="d-flex flex-column gap-4">
          {ESPECIES.map(({ key, label, unidad }) => {
            const r = data[key]
            if (!r || r.error) return (
              <div key={key} className="vs-card">
                <h6 className="fw-semibold">{label}</h6>
                <p className="text-muted mb-0">{r?.error ?? 'Sin datos'}</p>
              </div>
            )
            return (
              <div key={key} className="vs-card">
                <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
                  <div>
                    <h6 className="fw-semibold mb-0">{label}</h6>
                    <small className="text-muted">{r.especie} — {r.unidad}</small>
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    <span className="badge bg-light text-dark border">R² {r.r2_score}</span>
                    <span className={`badge ${r.tendencia === 'creciente' ? 'badge-creciente' : 'badge-decreciente'}`}>
                      {r.tendencia === 'creciente' ? '↑' : '↓'} {r.tendencia}
                    </span>
                    <span className="badge bg-light text-dark border">Prom. hist. {r.promedio_historico} {unidad}</span>
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table vs-table mb-0">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Demanda estimada ({unidad})</th>
                        <th>Producción necesaria ({unidad})</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.predicciones.map((p: any) => (
                        <tr key={p.fecha}>
                          <td>{p.fecha}</td>
                          <td>{p.demanda_estimada}</td>
                          <td><strong>{p.produccion_necesaria}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}