import { useRef, useState } from 'react'
import { importarSitotroga, importarTrichogramma, importarGalleria, importarParatheresia } from '@/services/importacionApi'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const ESPECIES = [
  { key: 'sitotroga',    label: 'Sitotroga cerealella',     sub: 'Huevos — gramos',      fn: importarSitotroga,    accent: '#16a34a' },
  { key: 'trichogramma', label: 'Trichogramma',             sub: 'Avispitas — pulg²',    fn: importarTrichogramma, accent: '#1d4ed8' },
  { key: 'galleria',     label: 'Galleria melonella',       sub: 'Larvas — unidades',    fn: importarGalleria,     accent: '#b45309' },
  { key: 'paratheresia', label: 'Paratheresia claripalpis', sub: 'Moscas — parejas',     fn: importarParatheresia, accent: '#7c3aed' },
]

type Resultado = { importados: number; errores: number }

/* ─── Upload card ─────────────────────────────────────────────────────────── */
function UploadCard({
  label, sub, accent, loading, resultado, onUpload,
}: {
  label: string; sub: string; accent: string
  loading: boolean; resultado?: Resultado; onUpload: () => void
}) {
  const hasResult = resultado !== undefined
  const hasErrors = hasResult && resultado.errores > 0
  const allOk     = hasResult && resultado.errores === 0

  return (
    <div style={{
      background: '#fff', border: '1px solid var(--vs-border)', borderRadius: 10,
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      {/* Accent top bar */}
      <div style={{ height: 3, background: accent }} />

      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {/* Header */}
        <div>
          <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--vs-text-primary)', marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: '.75rem', color: 'var(--vs-text-muted)' }}>{sub}</div>
        </div>

        {/* Resultado anterior */}
        {hasResult && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', borderRadius: 8,
            background: allOk ? 'var(--vs-success-soft)' : 'var(--vs-warn-soft)',
            border: `1px solid ${allOk ? '#86efac' : '#fcd34d'}`,
          }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              {allOk
                ? <path d="M3 8l3.5 3.5L13 5" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                : <path d="M8 5v4M8 11v.5" stroke="#d97706" strokeWidth="2" strokeLinecap="round"/>
              }
            </svg>
            <span style={{ fontSize: '.78rem', fontWeight: 600, color: allOk ? 'var(--vs-success)' : 'var(--vs-warn)' }}>
              {resultado.importados} importados
              {hasErrors && <span style={{ marginLeft: 6, fontWeight: 400 }}>— {resultado.errores} con errores</span>}
            </span>
          </div>
        )}

        {/* Botón */}
        <button
          disabled={loading}
          onClick={onUpload}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '9px 0', borderRadius: 8, border: `1.5px solid ${loading ? 'var(--vs-border)' : accent}`,
            background: loading ? 'var(--vs-neutral-soft)' : `${accent}12`,
            color: loading ? 'var(--vs-text-muted)' : accent,
            fontSize: '.82rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all .15s', width: '100%',
          }}
          onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.background = `${accent}22` } }}
          onMouseLeave={e => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.background = `${accent}12` } }}
        >
          {loading
            ? <>
                <span style={{ width: 12, height: 12, border: '2px solid #ccc', borderTopColor: '#888', borderRadius: '50%', display: 'inline-block', animation: 'spin .6s linear infinite' }} />
                Procesando...
              </>
            : <>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path d="M8 11V2M4 5l4-4 4 4M2 13h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Seleccionar archivo e importar
              </>
          }
        </button>
      </div>
    </div>
  )
}

/* ─── Main ────────────────────────────────────────────────────────────────── */
export default function ImportacionPage() {
  const rol = useAuthStore(s => s.user?.rol)
  const [loadingKey, setLoadingKey] = useState<string | null>(null)
  const [resultados, setResultados] = useState<Record<string, Resultado>>({})
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  if (rol !== 'admin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 12, color: 'var(--vs-text-muted)' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M12 2a5 5 0 0 1 5 5v2h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h1V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v2h6V7a3 3 0 0 0-3-3z" fill="#9ca3af"/></svg>
        <p style={{ margin: 0, fontSize: '.9rem', fontWeight: 500 }}>Solo los administradores pueden importar datos.</p>
      </div>
    )
  }

  const handleFile = async (key: string, fn: (f: File) => Promise<Resultado>, file: File) => {
    setLoadingKey(key)
    try {
      const res = await fn(file)
      setResultados(r => ({ ...r, [key]: res }))
      toast.success(`${res.importados} registros importados${res.errores ? `, ${res.errores} con errores` : ' sin errores'}`)
    } catch {
      toast.error('Error al procesar el archivo')
    } finally {
      setLoadingKey(null)
      if (inputRefs.current[key]) inputRefs.current[key]!.value = ''
    }
  }

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        :root {
          --vs-primary:      #16a34a;
          --vs-primary-soft: #dcfce7;
          --vs-success:      #15803d;
          --vs-success-soft: #dcfce7;
          --vs-warn:         #d97706;
          --vs-warn-soft:    #fef3c7;
          --vs-neutral-soft: #f3f4f6;
          --vs-border:       #e5e7eb;
          --vs-text-primary:   #111827;
          --vs-text-secondary: #374151;
          --vs-text-muted:     #9ca3af;
          --vs-bg-card:      #ffffff;
          --vs-bg-page:      #f9fafb;
        }
        .imp-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        @media (max-width: 640px) {
          .imp-grid { grid-template-columns: 1fr; }
        }
        .imp-format-table {
          width: 100%; border-collapse: collapse; font-size: .82rem;
        }
        .imp-format-table thead th {
          padding: 8px 12px; background: var(--vs-bg-page);
          font-size: .72rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: .05em; color: var(--vs-text-muted);
          border-bottom: 1px solid var(--vs-border); text-align: left;
        }
        .imp-format-table tbody td {
          padding: 8px 12px; color: var(--vs-text-secondary);
          border-bottom: 1px solid var(--vs-border); font-family: monospace; font-size: .82rem;
        }
        .imp-format-table tbody tr:last-child td { border-bottom: none; }
        .imp-note {
          display: flex; align-items: flex-start; gap: 10;
          background: #eff6ff; border: 1px solid #bfdbfe;
          border-radius: 8px; padding: 10px 14px;
          font-size: .8rem; color: #1d4ed8; line-height: 1.5;
        }
      `}</style>

      {/* Encabezado */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontWeight: 700, fontSize: '1.4rem', color: 'var(--vs-text-primary)' }}>
          Importación masiva
        </h1>
        <p style={{ margin: '3px 0 0', fontSize: '.83rem', color: 'var(--vs-text-muted)' }}>
          Carga registros de producción desde archivos Excel (.xlsx / .xls)
        </p>
      </div>

      {/* Formato requerido */}
      <div style={{ background: '#fff', border: '1px solid var(--vs-border)', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--vs-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 3, height: 16, borderRadius: 2, background: 'var(--vs-primary)', flexShrink: 0 }} />
          <span style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--vs-text-primary)' }}>Formato requerido</span>
        </div>

        <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0, fontSize: '.82rem', color: 'var(--vs-text-secondary)' }}>
            El archivo Excel debe contener las siguientes columnas en la primera fila:
          </p>

          <div style={{ border: '1px solid var(--vs-border)', borderRadius: 8, overflow: 'hidden', maxWidth: 480 }}>
            <table className="imp-format-table">
              <thead>
                <tr>
                  <th>fecha</th>
                  <th>cantidad</th>
                  <th>id_unidad <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span></th>
                </tr>
              </thead>
              <tbody>
                <tr><td>2024-01-15</td><td>320.5</td><td>1</td></tr>
                <tr><td>2024-01-16</td><td>415.0</td><td></td></tr>
              </tbody>
            </table>
          </div>

          <div className="imp-note">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="8" cy="8" r="7" stroke="#1d4ed8" strokeWidth="1.5"/>
              <path d="M8 7v4M8 5v.5" stroke="#1d4ed8" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>
              La columna <code style={{ background: '#dbeafe', padding: '1px 5px', borderRadius: 4, fontSize: '.78rem' }}>fecha</code> debe estar en formato <strong>YYYY-MM-DD</strong>.
              Las filas con datos inválidos serán contadas como errores y omitidas.
            </span>
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      {ESPECIES.map(({ key, fn }) => (
        <input
          key={key}
          type="file"
          accept=".xlsx,.xls"
          ref={el => { inputRefs.current[key] = el }}
          style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) handleFile(key, fn, file)
          }}
        />
      ))}

      {/* Cards de importación */}
      <div className="imp-grid">
        {ESPECIES.map(({ key, label, sub, accent }) => (
          <UploadCard
            key={key}
            label={label}
            sub={sub}
            accent={accent}
            loading={loadingKey === key}
            resultado={resultados[key]}
            onUpload={() => inputRefs.current[key]?.click()}
          />
        ))}
      </div>
    </>
  )
}
