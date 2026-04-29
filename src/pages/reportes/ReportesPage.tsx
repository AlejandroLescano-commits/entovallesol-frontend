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

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]

const ANIOS = [2023, 2024, 2025, 2026]

export default function ReportesPage() {
  // Notas de salida — rango de fechas
  const [fi, setFi] = useState(haceTreinta)
  const [ff, setFf] = useState(hoy)

  // Producción mensual — mes + año
  const mesActual = new Date().getMonth() + 1
  const anioActual = new Date().getFullYear()
  const [mes, setMes] = useState(mesActual)
  const [anio, setAnio] = useState(anioActual)

  const [loading, setLoading] = useState<string | null>(null)

  const descargar = async (key: string, fn: () => Promise<void>) => {
    setLoading(key)
    try { await fn(); toast.success('Descargando...') }
    catch { toast.error('Error al generar reporte') }
    finally { setLoading(null) }
  }

  const notasSalida = [
    { key: 'ns', label: 'Notas Sitotroga',  sub: 'Huevos · gramos',           fn: () => descargarExcelNotasSitodroga(fi, ff) },
    { key: 'na', label: 'Notas Avispitas',  sub: 'Trichogramma · pulg²',       fn: () => descargarExcelNotasAvispitas(fi, ff) },
    { key: 'nm', label: 'Notas Moscas',     sub: 'Paratheresia · parejas',     fn: () => descargarExcelNotasMoscas(fi, ff) },
    { key: 'ng', label: 'Notas Galleria',   sub: 'Galleria · unidades',        fn: () => descargarExcelNotasGalleria(fi, ff) },
  ]

  const produccionMensual = [
    { key: 'sit', label: 'Producción Sitotroga',   sub: 'Huevos · gramos + Crysopas', fn: () => descargarExcelSitotroga(mes, anio) },
    { key: 'tri', label: 'Producción Avispitas',   sub: 'Trichogramma · pulg²',        fn: () => descargarExcelTrichogramma(mes, anio) },
    { key: 'par', label: 'Producción Moscas',      sub: 'Paratheresia · parejas',      fn: () => descargarExcelParatheresia(mes, anio) },
    { key: 'gal', label: 'Producción Galleria',    sub: 'Galleria · unidades',         fn: () => descargarExcelGalleria(mes, anio) },
  ]

  const Btn = ({ k, fn }: { k: string; fn: () => Promise<void> }) => (
    <button className="btn-vs btn w-100" onClick={() => descargar(k, fn)} disabled={loading === k}>
      {loading === k
        ? <span className="spinner-border spinner-border-sm" />
        : '⬇ Descargar Excel'}
    </button>
  )

  return (
    <div>
      <div className="mb-4">
        <h1 className="vs-page-title mb-0">Reportes</h1>
        <p className="text-muted" style={{ fontSize: '.85rem' }}>Descarga reportes Excel de producción y notas de salida</p>
      </div>

      {/* ── Bloque 1: Notas de salida ── */}
      <div className="vs-card mb-3">
        <p className="text-muted mb-2" style={{ fontSize: '.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>
          Rango de fechas — notas de salida
        </p>
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

      <div className="row g-3 mb-4">
        {notasSalida.map(({ key, label, sub, fn }) => (
          <div key={key} className="col-md-6 col-lg-3">
            <div className="vs-stat-card d-flex flex-column gap-2">
              <span style={{ fontSize: '.85rem', fontWeight: 600 }}>{label}</span>
              <span className="text-muted" style={{ fontSize: '.75rem' }}>{sub}</span>
              <Btn k={key} fn={fn} />
            </div>
          </div>
        ))}
      </div>

      <hr className="my-4" />

      {/* ── Bloque 2: Producción mensual ── */}
      <div className="vs-card mb-3">
        <p className="text-muted mb-2" style={{ fontSize: '.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>
          Mes y año — producción mensual
        </p>
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label fw-semibold">Mes</label>
            <select className="form-select" value={mes} onChange={e => setMes(Number(e.target.value))}>
              {MESES.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label fw-semibold">Año</label>
            <select className="form-select" value={anio} onChange={e => setAnio(Number(e.target.value))}>
              {ANIOS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {produccionMensual.map(({ key, label, sub, fn }) => (
          <div key={key} className="col-md-6 col-lg-3">
            <div className="vs-stat-card d-flex flex-column gap-2">
              <span style={{ fontSize: '.85rem', fontWeight: 600 }}>{label}</span>
              <span className="text-muted" style={{ fontSize: '.75rem' }}>{sub}</span>
              <Btn k={key} fn={fn} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
