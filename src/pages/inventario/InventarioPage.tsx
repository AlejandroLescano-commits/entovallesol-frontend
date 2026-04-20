import { useSitotroga, useTrichogramma, useGalleria, useParatheresia } from "@/hooks/useProduccion";

interface StockCardProps {
  especie: string;
  saldo: number;
  unidad: string;
  color: string;
  bg: string;
}

function StockCard({ especie, saldo, unidad, color, bg }: StockCardProps) {
  return (
    <div
      className="p-4 rounded-3 border d-flex align-items-center gap-3"
      style={{ background: "#fff", borderColor: "#e5e7eb" }}
    >
      <div
        className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
        style={{ width: 44, height: 44, background: bg }}
      >
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: color }} />
      </div>
      <div className="flex-grow-1 min-width-0">
        <div style={{ fontSize: ".7rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".06em", color: "#9ca3af" }}>
          {especie}
        </div>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.6rem", color, lineHeight: 1.1 }}>
          {saldo.toLocaleString("es-PE")}
        </div>
        <div style={{ fontSize: ".72rem", color: "#b0b0aa" }}>{unidad}</div>
      </div>
    </div>
  );
}

export default function InventarioPage() {
  const { data: sitotroga    = [], isLoading: l1 } = useSitotroga();
  const { data: trichogramma = [], isLoading: l2 } = useTrichogramma();
  const { data: galleria     = [], isLoading: l3 } = useGalleria();
  const { data: paratheresia = [], isLoading: l4 } = useParatheresia();

  const loading = l1 || l2 || l3 || l4;

  const saldoSito  = sitotroga.at(-1)?.saldo    ?? 0;
  const saldoTrich = trichogramma.at(-1)?.saldo ?? 0;
  const saldoGall  = galleria.at(-1)?.saldo     ?? 0;
  const saldoPara  = paratheresia.at(-1)?.saldo ?? 0;

  const stocks = [
    { especie: "Sitotroga cerealella",    saldo: saldoSito,  unidad: "gramos",  color: "#166534", bg: "#dcfce7" },
    { especie: "Trichogramma spp.",       saldo: saldoTrich, unidad: "pulg²",   color: "#7c3aed", bg: "#ede9fe" },
    { especie: "Galleria mellonella",     saldo: saldoGall,  unidad: "unidades",color: "#d97706", bg: "#fef3c7" },
    { especie: "Paratheresia claripalpis",saldo: saldoPara,  unidad: "parejas", color: "#0d9488", bg: "#ccfbf1" },
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-0">
          Inventario — Saldos en Tiempo Real
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Calculado desde el último registro de cada módulo de producción.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-5 text-secondary" style={{ fontSize: ".85rem" }}>
          Cargando inventario…
        </div>
      ) : (
        <div className="row g-3">
          {stocks.map((s) => (
            <div key={s.especie} className="col-12 col-sm-6 col-xl-3">
              <StockCard {...s} />
            </div>
          ))}
        </div>
      )}

      {/* Tabla detallada */}
      {!loading && (
        <div
          className="mt-4 rounded-3 overflow-hidden"
          style={{ border: "0.5px solid #e5e7eb" }}
        >
          <div
            className="px-4 py-3"
            style={{ borderBottom: "0.5px solid #f0f0ee", background: "#fff" }}
          >
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1rem", color: "#111" }}>
              Resumen de saldos
            </span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans', sans-serif", fontSize: ".82rem", background: "#fff" }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid #f0f0ee" }}>
                {["Especie","Último registro","Saldo actual","Unidad"].map((h) => (
                  <th key={h} style={{ padding: ".6rem 1.25rem", textAlign: "left", fontSize: ".65rem", textTransform: "uppercase", letterSpacing: ".07em", color: "#9ca3af", fontWeight: 500 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { especie: "Sitotroga cerealella",     fecha: sitotroga.at(-1)?.fecha    ?? "—", saldo: saldoSito,  unidad: "g",       color: "#166534" },
                { especie: "Trichogramma spp.",         fecha: trichogramma.at(-1)?.fecha ?? "—", saldo: saldoTrich, unidad: "pulg²",   color: "#7c3aed" },
                { especie: "Galleria mellonella",       fecha: galleria.at(-1)?.fecha     ?? "—", saldo: saldoGall,  unidad: "u.",      color: "#d97706" },
                { especie: "Paratheresia claripalpis",  fecha: paratheresia.at(-1)?.fecha ?? "—", saldo: saldoPara,  unidad: "parejas", color: "#0d9488" },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: "0.5px solid #f9f9f7" }}>
                  <td style={{ padding: ".7rem 1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: row.color, flexShrink: 0 }} />
                      <strong>{row.especie}</strong>
                    </div>
                  </td>
                  <td style={{ padding: ".7rem 1.25rem", color: "#9ca3af" }}>{row.fecha}</td>
                  <td style={{ padding: ".7rem 1.25rem" }}>
                    <strong style={{ color: row.color }}>{row.saldo.toLocaleString("es-PE")}</strong>
                  </td>
                  <td style={{ padding: ".7rem 1.25rem", color: "#9ca3af" }}>{row.unidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
