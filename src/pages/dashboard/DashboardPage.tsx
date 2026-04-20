// DashboardPage.tsx
// Solo el contenido del <Outlet /> — Sidebar y Navbar ya los maneja Layout.tsx

import { useSitotroga, useTrichogramma, useGalleria, useParatheresia } from "@/hooks/useProduccion";

/* ═══════════════════════════════════════════
   ESTILOS
══════════════════════════════════════════ */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

  .vs-heading { font-family: 'DM Serif Display', serif; }
  .vs-body    { font-family: 'DM Sans', sans-serif; }

  /* ── KPI ── */
  .vs-kpi-card {
    background: #fff;
    border-radius: 14px;
    border: 0.5px solid #e5e7eb;
    padding: 1.25rem 1.25rem 1rem;
    position: relative;
    overflow: hidden;
    transition: transform .18s, box-shadow .18s;
    font-family: 'DM Sans', sans-serif;
    height: 100%;
  }
  .vs-kpi-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,.07);
  }
  .vs-kpi-accent {
    position: absolute; top: 0; left: 0;
    width: 4px; height: 100%;
    border-radius: 14px 0 0 14px;
  }
  .vs-kpi-icon {
    width: 38px; height: 38px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: .85rem;
  }
  .vs-kpi-label {
    font-size: .68rem; font-weight: 500;
    text-transform: uppercase; letter-spacing: .07em;
    color: #9ca3af; margin-bottom: .3rem;
  }
  .vs-kpi-value {
    font-family: 'DM Serif Display', serif;
    font-size: 2rem; line-height: 1; margin-bottom: .2rem;
  }
  .vs-kpi-unit  { font-size: .72rem; color: #b0b0aa; }
  .vs-kpi-trend {
    margin-top: .55rem; font-size: .72rem;
    display: flex; align-items: center; gap: 4px;
  }

  /* ── Tarjeta genérica ── */
  .vs-card {
    background: #fff;
    border-radius: 14px;
    border: 0.5px solid #e5e7eb;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── Chip ── */
  .vs-chip {
    background: #f3faf4; border: 0.5px solid #bbf7d0;
    color: #166534; border-radius: 50px;
    padding: 3px 11px; font-size: .7rem; font-weight: 500;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
  }

  /* ── Badge live ── */
  .vs-badge-live {
    display: inline-flex; align-items: center; gap: 6px;
    background: #dcfce7; border: 0.5px solid #bbf7d0;
    border-radius: 50px; padding: 4px 12px;
    font-size: .72rem; font-weight: 500; color: #166534;
    font-family: 'DM Sans', sans-serif;
  }
  @keyframes vs-pulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:.6; transform:scale(.8); }
  }
  .vs-pulse {
    width:6px; height:6px; border-radius:50%;
    background:#4ade80; animation: vs-pulse 2s infinite;
  }

  /* ── Bar chart ── */
  .vs-chart-area {
    display: flex; gap: 8px; align-items: flex-end; height: 130px;
  }
  .vs-bar-group {
    flex:1; display:flex; flex-direction:column;
    align-items:center; gap:3px; height:100%; justify-content:flex-end;
  }
  .vs-bar-cols {
    display:flex; gap:2px; align-items:flex-end;
    height:100%; width:100%; justify-content:center;
  }
  .vs-bar { width:8px; border-radius:3px 3px 0 0; transition:opacity .2s; }
  .vs-bar:hover { opacity:.7; }
  .vs-bar-lbl {
    flex:1; text-align:center; font-size:.6rem; color:#b0b0aa;
    font-family:'DM Sans',sans-serif;
  }

  /* ── Activity feed ── */
  .vs-feed-item {
    display:flex; align-items:flex-start; gap:10px;
    padding:.6rem 0; border-bottom:0.5px solid #f5f5f3;
  }
  .vs-feed-item:last-child { border-bottom:none; }
  .vs-feed-dot { width:8px; height:8px; border-radius:50%; margin-top:5px; flex-shrink:0; }
  .vs-feed-text { font-size:.8rem; color:#374151; line-height:1.4; font-family:'DM Sans',sans-serif; }
  .vs-feed-time { font-size:.7rem; color:#b0b0aa; margin-top:2px; }

  /* ── Table ── */
  .vs-table { width:100%; border-collapse:collapse; font-size:.82rem; font-family:'DM Sans',sans-serif; }
  .vs-table th {
    padding:.6rem 1.25rem; text-align:left;
    font-size:.65rem; text-transform:uppercase; letter-spacing:.07em;
    color:#9ca3af; font-weight:500; border-bottom:0.5px solid #f0f0ee;
  }
  .vs-table td { padding:.7rem 1.25rem; color:#374151; border-bottom:0.5px solid #f9f9f7; }
  .vs-table tbody tr:last-child td { border-bottom:none; }
  .vs-table tbody tr { transition:background .12s; }
  .vs-table tbody tr:hover td { background:#fafaf8; }

  /* ── Pills ── */
  .vs-pill { display:inline-block; border-radius:50px; padding:2px 10px; font-size:.68rem; font-weight:500; }
  .vs-pill-green { background:#dcfce7; color:#166534; }
  .vs-pill-amber { background:#fef9c3; color:#854d0e; }
  .vs-pill-red   { background:#fee2e2; color:#991b1b; }

  /* ── Sparkline ── */
  .vs-sparkline { display:flex; align-items:flex-end; gap:2px; height:26px; }
  .vs-spark-bar { width:5px; border-radius:2px 2px 0 0; }

  /* ── Legend ── */
  .vs-legend-item { display:flex; align-items:center; gap:5px; font-size:.72rem; color:#6b7280; }
  .vs-legend-dot  { width:10px; height:10px; border-radius:2px; flex-shrink:0; }
`;

/* ═══════════════════════════════════════════
   DATOS GRÁFICO SEMANAL (mock)
══════════════════════════════════════════ */
const WEEKS  = ["S-13","S-14","S-15","S-16","S-17","S-18","S-19","S-20"];
const COLORS = { sito:"#166534", trich:"#7c3aed", gall:"#d97706", para:"#0d9488" } as const;
const LIGHTS = { sito:"#bbf7d0", trich:"#c4b5fd", gall:"#fde68a", para:"#99f6e4" } as const;
const SERIES = {
  sito:  [180,210,195,240,225,260,275,310],
  trich: [ 90,105, 98,120,115,130,140,155],
  gall:  [ 65, 70, 60, 80, 72, 68, 58, 62],
  para:  [ 30, 38, 35, 42, 40, 48, 52, 58],
} as const;
type SerieKey = keyof typeof SERIES;
const MAX_VAL = Math.max(...(Object.values(SERIES) as number[][]).flat());

/* ═══════════════════════════════════════════
   MOVIMIENTOS MOCK
══════════════════════════════════════════ */
type Estado = "Completado" | "En proceso" | "Pendiente";
const pillClass: Record<Estado, string> = {
  "Completado": "vs-pill-green",
  "En proceso": "vs-pill-amber",
  "Pendiente":  "vs-pill-red",
};

const MOVIMIENTOS: {
  especie:string; dot:string; tipo:string; cantidad:string;
  resp:string; fecha:string; estado:Estado;
  spark:number[]; sc:string; sh:string;
}[] = [
  { especie:"Sitotroga",    dot:"#166534", tipo:"Ingreso",     cantidad:"1,200 g",    resp:"M. Rodríguez", fecha:"20/04/2026", estado:"Completado", spark:[40,55,48,70,90], sc:"#bbf7d0", sh:"#166534" },
  { especie:"Trichogramma", dot:"#7c3aed", tipo:"Cosecha",     cantidad:"180 pulg²",  resp:"L. Torres",    fecha:"20/04/2026", estado:"Completado", spark:[60,65,72,78,85], sc:"#c4b5fd", sh:"#7c3aed" },
  { especie:"Galleria",     dot:"#d97706", tipo:"Salida",       cantidad:"320 u.",     resp:"K. Mendoza",   fecha:"19/04/2026", estado:"En proceso", spark:[80,65,55,45,38], sc:"#fde68a", sh:"#d97706" },
  { especie:"Paratheresia", dot:"#0d9488", tipo:"Apareamiento", cantidad:"42 parejas", resp:"R. Castillo",  fecha:"19/04/2026", estado:"Completado", spark:[30,45,55,70,88], sc:"#99f6e4", sh:"#0d9488" },
  { especie:"Sitotroga",    dot:"#166534", tipo:"Salida",       cantidad:"500 g",      resp:"M. Rodríguez", fecha:"18/04/2026", estado:"Pendiente",  spark:[70,55,60,50,40], sc:"#bbf7d0", sh:"#86efac" },
];

/* ═══════════════════════════════════════════
   SUB-COMPONENTES
══════════════════════════════════════════ */
function ChevUp()   {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="18 15 12 9 6 15"/>
    </svg>
  );
}
function ChevDown() {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

function KpiCard({
  titulo, valor, unidad, accent, iconBg, iconEl, tendencia,
}: {
  titulo:string; valor:number; unidad:string;
  accent:string; iconBg:string; iconEl:React.ReactNode; tendencia:number;
}) {
  const up = tendencia >= 0;
  return (
    <div className="vs-kpi-card">
      <div className="vs-kpi-accent" style={{ background: accent }} />
      <div className="vs-kpi-icon" style={{ background: iconBg }}>{iconEl}</div>
      <div className="vs-kpi-label">{titulo}</div>
      <div className="vs-kpi-value" style={{ color: accent }}>
        {valor.toLocaleString("es-PE")}
      </div>
      <div className="vs-kpi-unit">{unidad}</div>
      <div className="vs-kpi-trend" style={{ color: up ? accent : "#dc2626" }}>
        {up ? <ChevUp /> : <ChevDown />}
        {up ? "+" : ""}{tendencia}% vs semana anterior
      </div>
    </div>
  );
}

function Sparkline({ values, color, hi }: { values:number[]; color:string; hi:string }) {
  const max = Math.max(...values);
  return (
    <div className="vs-sparkline">
      {values.map((v, i) => (
        <div key={i} className="vs-spark-bar" style={{
          height: `${Math.round((v / max) * 100)}%`,
          background: i === values.length - 1 ? hi : color,
        }}/>
      ))}
    </div>
  );
}

function BarChart() {
  const series: SerieKey[] = ["sito","trich","gall","para"];
  return (
    <>
      <div className="d-flex flex-wrap gap-3 mb-3">
        {([["sito","Sitotroga"],["trich","Trichogramma"],["gall","Galleria"],["para","Paratheresia"]] as [SerieKey,string][]).map(([k,lbl]) => (
          <div key={k} className="vs-legend-item">
            <div className="vs-legend-dot" style={{ background: COLORS[k] }}/>
            {lbl}
          </div>
        ))}
      </div>
      <div className="vs-chart-area">
        {WEEKS.map((w, i) => {
          const isLast = i === WEEKS.length - 1;
          return (
            <div key={w} className="vs-bar-group">
              <div className="vs-bar-cols">
                {series.map((k) => (
                  <div key={k} className="vs-bar" style={{
                    height: `${Math.round((SERIES[k][i] / MAX_VAL) * 100)}%`,
                    background: isLast ? COLORS[k] : LIGHTS[k],
                  }}/>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="d-flex gap-2 mt-2">
        {WEEKS.map((w) => <div key={w} className="vs-bar-lbl">{w}</div>)}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════
   PAGE — solo el contenido del Outlet
══════════════════════════════════════════ */
export default function DashboardPage() {
  const { data: sitotroga    = [] } = useSitotroga();
  const { data: trichogramma = [] } = useTrichogramma();
  const { data: galleria     = [] } = useGalleria();
  const { data: paratheresia = [] } = useParatheresia();

  const saldoSito  = sitotroga.at(-1)?.saldo    ?? 0;
  const saldoTrich = trichogramma.at(-1)?.saldo ?? 0;
  const saldoGall  = galleria.at(-1)?.saldo     ?? 0;
  const saldoPara  = paratheresia.at(-1)?.saldo ?? 0;

  const hoy = new Date().toLocaleDateString("es-PE", {
    weekday:"long", day:"numeric", month:"long", year:"numeric",
  });

  return (
    <>
      <style>{styles}</style>

      {/* ── Topbar ── */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
        <div>
          <div className="vs-body" style={{ fontSize:".72rem", color:"#9ca3af", marginBottom:3, textTransform:"capitalize" }}>
            {hoy}
          </div>
          <h2 className="vs-heading mb-0" style={{ fontSize:"1.5rem", color:"#111" }}>
            Resumen de <em>Producción</em>
          </h2>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="vs-badge-live">
            <div className="vs-pulse"/>
            Portal activo
          </div>
          <button
            className="btn btn-sm btn-outline-secondary vs-body d-flex align-items-center gap-1"
            style={{ fontSize:".78rem", borderRadius:9 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Exportar
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <KpiCard
            titulo="Saldo Sitotroga" valor={saldoSito} unidad="gramos disponibles"
            accent="#166534" iconBg="#dcfce7" tendencia={8.2}
            iconEl={
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2">
                <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/>
                <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/>
              </svg>
            }
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <KpiCard
            titulo="Saldo Trichogramma" valor={saldoTrich} unidad="pulg² disponibles"
            accent="#7c3aed" iconBg="#ede9fe" tendencia={3.1}
            iconEl={
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
              </svg>
            }
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <KpiCard
            titulo="Saldo Galleria" valor={saldoGall} unidad="unidades disponibles"
            accent="#d97706" iconBg="#fef3c7" tendencia={-2.4}
            iconEl={
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            }
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <KpiCard
            titulo="Saldo Paratheresia" valor={saldoPara} unidad="parejas disponibles"
            accent="#0d9488" iconBg="#ccfbf1" tendencia={12.6}
            iconEl={
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            }
          />
        </div>
      </div>

      {/* ── Gráfico + Feed ── */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-8">
          <div className="vs-card p-4 h-100">
            <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-3">
              <div>
                <div className="vs-heading" style={{ fontSize:"1rem", color:"#111" }}>
                  Producción semanal
                </div>
                <div className="vs-body" style={{ fontSize:".72rem", color:"#9ca3af" }}>
                  Últimas 8 semanas · todas las especies
                </div>
              </div>
              <div className="d-flex gap-2">
                <span className="vs-chip">Semana</span>
                <span className="vs-chip" style={{ background:"#f9f9f7", borderColor:"#e5e7eb", color:"#6b7280" }}>
                  Mes
                </span>
              </div>
            </div>
            <BarChart />
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="vs-card p-4 h-100">
            <div className="vs-heading mb-3" style={{ fontSize:"1rem", color:"#111" }}>
              Actividad reciente
            </div>
            {[
              { dot:"#166534", text:<>Lote <strong>S-0412</strong> ingresado — Sitotroga</>,        time:"Hace 18 min" },
              { dot:"#7c3aed", text:<>Cosecha Trichogramma — <strong>180 pulg²</strong></>,         time:"Hace 1 h"    },
              { dot:"#dc2626", text:<>Alerta: Galleria por debajo del mínimo</>,                    time:"Hace 2 h"    },
              { dot:"#0d9488", text:<>Paratheresia — <strong>+42</strong> nuevas parejas</>,         time:"Hace 3 h"    },
              { dot:"#166534", text:<>Despacho programado para el martes 22/04</>,                  time:"Ayer"        },
            ].map((item, i) => (
              <div key={i} className="vs-feed-item">
                <div className="vs-feed-dot" style={{ background: item.dot }}/>
                <div>
                  <div className="vs-feed-text">{item.text}</div>
                  <div className="vs-feed-time">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabla ── */}
      <div className="vs-card overflow-hidden">
        <div
          className="d-flex align-items-center justify-content-between px-4 py-3"
          style={{ borderBottom:"0.5px solid #f0f0ee" }}
        >
          <div className="vs-heading" style={{ fontSize:"1rem", color:"#111" }}>
            Últimos movimientos
          </div>
          <span className="vs-chip">Ver todos →</span>
        </div>
        <div className="table-responsive">
          <table className="vs-table">
            <thead>
              <tr>
                <th>Especie</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Responsable</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th style={{ textAlign:"right" }}>Tendencia</th>
              </tr>
            </thead>
            <tbody>
              {MOVIMIENTOS.map((m, i) => (
                <tr key={i}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width:8, height:8, borderRadius:"50%", background:m.dot, flexShrink:0 }}/>
                      <strong>{m.especie}</strong>
                    </div>
                  </td>
                  <td style={{ color:"#9ca3af" }}>{m.tipo}</td>
                  <td><strong>{m.cantidad}</strong></td>
                  <td>{m.resp}</td>
                  <td>{m.fecha}</td>
                  <td>
                    <span className={`vs-pill ${pillClass[m.estado]}`}>{m.estado}</span>
                  </td>
                  <td style={{ textAlign:"right" }}>
                    <Sparkline values={m.spark} color={m.sc} hi={m.sh}/>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
