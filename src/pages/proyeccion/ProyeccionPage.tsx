import { useState } from 'react'
import { Calculator, Bug, RefreshCw, CheckCircle2, Package, CalendarDays, Clock, Target, ArrowRight, AlertTriangle, Info } from 'lucide-react'
import { useProyeccionParametros, useCalcularProyeccion } from '@/hooks/useProduccion'

type Especie = { especie_destino: string; especie_origen: string; factor: number; dias_ciclo: number; unidad_origen: string }
type Resultado = {
  especie_destino: string; cantidad_objetivo: number; fecha_objetivo: string
  especie_origen: string; cantidad_origen_necesaria: number; unidad_origen: string
  fecha_inicio_produccion: string; dias_ciclo: number; factor: number
}

const LABEL: Record<string, string> = {
  trichogramma: 'Trichogramma', paratheresia: 'Paratheresia',
  sitotroga: 'Sitotroga', galleria: 'Galleria',
}
const SP_COLOR: Record<string, { bg: string; border: string; text: string; tagBg: string; tagText: string }> = {
  trichogramma: { bg: '#eff6ff', border: '#93c5fd', text: '#1d4ed8', tagBg: '#eff6ff', tagText: '#1e40af' },
  paratheresia:  { bg: '#fdf4ff', border: '#d8b4fe', text: '#7c3aed', tagBg: '#fdf4ff', tagText: '#6b21a8' },
}

const fmt      = (s: string) => new Date(s + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })
const fmtShort = (s: string) => new Date(s + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
const todayStr = () => new Date().toISOString().slice(0, 10)
const diffDays = (a: string, b: string) =>
  Math.round((new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86400000)

export default function ProyeccionPage() {
  const { data: parametros = [] } = useProyeccionParametros()
  const calcular = useCalcularProyeccion()

  const [especie,   setEspecie]   = useState('')
  const [cantidad,  setCantidad]  = useState('')
  const [fecha,     setFecha]     = useState('')
  const [resultado, setResultado] = useState<Resultado | null>(null)

  const especies = parametros as Especie[]

  const handleCalc = async () => {
    if (!especie || !cantidad || !fecha) return
    const res = await calcular.mutateAsync({
      especie_destino: especie,
      cantidad_objetivo: parseFloat(cantidad),
      fecha_objetivo: fecha,
    })
    setResultado(res)
  }

  const reset = () => {
    setEspecie(''); setCantidad(''); setFecha(''); setResultado(null)
  }

  const diasParaEmpezar = resultado
    ? diffDays(todayStr(), resultado.fecha_inicio_produccion)
    : 0

  const alertaMsg = resultado
    ? diasParaEmpezar > 3
      ? `Tienes ${diasParaEmpezar} días para preparar el material. ¡Buen margen!`
      : diasParaEmpezar >= 0
      ? 'El tiempo es muy justo. Prepara el material lo antes posible.'
      : 'La fecha de inicio ya pasó. Considera mover la fecha objetivo o reducir la cantidad.'
    : ''

  return (
    <>
      <style>{`
        .proy2-card{background:#fff;border:0.5px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:1rem}
        .proy2-hd{padding:13px 20px;border-bottom:0.5px solid #e5e7eb;display:flex;align-items:center;gap:10px}
        .proy2-accent{width:3px;height:18px;border-radius:0;background:#16a34a;flex-shrink:0}
        .proy2-title{font-size:.88rem;font-weight:500;color:#111827}
        .proy2-bd{padding:20px}
        .proy2-species-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:20px}
        .proy2-sp{border:1.5px solid #e5e7eb;border-radius:10px;padding:14px;cursor:pointer;transition:all .15s;background:#fff}
        .proy2-sp:hover{border-color:#16a34a;background:#f0fdf4}
        .proy2-sp.active{border-color:#16a34a;background:#f0fdf4}
        .proy2-sp-icon{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:8px}
        .proy2-sp-name{font-size:.88rem;font-weight:500;color:#111827;margin-bottom:2px}
        .proy2-sp-sub{font-size:.75rem;color:#6b7280}
        .proy2-sp-tag{display:inline-block;margin-top:6px;padding:2px 8px;border-radius:20px;font-size:.7rem;font-weight:500}
        .proy2-sep{height:0.5px;background:#e5e7eb;margin:20px 0}
        .proy2-step{display:flex;align-items:center;gap:10px;margin-bottom:16px}
        .proy2-stepnum{width:24px;height:24px;border-radius:50%;background:#16a34a;color:#fff;font-size:.72rem;font-weight:500;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .proy2-steplabel{font-size:.83rem;font-weight:500;color:#111827}
        .proy2-inputs{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px}
        .proy2-flabel{font-size:.7rem;font-weight:500;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af;margin-bottom:6px}
        .proy2-fhint{font-size:.72rem;color:#9ca3af;margin-top:4px}
        .proy2-input{width:100%;padding:9px 12px;font-size:.88rem;border:0.5px solid #d1d5db;border-radius:8px;background:#fff;color:#111827;box-sizing:border-box;transition:border-color .15s,box-shadow .15s}
        .proy2-input:focus{outline:none;border-color:#16a34a;box-shadow:0 0 0 3px rgba(22,163,74,.1)}
        .proy2-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:10px 20px;border-radius:8px;font-size:.88rem;font-weight:500;border:none;cursor:pointer;background:#16a34a;color:#fff;transition:opacity .15s,transform .1s}
        .proy2-btn:hover:not(:disabled){opacity:.88}
        .proy2-btn:active:not(:disabled){transform:scale(.98)}
        .proy2-btn:disabled{opacity:.4;cursor:not-allowed}
        .proy2-timeline{display:flex;align-items:center;margin-bottom:20px}
        .proy2-tl-node{flex:1;text-align:center}
        .proy2-tl-dot{width:12px;height:12px;border-radius:50%;margin:0 auto 6px}
        .proy2-tl-line{flex:2;height:2px;margin-bottom:18px}
        .proy2-tl-label{font-size:.7rem;font-weight:500;color:#9ca3af;margin-bottom:2px;text-transform:uppercase;letter-spacing:.04em}
        .proy2-tl-date{font-size:.82rem;font-weight:500;color:#111827}
        .proy2-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:16px}
        .proy2-metric{border-radius:10px;padding:15px}
        .proy2-mlabel{font-size:.7rem;font-weight:500;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;display:flex;align-items:center;gap:5px}
        .proy2-mvalue{font-size:1.2rem;font-weight:500;line-height:1.1}
        .proy2-msub{font-size:.75rem;margin-top:4px}
        .proy2-what{background:#f9fafb;border-radius:10px;padding:14px 16px;margin-bottom:16px}
        .proy2-what-title{font-size:.7rem;font-weight:500;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px;display:flex;align-items:center;gap:6px}
        .proy2-what-row{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px}
        .proy2-what-row:last-child{margin-bottom:0}
        .proy2-what-icon{width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .proy2-what-text{font-size:.82rem;color:#111827;line-height:1.4}
        .proy2-what-sub{font-size:.75rem;color:#9ca3af;margin-top:1px}
        .proy2-reset{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;font-size:.82rem;font-weight:500;border:0.5px solid #d1d5db;background:transparent;color:#374151;cursor:pointer;transition:background .15s}
        .proy2-reset:hover{background:#f3f4f6}
        @media(max-width:600px){.proy2-species-grid,.proy2-inputs,.proy2-metrics{grid-template-columns:1fr}}
      `}</style>

      {/* Encabezado */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ margin: 0, fontWeight: 500, fontSize: '1.4rem', color: '#111827' }}>
          Proyección de producción
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '.83rem', color: '#9ca3af' }}>
          ¿Cuánto necesitas producir y para cuándo? Te decimos qué preparar y cuándo empezar.
        </p>
      </div>

      {!resultado ? (
        <div className="proy2-card">
          <div className="proy2-hd">
            <div className="proy2-accent" />
            <Bug size={14} color="#16a34a" />
            <span className="proy2-title">Paso 1 — ¿Qué especie quieres producir?</span>
          </div>
          <div className="proy2-bd">

            {/* Selección de especie */}
            <div className="proy2-species-grid">
              {especies.map((e) => {
                const col = SP_COLOR[e.especie_destino] ?? SP_COLOR['trichogramma']
                const active = especie === e.especie_destino
                return (
                  <div
                    key={e.especie_destino}
                    className={`proy2-sp${active ? ' active' : ''}`}
                    onClick={() => setEspecie(e.especie_destino)}
                  >
                    <div className="proy2-sp-icon" style={{ background: col.bg }}>
                      <Bug size={18} color={col.text} />
                    </div>
                    <div className="proy2-sp-name">{LABEL[e.especie_destino] ?? e.especie_destino}</div>
                    <div className="proy2-sp-sub">Origen: {LABEL[e.especie_origen] ?? e.especie_origen}</div>
                    <div className="proy2-sp-tag" style={{ background: col.tagBg, color: col.tagText }}>
                      Ciclo {e.dias_ciclo} días · Factor ×{e.factor}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="proy2-sep" />

            <div className="proy2-step">
              <div className="proy2-stepnum">2</div>
              <div className="proy2-steplabel">¿Cuánto necesitas y para cuándo?</div>
            </div>

            <div className="proy2-inputs">
              <div>
                <div className="proy2-flabel">Cantidad objetivo</div>
                <input
                  className="proy2-input"
                  type="number" min="1" step="1" placeholder="Ej: 30"
                  value={cantidad}
                  onChange={e => setCantidad(e.target.value)}
                />
                <div className="proy2-fhint">Unidades del producto final que necesitas</div>
              </div>
              <div>
                <div className="proy2-flabel">Fecha que los necesitas</div>
                <input
                  className="proy2-input"
                  type="date"
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                />
                <div className="proy2-fhint">El día que deben estar listos</div>
              </div>
            </div>

            <button
              className="proy2-btn"
              disabled={!especie || !cantidad || !fecha || calcular.isPending}
              onClick={handleCalc}
            >
              <Calculator size={15} />
              {calcular.isPending ? 'Calculando...' : 'Ver mi plan de producción'}
            </button>
          </div>
        </div>
      ) : (
        <div className="proy2-card">
          <div className="proy2-hd">
            <div className="proy2-accent" />
            <CheckCircle2 size={14} color="#16a34a" />
            <span className="proy2-title">Tu plan de producción</span>
          </div>
          <div className="proy2-bd">

            {/* Timeline */}
            <div className="proy2-timeline">
              <div className="proy2-tl-node">
                <div className="proy2-tl-dot" style={{ background: '#16a34a' }} />
                <div className="proy2-tl-label">Iniciar producción</div>
                <div className="proy2-tl-date">{fmtShort(resultado.fecha_inicio_produccion)}</div>
              </div>
              <div className="proy2-tl-line" style={{ background: '#16a34a' }} />
              <div className="proy2-tl-node">
                <div className="proy2-tl-dot" style={{ background: '#6b7280' }} />
                <div className="proy2-tl-label">{resultado.dias_ciclo} días</div>
                <div className="proy2-tl-date" style={{ color: '#9ca3af' }}>producción activa</div>
              </div>
              <div className="proy2-tl-line" style={{ background: '#dc2626' }} />
              <div className="proy2-tl-node">
                <div className="proy2-tl-dot" style={{ background: '#dc2626' }} />
                <div className="proy2-tl-label">Fecha objetivo</div>
                <div className="proy2-tl-date">{fmtShort(resultado.fecha_objetivo)}</div>
              </div>
            </div>

            {/* Metrics */}
            <div className="proy2-metrics">
              <div className="proy2-metric" style={{ background: '#f0fdf4', border: '0.5px solid #86efac' }}>
                <div className="proy2-mlabel" style={{ color: '#166534' }}>
                  <Package size={12} /> Necesitas preparar
                </div>
                <div className="proy2-mvalue" style={{ color: '#15803d' }}>
                  {resultado.cantidad_origen_necesaria.toLocaleString('es-PE')}
                </div>
                <div className="proy2-msub" style={{ color: '#166534' }}>
                  {resultado.unidad_origen} de {LABEL[resultado.especie_origen] ?? resultado.especie_origen}
                </div>
              </div>

              <div className="proy2-metric" style={{ background: '#eff6ff', border: '0.5px solid #93c5fd' }}>
                <div className="proy2-mlabel" style={{ color: '#1e40af' }}>
                  <CalendarDays size={12} /> Fecha de inicio
                </div>
                <div className="proy2-mvalue" style={{ color: '#1d4ed8', fontSize: '1rem' }}>
                  {fmt(resultado.fecha_inicio_produccion)}
                </div>
                <div className="proy2-msub" style={{ color: '#1e40af' }}>
                  {diasParaEmpezar > 0
                    ? `en ${diasParaEmpezar} días desde hoy`
                    : diasParaEmpezar === 0
                    ? '¡Debes empezar hoy!'
                    : 'ya pasó — ajusta la fecha'}
                </div>
              </div>

              <div className="proy2-metric" style={{ background: '#fffbeb', border: '0.5px solid #fcd34d' }}>
                <div className="proy2-mlabel" style={{ color: '#92400e' }}>
                  <Clock size={12} /> Duración del ciclo
                </div>
                <div className="proy2-mvalue" style={{ color: '#b45309', fontSize: '1rem' }}>
                  {resultado.dias_ciclo} días
                </div>
                <div className="proy2-msub" style={{ color: '#92400e' }}>
                  factor de conversión ×{resultado.factor}
                </div>
              </div>

              <div className="proy2-metric" style={{ background: '#f9fafb', border: '0.5px solid #e5e7eb' }}>
                <div className="proy2-mlabel" style={{ color: '#6b7280' }}>
                  <Target size={12} /> Tu objetivo final
                </div>
                <div className="proy2-mvalue" style={{ fontSize: '1rem' }}>
                  {resultado.cantidad_objetivo.toLocaleString('es-PE')}
                </div>
                <div className="proy2-msub" style={{ color: '#6b7280' }}>
                  {LABEL[resultado.especie_destino] ?? resultado.especie_destino} listos para esa fecha
                </div>
              </div>
            </div>

            {/* ¿Qué significa esto? */}
            <div className="proy2-what">
              <div className="proy2-what-title">
                <Info size={12} /> ¿Qué significa esto?
              </div>
              <div className="proy2-what-row">
                <div className="proy2-what-icon" style={{ background: '#f0fdf4' }}>
                  <ArrowRight size={14} color="#16a34a" />
                </div>
                <div>
                  <div className="proy2-what-text">
                    Para obtener {resultado.cantidad_objetivo.toLocaleString('es-PE')} unidades de{' '}
                    {LABEL[resultado.especie_destino] ?? resultado.especie_destino}, necesitas{' '}
                    {resultado.cantidad_origen_necesaria.toLocaleString('es-PE')} {resultado.unidad_origen} de{' '}
                    {LABEL[resultado.especie_origen] ?? resultado.especie_origen}.
                  </div>
                  <div className="proy2-what-sub">Material de origen necesario</div>
                </div>
              </div>
              <div className="proy2-what-row">
                <div className="proy2-what-icon" style={{ background: '#eff6ff' }}>
                  <CalendarDays size={14} color="#1d4ed8" />
                </div>
                <div>
                  <div className="proy2-what-text">
                    Debes iniciar el {fmt(resultado.fecha_inicio_produccion)}, que es{' '}
                    {resultado.dias_ciclo} días antes de tu fecha objetivo.
                  </div>
                  <div className="proy2-what-sub">Cuándo iniciar</div>
                </div>
              </div>
              <div className="proy2-what-row">
                <div className="proy2-what-icon" style={{ background: '#fffbeb' }}>
                  <AlertTriangle size={14} color="#b45309" />
                </div>
                <div>
                  <div className="proy2-what-text">{alertaMsg}</div>
                  <div className="proy2-what-sub">Recomendación</div>
                </div>
              </div>
            </div>

            <button className="proy2-reset" onClick={reset}>
              <RefreshCw size={13} /> Nueva proyección
            </button>
          </div>
        </div>
      )}
    </>
  )
}
