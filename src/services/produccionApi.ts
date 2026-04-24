import api from "./axiosInstance";

// ── Producción Sitotroga ──────────────────────────────────────────────────────
export const getSitotroga = (params?: { fecha_inicio?: string; fecha_fin?: string }) =>
  api.get("/produccion/sitotroga", { params }).then((r) => r.data);
export const createSitotroga = (data: unknown) =>
  api.post("/produccion/sitotroga", data).then((r) => r.data);

// ── Producción Trichogramma ───────────────────────────────────────────────────
export const getTrichogramma = (params?: { fecha_inicio?: string; fecha_fin?: string }) =>
  api.get("/produccion/trichogramma", { params }).then((r) => r.data);
export const createTrichogramma = (data: unknown) =>
  api.post("/produccion/trichogramma", data).then((r) => r.data);

// ── Producción Galleria ───────────────────────────────────────────────────────
export const getGalleria = (params?: { fecha_inicio?: string; fecha_fin?: string }) =>
  api.get("/produccion/galleria", { params }).then((r) => r.data);
export const createGalleria = (data: unknown) =>
  api.post("/produccion/galleria", data).then((r) => r.data);

// ── Producción Paratheresia ───────────────────────────────────────────────────
export const getParatheresia = (params?: { fecha_inicio?: string; fecha_fin?: string }) =>
  api.get("/produccion/paratheresia", { params }).then((r) => r.data);
export const createParatheresia = (data: unknown) =>
  api.post("/produccion/paratheresia", data).then((r) => r.data);

// ── Notas de Salida ───────────────────────────────────────────────────────────
export const getNotasSitodroga = (params?: { fecha_inicio?: string; fecha_fin?: string }) =>
  api.get("/produccion/notas/sitodroga", { params }).then((r) => r.data);
export const createNotaSitodroga = (data: unknown) =>
  api.post("/produccion/notas/sitodroga", data).then((r) => r.data);

export const getNotasAvispitas = (params?: { fecha_inicio?: string; fecha_fin?: string }) =>
  api.get("/produccion/notas/avispitas", { params }).then((r) => r.data);
export const createNotaAvispitas = (data: unknown) =>
  api.post("/produccion/notas/avispitas", data).then((r) => r.data);

export const getNotasMoscas = (params?: { fecha_inicio?: string; fecha_fin?: string }) =>
  api.get("/produccion/notas/moscas", { params }).then((r) => r.data);
export const createNotaMoscas = (data: unknown) =>
  api.post("/produccion/notas/moscas", data).then((r) => r.data);

export const getNotasGalleria = (params?: { fecha_inicio?: string; fecha_fin?: string }) =>
  api.get("/produccion/notas/galleria", { params }).then((r) => r.data);
export const createNotaGalleria = (data: unknown) =>
  api.post("/produccion/notas/galleria", data).then((r) => r.data);

// ── Configuración (lugares y unidades) ───────────────────────────────────────
export const getLugaresAvispitas = () =>
  api.get("/configuracion/lugares/avispitas").then((r) => r.data);
export const getLugaresMoscas = () =>
  api.get("/configuracion/lugares/moscas").then((r) => r.data);
export const getUnidadesSitodroga = () =>
  api.get("/configuracion/unidades/sitodroga").then((r) => r.data);
export const getUnidadesAvispas = () =>
  api.get("/configuracion/unidades/avispas").then((r) => r.data);
export const getUnidadesGalleria = () =>
  api.get("/configuracion/unidades/galleria").then((r) => r.data);
export const getUnidadesMoscas = () =>
  api.get("/configuracion/unidades/moscas").then((r) => r.data);

// ── Predicción ────────────────────────────────────────────────────────────────
export const getPrediccion = (especie: string, dias: number) =>
  api.get(`/prediccion/${especie}`, { params: { dias } }).then((r) => r.data);
export const getPrediccionTodas = (dias: number) =>
  api.get("/prediccion/todas", { params: { dias } }).then((r) => r.data);