import { useState } from "react";
import { useExportarReporte } from "@/hooks/useReportes";
import Button from "@/components/ui/Button";

type Modulo  = "sitotroga" | "trichogramma" | "galleria" | "paratheresia" | "distribucion" | "inventario";
type Formato = "excel" | "pdf";

const MODULOS: { value: Modulo; label: string }[] = [
  { value: "sitotroga",    label: "Sitotroga cerealella"     },
  { value: "trichogramma", label: "Trichogramma spp."        },
  { value: "galleria",     label: "Galleria mellonella"      },
  { value: "paratheresia", label: "Paratheresia claripalpis" },
  { value: "distribucion", label: "Distribución a fincas"    },
  { value: "inventario",   label: "Inventario general"       },
];

export default function ReportesPage() {
  const [modulo,   setModulo]   = useState<Modulo>("sitotroga");
  const [formato,  setFormato]  = useState<Formato>("excel");
  const [fechaIni, setFechaIni] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const { mutate, isPending, isSuccess, isError, error } = useExportarReporte();

  const handleExportar = () => {
    mutate({ modulo, formato, fecha_inicio: fechaIni, fecha_fin: fechaFin });
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-0">
          Reportes — Exportar Excel / PDF
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Genera reportes por módulo y rango de fechas.
        </p>
      </div>

      <div className="row g-4">
        {/* Formulario */}
        <div className="col-12 col-lg-6">
          <div
            className="rounded-3 p-4"
            style={{ background: "#fff", border: "0.5px solid #e5e7eb" }}
          >
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1rem", color: "#111", marginBottom: "1rem" }}>
              Configurar reporte
            </div>

            {/* Módulo */}
            <div className="mb-3">
              <label className="d-block mb-1" style={{ fontSize: ".72rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".07em", color: "#9ca3af" }}>
                Módulo
              </label>
              <select
                className="form-select"
                style={{ fontSize: ".85rem", borderRadius: 8 }}
                value={modulo}
                onChange={(e) => setModulo(e.target.value as Modulo)}
              >
                {MODULOS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Rango de fechas */}
            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="d-block mb-1" style={{ fontSize: ".72rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".07em", color: "#9ca3af" }}>
                  Fecha inicio
                </label>
                <input
                  type="date"
                  className="form-control"
                  style={{ fontSize: ".85rem", borderRadius: 8 }}
                  value={fechaIni}
                  onChange={(e) => setFechaIni(e.target.value)}
                />
              </div>
              <div className="col-6">
                <label className="d-block mb-1" style={{ fontSize: ".72rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".07em", color: "#9ca3af" }}>
                  Fecha fin
                </label>
                <input
                  type="date"
                  className="form-control"
                  style={{ fontSize: ".85rem", borderRadius: 8 }}
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
            </div>

            {/* Formato */}
            <div className="mb-4">
              <label className="d-block mb-2" style={{ fontSize: ".72rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".07em", color: "#9ca3af" }}>
                Formato
              </label>
              <div className="d-flex gap-2">
                {(["excel","pdf"] as Formato[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormato(f)}
                    style={{
                      padding: "8px 20px",
                      borderRadius: 9,
                      border: `0.5px solid ${formato === f ? "#166534" : "#e5e7eb"}`,
                      background: formato === f ? "#dcfce7" : "#f9f9f7",
                      color: formato === f ? "#166534" : "#6b7280",
                      fontSize: ".82rem",
                      fontWeight: formato === f ? 500 : 400,
                      cursor: "pointer",
                      textTransform: "uppercase",
                      letterSpacing: ".05em",
                      transition: "all .15s",
                    }}
                  >
                    {f === "excel" ? "📊 Excel" : "📄 PDF"}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback */}
            {isSuccess && (
              <div className="alert alert-success py-2 mb-3" style={{ fontSize: ".82rem", borderRadius: 8 }}>
                ✓ Reporte generado y descargado.
              </div>
            )}
            {isError && (
              <div className="alert alert-danger py-2 mb-3" style={{ fontSize: ".82rem", borderRadius: 8 }}>
                {(error as Error)?.message ?? "Error al generar el reporte."}
              </div>
            )}

            <Button
              type="button"
              loading={isPending}
              onClick={handleExportar}
              // @ts-expect-error — ajusta según tu prop de Button
              disabled={isPending}
            >
              Generar reporte
            </Button>
          </div>
        </div>

        {/* Panel de accesos rápidos */}
        <div className="col-12 col-lg-6">
          <div
            className="rounded-3 p-4"
            style={{ background: "#fff", border: "0.5px solid #e5e7eb" }}
          >
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1rem", color: "#111", marginBottom: "1rem" }}>
              Reportes frecuentes
            </div>
            {[
              { label: "Producción mensual — Sitotroga",    modulo: "sitotroga",    formato: "excel" },
              { label: "Producción mensual — Trichogramma", modulo: "trichogramma", formato: "excel" },
              { label: "Inventario general (hoy)",          modulo: "inventario",   formato: "pdf"   },
              { label: "Distribución a fincas — mes actual",modulo: "distribucion", formato: "pdf"   },
            ].map((r, i) => (
              <div
                key={i}
                className="d-flex align-items-center justify-content-between py-2"
                style={{ borderBottom: i < 3 ? "0.5px solid #f5f5f3" : "none" }}
              >
                <span style={{ fontSize: ".82rem", color: "#374151" }}>{r.label}</span>
                <button
                  type="button"
                  onClick={() => {
                    setModulo(r.modulo as Modulo);
                    setFormato(r.formato as Formato);
                  }}
                  style={{
                    fontSize: ".72rem", color: "#166534", background: "none",
                    border: "none", cursor: "pointer", fontWeight: 500,
                  }}
                >
                  Seleccionar →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
