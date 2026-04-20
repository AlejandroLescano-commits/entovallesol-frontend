import { useState } from "react";
import { useUsuarios, useCreateUsuario, useUpdateUsuario, useDeleteUsuario } from "@/hooks/useUsuarios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { Usuario } from "@/types";

const ROL_COLORS: Record<string, { bg: string; color: string }> = {
  admin:      { bg: "#fee2e2", color: "#991b1b" },
  supervisor: { bg: "#fef9c3", color: "#854d0e" },
  operario:   { bg: "#f3f4f6", color: "#374151" },
};

const schema = z.object({
  nombre:   z.string().min(2, "Mínimo 2 caracteres"),
  email:    z.string().email("Correo inválido"),
  rol:      z.enum(["admin", "supervisor", "operario"]),
  password: z.string().min(6, "Mínimo 6 caracteres").optional().or(z.literal("")),
});
type Form = z.infer<typeof schema>;

export default function UsuariosPage() {
  const [open,     setOpen]     = useState(false);
  const [editUser, setEditUser] = useState<Usuario | null>(null);
  const [delId,    setDelId]    = useState<number | null>(null);

  const { data: usuarios = [], isLoading }    = useUsuarios();
  const { mutate: crear,    isPending: creando } = useCreateUsuario();
  const { mutate: actualizar, isPending: guardando } = useUpdateUsuario();
  const { mutate: eliminar, isPending: eliminando } = useDeleteUsuario();

  const {
    register, handleSubmit, reset, setValue,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const abrirNuevo = () => {
    setEditUser(null);
    reset({ nombre: "", email: "", rol: "operario", password: "" });
    setOpen(true);
  };

  const abrirEditar = (u: Usuario) => {
    setEditUser(u);
    setValue("nombre",   u.nombre);
    setValue("email",    u.email);
    setValue("rol",      u.rol as Form["rol"]);
    setValue("password", "");
    setOpen(true);
  };

  const onSubmit = (d: Form) => {
    if (editUser) {
      actualizar(
        { id: editUser.id, ...d },
        { onSuccess: () => { setOpen(false); reset(); setEditUser(null); } }
      );
    } else {
      crear(d as Required<Form>, { onSuccess: () => { setOpen(false); reset(); } });
    }
  };

  const confirmarEliminar = (id: number) => setDelId(id);
  const doEliminar = () => {
    if (delId === null) return;
    eliminar(delId, { onSuccess: () => setDelId(null) });
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-0">
            Gestión de Usuarios y Roles
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""} registrado{usuarios.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button size="sm" onClick={abrirNuevo}>+ Nuevo usuario</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-5 text-secondary" style={{ fontSize: ".85rem" }}>
          Cargando usuarios…
        </div>
      ) : (
        <div
          className="rounded-3 overflow-hidden"
          style={{ border: "0.5px solid #e5e7eb" }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans', sans-serif", fontSize: ".82rem", background: "#fff" }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid #f0f0ee" }}>
                {["Usuario","Correo","Rol","Acciones"].map((h) => (
                  <th key={h} style={{ padding: ".6rem 1.25rem", textAlign: "left", fontSize: ".65rem", textTransform: "uppercase", letterSpacing: ".07em", color: "#9ca3af", fontWeight: 500 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => {
                const rc = ROL_COLORS[u.rol] ?? ROL_COLORS.operario;
                return (
                  <tr key={u.id} style={{ borderBottom: "0.5px solid #f9f9f7", transition: "background .12s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fafaf8")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  >
                    <td style={{ padding: ".7rem 1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: "50%",
                          background: "#dcfce7", color: "#166534",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: ".7rem", fontWeight: 600, flexShrink: 0,
                        }}>
                          {u.nombre.slice(0, 2).toUpperCase()}
                        </div>
                        <strong>{u.nombre}</strong>
                      </div>
                    </td>
                    <td style={{ padding: ".7rem 1.25rem", color: "#6b7280" }}>{u.email}</td>
                    <td style={{ padding: ".7rem 1.25rem" }}>
                      <span style={{
                        display: "inline-block", borderRadius: 50, padding: "2px 10px",
                        fontSize: ".68rem", fontWeight: 500,
                        background: rc.bg, color: rc.color,
                      }}>
                        {u.rol}
                      </span>
                    </td>
                    <td style={{ padding: ".7rem 1.25rem" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => abrirEditar(u)}
                          style={{ fontSize: ".72rem", color: "#166534", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmarEliminar(u.id)}
                          style={{ fontSize: ".72rem", color: "#dc2626", background: "none", border: "none", cursor: "pointer" }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal crear / editar */}
      <Modal
        open={open}
        onClose={() => { setOpen(false); setEditUser(null); reset(); }}
        title={editUser ? "Editar usuario" : "Nuevo usuario"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-3">
          <Input
            label="Nombre completo"
            type="text"
            error={errors.nombre?.message}
            {...register("nombre")}
            className="col-span-2"
          />
          <Input
            label="Correo electrónico"
            type="email"
            error={errors.email?.message}
            {...register("email")}
            className="col-span-2"
          />
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">Rol</label>
            <select
              className={`form-select${errors.rol ? " is-invalid" : ""}`}
              style={{ fontSize: ".85rem", borderRadius: 8 }}
              {...register("rol")}
            >
              <option value="operario">Operario</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Administrador</option>
            </select>
            {errors.rol && <div className="invalid-feedback">{errors.rol.message}</div>}
          </div>
          <Input
            label={editUser ? "Nueva contraseña (dejar vacío para no cambiar)" : "Contraseña"}
            type="password"
            error={errors.password?.message}
            {...register("password")}
            className="col-span-2"
          />
          <div className="col-span-2 flex justify-end gap-2 mt-2">
            <Button variant="ghost" type="button" onClick={() => { setOpen(false); reset(); }}>
              Cancelar
            </Button>
            <Button type="submit" loading={creando || guardando}>
              {editUser ? "Guardar cambios" : "Crear usuario"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal confirmar eliminación */}
      <Modal
        open={delId !== null}
        onClose={() => setDelId(null)}
        title="Eliminar usuario"
      >
        <p className="text-sm text-gray-600 mb-4">
          ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" type="button" onClick={() => setDelId(null)}>
            Cancelar
          </Button>
          <Button
            type="button"
            loading={eliminando}
            onClick={doEliminar}
            // @ts-expect-error — usa tu prop de variante danger si existe
            variant="danger"
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
