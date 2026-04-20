import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useConfiguracion, useSaveConfiguracion } from "@/hooks/useConfiguracion";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const schema = z.object({
  nombre_empresa:       z.string().min(1, "Requerido"),
  ruc:                  z.string().length(11, "El RUC debe tener 11 dígitos").optional().or(z.literal("")),
  direccion:            z.string().optional(),
  telefono:             z.string().optional(),
  email_contacto:       z.string().email("Correo inválido").optional().or(z.literal("")),
  stock_minimo_sito:    z.coerce.number().nonnegative().default(0),
  stock_minimo_trich:   z.coerce.number().nonnegative().default(0),
  stock_minimo_gall:    z.coerce.number().nonnegative().default(0),
  stock_minimo_para:    z.coerce.number().nonnegative().default(0),
  zona_horaria:         z.string().default("America/Lima"),
});
type Form = z.infer<typeof schema>;

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: "1rem",
        color: "#111",
        marginBottom: "1rem",
        paddingBottom: ".5rem",
        borderBottom: "0.5px solid #f0f0ee",
      }}
    >
      {children}
    </div>
  );
}

export default function ConfiguracionPage() {
  const { data: config, isLoading } = useConfiguracion();
  const { mutate, isPending, isSuccess, isError, error } = useSaveConfiguracion();

  const {
    register, handleSubmit,
    formState: { errors, isDirty },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    values: config,
  });

  const onSubmit = (d: Form) => mutate(d);

  if (isLoading) {
    return (
      <div className="text-center py-5 text-secondary" style={{ fontSize: ".85rem" }}>
        Cargando configuración…
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-0">
          Configuración del Sistema
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Ajustes generales de la empresa y parámetros de producción.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row g-4">

          {/* Datos de empresa */}
          <div className="col-12 col-lg-6">
            <div
              className="rounded-3 p-4"
              style={{ background: "#fff", border: "0.5px solid #e5e7eb" }}
            >
              <SectionTitle>Datos de la empresa</SectionTitle>
              <div className="d-flex flex-column gap-3">
                <Input
                  label="Nombre de la empresa"
                  type="text"
                  error={errors.nombre_empresa?.message}
                  {...register("nombre_empresa")}
                />
                <Input
                  label="RUC"
                  type="text"
                  maxLength={11}
                  error={errors.ruc?.message}
                  {...register("ruc")}
                />
                <Input
                  label="Dirección"
                  type="text"
                  {...register("direccion")}
                />
                <Input
                  label="Teléfono"
                  type="tel"
                  {...register("telefono")}
                />
                <Input
                  label="Correo de contacto"
                  type="email"
                  error={errors.email_contacto?.message}
                  {...register("email_contacto")}
                />
              </div>
            </div>
          </div>

          {/* Parámetros de producción */}
          <div className="col-12 col-lg-6">
            <div
              className="rounded-3 p-4 mb-4"
              style={{ background: "#fff", border: "0.5px solid #e5e7eb" }}
            >
              <SectionTitle>Stock mínimo de alerta</SectionTitle>
              <p style={{ fontSize: ".78rem", color: "#9ca3af", marginBottom: "1rem" }}>
                Se mostrará una alerta cuando el saldo baje de estos valores.
              </p>
              <div className="row g-3">
                <div className="col-6">
                  <Input
                    label="Sitotroga (g)"
                    type="number"
                    step="0.01"
                    {...register("stock_minimo_sito")}
                  />
                </div>
                <div className="col-6">
                  <Input
                    label="Trichogramma (pulg²)"
                    type="number"
                    step="0.01"
                    {...register("stock_minimo_trich")}
                  />
                </div>
                <div className="col-6">
                  <Input
                    label="Galleria (u.)"
                    type="number"
                    step="1"
                    {...register("stock_minimo_gall")}
                  />
                </div>
                <div className="col-6">
                  <Input
                    label="Paratheresia (parejas)"
                    type="number"
                    step="1"
                    {...register("stock_minimo_para")}
                  />
                </div>
              </div>
            </div>

            <div
              className="rounded-3 p-4"
              style={{ background: "#fff", border: "0.5px solid #e5e7eb" }}
            >
              <SectionTitle>Sistema</SectionTitle>
              <div className="mb-3">
                <label
                  className="d-block mb-1"
                  style={{ fontSize: ".72rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".07em", color: "#9ca3af" }}
                >
                  Zona horaria
                </label>
                <select
                  className="form-select"
                  style={{ fontSize: ".85rem", borderRadius: 8 }}
                  {...register("zona_horaria")}
                >
                  <option value="America/Lima">America/Lima (UTC-5)</option>
                  <option value="America/Bogota">America/Bogota (UTC-5)</option>
                  <option value="America/Santiago">America/Santiago (UTC-4)</option>
                  <option value="America/Sao_Paulo">America/Sao_Paulo (UTC-3)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback + guardar */}
        <div className="mt-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            {isSuccess && (
              <div className="alert alert-success py-2 mb-0" style={{ fontSize: ".82rem", borderRadius: 8 }}>
                ✓ Configuración guardada correctamente.
              </div>
            )}
            {isError && (
              <div className="alert alert-danger py-2 mb-0" style={{ fontSize: ".82rem", borderRadius: 8 }}>
                {(error as Error)?.message ?? "Error al guardar la configuración."}
              </div>
            )}
          </div>
          <Button
            type="submit"
            loading={isPending}
            // @ts-expect-error — ajusta según tus props de Button
            disabled={!isDirty && !isPending}
          >
            Guardar configuración
          </Button>
        </div>
      </form>
    </div>
  );
}
