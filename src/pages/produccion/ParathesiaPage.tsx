import { useState } from "react";
import { useParatheresia, useCreateParatheresia } from "@/hooks/useProduccion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const schema = z.object({
  fecha:               z.string().min(1, "Requerido"),
  ingreso_parejas:     z.coerce.number().nonnegative().default(0),
  salida_campo:        z.coerce.number().nonnegative().default(0),
  salida_ventas:       z.coerce.number().nonnegative().default(0),
  mortalidad:          z.coerce.number().nonnegative().default(0),
  observaciones:       z.string().optional(),
});
type Form = z.infer<typeof schema>;

const columns = [
  { key: "fecha",           label: "Fecha"          },
  { key: "ingreso_parejas", label: "Ingreso parejas" },
  { key: "salida_campo",    label: "Sal. campo"      },
  { key: "salida_ventas",   label: "Ventas"          },
  { key: "mortalidad",      label: "Mortalidad"      },
  { key: "salida_total",    label: "Total salida"    },
  { key: "saldo",           label: "Saldo (parejas)" },
  { key: "observaciones",   label: "Observaciones"   },
];

export default function ParathesiaPage() {
  const [open, setOpen] = useState(false);
  const { data = [], isLoading } = useParatheresia();
  const { mutate, isPending } = useCreateParatheresia();
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
          Producción Paratheresia claripalpis
        </h2>
        <Button size="sm" onClick={() => setOpen(true)}>+ Nuevo registro</Button>
      </div>

      <DataTable
        columns={columns}
        data={data as unknown as Record<string, unknown>[]}
        loading={isLoading}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Registrar producción Paratheresia"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-3">
          <Input
            label="Fecha"
            type="date"
            error={errors.fecha?.message}
            {...register("fecha")}
            className="col-span-2"
          />
          <Input
            label="Ingreso parejas"
            type="number"
            step="1"
            {...register("ingreso_parejas")}
          />
          <Input
            label="Salida campo (parejas)"
            type="number"
            step="1"
            {...register("salida_campo")}
          />
          <Input
            label="Ventas (parejas)"
            type="number"
            step="1"
            {...register("salida_ventas")}
          />
          <Input
            label="Mortalidad (parejas)"
            type="number"
            step="1"
            {...register("mortalidad")}
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
