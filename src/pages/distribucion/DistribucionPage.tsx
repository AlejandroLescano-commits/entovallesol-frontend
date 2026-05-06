import { useState } from 'react'
import { useNotasSitodroga, useNotasAvispitas, useNotasMoscas, useNotasGalleria, useLugaresAvispitas, useLugaresMoscas } from '@/hooks/useProduccion'

type TabKey = 'sitodroga' | 'avispitas' | 'moscas' | 'galleria'

const PAGE_SIZE = 10

function Paginador({ total, pagina, onChange }: { total: number; pagina: number; onChange: (p: number) => void }) {
  const totalPags = Math.ceil(total / PAGE_SIZE)
  if (totalPags <= 1) return null
  return (
    <div className="d-flex align-items-center justify-content-between mt-3">
      <span className="text-muted" style={{ fontSize: '.8rem' }}>
        Página {pagina} de {totalPags} — {total} registros
      </span>
      <div className="d-flex gap-1">
        <button className="btn btn-sm btn-outline-secondary" disabled={pagina === 1} onClick={() => onChange(1)}>«</button>
        <button className="btn btn-sm btn-outline-secondary" disabled={pagina === 1} onClick={() => onChange(pagina - 1)}>‹</button>
        {Array.from({ length: totalPags }, (_, i) => i + 1)
          .filter(p => p === 1 || p === totalPags || Math.abs(p - pagina) <= 1)
          .reduce<(number | '...')[]>((acc, p, i, arr) => {
            if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...')
            acc.push(p)
            return acc
          }, [])
          .map((p, i) =>
            p === '...'
              ? <span key={`e${i}`} className="btn btn-sm disabled">…</span>
              : <button key={p} className={`btn btn-sm ${pagina === p ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => onChange(p as number)}>{p}</button>
          )}
        <button className="btn btn-sm btn-outline-secondary" disabled={pagina === totalPags} onClick={() => onChange(pagina + 1)}>›</button>
        <button className="btn btn-sm btn-outline-secondary" disabled={pagina === totalPags} onClick={() => onChange(totalPags)}>»</button>
      </div>
    </div>
  )
}

function paginar<T>(data: T[], pagina: number): T[] {
  return data.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE)
}

export default function DistribucionPage() {
  const [tab, setTab] = useState<TabKey>('sitodroga')
  const [fi, setFi] = useState('')
  const [ff, setFf] = useState('')
  const [pags, setPags] = useState({ sitodroga: 1, avispitas: 1, moscas: 1, galleria: 1 })

  const params = fi && ff ? { fecha_inicio: fi, fecha_fin: ff } : undefined

  const { data: notasSit  = [] } = useNotasSitodroga(params)
  const { data: notasAvis = [] } = useNotasAvispitas(params)
  const { data: notasMosc = [] } = useNotasMoscas(params)
  const { data: notasGall = [] } = useNotasGalleria(params)
  const { data: lugaresAvis = [] } = useLugaresAvispitas()
  const { data: lugaresMosc = [] } = useLugaresMoscas()

  const lugarNombre = (lugares: any[], id: number | null) =>
    lugares.find((l: any) => l.id === id)?.nombre ?? '—'

  const setPag = (key: TabKey, p: number) => setPags(prev => ({ ...prev, [key]: p }))

  // Resetear página al cambiar filtros
  const limpiar = () => { setFi(''); setFf(''); setPags({ sitodroga: 1, avispitas: 1, moscas: 1, galleria: 1 }) }

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
            <input type="date" className="form-control" value={fi} onChange={e => { setFi(e.target.value); setPags(p => ({ ...p, [tab]: 1 })) }} />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">Fecha fin</label>
            <input type="date" className="form-control" value={ff} onChange={e => { setFf(e.target.value); setPags(p => ({ ...p, [tab]: 1 })) }} />
          </div>
          <div className="col-md-2">
            <button className="btn btn-outline-secondary w-100" onClick={limpiar}>Limpiar</button>
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
              {paginar(notasSit, pags.sitodroga).map((n: any) => (
                <tr key={n.id}>
                  <td>{n.id}</td><td>{n.fecha}</td>
                  <td><span className="badge bg-primary">{n.tiposalida}</span></td>
                  <td>{n.cantidad}</td><td>{n.factor}</td><td>{n.descripcion ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Paginador total={notasSit.length} pagina={pags.sitodroga} onChange={p => setPag('sitodroga', p)} />
        </div>
      )}

      {/* Avispitas */}
      {tab === 'avispitas' && (
        <div className="vs-card">
          <table className="table vs-table mb-0">
            <thead><tr><th>#</th><th>Fecha</th><th>Tipo salida</th><th>Lugar</th><th>Cantidad (pulg²)</th><th>Descripción</th></tr></thead>
            <tbody>
              {notasAvis.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-4">Sin registros</td></tr>}
              {paginar(notasAvis, pags.avispitas).map((n: any) => (
                <tr key={n.id}>
                  <td>{n.id}</td><td>{n.fecha}</td>
                  <td><span className="badge bg-primary">{n.tiposalida}</span></td>
                  <td>{lugarNombre(lugaresAvis, n.id_lugarliberacion)}</td>
                  <td>{n.cantidad}</td><td>{n.descripcion ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Paginador total={notasAvis.length} pagina={pags.avispitas} onChange={p => setPag('avispitas', p)} />
        </div>
      )}

      {/* Moscas */}
      {tab === 'moscas' && (
        <div className="vs-card">
          <table className="table vs-table mb-0">
            <thead><tr><th>#</th><th>Fecha</th><th>Tipo salida</th><th>Lugar</th><th>Cantidad (parejas)</th><th>Descripción</th></tr></thead>
            <tbody>
              {notasMosc.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-4">Sin registros</td></tr>}
              {paginar(notasMosc, pags.moscas).map((n: any) => (
                <tr key={n.id}>
                  <td>{n.id}</td><td>{n.fecha}</td>
                  <td><span className="badge bg-primary">{n.tiposalida}</span></td>
                  <td>{lugarNombre(lugaresMosc, n.id_lugarliberacion)}</td>
                  <td>{n.cantidad}</td><td>{n.descripcion ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Paginador total={notasMosc.length} pagina={pags.moscas} onChange={p => setPag('moscas', p)} />
        </div>
      )}

      {/* Galleria */}
      {tab === 'galleria' && (
        <div className="vs-card">
          <table className="table vs-table mb-0">
            <thead><tr><th>#</th><th>Fecha</th><th>Tipo salida</th><th>Cantidad</th><th>Ratio</th><th>Descripción</th></tr></thead>
            <tbody>
              {notasGall.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-4">Sin registros</td></tr>}
              {paginar(notasGall, pags.galleria).map((n: any) => (
                <tr key={n.id}>
                  <td>{n.id}</td><td>{n.fecha}</td>
                  <td><span className="badge bg-primary">{n.tiposalida}</span></td>
                  <td>{n.cantidad}</td><td>{n.ratio ?? '—'}</td><td>{n.descripcion ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Paginador total={notasGall.length} pagina={pags.galleria} onChange={p => setPag('galleria', p)} />
        </div>
      )}
    </div>
  )
}
