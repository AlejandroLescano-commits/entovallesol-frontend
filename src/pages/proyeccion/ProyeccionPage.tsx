import { useState } from 'react'
import { useProyeccionParametros, useCalcularProyeccion } from '@/hooks/useProduccion'
import { Calculator, CalendarDays, FlaskConical, ArrowRight, Info } from 'lucide-react'

type Resultado = {
  especie_destino: string
  cantidad_objetivo: number
  fecha_objetivo: string
  especie_origen: string
  cantidad_origen_necesaria: number
  unidad_origen: string
  fecha_inicio_produccion: string
  dias_ciclo: number
  factor: number
}

const LABEL: Record<string, string> = {
  trichogramma: 'Trichogramma',
  paratheresia: 'Paratheresia',
  sitotroga: 'Sitotroga',
  galleria: 'Galleria',
}

const fmt = (dateStr: string) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('es-PE', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

export default function ProyeccionPage() {
  const { data: parametros = [] } = useProyeccionParametros()
  const calcular = useCalcularProyeccion()

  const [especie, setEspecie]     = useState('')
  const [cantidad, setCantidad]   = useState('')
  const [fecha, setFecha]         = useState('')
  const [resultado, setResultado] = useState<Resultado | null>(null)

  const especies = [...new Set(parametros.map((p: any) => p.especie_destino))]

  const handleCalc = async () => {
    if (!especie || !cantidad || !fecha) return
    const res = await calcular.mutateAsync({
      especie_destino: especie,
      cantidad_objetivo: parseFloat(cantidad),
      fecha_objetivo: fecha,
    })
    setResultado(res)
  }

  return (
    <>
      <style>{`
        .proy-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 16px;
        }
        .proy-header {
          padding: 13px 20px;
          border-bottom: 1px solid #e5e7eb;
          display: flex; align-items: center; gap: 10px;
        }
        .proy-accent { width: 3px; height: 16px; border-radius: 2px; background: #16a34a; flex-shrink: 0; }
        .proy-title  { font-weight: 700; font-size: .88rem; color: #111827; }
        .proy-body   { padding: 20px; }
        .proy-grid   { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
        @media(max-width:640px){ .proy-grid { grid-template-columns:1fr; } }
        .proy-label  {
          font-size: .72rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: .05em; color: #9ca3af; margin-bottom: 6px;
        }
        .proy-input, .proy-select {
          width: 100%; padding: 8px 12px; font-size: .88rem;
          border: 1px solid #e5e7eb; border-radius: 8px;
          background: #fff; color: #111827; box-sizing: border-box;
          transition: border-color .15s;
        }
        .proy-input:focus, .proy-select:focus {
          outline: none; border-color: #16a34a;
          box-shadow: 0 0 0 3px rgba(22,163,74,.1);
        }
        .proy-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 9px 22px; border-radius: 8px; font-size: .85rem;
          font-weight: 600; border: none; cursor: pointer;
          background: #16a34a; color: #fff; transition: opacity .15s;
        }
        .proy-btn:hover { opacity: .88; }
        .proy-btn:disabled { opacity: .5; cursor: not-allowed; }
        .proy-result-grid {
          display: grid; grid-template-columns: repeat(2,1fr); gap: 12px;
        }
        @media(max-width:500px){ .proy-result-grid { grid-template-columns:1fr; } }
        .proy-stat {
          background: #f9fafb; border: 1px solid #e5e7eb;
          border-radius: 10px; padding: 14px 16px;
        }
        .proy-stat-label { font-size: .72rem; font-weight: 600; color: #9ca3af; margin-bottom: 4px; }
        .proy-stat-value { font-size: 1.05rem; font-weight: 700; color: #111827; }
        .proy-stat-sub   { font-size: .75rem; color: #6b7280; margin-top: 2px; }
        .proy-highlight  {
          background: #dcfce7; border-color: #86efac;
        }
        .proy-highlight .proy-stat-value { color: #15803d; font-size: 1.2rem; }
        .proy-flow {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 18px; background: #f0fdf4;
          border: 1px solid #bbf7d0; border-radius: 10px;
          margin-bottom: 16px; flex-wrap: wrap;
        }
        .proy-flow-chip {
          padding: 4px 12px; border-radius: 20px; font-size: .8rem;
          font-weight: 600; background: #16a34a; color: #fff;
        }
        .proy-flow-text { font-size: .82rem; color: #166534; }
      `}</style>

      {/* Encabezado */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontWeight: 700, fontSize: '1.4rem', color: '#111827' }}>
          Proyección de Producción
        </h1>
        <p style={{ margin: '3px 0 0', fontSize: '.83rem', color: '#9ca3af' }}>
          Calcula cuánto material origen necesitas y cuándo empezar
        </p>
      </div>

      {/* Formulario */}
      <div className="proy-card">
        <div className="proy-header">
          <div className="proy-accent" />
          <Calculator size={14} color="#16a34a" />
          <span className="proy-title">Parámetros de cálculo</span>
        </div>
        <div className="proy-body">
          <div className="proy-grid" style={{ marginBottom: 20 }}>
            {/* Especie destino */}
            <div>
              <div className="proy-label">Especie objetivo</div>
              <select
                className="proy-select"
                value={especie}
                onChange={e => { setEspecie(e.target.value); setResultado(null) }}
              >
                <option value="">Seleccionar...</option>
                {especies.map((e: any) => (
                  <option key={e} value={e}>{LABEL[e] ?? e}</option>
                ))}
              </select>
            </div>

            {/* Cantidad objetivo */}
            <div>
              <div className="proy-label">Cantidad objetivo</div>
              <input
                className="proy-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ej: 30"
                value={cantidad}
                onChange={e => { setCantidad(e.target.value); setResultado(null) }}
              />
            </div>

            {/* Fecha objetivo */}
            <div>
              <div className="proy-label">Fecha objetivo</div>
              <input
                className="proy-input"
                type="date"
                value={fecha}
                onChange={e => { setFecha(e.target.value); setResultado(null) }}
              />
            </div>
          </div>

          <button
            className="proy-btn"
            onClick={handleCalc}
            disabled={!especie || !cantidad || !fecha || calcular.isPending}
          >
            <Calculator size={15} />
            {calcular.isPending ? 'Calculando...' : 'Calcular proyección'}
          </button>
        </div>
      </div>

      {/* Resultado */}
      {resultado && (
        <div className="proy-card">
          <div className="proy-header">
            <div className="proy-accent" />
            <FlaskConical size={14} color="#16a34a" />
            <span className="proy-title">Resultado</span>
          </div>
          <div className="proy-body">

            {/* Flujo resumen */}
            <div className="proy-flow">
              <span className="proy-flow-chip">{LABEL[resultado.especie_origen] ?? resultado.especie_origen}</span>
              <ArrowRight size={14} color="#16a34a" />
              <span className="proy-flow-text" style={{ fontWeight: 600 }}>
                Factor {resultado.factor} · {resultado.dias_ciclo} días
              </span>
              <ArrowRight size={14} color="#16a34a" />
              <span className="proy-flow-chip">{LABEL[resultado.especie_destino] ?? resultado.especie_destino}</span>
            </div>

            <div className="proy-result-grid">
              {/* Material origen necesario — destacado */}
              <div className="proy-stat proy-highlight">
                <div className="proy-stat-label">Material origen necesario</div>
                <div className="proy-stat-value">
                  {resultado.cantidad_origen_necesaria.toLocaleString('es-PE')}
                </div>
                <div className="proy-stat-sub">
                  {resultado.unidad_origen} de {LABEL[resultado.especie_origen] ?? resultado.especie_origen}
                </div>
              </div>

              {/* Fecha inicio producción — destacado */}
              <div className="proy-stat proy-highlight">
                <div className="proy-stat-label">Iniciar producción el</div>
                <div className="proy-stat-value" style={{ fontSize: '1rem' }}>
                  {fmt(resultado.fecha_inicio_produccion)}
                </div>
                <div className="proy-stat-sub">
                  {resultado.dias_ciclo} días antes de la fecha objetivo
                </div>
              </div>

              <div className="proy-stat">
                <div className="proy-stat-label">Especie objetivo</div>
                <div className="proy-stat-value">
                  {LABEL[resultado.especie_destino] ?? resultado.especie_destino}
                </div>
                <div className="proy-stat-sub">
                  Cantidad: {resultado.cantidad_objetivo.toLocaleString('es-PE')}
                </div>
              </div>

              <div className="proy-stat">
                <div className="proy-stat-label">Fecha objetivo</div>
                <div className="proy-stat-value" style={{ fontSize: '1rem' }}>
                  {fmt(resultado.fecha_objetivo)}
                </div>
                <div className="proy-stat-sub">Factor de conversión: {resultado.factor}</div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Info parámetros disponibles */}
      {parametros.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 8,
          padding: '12px 16px', background: '#f9fafb',
          border: '1px solid #e5e7eb', borderRadius: 10,
          fontSize: '.78rem', color: '#6b7280',
        }}>
          <Info size={13} style={{ marginTop: 1, flexShrink: 0 }} />
          <span>
            Parámetros activos:{' '}
            {parametros.map((p: any) =>
              `${LABEL[p.especie_destino] ?? p.especie_destino} (factor ${p.factor}, ${p.dias_ciclo}d)`
            ).join(' · ')}
          </span>
        </div>
      )}
    </>
  )
}
