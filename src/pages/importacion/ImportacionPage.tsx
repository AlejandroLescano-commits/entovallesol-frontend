import { useRef, useState } from "react";
import { useImportarExcel } from "@/hooks/useImportacion";
import Button from "@/components/ui/Button";

type Modulo = "sitotroga" | "trichogramma" | "galleria" | "paratheresia" | "distribucion";

const MODULOS: { value: Modulo; label: string }[] = [
  { value: "sitotroga",    label: "Sitotroga cerealella"     },
  { value: "trichogramma", label: "Trichogramma spp."        },
  { value: "galleria",     label: "Galleria mellonella"      },
  { value: "paratheresia", label: "Paratheresia claripalpis" },
  { value: "distribucion", label: "Distribución a fincas"    },
];

export default function ImportacionPage() {
  const fileRef                = useRef<HTMLInputElement>(null);
  const [modulo, setModulo]    = useState<Modulo>("sitotroga");
  const [archivo, setArchivo]  = useState<File | null>(null);
  const [arrastrado, setArr]   = useState(false);
  const { mutate, isPending, isSuccess, isError, error, reset } = useImportarExcel();

  const handleFile = (f: File | null) => {
    if (!f) return;
    setArchivo(f);
    reset();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setArr(false);
    handleFile(e.dataTransfer.files[0] ?? null);
  };

  const handleSubmit = () => {
    if (!archivo) return;
    const fd = new FormData();
    fd.append("file", archivo);
    fd.append("modulo", modulo);
    mutate(fd);
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-0">
          Importación Masiva desde Excel
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Sube un archivo .xlsx con los registros de producción o distribución.
        </p>
      </div>

      <div className="row g-4">
        {/* Panel principal */}
        <div className="col-12 col-lg-8">
          <div
            className="rounded-3 p-4"
            style={{ background: "#fff", border: "0.5px solid #e5e7eb" }}
          >
            {/* Selector de módulo */}
            <div className="mb-4">
              <label className="d-block mb-1" style={{ fontSize: ".72rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".07em", color: "#9ca3af" }}>
                Módulo destino
              </label>
              <select
                className="form-select"
                style={{ fontSize: ".85rem", borderRadius: 8, maxWidth: 320 }}
                value={modulo}
                onChange={(e) => setModulo(e.target.value as Modulo)}
              >
                {MODULOS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setArr(true); }}
              onDragLeave={() => setArr(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${arrastrado ? "#166534" : "#d1d5db"}`,
                borderRadius: 12,
                background: arrastrado ? "#f0fdf4" : "#fafaf8",
                padding: "2.5rem 1rem",
                textAlign: "center",
                cursor: "pointer",
                transition: "border-color .2s, background .2s",
              }}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls"
                className="d-none"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
              <svg
                width="32" height="32" viewBox="0 0 24 24"
                fill="none" stroke={arrastrado ? "#166534" : "#9ca3af"} strokeWidth="1.5"
                style={{ marginBottom: 12 }}
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>

              {archivo ? (
                <>
                  <div style={{ fontSize: ".85rem", fontWeight: 500, color: "#166534" }}>
                    {archivo.name}
                  </div>
                  <div style={{ fontSize: ".72rem", color: "#9ca3af", marginTop: 4 }}>
                    {(archivo.size / 1024).toFixed(1)} KB · Haz clic para cambiar
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: ".85rem", color: "#374151", fontWeight: 500 }}>
                    Arrastra tu archivo .xlsx aquí
                  </div>
                  <div style={{ fontSize: ".72rem", color: "#9ca3af", marginTop: 4 }}>
                    o haz clic para seleccionar
                  </div>
                </>
              )}
            </div>

            {/* Feedback */}
            {isSuccess && (
              <div className="alert alert-success mt-3 mb-0 py-2" style={{ fontSize: ".82rem", borderRadius: 8 }}>
                ✓ Importación completada correctamente.
              </div>
            )}
            {isError && (
              <div className="alert alert-danger mt-3 mb-0 py-2" style={{ fontSize: ".82rem", borderRadius: 8 }}>
                {(error as Error)?.message ?? "Error al importar el archivo."}
              </div>
            )}

            {/* Acciones */}
            <div className="d-flex justify-content-end gap-2 mt-4">
              {archivo && (
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => { setArchivo(null); reset(); }}
                >
                  Limpiar
                </Button>
              )}
              <Button
                type="button"
                loading={isPending}
                onClick={handleSubmit}
                // @ts-expect-error — ajusta según tu prop de Button
                disabled={!archivo || isPending}
              >
                Importar
              </Button>
            </div>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="col-12 col-lg-4">
          <div
            className="rounded-3 p-4"
            style={{ background: "#fff", border: "0.5px solid #e5e7eb", fontSize: ".82rem", color: "#374151" }}
          >
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1rem", color: "#111", marginBottom: ".75rem" }}>
              Instrucciones
            </div>
            <ol className="ps-3 mb-3" style={{ lineHeight: 1.8 }}>
              <li>Selecciona el <strong>módulo destino</strong>.</li>
              <li>Descarga la <strong>plantilla</strong> correspondiente.</li>
              <li>Llena los datos sin modificar los encabezados.</li>
              <li>Sube el archivo y haz clic en <strong>Importar</strong>.</li>
            </ol>
            <div style={{ borderTop: "0.5px solid #f0f0ee", paddingTop: ".75rem", color: "#9ca3af", fontSize: ".72rem" }}>
              Formatos aceptados: <strong>.xlsx</strong>, <strong>.xls</strong><br />
              Tamaño máximo: <strong>5 MB</strong>
            </div>
            <div className="mt-3">
              <div style={{ fontSize: ".72rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".07em", color: "#9ca3af", marginBottom: ".5rem" }}>
                Plantillas
              </div>
              {MODULOS.map((m) => (
                <a
                  key={m.value}
                  href={`/plantillas/${m.value}.xlsx`}
                  download
                  className="d-flex align-items-center gap-2 py-1"
                  style={{ fontSize: ".8rem", color: "#166534", textDecoration: "none" }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  {m.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
