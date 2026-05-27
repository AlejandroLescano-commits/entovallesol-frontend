import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPrediccionTodas,
  getModeloConfig,
  updateModeloConfig,
  getModeloKpis,
  entrenarModelo,
} from '../services/produccionApi'

// Predicción completa (todas las especies) — NO se dispara al montar
export const usePrediccionTodas = (dias: number, enabled: boolean) =>
  useQuery({
    queryKey:  ['prediccion', 'todas', dias],
    queryFn:   () => getPrediccionTodas(dias),
    staleTime: 1000 * 60 * 5,
    enabled,                    // ← solo corre cuando el padre lo activa
  })

// Configuración de modelos (ON/OFF, rango)
export const useModeloConfig = () =>
  useQuery({
    queryKey: ['modelo', 'config'],
    queryFn:  getModeloConfig,
  })

// KPIs históricos de una especie
export const useModeloKpis = (especie: string) =>
  useQuery({
    queryKey: ['modelo', 'kpis', especie],
    queryFn:  () => getModeloKpis(especie),
  })

export const useEntrenarModelo = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (especie?: string) => entrenarModelo(especie),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['modelo', 'config'] })
      qc.invalidateQueries({ queryKey: ['modelo', 'kpis'] })
    },
  })
}

export const useUpdateModeloConfig = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ especie, data }: {
      especie: string
      data: { activo?: boolean; rango_meses?: number }
    }) => updateModeloConfig(especie, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['modelo', 'config'] }),
  })
}
