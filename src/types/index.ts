export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: "admin" | "supervisor" | "operario";
  activo: boolean;
  creado_en: string;
}

// ── Producción ────────────────────────────────────────────────────────────────
export interface ProduccionSitotroga {
  id: number;
  fecha: string;
  id_unidad: number | null;
  cantidad: number;
  activo: boolean;
  registrado_por: number | null;
  creado_en: string;
}

export interface ProduccionTrichogramma {
  id: number;
  fecha: string;
  id_unidad: number | null;
  cantidad: number;
  activo: boolean;
  registrado_por: number | null;
  creado_en: string;
}

export interface ProduccionGalleria {
  id: number;
  fecha: string;
  id_unidad: number | null;
  cantidad: number;
  activo: boolean;
  registrado_por: number | null;
  creado_en: string;
}

export interface ProduccionParatheresia {
  id: number;
  fecha: string;
  id_unidad: number | null;
  cantidad: number;
  activo: boolean;
  registrado_por: number | null;
  creado_en: string;
}

// ── Notas de Salida ───────────────────────────────────────────────────────────
export interface NotaSalidaSitodroga {
  id: number;
  tiposalida: "T.exiguum" | "T.pretiosum" | "Infestación" | "Ventas";
  descripcion: string | null;
  fecha: string;
  id_unidad: number | null;
  factor: number;
  cantidad: number;
  activo: boolean;
  registrado_por: number | null;
  creado_en: string;
}

export interface NotaSalidaAvispitas {
  id: number;
  tiposalida: "Parasitacion" | "Liberacion" | "Ventas";
  id_lugarliberacion: number | null;
  descripcion: string | null;
  fecha: string;
  id_unidad: number | null;
  cantidad: number;
  activo: boolean;
  registrado_por: number | null;
  creado_en: string;
}

export interface NotaSalidaMoscas {
  id: number;
  tiposalida: "Parasitacion" | "Venta" | "Liberacion";
  id_lugarliberacion: number | null;
  descripcion: string | null;
  fecha: string;
  id_unidad: number | null;
  cantidad: number;
  activo: boolean;
  registrado_por: number | null;
  creado_en: string;
}

export interface NotaSalidaGalleria {
  id: number;
  tiposalida: "Paratheresia" | "Instalacion" | "Ventas";
  descripcion: string | null;
  fecha: string;
  id_unidad: number | null;
  cantidad: number;
  ratio: number | null;
  activo: boolean;
  registrado_por: number | null;
  creado_en: string;
}

// ── Lugares y Unidades ────────────────────────────────────────────────────────
export interface LugarLiberacion {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface UnidadMedida {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

// ── Predicción ────────────────────────────────────────────────────────────────
export interface PrediccionDia {
  fecha: string;
  demanda_estimada: number;
  produccion_necesaria: number;
}

export interface PrediccionResult {
  especie: string;
  unidad: string;
  r2_score: number;
  dias_predichos: number;
  tendencia: "creciente" | "decreciente";
  promedio_historico: number;
  predicciones: PrediccionDia[];
  error?: string;
}