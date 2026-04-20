export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: "admin" | "supervisor" | "operario";
  activo: boolean;
  creado_en: string;
}

export interface ProduccionSitotroga {
  id: number;
  fecha: string;
  produccion_dia: number | null;
  salida_t_exiguum: number;
  salida_t_pretiosum: number;
  salida_infestacion: number;
  salida_ventas: number;
  salida_total: number;
  saldo: number;
}

export interface ProduccionTrichogramma {
  id: number;
  fecha: string;
  especie: "exiguum" | "pretiosum";
  produccion_dia: number;
  salida_parasitacion: number;
  salida_san_ricardo_a: number;
  salida_san_ricardo_b: number;
  salida_total: number;
  saldo: number;
  porcentaje_eclosion: number | null;
}

export interface ProduccionGalleria {
  id: number;
  fecha: string;
  produccion_dia: number;
  salida_paratheresia: number;
  salida_instalacion: number;
  salida_ventas: number;
  salida_total: number;
  saldo: number;
}

export interface ProduccionParatheresia {
  id: number;
  fecha: string;
  produccion_dia: number;
  salida_parasitacion: number;
  salida_total: number;
  saldo: number;
}

export interface Finca {
  id: number;
  nombre: string;
  ubicacion: string;
  activa: boolean;
}
