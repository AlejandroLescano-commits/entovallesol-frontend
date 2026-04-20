import api from "./axiosInstance";

export const getUsuarios = () => api.get("/usuarios/").then((r) => r.data);
export const createUsuario = (data: unknown) => api.post("/usuarios/", data).then((r) => r.data);
export const updateUsuario = (id: number, data: unknown) => api.put(`/usuarios/${id}`, data).then((r) => r.data);
export const deleteUsuario = (id: number) => api.delete(`/usuarios/${id}`);
