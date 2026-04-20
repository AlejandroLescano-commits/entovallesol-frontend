import { useState } from "react";
import { useDistribucion, useCreateDistribucion } from "@/hooks/useDistribucion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const schema = z.object({
  fecha:              z.string().min(1, "Requerido"),
  finca:              z.string().min(1, "Requerido"),
  especie:            z.enum(["sitotroga", "trichogramma_exiguum", "trichogramma_pretiosum", "galleria", "paratheresia"]),
  cantidad:           z.coerce.number().positive("Debe ser mayor a 0"),
  unidad:             z.string().min(1, "Requerido"),
  responsable:        z.string().optional(),
  observaciones:      z.string().optional(),
});
type Form = z.infer<typeof schema>;

const ESPECIES = [
  { value: "sitotroga",               label: "Sitotroga cerealella"       },
  { value: "trichogramma_exiguum",    label: "Trichogramma exiguum"       },
  { value: "trichogramma_pretiosum",  label: "Trichogramma pretiosum"     },
  { value: "galleria",                label: "Galleria mellonella"         },
  { value: "paratheresia",            label: "Paratheresia claripalpis"    },
];

const columns = [
  { key: "fecha",         label: "Fecha"        },
  { key: "finca",         label: "Finca"        },
  { key: "especie",       label: "Especie"      },
  { key: "cantidad",      label: "Cantidad"     },
  { key: "unidad",        label: "Unidad"       },
  { key: "responsable",   label: "Responsable"  },
  { key: "observaciones", label: "Obs."         },
];

export default function DistribucionPage() {
  const [open, setOpen] = useState(false);
  const { data = [], isLoading } = useDistribucion();
  const { mutate, isPending } = useCreateDistribucion();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = (d: Form) => {
    mutate(d, { onSuccess: () => { setOpen(false); reset(); } });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">
          Distribución a Fincas
        </h2>
        <Button size="sm" onClick={() => setOpen(true)}>+ Nueva distribución</Button>
      </div>

      <DataTable
        columns={columns}
        data={data as unknown as Record<string, unknown>[]}
        loading={isLoading}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Registrar distribución"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-3">
          <Input
            label="Fecha"
            type="date"
            error={errors.fecha?.message}
            {...register("fecha")}
          />
          <Input
            label="Finca / destino"
            type="text"
            error={errors.finca?.message}
            {...register("finca")}
          />

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Especie
            </label>
            <select
              className={`form-select${errors.especie ? " is-invalid" : ""}`}
              style={{ fontSize: ".85rem", borderRadius: 8 }}
              {...register("especie")}
            >
              <option value="">Seleccionar…</option>
              {ESPECIES.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
            {errors.especie && (
              <div className="invalid-feedback">{errors.especie.message}</div>
            )}
          </div>

          <Input
            label="Cantidad"
            type="number"
            step="0.01"
            error={errors.cantidad?.message}
            {...register("cantidad")}
          />
          <Input
            label="Unidad (g, pulg², parejas, u.)"
            type="text"
            error={errors.unidad?.message}
            {...register("unidad")}
          />
          <Input
            label="Responsable"
            type="text"
            {...register("responsable")}
          />
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Observaciones
            </label>
            <textarea
              rows={2}
              className="form-control"
              style={{ fontSize: ".85rem", borderRadius: 8 }}
              {...register("observaciones")}
            />
          </div>

          <div className="col-span-2 flex justify-end gap-2 mt-2">
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={isPending}>Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
