import { useState } from "react";
import { useGalleria, useCreateGalleria } from "@/hooks/useProduccion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const schema = z.object({
  fecha:            z.string().min(1, "Requerido"),
  ingreso_huevos:   z.coerce.number().nonnegative().default(0),
  ingreso_larvas:   z.coerce.number().nonnegative().default(0),
  salida_sitotroga: z.coerce.number().nonnegative().default(0),
  salida_ventas:    z.coerce.number().nonnegative().default(0),
  mortalidad:       z.coerce.number().nonnegative().default(0),
});
type Form = z.infer<typeof schema>;

const columns = [
  { key: "fecha",            label: "Fecha"            },
  { key: "ingreso_huevos",   label: "Ingreso huevos"   },
  { key: "ingreso_larvas",   label: "Ingreso larvas"   },
  { key: "ingreso_total",    label: "Total ingreso"    },
  { key: "salida_sitotroga", label: "Sal. Sitotroga"   },
  { key: "salida_ventas",    label: "Ventas"           },
  { key: "mortalidad",       label: "Mortalidad"       },
  { key: "salida_total",     label: "Total salida"     },
  { key: "saldo",            label: "Saldo (u.)"       },
];

export default function GalleriaPage() {
  const [open, setOpen] = useState(false);
  const { data = [], isLoading } = useGalleria();
  const { mutate, isPending } = useCreateGalleria();
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
          Producción Galleria mellonella
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
        title="Registrar producción Galleria"
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
            label="Ingreso huevos (u.)"
            type="number"
            step="1"
            {...register("ingreso_huevos")}
          />
          <Input
            label="Ingreso larvas (u.)"
            type="number"
            step="1"
            {...register("ingreso_larvas")}
          />
          <Input
            label="Salida a Sitotroga (u.)"
            type="number"
            step="1"
            {...register("salida_sitotroga")}
          />
          <Input
            label="Ventas (u.)"
            type="number"
            step="1"
            {...register("salida_ventas")}
          />
          <Input
            label="Mortalidad (u.)"
            type="number"
            step="1"
            {...register("mortalidad")}
            className="col-span-2"
          />
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
