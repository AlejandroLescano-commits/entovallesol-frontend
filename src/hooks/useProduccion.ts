import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
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
} from "@/services/produccionApi";

const ok = (qc: ReturnType<typeof useQueryClient>, key: string) => () => {
  qc.invalidateQueries({ queryKey: [key] });
  toast.success("Registro guardado");
};

// ── Producción ────────────────────────────────────────────────────────────────
export const useSitotroga = (p?: { fecha_inicio?: string; fecha_fin?: string }) =>
  useQuery({ queryKey: ["sitotroga", p], queryFn: () => getSitotroga(p) });

export const useCreateSitotroga = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createSitotroga, onSuccess: ok(qc, "sitotroga"), onError: () => toast.error("Error al guardar") });
};

export const useTrichogramma = (p?: { fecha_inicio?: string; fecha_fin?: string }) =>
  useQuery({ queryKey: ["trichogramma", p], queryFn: () => getTrichogramma(p) });

export const useCreateTrichogramma = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createTrichogramma, onSuccess: ok(qc, "trichogramma"), onError: () => toast.error("Error al guardar") });
};

export const useGalleria = (p?: { fecha_inicio?: string; fecha_fin?: string }) =>
  useQuery({ queryKey: ["galleria", p], queryFn: () => getGalleria(p) });

export const useCreateGalleria = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createGalleria, onSuccess: ok(qc, "galleria"), onError: () => toast.error("Error al guardar") });
};

export const useParatheresia = (p?: { fecha_inicio?: string; fecha_fin?: string }) =>
  useQuery({ queryKey: ["paratheresia", p], queryFn: () => getParatheresia(p) });

export const useCreateParatheresia = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createParatheresia, onSuccess: ok(qc, "paratheresia"), onError: () => toast.error("Error al guardar") });
};

// ── Notas de Salida ───────────────────────────────────────────────────────────
export const useNotasSitodroga = (p?: { fecha_inicio?: string; fecha_fin?: string }) =>
  useQuery({ queryKey: ["notas_sitodroga", p], queryFn: () => getNotasSitodroga(p) });

export const useCreateNotaSitodroga = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createNotaSitodroga, onSuccess: ok(qc, "notas_sitodroga"), onError: () => toast.error("Error al guardar") });
};

export const useNotasAvispitas = (p?: { fecha_inicio?: string; fecha_fin?: string }) =>
  useQuery({ queryKey: ["notas_avispitas", p], queryFn: () => getNotasAvispitas(p) });

export const useCreateNotaAvispitas = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createNotaAvispitas, onSuccess: ok(qc, "notas_avispitas"), onError: () => toast.error("Error al guardar") });
};

export const useNotasMoscas = (p?: { fecha_inicio?: string; fecha_fin?: string }) =>
  useQuery({ queryKey: ["notas_moscas", p], queryFn: () => getNotasMoscas(p) });

export const useCreateNotaMoscas = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createNotaMoscas, onSuccess: ok(qc, "notas_moscas"), onError: () => toast.error("Error al guardar") });
};

export const useNotasGalleria = (p?: { fecha_inicio?: string; fecha_fin?: string }) =>
  useQuery({ queryKey: ["notas_galleria", p], queryFn: () => getNotasGalleria(p) });

export const useCreateNotaGalleria = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createNotaGalleria, onSuccess: ok(qc, "notas_galleria"), onError: () => toast.error("Error al guardar") });
};

// ── Lugares y Unidades ────────────────────────────────────────────────────────
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
  useQuery({ queryKey: ["prediccion", especie, dias], queryFn: () => getPrediccion(especie, dias), enabled: !!especie });

export const usePrediccionTodas = (dias: number) =>
  useQuery({ queryKey: ["prediccion_todas", dias], queryFn: () => getPrediccionTodas(dias) });