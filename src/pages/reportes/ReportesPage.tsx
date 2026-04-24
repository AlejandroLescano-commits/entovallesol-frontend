import { useState } from 'react'
import {
  descargarExcelSitotroga, descargarExcelTrichogramma,
  descargarExcelGalleria, descargarExcelParatheresia,
  descargarExcelNotasSitodroga, descargarExcelNotasAvispitas,
  descargarExcelNotasMoscas, descargarExcelNotasGalleria,
} from '@/services/reportesApi'
import toast from 'react-hot-toast'

const hoy = new Date().toISOString().split('T')[0]
const haceTreinta = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]

export default function ReportesPage() {
  const [fi, setFi] = useState(haceTreinta)
  const [ff, setFf] = useState(hoy)
  const [loading, setLoading] = useState<string | null>(null)

  const descargar = async (key: string, fn: () => Promise<void>) => {
    setLoading(key)
    try { await fn(); toast.success('Descargando...') }
    catch { toast.error('Error al generar reporte') }
    finally { setLoading(null) }
  }

  const reportes = [
    { key: 'sit',  label: 'Producción Sitotroga',     fn: () => descargarExcelSitotroga(fi, ff) },
    { key: 'tri',  label: 'Producción Trichogramma',   fn: () => descargarExcelTrichogramma(fi, ff) },
    { key: 'gal',  label: 'Producción Galleria',       fn: () => descargarExcelGalleria(fi, ff) },
    { key: 'par',  label: 'Producción Paratheresia',   fn: () => descargarExcelParatheresia(fi, ff) },
    { key: 'ns',   label: 'Notas Salida Sitodroga',    fn: () => descargarExcelNotasSitodroga(fi, ff) },
    { key: 'na',   label: 'Notas Salida Avispitas',    fn: () => descargarExcelNotasAvispitas(fi, ff) },
    { key: 'nm',   label: 'Notas Salida Moscas',       fn: () => descargarExcelNotasMoscas(fi, ff) },
    { key: 'ng',   label: 'Notas Salida Galleria',     fn: () => descargarExcelNotasGalleria(fi, ff) },
  ]

  return (
    <div>
      <div className="mb-4">
        <h1 className="vs-page-title mb-0">Reportes</h1>
        <p className="text-muted" style={{ fontSize: '.85rem' }}>Descarga Excel por rango de fechas</p>
      </div>

      <div className="vs-card mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label fw-semibold">Fecha inicio</label>
            <input type="date" className="form-control" value={fi} onChange={e => setFi(e.target.value)} />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Fecha fin</label>
            <input type="date" className="form-control" value={ff} onChange={e => setFf(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="row g-3">
        {reportes.map(({ key, label, fn }) => (
          <div key={key} className="col-md-6 col-lg-3">
            <div className="vs-stat-card d-flex flex-column gap-2">
              <span style={{ fontSize: '.85rem', fontWeight: 600 }}>{label}</span>
              <button className="btn-vs btn w-100" onClick={() => descargar(key, fn)} disabled={loading === key}>
                {loading === key ? <span className="spinner-border spinner-border-sm" /> : '⬇ Descargar Excel'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}