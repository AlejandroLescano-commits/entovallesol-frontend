import api from "./axiosInstance";
import { saveAs } from "file-saver";

export const descargarExcelSitotroga = async (fechaInicio: string, fechaFin: string) => {
  const res = await api.get("/reportes/excel/sitotroga", {
    params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
    responseType: "blob",
  });
  saveAs(res.data, `sitotroga_${fechaInicio}_${fechaFin}.xlsx`);
};

export const descargarExcelTrichogramma = async (especie: string, fechaInicio: string, fechaFin: string) => {
  const res = await api.get("/reportes/excel/trichogramma", {
    params: { especie, fecha_inicio: fechaInicio, fecha_fin: fechaFin },
    responseType: "blob",
  });
  saveAs(res.data, `trichogramma_${especie}_${fechaInicio}_${fechaFin}.xlsx`);
};
