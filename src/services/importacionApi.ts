import api from "./axiosInstance";

const subirExcel = async (url: string, file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.post(url, form, { headers: { "Content-Type": "multipart/form-data" } }).then(r => r.data);
};

export const importarSitotroga    = (file: File) => subirExcel("/importacion/sitotroga", file);
export const importarTrichogramma = (file: File) => subirExcel("/importacion/trichogramma", file);
export const importarGalleria     = (file: File) => subirExcel("/importacion/galleria", file);
export const importarParatheresia = (file: File) => subirExcel("/importacion/paratheresia", file);