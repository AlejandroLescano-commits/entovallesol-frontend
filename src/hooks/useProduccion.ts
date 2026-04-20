import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSitotroga, createSitotroga, getTrichogramma, createTrichogramma,
         getGalleria, createGalleria, getParatheresia, createParatheresia } from "@/services/produccionApi";
import toast from "react-hot-toast";

export function useSitotroga(params?: { fecha_inicio?: string; fecha_fin?: string }) {
  return useQuery({ queryKey: ["sitotroga", params], queryFn: () => getSitotroga(params) });
}

export function useCreateSitotroga() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSitotroga,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sitotroga"] }); toast.success("Registro guardado"); },
    onError: () => toast.error("Error al guardar"),
  });
}

export function useTrichogramma(params?: { especie?: string; fecha_inicio?: string; fecha_fin?: string }) {
  return useQuery({ queryKey: ["trichogramma", params], queryFn: () => getTrichogramma(params) });
}

export function useCreateTrichogramma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTrichogramma,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["trichogramma"] }); toast.success("Registro guardado"); },
    onError: () => toast.error("Error al guardar"),
  });
}

export function useGalleria(params?: { fecha_inicio?: string; fecha_fin?: string }) {
  return useQuery({ queryKey: ["galleria", params], queryFn: () => getGalleria(params) });
}

export function useCreateGalleria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createGalleria,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["galleria"] }); toast.success("Registro guardado"); },
  });
}

export function useParatheresia(params?: { fecha_inicio?: string; fecha_fin?: string }) {
  return useQuery({ queryKey: ["paratheresia", params], queryFn: () => getParatheresia(params) });
}

export function useCreateParatheresia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createParatheresia,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["paratheresia"] }); toast.success("Registro guardado"); },
  });
}
