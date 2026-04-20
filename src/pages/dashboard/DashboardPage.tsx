// DashboardPage.tsx
// Requiere: Bootstrap 5 en tu proyecto (CSS + JS)
// Fuentes: DM Serif Display + DM Sans (Google Fonts en index.html)
// ─────────────────────────────────────────────────────────────────

import { useSitotroga, useTrichogramma, useGalleria, useParatheresia } from "@/hooks/useProduccion";

/* ═══════════════════════════════════════════
   TIPOS
══════════════════════════════════════════ */
interface KpiCardProps {
  titulo: string;
  valor: number;
  unidad: string;
  accentColor: string;
  iconBg: string;
  iconColor: string;
  tendencia: number;
  icono: React.ReactNode;
}

interface MovimientoRow {
  especie: string;
  dotColor: string;
  tipo: "Ingreso" | "Salida" | "Cosecha" | "Apareamiento";
  cantidad: string;
  responsable: string;
  fecha: string;
  estado: "Completado" | "En proceso" | "Pendiente";
  spark: number[];
  sparkColor: string;
  sparkHi: string;
}

/* ═══════════════════════════════════════════
   ESTILOS INYECTADOS (igual que en el login)
══════════════════════════════════════════ */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

  .vs-brand-name { font-family: 'DM Serif Display', serif; }
  .vs-heading    { font-family: 'DM Serif Display', serif; }
  .vs-body       { font-family: 'DM Sans', sans-serif; }

  /* ── Layout ── */
  .vs-dash-wrapper {
    font-family: 'DM Sans', sans-serif;
    background: #f5f5f1;
    min-height: 100vh;
    display: flex;
  }

  /* ── Sidebar ── */
  .vs-sidebar {
    width: 240px;
    min-height: 100vh;
    background: #fff;
    border-right: 0.5px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 0;
    height: 100vh;
    flex-shrink: 0;
    overflow-y: auto;
  }
  .vs-sidebar-brand {
    padding: 1.5rem 1.25rem 1rem;
    border-bottom: 0.5px solid #f0f0ee;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .vs-icon-logo {
    width: 34px; height: 34px;
    border-radius: 9px;
    background: #166534;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .vs-nav-section { padding: 1.25rem 0.75rem 0.5rem; }
  .vs-nav-label {
    font-size: .65rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: #9ca3af;
    padding: 0 0.5rem;
    margin-bottom: .5rem;
    font-family: 'DM Sans', sans-serif;
  }
  .vs-nav-item {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: .52rem .75rem;
    border-radius: 9px;
    font-size: .85rem;
    font-weight: 400;
    color: #374151;
    cursor: pointer;
    transition: background .15s, color .15s;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    margin-bottom: 2px;
    font-family: 'DM Sans', sans-serif;
  }
  .vs-nav-item:hover { background: #f3faf4; color: #166534; }
  .vs-nav-item.active { background: #dcfce7; color: #166534; font-weight: 500; }
  .vs-nav-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .vs-sidebar-footer {
    margin-top: auto;
    padding: 1rem .75rem;
    border-top: 0.5px solid #f0f0ee;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .vs-avatar {
    width: 32px; height: 32px;
    border-radius: 50%;
    background: #dcfce7;
    display: flex; align-items: center; justify-content: center;
    font-size: .7rem;
    font-weight: 600;
    color: #166534;
    flex-shrink: 0;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── Main ── */
  .vs-main {
    flex: 1;
    overflow-y: auto;
    padding: 2rem 2rem 3rem;
    min-width: 0;
  }

  /* ── Topbar ── */
  .vs-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .vs-badge-live {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #dcfce7;
    border: 0.5px solid #bbf7d0;
    border-radius: 50px;
    padding: 4px 12px;
    font-size: .72rem;
    font-weight: 500;
    color: #166534;
    font-family: 'DM Sans', sans-serif;
  }
  @keyframes vs-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: .6; transform: scale(.8); }
  }
  .vs-pulse {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #4ade80;
    animation: vs-pulse 2s infinite;
  }
  .vs-export-btn {
    background: #fff;
    border: 0.5px solid #e5e7eb;
    border-radius: 9px;
    padding: 7px 14px;
    font-size: .78rem;
    font-family: 'DM Sans', sans-serif;
    color: #374151;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: background .15s;
  }
  .vs-export-btn:hover { background: #f9f9f7; }

  /* ── KPI Grid ── */
  .vs-kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.75rem;
  }
  .vs-kpi-card {
    background: #fff;
    border-radius: 14px;
    border: 0.5px solid #e5e7eb;
    padding: 1.25rem 1.25rem 1rem;
    position: relative;
    overflow: hidden;
    transition: transform .18s, box-shadow .18s;
  }
  .vs-kpi-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,.07);
  }
  .vs-kpi-accent {
    position: absolute;
    top: 0; left: 0;
    width: 4px;
    height: 100%;
    border-radius: 14px 0 0 14px;
  }
  .vs-kpi-icon {
    width: 38px; height: 38px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: .85rem;
  }
  .vs-kpi-label {
    font-size: .7rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: .07em;
    color: #9ca3af;
    margin-bottom: .3rem;
    font-family: 'DM Sans', sans-serif;
  }
  .vs-kpi-value {
    font-family: 'DM Serif Display', serif;
    font-size: 1.9rem;
    color: #111;
    line-height: 1;
    margin-bottom: .25rem;
  }
  .vs-kpi-unit {
    font-size: .72rem;
    color: #b0b0aa;
    font-family: 'DM Sans', sans-serif;
  }
  .vs-kpi-trend {
    margin-top: .6rem;
    font-size: .72rem;
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── Cards genéricos ── */
  .vs-chart-card, .vs-feed-card, .vs-table-card {
    background: #fff;
    border-radius: 14px;
    border: 0.5px solid #e5e7eb;
  }
  .vs-chart-card { padding: 1.5rem; margin-bottom: 1rem; }
  .vs-feed-card  { padding: 1.25rem; }
  .vs-table-card { overflow: hidden; margin-bottom: 1rem; }

  .vs-chart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
    gap: .5rem;
  }
  .vs-chip {
    background: #f3faf4;
    border: 0.5px solid #bbf7d0;
    color: #166534;
    border-radius: 50px;
    padding: 3px 11px;
    font-size: .7rem;
    font-weight: 500;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
  }
  .vs-chip-neutral {
    background: #f9f9f7;
    border-color: #e5e7eb;
    color: #6b7280;
  }

  /* ── Bar chart ── */
  .vs-chart-area {
    display: flex;
    gap: 8px;
    align-items: flex-end;
    height: 140px;
    padding-top: 4px;
  }
  .vs-bar-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    height: 100%;
    justify-content: flex-end;
  }
  .vs-bar-cols {
    display: flex;
    gap: 2px;
    align-items: flex-end;
    height: 100%;
    width: 100%;
    justify-content: center;
  }
  .vs-bar {
    width: 8px;
    border-radius: 3px 3px 0 0;
    transition: opacity .2s;
  }
  .vs-bar:hover { opacity: .7; }
  .vs-bar-lbl {
    font-size: .62rem;
    color: #b0b0aa;
    font-family: 'DM Sans', sans-serif;
    flex: 1;
    text-align: center;
  }
  .vs-chart-labels { display: flex; gap: 8px; margin-top: 6px; }

  /* ── Activity feed ── */
  .vs-feed-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: .65rem 0;
    border-bottom: 0.5px solid #f9f9f7;
  }
  .vs-feed-item:last-child { border-bottom: none; }
  .vs-feed-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    margin-top: 5px;
    flex-shrink: 0;
  }
  .vs-feed-text { font-size: .8rem; color: #374151; line-height: 1.4; font-family: 'DM Sans', sans-serif; }
  .vs-feed-time { font-size: .7rem; color: #b0b0aa; margin-top: 2px; font-family: 'DM Sans', sans-serif; }

  /* ── Table ── */
  .vs-table-head {
    padding: 1rem 1.25rem .75rem;
    border-bottom: 0.5px solid #f0f0ee;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .vs-table {
    width: 100%;
    border-collapse: collapse;
    font-size: .82rem;
    font-family: 'DM Sans', sans-serif;
  }
  .vs-table th {
    padding: .65rem 1.25rem;
    text-align: left;
    font-size: .65rem;
    text-transform: uppercase;
    letter-spacing: .07em;
    color: #9ca3af;
    font-weight: 500;
    border-bottom: 0.5px solid #f0f0ee;
  }
  .vs-table td {
    padding: .75rem 1.25rem;
    color: #374151;
    border-bottom: 0.5px solid #f9f9f7;
  }
  .vs-table tbody tr:last-child td { border-bottom: none; }
  .vs-table tbody tr:hover td { background: #fafaf8; }

  /* ── Pills ── */
  .vs-pill {
    display: inline-block;
    border-radius: 50px;
    padding: 2px 10px;
    font-size: .68rem;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
  }
  .vs-pill-green { background: #dcfce7; color: #166534; }
  .vs-pill-amber { background: #fef9c3; color: #854d0e; }
  .vs-pill-red   { background: #fee2e2; color: #991b1b; }

  /* ── Sparkline ── */
  .vs-sparkline {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 28px;
    margin-left: auto;
  }
  .vs-spark-bar {
    width: 5px;
    border-radius: 2px 2px 0 0;
  }

  /* ── Legend ── */
  .vs-legend {
    display: flex;
    gap: 16px;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }
  .vs-legend-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: .72rem;
    color: #6b7280;
    font-family: 'DM Sans', sans-serif;
  }
  .vs-legend-dot {
    width: 10px; height: 10px;
    border-radius: 2px;
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .vs-sidebar { display: none !important; }
    .vs-main { padding: 1.25rem 1rem 2rem; }
    .vs-kpi-value { font-size: 1.5rem; }
    .vs-mid-grid { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 480px) {
    .vs-kpi-grid { grid-template-columns: 1fr 1fr; }
  }
`;

/* ═══════════════════════════════════════════
   ÍCONOS SVG
══════════════════════════════════════════ */
const IconLeaf = ({ color = "currentColor", size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20c8 0 6-8 14-8a4.38 4.38 0 010 .56A8 8 0 0017 8z"/>
  </svg>
);

const IconGrid = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);

const IconClock = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
  </svg>
);

const IconChevUp = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
);

const IconChevDown = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const IconDownload = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const IconUsers = ({ size = 17, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconBug = ({ size = 17, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 8v4M12 16h.01"/>
  </svg>
);

const IconHeart = ({ size = 17, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const IconGlobe = ({ size = 17, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
    <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/>
  </svg>
);

/* ═══════════════════════════════════════════
   KPI CARD
══════════════════════════════════════════ */
function KpiCard({ titulo, valor, unidad, accentColor, iconBg, iconColor, tendencia, icono }: KpiCardProps) {
  const positivo = tendencia >= 0;
  return (
    <div className="vs-kpi-card">
      <div className="vs-kpi-accent" style={{ background: accentColor }} />
      <div className="vs-kpi-icon" style={{ background: iconBg }}>
        {icono}
      </div>
      <div className="vs-kpi-label">{titulo}</div>
      <div className="vs-kpi-value" style={{ color: accentColor }}>
        {valor.toLocaleString("es-PE")}
      </div>
      <div className="vs-kpi-unit">{unidad}</div>
      <div className="vs-kpi-trend" style={{ color: positivo ? accentColor : "#dc2626" }}>
        {positivo ? <IconChevUp /> : <IconChevDown />}
        {positivo ? "+" : ""}{tendencia}% vs semana anterior
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SPARKLINE
══════════════════════════════════════════ */
function Sparkline({ values, color, hiColor }: { values: number[]; color: string; hiColor: string }) {
  const max = Math.max(...values);
  return (
    <div className="vs-sparkline">
      {values.map((v, i) => (
        <div
          key={i}
          className="vs-spark-bar"
          style={{
            height: `${Math.round((v / max) * 100)}%`,
            background: i === values.length - 1 ? hiColor : color,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   BAR CHART (semanal)
══════════════════════════════════════════ */
const WEEKS  = ["S-13","S-14","S-15","S-16","S-17","S-18","S-19","S-20"];
const COLORS = { sito: "#166534", trich: "#7c3aed", gall: "#d97706", para: "#0d9488" };
const LIGHTS = { sito: "#bbf7d0", trich: "#c4b5fd", gall: "#fde68a", para: "#99f6e4" };
const SERIES = {
  sito:  [180,210,195,240,225,260,275,310],
  trich: [90, 105,98, 120,115,130,140,155],
  gall:  [65,  70, 60,  80, 72,  68, 58,  62],
  para:  [30,  38, 35,  42, 40,  48, 52,  58],
};

function BarChart() {
  const max = Math.max(
    ...SERIES.sito, ...SERIES.trich, ...SERIES.gall, ...SERIES.para
  );
  return (
    <>
      <div className="vs-legend">
        {([["sito","Sitotroga"],["trich","Trichogramma"],["gall","Galleria"],["para","Paratheresia"]] as const).map(([k, label]) => (
          <div key={k} className="vs-legend-item">
            <div className="vs-legend-dot" style={{ background: COLORS[k] }} />
            {label}
          </div>
        ))}
      </div>
      <div className="vs-chart-area">
        {WEEKS.map((w, i) => {
          const isLast = i === WEEKS.length - 1;
          return (
            <div key={w} className="vs-bar-group">
              <div className="vs-bar-cols">
                {(["sito","trich","gall","para"] as const).map((k) => (
                  <div
                    key={k}
                    className="vs-bar"
                    style={{
                      height: `${Math.round((SERIES[k][i] / max) * 100)}%`,
                      background: isLast ? COLORS[k] : LIGHTS[k],
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="vs-chart-labels">
        {WEEKS.map((w) => (
          <div key={w} className="vs-bar-lbl">{w}</div>
        ))}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════
   MOVIMIENTOS MOCK (reemplaza con datos reales)
══════════════════════════════════════════ */
const MOVIMIENTOS: MovimientoRow[] = [
  {
    especie: "Sitotroga", dotColor: "#166534",
    tipo: "Ingreso", cantidad: "1,200 g",
    responsable: "M. Rodríguez", fecha: "20/04/2026",
    estado: "Completado",
    spark: [40,55,48,70,90], sparkColor: "#bbf7d0", sparkHi: "#166534",
  },
  {
    especie: "Trichogramma", dotColor: "#7c3aed",
    tipo: "Cosecha", cantidad: "180 pulg²",
    responsable: "L. Torres", fecha: "20/04/2026",
    estado: "Completado",
    spark: [60,65,72,78,85], sparkColor: "#c4b5fd", sparkHi: "#7c3aed",
  },
  {
    especie: "Galleria", dotColor: "#d97706",
    tipo: "Salida", cantidad: "320 u.",
    responsable: "K. Mendoza", fecha: "19/04/2026",
    estado: "En proceso",
    spark: [80,65,55,45,38], sparkColor: "#fde68a", sparkHi: "#d97706",
  },
  {
    especie: "Paratheresia", dotColor: "#0d9488",
    tipo: "Apareamiento", cantidad: "42 parejas",
    responsable: "R. Castillo", fecha: "19/04/2026",
    estado: "Completado",
    spark: [30,45,55,70,88], sparkColor: "#99f6e4", sparkHi: "#0d9488",
  },
  {
    especie: "Sitotroga", dotColor: "#166534",
    tipo: "Salida", cantidad: "500 g",
    responsable: "M. Rodríguez", fecha: "18/04/2026",
    estado: "Pendiente",
    spark: [70,55,60,50,40], sparkColor: "#bbf7d0", sparkHi: "#86efac",
  },
];

/* ═══════════════════════════════════════════
   PAGE COMPONENT
══════════════════════════════════════════ */
export default function DashboardPage() {
  const { data: sitotroga    = [] } = useSitotroga();
  const { data: trichogramma = [] } = useTrichogramma();
  const { data: galleria     = [] } = useGalleria();
  const { data: paratheresia = [] } = useParatheresia();

  const saldoSitotroga    = sitotroga.at(-1)?.saldo    ?? 0;
  const saldoTrichogramma = trichogramma.at(-1)?.saldo ?? 0;
  const saldoGalleria     = galleria.at(-1)?.saldo     ?? 0;
  const saldoParatheresia = paratheresia.at(-1)?.saldo ?? 0;

  const hoy = new Date().toLocaleDateString("es-PE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  return (
    <>
      <style>{styles}</style>

      <div className="vs-dash-wrapper">

        {/* ══════════════════ SIDEBAR ══════════════════ */}
        <aside className="vs-sidebar">
          {/* Brand */}
          <div className="vs-sidebar-brand">
            <div className="vs-icon-logo">
              <IconLeaf color="#4ade80" size={18} />
            </div>
            <span className="vs-brand-name" style={{ fontSize: "1.15rem", color: "#111" }}>
              Valle<span style={{ color: "#166534" }}>Sol</span>
            </span>
          </div>

          {/* Nav principal */}
          <div className="vs-nav-section">
            <div className="vs-nav-label">Principal</div>
            <button className="vs-nav-item active">
              <IconGrid />
              Dashboard
            </button>
            <button className="vs-nav-item">
              <IconClock />
              Producción
            </button>
            <button className="vs-nav-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              Registros
            </button>
          </div>

          {/* Nav inventario */}
          <div className="vs-nav-section">
            <div className="vs-nav-label">Inventario</div>
            {[
              { label: "Sitotroga",    color: "#166534" },
              { label: "Trichogramma", color: "#7c3aed" },
              { label: "Galleria",     color: "#d97706" },
              { label: "Paratheresia", color: "#0d9488" },
            ].map(({ label, color }) => (
              <button key={label} className="vs-nav-item">
                <div className="vs-nav-dot" style={{ background: color }} />
                {label}
              </button>
            ))}
          </div>

          {/* Footer user */}
          <div className="vs-sidebar-footer">
            <div className="vs-avatar">AG</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: ".78rem", fontWeight: 500, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Agro Gestor
              </div>
              <div style={{ fontSize: ".68rem", color: "#9ca3af" }}>admin@vallesol.pe</div>
            </div>
          </div>
        </aside>

        {/* ══════════════════ MAIN ══════════════════ */}
        <main className="vs-main">

          {/* Top bar */}
          <div className="vs-topbar">
            <div>
              <div style={{ fontSize: ".72rem", color: "#9ca3af", marginBottom: 3, textTransform: "capitalize" }}>
                {hoy}
              </div>
              <h1 className="vs-heading" style={{ fontSize: "1.55rem", color: "#111", margin: 0 }}>
                Resumen de <em>Producción</em>
              </h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: ".75rem", flexWrap: "wrap" }}>
              <div className="vs-badge-live">
                <div className="vs-pulse" />
                Portal activo
              </div>
              <button className="vs-export-btn">
                <IconDownload />
                Exportar
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="vs-kpi-grid">
            <KpiCard
              titulo="Saldo Sitotroga"
              valor={saldoSitotroga}
              unidad="gramos disponibles"
              accentColor="#166534"
              iconBg="#dcfce7"
              iconColor="#166534"
              tendencia={8.2}
              icono={<IconGlobe size={17} color="#166534" />}
            />
            <KpiCard
              titulo="Saldo Trichogramma"
              valor={saldoTrichogramma}
              unidad="pulg² disponibles"
              accentColor="#7c3aed"
              iconBg="#ede9fe"
              iconColor="#7c3aed"
              tendencia={3.1}
              icono={<IconBug size={17} color="#7c3aed" />}
            />
            <KpiCard
              titulo="Saldo Galleria"
              valor={saldoGalleria}
              unidad="unidades disponibles"
              accentColor="#d97706"
              iconBg="#fef3c7"
              iconColor="#d97706"
              tendencia={-2.4}
              icono={<IconHeart size={17} color="#d97706" />}
            />
            <KpiCard
              titulo="Saldo Paratheresia"
              valor={saldoParatheresia}
              unidad="parejas disponibles"
              accentColor="#0d9488"
              iconBg="#ccfbf1"
              iconColor="#0d9488"
              tendencia={12.6}
              icono={<IconUsers size={17} color="#0d9488" />}
            />
          </div>

          {/* Mid row: Chart + Feed */}
          <div
            className="vs-mid-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1rem", marginBottom: "1rem" }}
          >
            {/* Bar Chart */}
            <div className="vs-chart-card">
              <div className="vs-chart-header">
                <div>
                  <div className="vs-heading" style={{ fontSize: "1rem", color: "#111", marginBottom: 2 }}>
                    Producción semanal
                  </div>
                  <div style={{ fontSize: ".72rem", color: "#9ca3af" }}>
                    Últimas 8 semanas · todas las especies
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span className="vs-chip">Semana</span>
                  <span className="vs-chip vs-chip-neutral">Mes</span>
                </div>
              </div>
              <BarChart />
            </div>

            {/* Activity Feed */}
            <div className="vs-feed-card">
              <div className="vs-heading" style={{ fontSize: "1rem", color: "#111", marginBottom: "1rem" }}>
                Actividad reciente
              </div>
              {[
                { dot: "#166534", text: <>Lote <strong>S-0412</strong> ingresado al stock de Sitotroga</>, time: "Hace 18 min" },
                { dot: "#7c3aed", text: <>Cosecha Trichogramma — <strong>180 pulg²</strong> registradas</>, time: "Hace 1 h" },
                { dot: "#dc2626", text: <>Alerta: stock Galleria por debajo del mínimo</>, time: "Hace 2 h" },
                { dot: "#0d9488", text: <>Nuevas parejas Paratheresia — <strong>+42</strong> apareadas</>, time: "Hace 3 h" },
                { dot: "#166534", text: <>Despacho programado para el martes 22/04</>, time: "Ayer" },
              ].map((item, i) => (
                <div key={i} className="vs-feed-item">
                  <div className="vs-feed-dot" style={{ background: item.dot }} />
                  <div>
                    <div className="vs-feed-text">{item.text}</div>
                    <div className="vs-feed-time">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="vs-table-card">
            <div className="vs-table-head">
              <div className="vs-heading" style={{ fontSize: "1rem", color: "#111" }}>
                Últimos movimientos
              </div>
              <span className="vs-chip" style={{ cursor: "pointer" }}>Ver todos →</span>
            </div>
            <table className="vs-table">
              <thead>
                <tr>
                  <th>Especie</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Responsable</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th style={{ textAlign: "right" }}>Tendencia</th>
                </tr>
              </thead>
              <tbody>
                {MOVIMIENTOS.map((m, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: m.dotColor, flexShrink: 0 }} />
                        <strong>{m.especie}</strong>
                      </div>
                    </td>
                    <td style={{ color: "#9ca3af" }}>{m.tipo}</td>
                    <td><strong>{m.cantidad}</strong></td>
                    <td>{m.responsable}</td>
                    <td>{m.fecha}</td>
                    <td>
                      <span className={`vs-pill ${
                        m.estado === "Completado" ? "vs-pill-green"
                        : m.estado === "En proceso" ? "vs-pill-amber"
                        : "vs-pill-red"
                      }`}>
                        {m.estado}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Sparkline values={m.spark} color={m.sparkColor} hiColor={m.sparkHi} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </main>
      </div>
    </>
  );
}
