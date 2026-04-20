import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from "@/services/usuariosApi";
import toast from "react-hot-toast";

export function useUsuarios() {
  return useQuery({ queryKey: ["usuarios"], queryFn: getUsuarios });
}

export function useCreateUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createUsuario,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["usuarios"] }); toast.success("Usuario creado"); },
    onError: () => toast.error("Error al crear usuario"),
  });
}

export function useUpdateUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) => updateUsuario(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["usuarios"] }); toast.success("Usuario actualizado"); },
  });
}

export function useDeleteUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteUsuario(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["usuarios"] }); toast.success("Usuario eliminado"); },
  });
}
