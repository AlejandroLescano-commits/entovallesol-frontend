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

/* ─── Chip de especie ─────────────────────────────────────────────────────── */
function EspecieChip({ label }: { label: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '1px 8px', borderRadius: 4,
      fontSize: '.7rem', fontWeight: 600, letterSpacing: '.04em',
      background: 'var(--vs-primary-soft)', color: 'var(--vs-primary)',
      textTransform: 'uppercase',
    }}>
      {label}
    </span>
  )
}

/* ─── Download button ─────────────────────────────────────────────────────── */
function DownloadBtn({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: '100%', padding: '8px 0', borderRadius: 8, border: 'none',
        background: loading ? 'var(--vs-neutral-soft)' : 'var(--vs-primary)',
        color: loading ? 'var(--vs-text-muted)' : '#fff',
        fontSize: '.82rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'opacity .15s, background .15s',
        letterSpacing: '.02em',
      }}
      onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = '.88' }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
    >
      {loading
        ? <><span style={{ width: 12, height: 12, border: '2px solid #ccc', borderTopColor: '#888', borderRadius: '50%', display: 'inline-block', animation: 'spin .6s linear infinite' }} /> Generando...</>
        : <>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 1v9M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Descargar Excel
          </>
      }
    </button>
  )
}

/* ─── Report card ─────────────────────────────────────────────────────────── */
function ReportCard({
  title, especie, unidad, loading, onDownload,
}: {
  title: string; especie: string; unidad: string; loading: boolean; onDownload: () => void
}) {
  return (
    <div style={{
      background: 'var(--vs-bg-card)', border: '1px solid var(--vs-border)',
      borderRadius: 10, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <EspecieChip label={especie} />
        <span style={{ fontWeight: 600, fontSize: '.9rem', color: 'var(--vs-text-primary)' }}>{title}</span>
        <span style={{ fontSize: '.76rem', color: 'var(--vs-text-muted)' }}>{unidad}</span>
      </div>
      <DownloadBtn loading={loading} onClick={onDownload} />
    </div>
  )
}

/* ─── Section header ──────────────────────────────────────────────────────── */
function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
        <div style={{ width: 3, height: 18, borderRadius: 2, background: 'var(--vs-primary)', flexShrink: 0 }} />
        <span style={{ fontWeight: 700, fontSize: '.92rem', color: 'var(--vs-text-primary)' }}>{title}</span>
      </div>
      <p style={{ margin: 0, fontSize: '.78rem', color: 'var(--vs-text-muted)', paddingLeft: 13 }}>{description}</p>
    </div>
  )
}

/* ─── Main ────────────────────────────────────────────────────────────────── */
export default function ReportesPage() {
  const [fi, setFi] = useState(haceTreinta)
  const [ff, setFf] = useState(hoy)

  const mesActual  = new Date().getMonth() + 1
  const anioActual = new Date().getFullYear()
  const [mes, setMes]   = useState(mesActual)
  const [anio, setAnio] = useState(anioActual)

  const [loading, setLoading] = useState<string | null>(null)

  const descargar = async (key: string, fn: () => Promise<void>) => {
    setLoading(key)
    try { await fn(); toast.success('Archivo generado correctamente') }
    catch { toast.error('Error al generar el reporte') }
    finally { setLoading(null) }
  }

  const notasSalida = [
    { key: 'ns', title: 'Notas de Salida',  especie: 'Sitotroga',    unidad: 'Huevos — gramos',            fn: () => descargarExcelNotasSitodroga(fi, ff) },
    { key: 'na', title: 'Notas de Salida',  especie: 'Trichogramma', unidad: 'Avispitas — pulg²',           fn: () => descargarExcelNotasAvispitas(fi, ff) },
    { key: 'nm', title: 'Notas de Salida',  especie: 'Paratheresia', unidad: 'Moscas — parejas',            fn: () => descargarExcelNotasMoscas(fi, ff) },
    { key: 'ng', title: 'Notas de Salida',  especie: 'Galleria',     unidad: 'Larvas — unidades',           fn: () => descargarExcelNotasGalleria(fi, ff) },
  ]

  const produccionMensual = [
    { key: 'sit', title: 'Producción Mensual', especie: 'Sitotroga',    unidad: 'Huevos — gramos + Crysopas', fn: () => descargarExcelSitotroga(mes, anio) },
    { key: 'tri', title: 'Producción Mensual', especie: 'Trichogramma', unidad: 'Avispitas — pulg²',           fn: () => descargarExcelTrichogramma(mes, anio) },
    { key: 'par', title: 'Producción Mensual', especie: 'Paratheresia', unidad: 'Moscas — parejas',            fn: () => descargarExcelParatheresia(mes, anio) },
    { key: 'gal', title: 'Producción Mensual', especie: 'Galleria',     unidad: 'Larvas — unidades',           fn: () => descargarExcelGalleria(mes, anio) },
  ]

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        :root {
          --vs-primary:      #16a34a;
          --vs-primary-soft: #dcfce7;
          --vs-success:      #15803d;
          --vs-success-soft: #dcfce7;
          --vs-neutral-soft: #f3f4f6;
          --vs-border:       #e5e7eb;
          --vs-text-primary:   #111827;
          --vs-text-secondary: #374151;
          --vs-text-muted:     #9ca3af;
          --vs-bg-card:      #ffffff;
          --vs-bg-page:      #f9fafb;
        }
        .vs-section-card {
          background: var(--vs-bg-card);
          border: 1px solid var(--vs-border);
          border-radius: 12px;
          padding: 20px 20px 6px;
          margin-bottom: 16px;
        }
        .vs-filter-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }
        .vs-filter-row-3 {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }
        .vs-form-label {
          display: block; font-size: .78rem; font-weight: 600;
          color: var(--vs-text-secondary); margin-bottom: 5px;
        }
        .vs-input {
          width: 100%; padding: 8px 12px; font-size: .85rem;
          border: 1px solid var(--vs-border); border-radius: 8px;
          background: #fff; color: var(--vs-text-primary);
          transition: border-color .15s; box-sizing: border-box;
        }
        .vs-input:focus {
          outline: none; border-color: var(--vs-primary);
          box-shadow: 0 0 0 3px rgba(22,163,74,.1);
        }
        .vs-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 8px;
        }
        .vs-divider {
          border: none; border-top: 1px solid var(--vs-border);
          margin: 28px 0;
        }
        @media (max-width: 900px) {
          .vs-grid-4 { grid-template-columns: repeat(2, 1fr); }
          .vs-filter-row { grid-template-columns: 1fr; }
          .vs-filter-row-3 { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 540px) {
          .vs-grid-4 { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Encabezado */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontWeight: 700, fontSize: '1.4rem', color: 'var(--vs-text-primary)' }}>
          Reportes
        </h1>
        <p style={{ margin: '3px 0 0', fontSize: '.83rem', color: 'var(--vs-text-muted)' }}>
          Exportación de datos de producción y distribución en formato Excel
        </p>
      </div>

      {/* ── Sección 1: Notas de salida ── */}
      <div className="vs-section-card">
        <SectionHeader
          title="Notas de salida por rango de fechas"
          description="Selecciona el período para filtrar las notas de salida de cada especie"
        />
        <div className="vs-filter-row">
          <div>
            <label className="vs-form-label">Fecha inicio</label>
            <input type="date" className="vs-input" value={fi} onChange={e => setFi(e.target.value)} />
          </div>
          <div>
            <label className="vs-form-label">Fecha fin</label>
            <input type="date" className="vs-input" value={ff} onChange={e => setFf(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="vs-grid-4" style={{ marginBottom: 0 }}>
        {notasSalida.map(({ key, title, especie, unidad, fn }) => (
          <ReportCard
            key={key}
            title={title}
            especie={especie}
            unidad={unidad}
            loading={loading === key}
            onDownload={() => descargar(key, fn)}
          />
        ))}
      </div>

      <hr className="vs-divider" />

      {/* ── Sección 2: Producción mensual ── */}
      <div className="vs-section-card">
        <SectionHeader
          title="Producción mensual por especie"
          description="Selecciona el mes y año para exportar el resumen de producción"
        />
        <div className="vs-filter-row-3">
          <div>
            <label className="vs-form-label">Mes</label>
            <select className="vs-input" value={mes} onChange={e => setMes(Number(e.target.value))}>
              {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="vs-form-label">Año</label>
            <select className="vs-input" value={anio} onChange={e => setAnio(Number(e.target.value))}>
              {ANIOS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="vs-grid-4">
        {produccionMensual.map(({ key, title, especie, unidad, fn }) => (
          <ReportCard
            key={key}
            title={title}
            especie={especie}
            unidad={unidad}
            loading={loading === key}
            onDownload={() => descargar(key, fn)}
          />
        ))}
      </div>
    </>
  )
}
