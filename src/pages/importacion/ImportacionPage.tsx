import { useRef, useState } from 'react'
import { importarSitotroga, importarTrichogramma, importarGalleria, importarParatheresia } from '@/services/importacionApi'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const ESPECIES = [
  { key: 'sitotroga',    label: 'Sitotroga cerealella',    fn: importarSitotroga,    color: '#14532d' },
  { key: 'trichogramma', label: 'Trichogramma',            fn: importarTrichogramma, color: '#1d4ed8' },
  { key: 'galleria',     label: 'Galleria melonella',      fn: importarGalleria,     color: '#b45309' },
  { key: 'paratheresia', label: 'Paratheresia claripalpis', fn: importarParatheresia, color: '#7c3aed' },
]

type Resultado = { importados: number; errores: number }

export default function ImportacionPage() {
  const rol = useAuthStore(s => s.user?.rol)
  const [loading, setLoading] = useState<string | null>(null)
  const [resultados, setResultados] = useState<Record<string, Resultado>>({})
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  if (rol !== 'admin') {
    return (
      <div className="vs-card text-center text-muted py-5">
        Solo administradores pueden importar datos.
      </div>
    )
  }

  const handleFile = async (key: string, fn: (f: File) => Promise<Resultado>, file: File) => {
    setLoading(key)
    try {
      const res = await fn(file)
      setResultados(r => ({ ...r, [key]: res }))
      toast.success(`${res.importados} registros importados${res.errores ? `, ${res.errores} errores` : ''}`)
    } catch {
      toast.error('Error al importar archivo')
    } finally {
      setLoading(null)
      if (inputRefs.current[key]) inputRefs.current[key]!.value = ''
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="vs-page-title mb-0">Importación masiva</h1>
        <p className="text-muted" style={{ fontSize: '.85rem' }}>
          Carga registros de producción desde Excel. Columnas requeridas: <code>fecha</code>, <code>cantidad</code>
        </p>
      </div>

      {/* Plantilla de ejemplo */}
      <div className="vs-card mb-4">
        <h6 className="fw-semibold mb-2">Formato del Excel</h6>
        <p className="text-muted mb-2" style={{ fontSize: '.85rem' }}>
          El archivo debe tener estas columnas en la primera fila:
        </p>
        <table className="table vs-table mb-0" style={{ maxWidth: 400 }}>
          <thead><tr><th>fecha</th><th>cantidad</th><th>id_unidad (opcional)</th></tr></thead>
          <tbody>
            <tr><td>2024-01-15</td><td>320.5</td><td>1</td></tr>
            <tr><td>2024-01-16</td><td>415.0</td><td></td></tr>
          </tbody>
        </table>
      </div>

      <div className="row g-3">
        {ESPECIES.map(({ key, label, fn, color }) => {
          const res = resultados[key]
          return (
            <div key={key} className="col-md-6">
              <div className="vs-card h-100">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <h6 className="fw-semibold mb-0">{label}</h6>
                </div>

                <input
                  type="file"
                  accept=".xlsx,.xls"
                  ref={el => { inputRefs.current[key] = el }}
                  style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleFile(key, fn, file)
                  }}
                />

                <button
                  className="btn-vs btn w-100"
                  disabled={loading === key}
                  onClick={() => inputRefs.current[key]?.click()}
                >
                  {loading === key
                    ? <><span className="spinner-border spinner-border-sm me-2" />Procesando...</>
                    : '⬆ Seleccionar Excel e importar'
                  }
                </button>

                {res && (
                  <div className="mt-3 d-flex gap-2">
                    <span className="badge bg-success">✓ {res.importados} importados</span>
                    {res.errores > 0 && <span className="badge bg-warning text-dark">⚠ {res.errores} errores</span>}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}