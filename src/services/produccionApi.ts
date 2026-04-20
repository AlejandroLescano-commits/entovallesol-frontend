import api from "./axiosInstance";

// ── Sitotroga ──
export const getSitotroga = (params?: { fecha_inicio?: string; fecha_fin?: string }) =>
  api.get("/produccion/sitotroga", { params }).then((r) => r.data);

export const createSitotroga = (data: unknown) =>
  api.post("/produccion/sitotroga", data).then((r) => r.data);

export const updateSitotroga = (id: number, data: unknown) =>
  api.put(`/produccion/sitotroga/${id}`, data).then((r) => r.data);

export const deleteSitotroga = (id: number) =>
  api.delete(`/produccion/sitotroga/${id}`);

// ── Trichogramma ──
export const getTrichogramma = (params?: { especie?: string; fecha_inicio?: string; fecha_fin?: string }) =>
  api.get("/produccion/trichogramma", { params }).then((r) => r.data);

export const createTrichogramma = (data: unknown) =>
  api.post("/produccion/trichogramma", data).then((r) => r.data);

// ── Galleria ──
export const getGalleria = (params?: { fecha_inicio?: string; fecha_fin?: string }) =>
  api.get("/produccion/galleria", { params }).then((r) => r.data);

export const createGalleria = (data: unknown) =>
  api.post("/produccion/galleria", data).then((r) => r.data);

// ── Paratheresia ──
export const getParatheresia = (params?: { fecha_inicio?: string; fecha_fin?: string }) =>
  api.get("/produccion/paratheresia", { params }).then((r) => r.data);

export const createParatheresia = (data: unknown) =>
  api.post("/produccion/paratheresia", data).then((r) => r.data);
