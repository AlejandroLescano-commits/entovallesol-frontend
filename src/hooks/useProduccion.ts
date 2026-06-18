import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/services/axiosInstance";
import {
  getSitotroga, createSitotroga,
  getTrichogramma, createTrichogramma,
  getGalleria, createGalleria,
  getParatheresia, createParatheresia,
  getNotasSitodroga, createNotaSitodroga,
  getNotasAvispitas, createNotaAvispitas,
  getNotasMoscas, createNotaMoscas,
  getNotasGalleria, createNotaGalleria,
  getLugaresAvispitas, getLugaresMoscas,
  getUnidadesSitodroga, getUnidadesAvispas,
  getUnidadesGalleria, getUnidadesMoscas,
  getPrediccion, getPrediccionTodas,
  getLugaresAvispitasTodos, createLugarAvispitas, updateLugarAvispitas, deleteLugarAvispitas,
  getLugaresMoscasTodos, createLugarMoscas, updateLugarMoscas, deleteLugarMoscas,
} from "@/services/produccionApi";

// ── Helpers ───────────────────────────────────────────────────────────────────
const ok = (qc: ReturnType<typeof useQueryClient>, ...keys: string[]) => () => {
  keys.forEach(k => qc.invalidateQueries({ queryKey: [k] }));
  toast.success("Registro guardado");
};

const okAnular = (qc: ReturnType<typeof useQueryClient>, ...keys: string[]) => () => {
  keys.forEach(k => qc.invalidateQueries({ queryKey: [k] }));
  toast.success("Registro anulado");
};

const okEliminar = (qc: ReturnType<typeof useQueryClient>, ...keys: string[]) => () => {
  keys.forEach(k => qc.invalidateQueries({ queryKey: [k] }));
  toast.success("Registro eliminado permanentemente");
};

const errEliminar = (err: any) =>
  toast.error(err?.response?.data?.detail ?? "Error al eliminar");

// ── Producción Sitotroga ──────────────────────────────────────────────────────
export const useSitotroga = (p?: { fecha_inicio?: string; fecha_fin?: string }) =>
  useQuery({ queryKey: ["sitotroga", p], queryFn: () => getSitotroga(p) });

export const useCreateSitotroga = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSitotroga,
    onSuccess: ok(qc, "sitotroga"),
    onError: () => toast.error("Error al guardar"),
  });
};

export const useAnularSitotroga = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/produccion/sitotroga/${id}`).then(r => r.data),
    onSuccess: okAnular(qc, "sitotroga"),
    onError: () => toast.error("Error al anular"),
  });
};

// ── Producción Trichogramma ───────────────────────────────────────────────────
export const useTrichogramma = (p?: { fecha_inicio?: string; fecha_fin?: string }) =>
  useQuery({ queryKey: ["trichogramma", p], queryFn: () => getTrichogramma(p) });

export const useCreateTrichogramma = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTrichogramma,
    onSuccess: ok(qc, "trichogramma"),
    onError: () => toast.error("Error al guardar"),
  });
};

export const useAnularTrichogramma = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/produccion/trichogramma/${id}`).then(r => r.data),
    onSuccess: okAnular(qc, "trichogramma"),
    onError: () => toast.error("Error al anular"),
  });
};

// ── Producción Galleria ───────────────────────────────────────────────────────
export const useGalleria = (p?: { fecha_inicio?: string; fecha_fin?: string }) =>
  useQuery({ queryKey: ["galleria", p], queryFn: () => getGalleria(p) });

export const useCreateGalleria = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createGalleria,
    onSuccess: ok(qc, "galleria"),
    onError: () => toast.error("Error al guardar"),
  });
};

export const useAnularGalleria = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/produccion/galleria/${id}`).then(r => r.data),
    onSuccess: okAnular(qc, "galleria"),
    onError: () => toast.error("Error al anular"),
  });
};

// ── Producción Paratheresia ───────────────────────────────────────────────────
export const useParatheresia = (p?: { fecha_inicio?: string; fecha_fin?: string }) =>
  useQuery({ queryKey: ["paratheresia", p], queryFn: () => getParatheresia(p) });

export const useCreateParatheresia = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createParatheresia,
    onSuccess: ok(qc, "paratheresia"),
    onError: () => toast.error("Error al guardar"),
  });
};

export const useAnularParatheresia = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/produccion/paratheresia/${id}`).then(r => r.data),
    onSuccess: okAnular(qc, "paratheresia"),
    onError: () => toast.error("Error al anular"),
  });
};

// ── Notas de Salida Sitodroga ─────────────────────────────────────────────────
export const useNotasSitodroga = (p?: { fecha_inicio?: string; fecha_fin?: string }) =>
  useQuery({ queryKey: ["notas_sitodroga", p], queryFn: () => getNotasSitodroga(p) });

export const useCreateNotaSitodroga = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createNotaSitodroga,
    onSuccess: ok(qc, "notas_sitodroga"),
    onError: () => toast.error("Error al guardar"),
  });
};

export const useAnularNotaSitodroga = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/produccion/notas/sitodroga/${id}`).then(r => r.data),
    // Invalida también trichogramma porque la anulación puede revertir uno
    onSuccess: okAnular(qc, "notas_sitodroga", "trichogramma"),
    onError: () => toast.error("Error al anular"),
  });
};

// ── Notas de Salida Avispitas ─────────────────────────────────────────────────
export const useNotasAvispitas = (p?: { fecha_inicio?: string; fecha_fin?: string }) =>
  useQuery({ queryKey: ["notas_avispitas", p], queryFn: () => getNotasAvispitas(p) });

export const useCreateNotaAvispitas = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createNotaAvispitas,
    onSuccess: ok(qc, "notas_avispitas"),
    onError: () => toast.error("Error al guardar"),
  });
};

export const useAnularNotaAvispitas = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/produccion/notas/avispitas/${id}`).then(r => r.data),
    onSuccess: okAnular(qc, "notas_avispitas"),
    onError: () => toast.error("Error al anular"),
  });
};

// ── Notas de Salida Moscas ────────────────────────────────────────────────────
export const useNotasMoscas = (p?: { fecha_inicio?: string; fecha_fin?: string }) =>
  useQuery({ queryKey: ["notas_moscas", p], queryFn: () => getNotasMoscas(p) });

export const useCreateNotaMoscas = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createNotaMoscas,
    onSuccess: ok(qc, "notas_moscas"),
    onError: () => toast.error("Error al guardar"),
  });
};

export const useAnularNotaMoscas = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/produccion/notas/moscas/${id}`).then(r => r.data),
    onSuccess: okAnular(qc, "notas_moscas"),
    onError: () => toast.error("Error al anular"),
  });
};

// ── Notas de Salida Galleria ──────────────────────────────────────────────────
export const useNotasGalleria = (p?: { fecha_inicio?: string; fecha_fin?: string }) =>
  useQuery({ queryKey: ["notas_galleria", p], queryFn: () => getNotasGalleria(p) });

export const useCreateNotaGalleria = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createNotaGalleria,
    onSuccess: ok(qc, "notas_galleria"),
    onError: () => toast.error("Error al guardar"),
  });
};

export const useAnularNotaGalleria = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/produccion/notas/galleria/${id}`).then(r => r.data),
    // Invalida también paratheresia porque la anulación puede revertir uno
    onSuccess: okAnular(qc, "notas_galleria", "paratheresia"),
    onError: () => toast.error("Error al anular"),
  });
};

// ── Lugares y Unidades (solo lectura, listas activas) ────────────────────────
export const useLugaresAvispitas = () =>
  useQuery({ queryKey: ["lugares_avispitas"], queryFn: getLugaresAvispitas });
export const useLugaresMoscas = () =>
  useQuery({ queryKey: ["lugares_moscas"], queryFn: getLugaresMoscas });
export const useUnidadesSitodroga = () =>
  useQuery({ queryKey: ["unidades_sitodroga"], queryFn: getUnidadesSitodroga });
export const useUnidadesAvispas = () =>
  useQuery({ queryKey: ["unidades_avispas"], queryFn: getUnidadesAvispas });
export const useUnidadesGalleria = () =>
  useQuery({ queryKey: ["unidades_galleria"], queryFn: getUnidadesGalleria });
export const useUnidadesMoscas = () =>
  useQuery({ queryKey: ["unidades_moscas"], queryFn: getUnidadesMoscas });

// ── Predicción ────────────────────────────────────────────────────────────────
export const usePrediccion = (especie: string, dias: number) =>
  useQuery({
    queryKey: ["prediccion", especie, dias],
    queryFn: () => getPrediccion(especie, dias),
    enabled: !!especie,
  });

export const usePrediccionTodas = (dias: number) =>
  useQuery({
    queryKey: ["prediccion_todas", dias],
    queryFn: () => getPrediccionTodas(dias),
  });

// ── Eliminación física ─────────────────────────────────────────────────────
export const useEliminarSitotroga = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/produccion/sitotroga/${id}/eliminar`).then(r => r.data),
    onSuccess: okEliminar(qc, "sitotroga"),
    onError: errEliminar,
  });
};

export const useEliminarTrichogramma = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/produccion/trichogramma/${id}/eliminar`).then(r => r.data),
    onSuccess: okEliminar(qc, "trichogramma"),
    onError: errEliminar,
  });
};

export const useEliminarGalleria = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/produccion/galleria/${id}/eliminar`).then(r => r.data),
    onSuccess: okEliminar(qc, "galleria"),
    onError: errEliminar,
  });
};

export const useEliminarParatheresia = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/produccion/paratheresia/${id}/eliminar`).then(r => r.data),
    onSuccess: okEliminar(qc, "paratheresia"),
    onError: errEliminar,
  });
};

export const useEliminarNotaSitodroga = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/produccion/notas/sitodroga/${id}/eliminar`).then(r => r.data),
    onSuccess: okEliminar(qc, "notas_sitodroga", "trichogramma"),
    onError: errEliminar,
  });
};

export const useEliminarNotaAvispitas = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/produccion/notas/avispitas/${id}/eliminar`).then(r => r.data),
    onSuccess: okEliminar(qc, "notas_avispitas"),
    onError: errEliminar,
  });
};

export const useEliminarNotaMoscas = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/produccion/notas/moscas/${id}/eliminar`).then(r => r.data),
    onSuccess: okEliminar(qc, "notas_moscas"),
    onError: errEliminar,
  });
};

export const useEliminarNotaGalleria = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/produccion/notas/galleria/${id}/eliminar`).then(r => r.data),
    onSuccess: okEliminar(qc, "notas_galleria", "paratheresia"),
    onError: errEliminar,
  });
};

// ── Lugares Avispitas: CRUD completo (incluye inactivos) ──────────────────────
export const useLugaresAvispitasTodos = () =>
  useQuery({ queryKey: ["lugares_avispitas_todos"], queryFn: getLugaresAvispitasTodos });

export const useCreateLugarAvispitas = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createLugarAvispitas,
    onSuccess: ok(qc, "lugares_avispitas_todos", "lugares_avispitas"),
    onError: () => toast.error("Error al guardar"),
  });
};

export const useUpdateLugarAvispitas = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateLugarAvispitas(id, data),
    onSuccess: ok(qc, "lugares_avispitas_todos", "lugares_avispitas"),
    onError: () => toast.error("Error al actualizar"),
  });
};

export const useDeleteLugarAvispitas = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteLugarAvispitas,
    onSuccess: okEliminar(qc, "lugares_avispitas_todos", "lugares_avispitas"),
    onError: errEliminar,
  });
};

// ── Lugares Moscas: CRUD completo (incluye inactivos) ─────────────────────────
export const useLugaresMoscasTodos = () =>
  useQuery({ queryKey: ["lugares_moscas_todos"], queryFn: getLugaresMoscasTodos });

export const useCreateLugarMoscas = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createLugarMoscas,
    onSuccess: ok(qc, "lugares_moscas_todos", "lugares_moscas"),
    onError: () => toast.error("Error al guardar"),
  });
};

export const useUpdateLugarMoscas = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateLugarMoscas(id, data),
    onSuccess: ok(qc, "lugares_moscas_todos", "lugares_moscas"),
    onError: () => toast.error("Error al actualizar"),
  });
};

export const useDeleteLugarMoscas = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteLugarMoscas,
    onSuccess: okEliminar(qc, "lugares_moscas_todos", "lugares_moscas"),
    onError: errEliminar,
  });
};



import { getProyeccionParametros, calcularProyeccion } from "@/services/produccionApi";

export const useProyeccionParametros = () =>
  useQuery({ queryKey: ["proyeccion_parametros"], queryFn: getProyeccionParametros });

export const useCalcularProyeccion = () => {
  return useMutation({
    mutationFn: calcularProyeccion,
    onError: () => toast.error("Error al calcular proyección"),
  });
};
