import { useState } from "react";
import { useTrichogramma, useCreateTrichogramma } from "@/hooks/useProduccion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const schema = z.object({
  fecha:                     z.string().min(1, "Requerido"),
  cosecha_t_exiguum:         z.coerce.number().nonnegative().default(0),
  cosecha_t_pretiosum:       z.coerce.number().nonnegative().default(0),
  salida_campo_t_exiguum:    z.coerce.number().nonnegative().default(0),
  salida_campo_t_pretiosum:  z.coerce.number().nonnegative().default(0),
  salida_ventas:             z.coerce.number().nonnegative().default(0),
});
type Form = z.infer<typeof schema>;

const columns = [
  { key: "fecha",                    label: "Fecha"              },
  { key: "cosecha_t_exiguum",        label: "Cosecha exiguum"    },
  { key: "cosecha_t_pretiosum",      label: "Cosecha pretiosum"  },
  { key: "cosecha_total",            label: "Total cosecha"      },
  { key: "salida_campo_t_exiguum",   label: "Campo exiguum"      },
  { key: "salida_campo_t_pretiosum", label: "Campo pretiosum"    },
  { key: "salida_ventas",            label: "Ventas"             },
  { key: "salida_total",             label: "Total salida"       },
  { key: "saldo",                    label: "Saldo (pulg²)"      },
];

export default function TrichogrammaPage() {
  const [open, setOpen] = useState(false);
  const { data = [], isLoading } = useTrichogramma();
  const { mutate, isPending } = useCreateTrichogramma();
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
          Producción Trichogramma exiguum / pretiosum
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
        title="Registrar producción Trichogramma"
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
            label="Cosecha T. exiguum (pulg²)"
            type="number"
            step="0.01"
            {...register("cosecha_t_exiguum")}
          />
          <Input
            label="Cosecha T. pretiosum (pulg²)"
            type="number"
            step="0.01"
            {...register("cosecha_t_pretiosum")}
          />
          <Input
            label="Salida campo T. exiguum"
            type="number"
            step="0.01"
            {...register("salida_campo_t_exiguum")}
          />
          <Input
            label="Salida campo T. pretiosum"
            type="number"
            step="0.01"
            {...register("salida_campo_t_pretiosum")}
          />
          <Input
            label="Ventas (pulg²)"
            type="number"
            step="0.01"
            {...register("salida_ventas")}
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
