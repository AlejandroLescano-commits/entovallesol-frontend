import { useState } from "react";
import { useSitotroga, useCreateSitotroga } from "@/hooks/useProduccion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { ProduccionSitotroga } from "@/types";

const schema = z.object({
  fecha: z.string().min(1),
  produccion_dia: z.coerce.number().nonnegative().optional(),
  salida_t_exiguum: z.coerce.number().nonnegative().default(0),
  salida_t_pretiosum: z.coerce.number().nonnegative().default(0),
  salida_infestacion: z.coerce.number().nonnegative().default(0),
  salida_ventas: z.coerce.number().nonnegative().default(0),
});
type Form = z.infer<typeof schema>;

const columns = [
  { key: "fecha", label: "Fecha" },
  { key: "produccion_dia", label: "Prod/día (g)" },
  { key: "salida_t_exiguum", label: "T. exiguum" },
  { key: "salida_t_pretiosum", label: "T. pretiosum" },
  { key: "salida_total", label: "Total salida" },
  { key: "saldo", label: "Saldo (g)" },
];

export default function SitotrogaPage() {
  const [open, setOpen] = useState(false);
  const { data = [], isLoading } = useSitotroga();
  const { mutate, isPending } = useCreateSitotroga();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = (d: Form) => {
    mutate(d, { onSuccess: () => { setOpen(false); reset(); } });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Producción Sitotroga cerealella</h2>
        <Button size="sm" onClick={() => setOpen(true)}>+ Nuevo registro</Button>
      </div>
      <DataTable columns={columns} data={data as unknown as Record<string, unknown>[]} loading={isLoading} />
      <Modal open={open} onClose={() => setOpen(false)} title="Registrar producción Sitotroga">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-3">
          <Input label="Fecha" type="date" error={errors.fecha?.message} {...register("fecha")} className="col-span-2" />
          <Input label="Producción/día (g)" type="number" step="0.01" {...register("produccion_dia")} />
          <Input label="Salida T. exiguum" type="number" step="0.01" {...register("salida_t_exiguum")} />
          <Input label="Salida T. pretiosum" type="number" step="0.01" {...register("salida_t_pretiosum")} />
          <Input label="Infestación" type="number" step="0.01" {...register("salida_infestacion")} />
          <Input label="Ventas" type="number" step="0.01" {...register("salida_ventas")} />
          <div className="col-span-2 flex justify-end gap-2 mt-2">
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={isPending}>Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
